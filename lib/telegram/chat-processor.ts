import {
  getRecentTransactions,
  getRecentActivities,
  getActivePlans,
  getRecentChatHistory,
  saveChatMessage,
  insertTransaction,
  insertActivity,
  softDeleteTransactionByCriteria,
  randomizeTransactionTimestamps,
  randomizeActivityTimestamps,
  updateRecordById,
  deleteRecordById,
  getRecordDetailsByShortOrFull,
  syncAllRecordTimestampsToCreatedAt,
} from '@/lib/supabase/queries/transactions';
import { getUserPreferences, saveUserPreference } from '@/lib/supabase/queries/preferences';
import { updateUserName } from '@/lib/supabase/queries/sessions';
import { getUserCategories, getOrCreateCategory } from '@/lib/supabase/queries/categories';
import { sendTelegramMessageBubbles, sendTelegramMessage, sendTelegramChatAction, sendTelegramDocument } from '@/lib/telegram/send-message';
import { sendTelegramChart } from '@/lib/telegram/send-chart';
import { sendTelegramLocation } from '@/lib/telegram/send-location';
import { buildConfirmationInlineKeyboard } from '@/lib/telegram/inline-keyboard';
import { runChatOrchestration } from '@/lib/gemini/prompts/chat';
import { generateExportFile } from '@/lib/export/export-data';
import { checkTransactionAnomaly, checkActivityCollision } from '@/lib/analytics/anomalies';
import { supabaseAdmin } from '@/lib/supabase/client';

function parseSafeIsoDate(dateStr?: string): string {
  if (!dateStr || !dateStr.trim()) return new Date().toISOString();

  const str = dateStr.trim();

  // If explicit +07:00 timezone offset is already present
  if (str.includes('+07') || str.includes('+07:00')) {
    const d = new Date(str);
    if (!isNaN(d.getTime())) return d.toISOString();
  }

  try {
    const cleanStr = str.split(/[–—]/)[0].trim();

    // Extract numbers for YYYY, MM, DD, HH, mm
    // Matches YYYY-MM-DDTHH:mm or DD/MM/YYYY HH:mm
    const matchIso = cleanStr.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:[T\s](\d{1,2}):(\d{1,2}))?/);
    const matchIndo = cleanStr.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})(?:[T\s](\d{1,2}):(\d{1,2}))?/);

    let year: number, month: number, day: number, wibHour: number, wibMin: number;
    const now = new Date();

    if (matchIso) {
      year = parseInt(matchIso[1], 10);
      month = parseInt(matchIso[2], 10) - 1;
      day = parseInt(matchIso[3], 10);
      wibHour = matchIso[4] !== undefined ? parseInt(matchIso[4], 10) : (now.getUTCHours() + 7) % 24;
      wibMin = matchIso[5] !== undefined ? parseInt(matchIso[5], 10) : now.getUTCMinutes();
    } else if (matchIndo) {
      day = parseInt(matchIndo[1], 10);
      month = parseInt(matchIndo[2], 10) - 1;
      year = parseInt(matchIndo[3], 10);
      wibHour = matchIndo[4] !== undefined ? parseInt(matchIndo[4], 10) : (now.getUTCHours() + 7) % 24;
      wibMin = matchIndo[5] !== undefined ? parseInt(matchIndo[5], 10) : now.getUTCMinutes();
    } else {
      const d = new Date(str);
      if (!isNaN(d.getTime())) return d.toISOString();
      return new Date().toISOString();
    }

    // Convert WIB hour to UTC hour (wibHour - 7)
    const d = new Date(Date.UTC(year, month, day, wibHour - 7, wibMin));
    if (!isNaN(d.getTime())) {
      if (d.getMonth() === 0 && d.getDate() === 1 && d.getUTCHours() === 0 && d.getUTCMinutes() === 0) {
        return new Date().toISOString();
      }
      return d.toISOString();
    }
  } catch (e) {
    // Fallback to current time
  }

  return new Date().toISOString();
}

