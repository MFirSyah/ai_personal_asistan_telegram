import { fetchLiveWeather, OFFICIAL_FACTS } from '@/lib/services/live-grounding';

import {
  runFinancialSimulation,
  calculateItemAffordability,
  checkSmartScheduleConflict,
  optimizeTripBudget,
  calculateLoanRisk,
  calculateRealtimeLedger,
  calculatePlanProgress,
} from '@/lib/analytics/calculators';

import {
  getRecentTransactions,
  getAllActiveTransactions,
  getRecentActivities,
  getActivePlans,
  getRecentChatHistory,
  saveChatMessage,
  insertTransaction,
  insertActivity,
  upsertPlan,
  softDeleteTransactionByCriteria,
  randomizeTransactionTimestamps,
  randomizeActivityTimestamps,
  updateRecordById,
  deleteRecordById,
  getRecordDetailsByShortOrFull,
  syncAllRecordTimestampsToCreatedAt,
  consolidateDuplicateCashTransactions,
} from '@/lib/supabase/queries/transactions';
import { getUserPreferences, saveUserPreference } from '@/lib/supabase/queries/preferences';
import { updateUserName } from '@/lib/supabase/queries/sessions';
import { getUserCategories, getOrCreateCategory } from '@/lib/supabase/queries/categories';
import { sendTelegramMessageBubbles, sendTelegramMessage, sendTelegramChatAction, sendTelegramDocument } from '@/lib/telegram/send-message';
import { appendTransactionRealtime, appendActivityRealtime } from '@/lib/google-sheets/sync';
import { sendTelegramChart } from '@/lib/telegram/send-chart';
import { sendTelegramLocation } from '@/lib/telegram/send-location';
import { buildConfirmationInlineKeyboard, buildQuickActionKeyboard, buildWalletSelectionKeyboard } from '@/lib/telegram/inline-keyboard';
import { runChatOrchestration } from '@/lib/gemini/prompts/chat';
import { generateExportFile } from '@/lib/export/export-data';
import { checkTransactionAnomaly, checkActivityCollision } from '@/lib/analytics/anomalies';
import { supabaseAdmin } from '@/lib/supabase/client';

function parseSafeIsoDate(dateStr?: string, defaultTimestampMs?: number): string {
  const fallbackDate = defaultTimestampMs ? new Date(defaultTimestampMs) : new Date();
  if (!dateStr || !dateStr.trim()) return fallbackDate.toISOString();

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
    const now = defaultTimestampMs ? new Date(defaultTimestampMs) : new Date();

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
      return fallbackDate.toISOString();
    }

    // Convert WIB hour to UTC hour (wibHour - 7)
    const d = new Date(Date.UTC(year, month, day, wibHour - 7, wibMin));
    if (!isNaN(d.getTime())) {
      if (d.getMonth() === 0 && d.getDate() === 1 && d.getUTCHours() === 0 && d.getUTCMinutes() === 0) {
        return fallbackDate.toISOString();
      }
      return d.toISOString();
    }
  } catch (e) {
    // Fallback to current time
  }

  return fallbackDate.toISOString();
}

