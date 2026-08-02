import { NextRequest, NextResponse } from 'next/server';
import { runChatOrchestration } from '@/lib/gemini/prompts/chat';
import {
  getRecentTransactions,
  getRecentActivities,
  getActivePlans,
  getRecentChatHistory,
  saveChatMessage,
  insertTransaction,
  insertActivity,
} from '@/lib/supabase/queries/transactions';
import { getUserPreferences, saveUserPreference } from '@/lib/supabase/queries/preferences';
import { getUserCategories, getOrCreateCategory, matchCategoryByEmbedding } from '@/lib/supabase/queries/categories';
import { categorizeItem } from '@/lib/gemini/prompts/categorize';
import { generateCategoryEmbedding } from '@/lib/gemini/client';
import { sendTelegramMessageBubbles, sendTelegramMessage, sendTelegramChatAction } from '@/lib/telegram/send-message';
import { sendTelegramChart } from '@/lib/telegram/send-chart';
import { sendTelegramLocation } from '@/lib/telegram/send-location';

export async function POST(req: NextRequest) {
  try {
    const { userId, chatId, userMessage, userName } = await req.json();

    if (!userId || !userMessage) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (chatId) {
      sendTelegramChatAction(chatId, 'typing').catch(console.error);
    }

    // 1. Fetch context
    const [transactions, activities, plans, preferences, history, categories] = await Promise.all([
      getRecentTransactions(userId, 15),
      getRecentActivities(userId, 15),
      getActivePlans(userId),
      getUserPreferences(userId, 15),
      getRecentChatHistory(userId, 10),
      getUserCategories(userId),
    ]);

    // Save user message to history
    await saveChatMessage(userId, 'user', userMessage);

    if (chatId) {
      sendTelegramChatAction(chatId, 'typing').catch(console.error);
    }

    // 2. Run Gemini AI Orchestration
    const result = await runChatOrchestration({
      userMessage,
      recentTransactions: transactions,
      recentActivities: activities,
      activePlans: plans,
      preferences,
      chatHistory: history,
      userName,
    });

    // 3. Process Extracted Data (if present)
    if (result.extracted_data) {
      const ext = result.extracted_data;

      // Transactions
      if (ext.transaction) {
        const tx = ext.transaction;
        const catNames = categories.map((c) => c.name);

        const catResult = await categorizeItem({
          transactionOrActivityName: tx.description || tx.merchant || 'Transaksi',
          merchant: tx.merchant,
          existingCategories: catNames,
        });

        let catId: string | undefined = undefined;

        if (catResult.isNewCategory) {
          const embedding = await generateCategoryEmbedding(catResult.categoryName);
          const matched = embedding.length
            ? await matchCategoryByEmbedding(userId, embedding, 0.85)
            : null;

          if (matched) {
            catId = matched.id;
          } else {
            const newCat = await getOrCreateCategory(userId, catResult.categoryName, embedding);
            catId = newCat.id;
          }
        } else {
          const existingCat = categories.find((c) => c.name.toLowerCase() === catResult.categoryName.toLowerCase());
          if (existingCat) {
            catId = existingCat.id;
          } else {
            const newCat = await getOrCreateCategory(userId, catResult.categoryName);
            catId = newCat.id;
          }
        }

        await insertTransaction({
          user_id: userId,
          category_id: catId,
          amount: tx.amount,
          type: tx.type || 'expense',
          merchant: tx.merchant,
          description: tx.description,
          source: 'chat_manual',
          occurred_at: tx.occurred_at || new Date().toISOString(),
        });
      }

      // Activities
      if (ext.activity) {
        const act = ext.activity;
        await insertActivity({
          user_id: userId,
          title: act.title,
          description: act.description,
          occurred_at: act.occurred_at || new Date().toISOString(),
        });
      }

      // Preferences
      if (ext.preference) {
        const pref = ext.preference;
        await saveUserPreference(userId, pref.key, pref.value, pref.learned_from);
      }
    }

    // 4. Save Assistant Response to Chat History
    const fullAssistantText = [...(result.messages || []), result.follow_up_question].filter(Boolean).join('\n');
    await saveChatMessage(userId, 'assistant', fullAssistantText);

    // 5. Send Rich Responses to Telegram
    if (chatId) {
      // Message bubbles
      if (result.messages && result.messages.length > 0) {
        await sendTelegramMessageBubbles(chatId, result.messages, 1000);
      }

      // Chart
      if (result.chart) {
        await sendTelegramChart(chatId, result.chart, result.chart.title || 'Visualisasi Grafik');
      }

      // Location
      if (result.location) {
        await sendTelegramLocation(chatId, result.location.lat, result.location.lng);
      }

      // Follow-up question
      if (result.follow_up_question) {
        await sendTelegramMessage(chatId, result.follow_up_question);
      }
    }

    return NextResponse.json({ ok: true, result });
  } catch (error: any) {
    console.error('Error in chat/respond endpoint:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