export async function processChatRespondDirect(
  userId: string,
  chatId: number | string,
  userMessage: string,
  userName?: string
) {
  try {
    // Send typing action immediately
    if (chatId) {
      sendTelegramChatAction(chatId, 'typing').catch(console.error);
    }

    // 1. Fetch context in parallel (only fetch essential categories for context)
    const [transactions, activities, plans, preferences, history, categories] = await Promise.all([
      getRecentTransactions(userId, 10),
      getRecentActivities(userId, 20),
      getActivePlans(userId),
      getUserPreferences(userId, 20),
      getRecentChatHistory(userId, 24),
      getUserCategories(userId),
    ]);

    // Targeted ID Lookup: If user message contains short/full ID (e.g. TX-6909C8 or ACT-XXXXXX)
    const idMatches = userMessage.match(/(TX|ACT)-?[A-F0-9]{4,8}/gi);
    if (idMatches && idMatches.length > 0) {
      for (const rawId of idMatches) {
        try {
          const searched = await getRecordDetailsByShortOrFull(userId, rawId);
          if (searched && searched.record) {
            if (searched.type === 'transaction') {
              const exists = transactions.some((t) => t.id === searched.record.id);
              if (!exists) {
                transactions.unshift(searched.record);
              }
            } else if (searched.type === 'activity') {
              const exists = activities.some((a) => a.id === searched.record.id);
              if (!exists) {
                activities.unshift(searched.record);
              }
            }
          }
        } catch (idErr) {
          console.error('Error fetching targeted ID for context:', idErr);
        }
      }
    }

    // Save user message to history asynchronously
    saveChatMessage(userId, 'user', userMessage).catch(console.error);

    // 2. Run Gemini AI Orchestration with existing category list
    const catNames = categories.map((c) => c.name);
    const result = await runChatOrchestration({
      userMessage,
      recentTransactions: transactions,
      recentActivities: activities,
      activePlans: plans,
      preferences,
      chatHistory: history,
      userName,
      existingCategories: catNames,
    });

    // 3. Process Extracted Data (single API pass result)
    if (result.extracted_data) {
      const ext = result.extracted_data;

      // Transactions — support array of items (Fix for multi-transaction text journal)
      const txList = ext.transactions || (ext.transaction ? [ext.transaction] : []);
      for (const tx of txList) {
        if (tx && tx.amount > 0) {
          try {
            const categoryName = tx.category || tx.merchant || 'Lain-lain';
            const category = await getOrCreateCategory(userId, categoryName);

            await insertTransaction({
              user_id: userId,
              category_id: category.id,
              amount: tx.amount,
              type: tx.type || 'expense',
              merchant: tx.merchant,
              description: tx.description,
              source: 'chat_manual',
              payment_method: tx.payment_method,
              location: tx.location,
              items: tx.items || [],
              tags: tx.tags || [],
              occurred_at: parseSafeIsoDate(tx.occurred_at),
            });

            // Real-time Financial Anomaly Detection
            const anomalyAlert = await checkTransactionAnomaly(userId, {
              amount: tx.amount,
              type: tx.type || 'expense',
              merchant: tx.merchant,
              occurred_at: tx.occurred_at,
            });
            if (anomalyAlert && chatId) {
              await sendTelegramMessage(chatId, `${anomalyAlert.title}\n\n${anomalyAlert.message}`);
            }
          } catch (txErr) {
            console.error('Error inserting individual transaction:', txErr);
          }
        }
      }

      // Activities — support array of items
      const actList = ext.activities || (ext.activity ? [ext.activity] : []);
      for (const act of actList) {
        if (act && act.title) {
          try {
            await insertActivity({
              user_id: userId,
              title: act.title,
              description: act.description,
              status: act.status || 'scheduled',
              priority: act.priority || 'medium',
              tags: act.tags || [],
              occurred_at: parseSafeIsoDate(act.occurred_at),
            });

            // Real-time Schedule Collision Detection
            const collisionAlert = await checkActivityCollision(userId, {
              title: act.title,
              occurred_at: act.occurred_at,
            });
            if (collisionAlert && chatId) {
              await sendTelegramMessage(chatId, `${collisionAlert.title}\n\n${collisionAlert.message}`);
            }
          } catch (actErr) {
            console.error('Error inserting individual activity:', actErr);
          }
        }
      }

      // Preferences — support array of learned preferences
      const prefList = ext.preferences || (ext.preference ? [ext.preference] : []);
      for (const pref of prefList) {
        if (pref && pref.key) {
          await saveUserPreference(userId, pref.key, pref.value, pref.learned_from || userMessage);

          // Sync name preference directly to users.name column in database
          const keyLower = pref.key.toLowerCase();
          if (keyLower.includes('nama') || keyLower.includes('name') || keyLower.includes('panggilan')) {
            const cleanName = String(pref.value || '').trim().replace(/^["']|["']$/g, '');
            if (cleanName) {
              await updateUserName(userId, cleanName);
            }
          }
        }
      }

      // Edit Record by ID (TX-XXXX or ACT-XXXX)
      if ((ext as any).edit_record) {
        const editReq = (ext as any).edit_record;
        if (editReq?.id && editReq?.type && editReq?.changes) {
          try {
            if (editReq.changes.occurred_at) {
              editReq.changes.occurred_at = parseSafeIsoDate(editReq.changes.occurred_at);
            }
            const success = await updateRecordById(userId, editReq.id, editReq.type, editReq.changes);
            if (success && chatId) {
              await sendTelegramMessage(
                chatId,
                `✏️ **BERHASIL MENGUBAH DATA [${editReq.id.toUpperCase()}]**\n\nPerubahan berhasil disimpan di database Supabase.`
              );
            }
          } catch (editErr) {
            console.error('Error editing record by ID:', editErr);
          }
        }
      }

      // Delete Record by ID (TX-XXXX or ACT-XXXX)
      if ((ext as any).delete_record) {
        const delReq = (ext as any).delete_record;
        if (delReq?.id && delReq?.type) {
          try {
            const success = await deleteRecordById(userId, delReq.id, delReq.type);
            if (success && chatId) {
              await sendTelegramMessage(
                chatId,
                `🗑️ **BERHASIL MENGHAPUS DATA [${delReq.id.toUpperCase()}]**\n\nCatatan tersebut telah dihapus dari database.`
              );
            }
          } catch (delErr) {
            console.error('Error deleting record by ID:', delErr);
          }
        }
      }

      // Cancel/Delete Transaction (New feature to cancel transaction on user command)
      if (ext.cancel_transaction) {
        const cancel = ext.cancel_transaction;
        await softDeleteTransactionByCriteria(userId, {
          amount: cancel.amount || undefined,
          type: cancel.type || undefined,
        });
      }

      // Delete All Request
      if (ext.delete_all_request && chatId) {
        await sendTelegramMessage(
          chatId,
          '⚠️ **KONFIRMASI PENGHAPUSAN DATA**\n\nApakah kamu yakin ingin menghapus semua catatan pengeluaran dan aktivitas kamu?\n\n*(Klik tombol konfirmasi di bawah untuk memproses)*',
          buildConfirmationInlineKeyboard('confirm_delete_all', 'cancel')
        );
      }

      // Export Request
      if (ext.export_request && chatId) {
        try {
          const exportResult = await generateExportFile(userId, ext.export_request);
          await sendTelegramDocument(chatId, exportResult.buffer, exportResult.filename, exportResult.caption);
        } catch (expErr) {
          console.error('Export error:', expErr);
        }
      }

      // Fix All Timestamps Request
      if ((ext as any).fix_all_timestamps_request && chatId) {
        try {
          const { txCount, actCount } = await syncAllRecordTimestampsToCreatedAt(userId);
          await sendTelegramMessage(
            chatId,
            `✨ **BERHASIL MEMPERBAIKI SEMUA JAM DATA!**\n\n• **Total Transaksi Diperbarui**: ${txCount} data\n• **Total Aktivitas Diperbarui**: ${actCount} data\n\nSemua jam transaksi dan agenda kamu telah disinkronkan 100% presisi sesuai waktu kronologi asli percakapan kamu di database!`
          );
        } catch (syncErr) {
          console.error('Error syncing all timestamps:', syncErr);
        }
      }

      // Update / Randomize Timestamps Request
      if (ext.update_timestamps && chatId) {
        try {
          const req = ext.update_timestamps;
          const targetDate = req.targetDate || new Date().toISOString().split('T')[0];
          const startHr = req.startHour ?? 8;
          const endHr = req.endHour ?? 21;
          const target = req.target || 'all';

          let countTx = 0;
          let countAct = 0;

          if (target === 'transactions' || target === 'all') {
            countTx = await randomizeTransactionTimestamps(userId, targetDate, startHr, endHr);
          }
          if (target === 'activities' || target === 'all') {
            countAct = await randomizeActivityTimestamps(userId, targetDate, startHr, endHr);
          }

          await sendTelegramMessage(
            chatId,
            `⏰ **BERHASIL MENGACAK TANGGAL & JAM!**\n\n• **Tanggal Target**: ${targetDate}\n• **Rentang Jam**: ${String(startHr).padStart(2, '0')}:00 - ${String(endHr).padStart(2, '0')}:00 WIB\n• **Total Transaksi Diperbarui**: ${countTx}\n• **Total Aktivitas Diperbarui**: ${countAct}`
          );
        } catch (tsErr) {
          console.error('Update timestamps error:', tsErr);
        }
      }
    }

    // 4. Save Assistant Response to Chat History
    const fullAssistantText = [...(result.messages || []), result.follow_up_question].filter(Boolean).join('\n');
    saveChatMessage(userId, 'assistant', fullAssistantText).catch(console.error);

    // 5. Send Rich Responses to Telegram (Fix #6: 150ms bubble delay)
    if (chatId) {
      if (result.messages && result.messages.length > 0) {
        await sendTelegramMessageBubbles(chatId, result.messages, 150);
      }
      if (result.chart) {
        await sendTelegramChart(chatId, result.chart, result.chart.title || 'Visualisasi Grafik');
      }
      if (result.location) {
        await sendTelegramLocation(chatId, result.location.lat, result.location.lng);
      }
      if (result.follow_up_question) {
        await sendTelegramMessage(chatId, result.follow_up_question);
      }
    }
  } catch (error) {
    console.error('Error in processChatRespondDirect:', error);
    if (chatId) {
      await sendTelegramMessage(chatId, 'Maaf, terjadi kesalahan saat memproses pesan kamu.');
    }
  }
}
