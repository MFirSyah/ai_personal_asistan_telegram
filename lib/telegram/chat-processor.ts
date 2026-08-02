import {
  getRecentTransactions,
  getRecentActivities,
  getActivePlans,
  getRecentChatHistory,
  saveChatMessage,
  insertTransaction,
  insertActivity,
  softDeleteTransactionByCriteria,
} from '@/lib/supabase/queries/transactions';
import { getUserPreferences, saveUserPreference } from '@/lib/supabase/queries/preferences';
import { getUserCategories, getOrCreateCategory } from '@/lib/supabase/queries/categories';
import { sendTelegramMessageBubbles, sendTelegramMessage, sendTelegramChatAction } from '@/lib/telegram/send-message';
import { sendTelegramChart } from '@/lib/telegram/send-chart';
import { sendTelegramLocation } from '@/lib/telegram/send-location';
import { runChatOrchestration } from '@/lib/gemini/prompts/chat';

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
      getRecentActivities(userId, 5),
      getActivePlans(userId),
      getUserPreferences(userId, 20),
      getRecentChatHistory(userId, 10),
      getUserCategories(userId),
    ]);

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

      // Transactions — direct categorization without extra Gemini call (Fix #5)
      if (ext.transaction && ext.transaction.amount > 0) {
        const tx = ext.transaction;
        const categoryName = tx.category || tx.merchant || 'Lain-lain';

        // Get or create category in single pass
        const category = await getOrCreateCategory(userId, categoryName);

        await insertTransaction({
          user_id: userId,
          category_id: category.id,
          amount: tx.amount,
          type: tx.type || 'expense',
          merchant: tx.merchant,
          description: tx.description,
          source: 'chat_manual',
          occurred_at: tx.occurred_at || new Date().toISOString(),
        });
      }

      // Activities
      if (ext.activity && ext.activity.title) {
        const act = ext.activity;
        await insertActivity({
          user_id: userId,
          title: act.title,
          description: act.description,
          occurred_at: act.occurred_at || new Date().toISOString(),
        });
      }

      // Preferences
      if (ext.preference && ext.preference.key) {
        const pref = ext.preference;
        await saveUserPreference(userId, pref.key, pref.value, pref.learned_from);
      }

      // Cancel/Delete Transaction (New feature to cancel transaction on user command)
      if (ext.cancel_transaction) {
        const cancel = ext.cancel_transaction;
        await softDeleteTransactionByCriteria(userId, {
          amount: cancel.amount || undefined,
          type: cancel.type || undefined,
        });
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