export async function processChatRespondDirect(
  userId: string,
  chatId: number | string,
  userMessage: string,
  userName?: string,
  messageTimestampMs?: number
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

    // 2. Proactive Grounding: Fetch Live Weather & Official Fuel Prices
    let runtimePrefs = [...preferences];
    const isOutdoorOrTripQuery = /(cuaca|hujan|narik|gojek|dieng|bromo|trip|liburan|bensin|jalan|sore|pagi|malam|otw)/i.test(userMessage);
    if (isOutdoorOrTripQuery) {
      const locKey = /dieng/i.test(userMessage) ? 'dieng' : (/bromo/i.test(userMessage) ? 'bromo' : 'malang');
      try {
        const liveWeather = await fetchLiveWeather(locKey);
        if (liveWeather) {
          runtimePrefs.push({
            id: 'live-weather',
            user_id: userId,
            key: `Kondisi Cuaca Realtime (${liveWeather.city})`,
            value: `Suhu: ${liveWeather.temperatureC}°C, Kondisi: ${liveWeather.weatherDescription}, Kelembaban: ${liveWeather.humidityPct}%, Saran: ${liveWeather.advice}`,
            updated_at: new Date().toISOString(),
          });
        }
      } catch (wErr) {
        console.warn('Live weather grounding fetch skipped:', wErr);
      }
    }

    const isFuelQuery = /(bbm|bensin|pertamax|pertalite|solar|dexlite|biosolar|turbo|liter|harga bensin)/i.test(userMessage);
    if (isFuelQuery) {
      runtimePrefs.push({
        id: 'official-bbm-prices',
        user_id: userId,
        key: 'Daftar Resmi Harga BBM Pertamina Jawa Timur',
        value: OFFICIAL_FACTS.fuelPricesEastJavaString,
        updated_at: new Date().toISOString(),
      });
    }

    // 3. Proactive Grounding: Realtime Ledger Aggregator for Balance & Financial Queries
    const isBalanceOrFinancialQuery = /(saldo|uang|dompet|kas|cek saldo|posisi dana|duit|keuangan|rekap|tabungan|sisa dana|ringkasan saldo)/i.test(userMessage);
    if (isBalanceOrFinancialQuery) {
      try {
        const allActiveTxs = await getAllActiveTransactions(userId);
        const ledger = calculateRealtimeLedger(allActiveTxs);
        runtimePrefs.push({
          id: 'realtime-ledger-balances',
          user_id: userId,
          key: 'EXECUTIVE REALTIME WALLET LEDGER (HASIL HITUNGAN RESMI DATABASE SUPABASE)',
          value: ledger.summaryString,
          updated_at: new Date().toISOString(),
        });

        // Proactive Grounding: Calculate Full Plan / Trip Progress
        const isPlanOrTripQuery = /(dieng|trip|wisata|liburan|tiket|cicil|nyicil|sisa bayar|kurang bayar|sudah bayar)/i.test(userMessage);
        if (isPlanOrTripQuery) {
          const diengProgress = calculatePlanProgress('dieng', allActiveTxs, 1040000);
          runtimePrefs.push({
            id: 'dieng-plan-progress',
            user_id: userId,
            key: 'REKAP RESMI PROGRES CICILAN TIKET & TRIP DIENG (DATABASE SUPABASE)',
            value: diengProgress.summaryString,
            updated_at: new Date().toISOString(),
          });
        }
      } catch (lErr) {
        console.warn('Realtime ledger aggregation skipped:', lErr);
      }
    }

    // Run Gemini AI Orchestration with existing category list and live grounding
    const catNames = categories.map((c) => c.name);
    const result = await runChatOrchestration({
      userMessage,
      recentTransactions: transactions,
      recentActivities: activities,
      activePlans: plans,
      preferences: runtimePrefs,
      chatHistory: history,
      userName,
      existingCategories: catNames,
    });

    // =========================================================================
    // ⚡ FAST-PATH TELEGRAM DISPATCH (<2s): Send message bubbles to user IMMEDIATELY!
    // =========================================================================
    if (chatId) {
      // 1. Evaluate Multi-Location Interactive Cards (ONLY for genuine geographical place/venue recommendations)
      let effectiveLocations: any[] = [];
      
      const userMsgLower = (userMessage || '').toLowerCase();
      const isPlaceRecommendationQuery = /(rekomendasi|tempat|lokasi|wisata|kafe|cafe|resto|restoran|kuliner|hotel|villa|homestay|destinasi|spot|pantai|gunung|taman|mall|ngopi|nongkrong|pariwisata|liburan ke mana)/i.test(userMsgLower);

      // Check if message text has bullet point places ONLY if it is an actual place query
      let bulletLocations: any[] = [];
      if (isPlaceRecommendationQuery && (!result.locations || result.locations.length === 0) && result.messages && result.messages.length > 0) {
        const fullMsg = result.messages.join('\n');
        // Only if message contains actual location keywords (maps link, address, or pin icon)
        if (fullMsg.includes('Google Maps') || fullMsg.includes('Alamat:') || fullMsg.includes('📍') || fullMsg.includes('Daya Tarik:')) {
          const bulletMatches = fullMsg
            .split(/\n(?=[•\-\*]\s*[\p{Emoji}\w])/u)
            .filter(b => b.trim().startsWith('•') || b.trim().startsWith('-') || b.trim().startsWith('*'));

          if (bulletMatches.length >= 2) {
            bulletLocations = bulletMatches.map((b, i) => {
              const cleaned = b.replace(/^[•\-\*]\s*/, '').trim();
              const nameMatch = cleaned.match(/\*\*(.*?)\*\*/);
              const name = nameMatch ? nameMatch[1].replace(/^[\p{Emoji}\s]+/u, '').replace(/:$/, '').trim() : `Rekomendasi ${i + 1}`;
              const desc = cleaned.replace(/^[\p{Emoji}\s]*\*\*.*?\*\*[:\s]*/u, '').trim() || cleaned;
              
              const matchedLoc = result.locations?.find((l: any) => l.name && (l.name.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(l.name.toLowerCase())));
              
              return {
                name,
                category: matchedLoc?.category || 'Rekomendasi Pilihan',
                address: matchedLoc?.address || 'Lokasi Strategis',
                lat: matchedLoc?.lat || 0,
                lng: matchedLoc?.lng || 0,
                description: desc,
                highlights: matchedLoc?.highlights || desc,
                price_range: matchedLoc?.price_range || 'Standar / Terjangkau',
                google_maps_url: matchedLoc?.google_maps_url || (matchedLoc?.lat && matchedLoc?.lng ? `https://www.google.com/maps/search/?api=1&query=${matchedLoc.lat},${matchedLoc.lng}` : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}`)
              };
            });
          }
        }
      }

      // Prioritize structured locations explicitly returned by Gemini
      if (result.locations && Array.isArray(result.locations) && result.locations.length > 0) {
        effectiveLocations = result.locations;
      } else if (bulletLocations.length >= 2) {
        effectiveLocations = bulletLocations;
      }

      // 2. Send Clean Intro Message & Interactive Route Navigation Button
      if (result.messages && result.messages.length > 0) {
        let introMessages = result.messages;

        // Check if message contains a Google Maps Directions URL
        let extractedRouteUrl: string | null = null;
        for (const msg of introMessages) {
          const match = msg.match(/https?:\/\/(?:www\.)?google\.com\/maps\/dir\/[^\s\)\"\']+/i);
          if (match) {
            extractedRouteUrl = match[0];
            break;
          }
        }

        // Clean raw markdown link from message text if present so message is neat
        if (extractedRouteUrl) {
          introMessages = introMessages.map((m: string) => {
            return m.replace(/\[🗺️\s*Buka Rute[^\(]*\]\([^\)]+\)/gi, '')
                    .replace(/https?:\/\/(?:www\.)?google\.com\/maps\/dir\/[^\s\)\"\']+/gi, '')
                    .trim();
          }).filter((m: string) => m.length > 0);
        }

        if (effectiveLocations.length > 0) {
          introMessages = introMessages.map((m: string) => {
            const bulletIdx = m.search(/\n\s*[•\-\*]\s*[\p{Emoji}\w]/u);
            if (bulletIdx !== -1) {
              return m.substring(0, bulletIdx).trim();
            }
            return m.replace(/\[🗺️ Buka Google Maps\].*$/gi, '').replace(/🗺️ Buka Google Maps.*$/gi, '').trim();
          }).filter((m: string) => m.length > 0);
        }

        const needsWalletClarification = 
          Boolean(result.extracted_data?.transactions && result.extracted_data.transactions.some((t: any) => t.needs_wallet_clarification || !t.payment_method || t.payment_method === 'Unspecified')) ||
          introMessages.some(m => m.toLowerCase().includes('cash kertas atau non-tunai') || m.toLowerCase().includes('dibayarkan via') || m.toLowerCase().includes('mohon konfirmasi'));

        if (introMessages.length > 0) {
          let replyMarkup = undefined;
          if (extractedRouteUrl) {
            replyMarkup = { inline_keyboard: [[{ text: '🏍️ Buka Rute Navigasi di Google Maps', url: extractedRouteUrl }]] };
          } else if (needsWalletClarification) {
            replyMarkup = buildWalletSelectionKeyboard();
          } else if (effectiveLocations.length === 0) {
            replyMarkup = buildQuickActionKeyboard();
          }

          await sendTelegramMessageBubbles(chatId, introMessages, 150, replyMarkup);
        }
      }

      // 3. Dispatch Individual Location Cards (<20 items) with Google Maps button (SYNCHRONOUS AWAIT to prevent Vercel Serverless early kill)
      if (effectiveLocations.length > 0) {
        const locList = effectiveLocations.slice(0, 20);
        for (let idx = 0; idx < locList.length; idx++) {
          const loc = locList[idx];
          if (!loc || !loc.name) continue;

          let card = `📍 **${idx + 1}. ${loc.name.toUpperCase()}**\n`;
          if (loc.category) card += `🏛️ **Kategori**: ${loc.category}\n`;
          if (loc.address) card += `📌 **Alamat**: ${loc.address}\n`;
          if (loc.highlights || loc.description) card += `💡 **Daya Tarik**: ${loc.highlights || loc.description}\n`;
          if (loc.price_range) card += `💵 **Estimasi Biaya**: ${loc.price_range}\n`;

          // Dynamic Custom Details (On-The-Fly Attributes requested by user, e.g. Spot Foto, Jam Kunjung, Wifi, Menu, etc.)
          if (loc.custom_details && typeof loc.custom_details === 'object') {
            for (const [key, val] of Object.entries(loc.custom_details)) {
              if (val && typeof val === 'string' && val.trim().length > 0) {
                const cleanKey = key.replace(/^•\s*/, '').replace(/\*\*/g, '').trim();
                card += `• **${cleanKey}**: ${val}\n`;
              }
            }
          }

          const mapsQuery = loc.lat && loc.lng && loc.lat !== 0
            ? `${loc.lat},${loc.lng}`
            : encodeURIComponent(`${loc.name} ${loc.address || ''}`);
          const mapsUrl = loc.google_maps_url || `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;

          const replyMarkup = {
            inline_keyboard: [
              [{ text: '🗺️ Buka di Google Maps', url: mapsUrl }]
            ]
          };

          try {
            await sendTelegramMessage(chatId, card.trim(), replyMarkup);
          } catch (sendErr) {
            console.error('Failed to send location card:', sendErr);
          }
        }
      }

      // 3.5. Dispatch Interactive Route Card with Google Maps Turn-by-Turn Navigation Button
      const routeData = result.route || (result.extracted_data as any)?.route;
      if (routeData && (routeData.origin || routeData.destination)) {
        let routeCard = `🗺️ **RUTE NAVIGASI: ${(routeData.title || 'Panduan Perjalanan').toUpperCase()}**\n\n`;
        routeCard += `🚩 **Titik Awal**: ${routeData.origin}\n`;
        routeCard += `🏁 **Tujuan Akhir**: ${routeData.destination}\n`;
        
        if (routeData.estimated_distance_km) {
          routeCard += `📏 **Total Jarak**: ~${routeData.estimated_distance_km} KM`;
          if (routeData.estimated_time_hours) routeCard += ` (~${routeData.estimated_time_hours} Jam)`;
          routeCard += `\n`;
        }
        
        if (routeData.estimated_fuel_liters) {
          routeCard += `⛽ **Estimasi Bensin (Beat)**: ~${routeData.estimated_fuel_liters} Liter`;
          if (routeData.estimated_fuel_cost_rp) routeCard += ` (Rp ${routeData.estimated_fuel_cost_rp.toLocaleString('id-ID')})`;
          routeCard += `\n`;
        }

        if (routeData.waypoints && Array.isArray(routeData.waypoints) && routeData.waypoints.length > 0) {
          routeCard += `\n📍 **Titik Persinggahan (Waypoints)**:\n`;
          routeData.waypoints.forEach((wp: string, i: number) => {
            routeCard += `${i + 1}. ${wp}\n`;
          });
        }

        if (routeData.stops && Array.isArray(routeData.stops) && routeData.stops.length > 0) {
          routeCard += `\n📋 **Jadwal & Agenda Perjalanan**:\n`;
          routeData.stops.forEach((s: any, idx: number) => {
            const timePrefix = s.recommended_time ? `[${s.recommended_time}] ` : '';
            routeCard += `• **${s.location_name || `Titik ${idx + 1}`}**: ${timePrefix}${s.activity_or_notes || ''}\n`;
          });
        }

        // Construct Universal Google Maps Directions URL if not provided or to ensure two_wheeler mode
        let mapsNavUrl = routeData.google_maps_directions_url;
        if (!mapsNavUrl || !mapsNavUrl.includes('google.com/maps/dir')) {
          const originEnc = encodeURIComponent(routeData.origin);
          const destEnc = encodeURIComponent(routeData.destination);
          const waypointsEnc = routeData.waypoints && routeData.waypoints.length > 0
            ? `&waypoints=${routeData.waypoints.map((w: string) => encodeURIComponent(w)).join('%7C')}`
            : '';
          const mode = routeData.travel_mode || 'two_wheeler';
          mapsNavUrl = `https://www.google.com/maps/dir/?api=1&origin=${originEnc}&destination=${destEnc}${waypointsEnc}&travelmode=${mode}`;
        }

        const routeMarkup = {
          inline_keyboard: [
            [{ text: '🏍️ Buka Rute Navigasi di Google Maps', url: mapsNavUrl }]
          ]
        };

        try {
          await sendTelegramMessage(chatId, routeCard.trim(), routeMarkup);
        } catch (routeErr) {
          console.error('Failed to send route card:', routeErr);
        }
      }

      // 4. Send Chart if present
      if (result.chart) {
        sendTelegramChart(chatId, result.chart, result.chart.title || 'Visualisasi Grafik').catch(console.error);
      }

      // 5. Send Single Location if present AND no multi-locations
      if (result.location && effectiveLocations.length === 0) {
        sendTelegramLocation(chatId, result.location.lat, result.location.lng).catch(console.error);
      }

      // 6. Anti-duplicate follow-up dispatch
      if (
        result.follow_up_question &&
        result.follow_up_question.trim().length > 0 &&
        !result.messages?.some((m: string) => m.toLowerCase().includes(result.follow_up_question!.trim().toLowerCase()))
      ) {
        sendTelegramMessage(chatId, result.follow_up_question).catch(console.error);
      }
    }

    // 3. Concurrently Process Extracted Data & Database Persistences in Parallel
    if (result.extracted_data) {
      const ext = result.extracted_data;

      // Parallel Transaction Processing
      const txList = ext.transactions || (ext.transaction ? [ext.transaction] : []);
      const txPromises = txList.map(async (tx) => {
        if (!tx || tx.amount <= 0) return;
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
            occurred_at: parseSafeIsoDate(tx.occurred_at, messageTimestampMs),
          });

          // Real-time Google Sheets Stream Sync (runs in background)
          appendTransactionRealtime(userId, tx).catch((err) => console.error('[Google Sheets Realtime Error]:', err));

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
      });

      // Parallel Activity Processing
      const actList = ext.activities || (ext.activity ? [ext.activity] : []);
      const actPromises = actList.map(async (act) => {
        if (!act || !act.title) return;
        try {
          await insertActivity({
            user_id: userId,
            title: act.title,
            description: act.description,
            status: act.status || 'scheduled',
            priority: act.priority || 'medium',
            tags: act.tags || [],
            occurred_at: parseSafeIsoDate(act.occurred_at, messageTimestampMs),
          });

          // Real-time Google Sheets Stream Sync (runs in background)
          appendActivityRealtime(userId, act).catch((err) => console.error('[Google Sheets Realtime Error]:', err));

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
      });

      // Parallel Plans Processing
      const planList = (ext as any).plans || ((ext as any).plan ? [(ext as any).plan] : []);
      const planPromises = planList.map(async (p: any) => {
        if (!p || !p.title) return;
        try {
          let desc = p.description || '';
          if (p.budget_breakdown && Array.isArray(p.budget_breakdown)) {
            const breakdownStr = p.budget_breakdown.map((b: any) => `${b.item}: Rp ${Number(b.amount || 0).toLocaleString('id-ID')}`).join(', ');
            desc = desc ? `${desc} | Rincian: ${breakdownStr}` : `Rincian: ${breakdownStr}`;
          }
          if (p.budget_total) {
            desc = `${desc} | Total Budget: Rp ${Number(p.budget_total).toLocaleString('id-ID')}`;
          }
          if (p.strategy) {
            desc = `${desc} | Strategi: ${p.strategy}`;
          }

          await upsertPlan(userId, {
            user_id: userId,
            title: p.title,
            description: desc.trim(),
            target_date: p.target_date,
            status: p.status || 'planned',
          });
        } catch (planErr) {
          console.error('Error saving plan to Supabase:', planErr);
        }
      });

      // Parallel Preferences Processing
      const prefList = ext.preferences || (ext.preference ? [ext.preference] : []);
      const prefPromises = prefList.map(async (pref: any) => {
        if (!pref || !pref.key) return;
        await saveUserPreference(userId, pref.key, pref.value, pref.learned_from || userMessage);

        const keyLower = pref.key.toLowerCase();
        if (keyLower.includes('nama') || keyLower.includes('name') || keyLower.includes('panggilan')) {
          const cleanName = String(pref.value || '').trim().replace(/^["']|["']$/g, '');
          if (cleanName) {
            await updateUserName(userId, cleanName);
          }
        }
      });

      // Await all parallel operations
      await Promise.allSettled([...txPromises, ...actPromises, ...planPromises, ...prefPromises]);

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

      // Simulation / What-If Request
      if ((ext as any).run_simulation_request && chatId) {
        try {
          const req = (ext as any).run_simulation_request;
          const res = await runFinancialSimulation(userId, req.timeframe || 'next_6m', req.customParams);
          let replyMsg = `📊 **${res.scenarioName.toUpperCase()}**\n\n`;
          replyMsg += `• **Estimasi Saldo Akhir**: Rp ${res.projectedEndingBalance.toLocaleString('id-ID')}\n`;
          replyMsg += `• **Ketahanan Saldo (Runway)**: ${res.runwayDays} hari\n`;
          replyMsg += `• **Rata-rata Pengeluaran Harian**: Rp ${res.burnRatePerDay.toLocaleString('id-ID')}/hari\n\n`;
          if (res.recommendations.length > 0) {
            replyMsg += `💡 **Rekomendasi Butler**:\n` + res.recommendations.map(r => `• ${r}`).join('\n');
          }
          await sendTelegramMessage(chatId, replyMsg);
        } catch (simErr) {
          console.error('Error running financial simulation:', simErr);
        }
      }

      // Affordability Check Request (Motor 25 Juta)
      if ((ext as any).check_affordability_request && chatId) {
        try {
          const req = (ext as any).check_affordability_request;
          const res = await calculateItemAffordability(userId, req.itemName || 'Barang', req.itemPrice || 0);
          let icon = res.decision === 'SAFE_TO_BUY' ? '✅' : res.decision === 'RISKY_NEAR_EMERGENCY_FUND' ? '⚠️' : '🛑';
          let replyMsg = `${icon} **ANALISIS KELAYAKAN PEMBELIAN (${res.itemName.toUpperCase()})**\n\n`;
          replyMsg += `• **Harga Barang**: Rp ${res.itemPrice.toLocaleString('id-ID')}\n`;
          replyMsg += `• **Total Saldo Aktif**: Rp ${res.currentTotalBalance.toLocaleString('id-ID')}\n`;
          replyMsg += `• **Cadangan Dana Darurat (3 Bulan)**: Rp ${res.emergencyFundRequired.toLocaleString('id-ID')}\n`;
          replyMsg += `• **Saldo Bebas Aman**: Rp ${res.freeBalance.toLocaleString('id-ID')}\n\n`;
          replyMsg += `💬 **Penjelasan Butler**:\n${res.explanation}`;
          await sendTelegramMessage(chatId, replyMsg);
        } catch (affErr) {
          console.error('Error checking affordability:', affErr);
        }
      }

      // Schedule Conflict & Travel Buffer Request
      if ((ext as any).check_schedule_conflict_request && chatId) {
        try {
          const req = (ext as any).check_schedule_conflict_request;
          const res = await checkSmartScheduleConflict(userId, req.targetDate || new Date().toISOString(), req.destination);
          let replyMsg = `📅 **ANALISIS BENTROK AGENDA & TRAVEL BUFFER**\n\n`;
          replyMsg += `• **Tanggal Target**: ${res.targetDate}\n`;
          replyMsg += `• **Estimasi Perjalanan**: ~${res.travelBufferNeededHours} jam\n`;
          replyMsg += `• **Sisa Waktu Luang**: ${res.restHoursAvailable} jam\n\n`;
          replyMsg += `💬 **Rekomendasi Butler**:\n${res.recommendation}`;
          await sendTelegramMessage(chatId, replyMsg);
        } catch (confErr) {
          console.error('Error checking schedule conflict:', confErr);
        }
      }

      // Trip Budget Optimization Request
      if ((ext as any).optimize_trip_budget_request && chatId) {
        try {
          const req = (ext as any).optimize_trip_budget_request;
          const res = await optimizeTripBudget(userId, req.destination || 'Tujuan', req.items || []);
          let replyMsg = `🗺️ **REKOMENDASI OPTIMISASI BUDGET TRIP (${res.destination.toUpperCase()})**\n\n`;
          replyMsg += `• **Total Draf Awal**: Rp ${res.originalBudget.toLocaleString('id-ID')}\n`;
          replyMsg += `• **Total Rekomendasi Hemat**: Rp ${res.optimizedBudget.toLocaleString('id-ID')}\n`;
          replyMsg += `• **Potensi Penghematan**: Rp ${res.potentialSavings.toLocaleString('id-ID')}\n\n`;
          replyMsg += `📋 **Rincian Pos**:\n`;
          res.itemizedBreakdown.forEach(item => {
            replyMsg += `• **${item.item}**: Rp ${item.recommended.toLocaleString('id-ID')} (${item.note})\n`;
          });
          replyMsg += `\n💬 **Pesan Butler**:\n${res.butlerAdvice}`;
          await sendTelegramMessage(chatId, replyMsg);
        } catch (optErr) {
          console.error('Error optimizing trip budget:', optErr);
        }
      }

      // Loan Risk & Pinjol Stress Test Request
      if ((ext as any).check_loan_risk_request && chatId) {
        try {
          const req = (ext as any).check_loan_risk_request;
          const res = await calculateLoanRisk(
            userId,
            req.principal || 500000,
            req.dailyInterestRatePct ?? 0.2,
            req.tenorMonths ?? 12
          );
          let icon = res.decision === 'STRONGLY_REJECT' ? '🛑' : '⚠️';
          let replyMsg = `${icon} **ANALISIS RISIKO PINJAMAN ONLINE (PINJOL STRESS TEST)**\n\n`;
          replyMsg += `• **Pokok Pinjaman**: Rp ${res.principal.toLocaleString('id-ID')}\n`;
          replyMsg += `• **Bunga Harian**: ${res.dailyInterestRatePct}% / hari (${res.effectiveAnnualRatePct.toFixed(1)}% / tahun!)\n`;
          replyMsg += `• **Total Bunga Membengkak**: Rp ${res.totalInterestPayable.toLocaleString('id-ID')}\n`;
          replyMsg += `• **Total Pengembalian (Pokok + Bunga)**: Rp ${res.totalRepaymentTotal.toLocaleString('id-ID')}\n`;
          replyMsg += `• **Estimasi Cicilan**: Rp ${res.monthlyRepaymentEst.toLocaleString('id-ID')} / bulan (${res.tenorMonths} bulan)\n\n`;
          replyMsg += `💬 **Peringatan & Saran Royal Butler**:\n${res.butlerAdvice}`;
          await sendTelegramMessage(chatId, replyMsg);
        } catch (loanErr) {
          console.error('Error checking loan risk:', loanErr);
        }
      }

      // Reconcile Wallet Balances Request
      if ((ext as any).reconcile_wallet_balances && chatId) {
        try {
          const { mergedCount, newRecordId } = await consolidateDuplicateCashTransactions(userId);
          const msg = mergedCount > 0
            ? `👛 **KONSOLIDASI SALDO DOMPET BERHASIL!**\n\n• **Total Transaksi Terpisah Digabung**: ${mergedCount} entri\n• **ID Transaksi Konsolidasi Baru**: [${newRecordId}]\n\nSeluruh catatan pecahan tunai (kertas, koin, penyesuaian) telah digabungkan secara rapi menjadi 1 entri Saldo Cash di database!`
            : `👛 **REKONSILIASI SALDO DOMPET**\n\nSeluruh saldo dompet kamu (SeaBank, Cash, Gopay, BCA, dll) sudah tercatat rapi dan berada dalam kondisi ideal tanpa duplikasi!`;
          await sendTelegramMessage(chatId, msg);
        } catch (recErr) {
          console.error('Error reconciling wallet balances:', recErr);
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

  } catch (error) {
    console.error('Error in processChatRespondDirect:', error);
    if (chatId) {
      await sendTelegramMessage(chatId, 'Maaf, terjadi kesalahan saat memproses pesan kamu.');
    }
  }
}
