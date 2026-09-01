/**
 * Proactive Companion Service (Raphael AI)
 * Evaluates current user activities & plans to generate context-aware, caring check-ins:
 * 1. Post-Event Check-in: Meeting / task ended -> ask for outcomes and new action items.
 * 2. Mid-Event Endurance Check-in: Long touring / travel -> remind to rest, hydrate, and share stories.
 * 3. Noon / Milestone Check-in: Campus / office tasks spanning midday -> check lunch break & offer afternoon reminder.
 */

export interface ProactiveCheckIn {
  id: string;
  activityId: string;
  type: 'post_event' | 'mid_event_endurance' | 'noon_milestone';
  title: string;
  message: string;
  suggestedReplies: string[];
  suggestedReminderTime?: string;
  timestamp: string;
}

// In-memory debounce cache per runtime (prevents spamming the same check-in multiple times)
const sentCheckInCache = new Set<string>();

export function evaluateProactiveCheckIns(
  activities: any[] = [],
  plans: any[] = [],
  referenceDate: Date = new Date()
): ProactiveCheckIn[] {
  const checkIns: ProactiveCheckIn[] = [];
  const currentHours = referenceDate.getHours();
  const currentMinutes = referenceDate.getMinutes();
  const currentTotalMinutes = currentHours * 60 + currentMinutes;
  const todayDateStr = referenceDate.toISOString().split('T')[0];

  for (const act of activities) {
    if (act.deleted_at || act.deletedAt) continue;

    const titleLower = String(act.title || '').toLowerCase();
    const descLower = String(act.description || '').toLowerCase();
    const combined = `${titleLower} ${descLower}`;
    const actId = String(act.id || 'act-0');
    const isCompleted = act.status === 'completed';

    // Parse time range e.g. "09.00 - 12.00", "09:00 - 12:00", "08.00 sd 17.00"
    const timeMatch = combined.match(/(\d{1,2})[\.:](\d{2})\s*(?:-|sd|hingga|sampai)\s*(\d{1,2})[\.:](\d{2})/);

    let startTotalMinutes: number | null = null;
    let endTotalMinutes: number | null = null;

    if (timeMatch) {
      const sH = parseInt(timeMatch[1], 10);
      const sM = parseInt(timeMatch[2], 10);
      const eH = parseInt(timeMatch[3], 10);
      const eM = parseInt(timeMatch[4], 10);
      startTotalMinutes = sH * 60 + sM;
      endTotalMinutes = eH * 60 + eM;
    } else {
      // Single time match e.g. "jam 08.00"
      const singleTimeMatch = combined.match(/(?:jam|pukul|dari)?\s*(\d{1,2})[\.:](\d{2})/);
      if (singleTimeMatch) {
        const sH = parseInt(singleTimeMatch[1], 10);
        const sM = parseInt(singleTimeMatch[2], 10);
        startTotalMinutes = sH * 60 + sM;
      }
    }

    // SCENARIO 1: POST-EVENT CHECK-IN
    // If activity had an end time and that end time passed recently (within last 90 minutes) or is marked completed recently
    if (endTotalMinutes !== null && !isCompleted) {
      const diffSinceEnd = currentTotalMinutes - endTotalMinutes;
      // Window: 0 to 90 minutes after end time
      if (diffSinceEnd >= 0 && diffSinceEnd <= 90) {
        const cacheKey = `post_event_${actId}_${todayDateStr}`;
        if (!sentCheckInCache.has(cacheKey)) {
          sentCheckInCache.add(cacheKey);
          checkIns.push({
            id: cacheKey,
            activityId: actId,
            type: 'post_event',
            title: `Evaluasi: ${act.title}`,
            message: `Gimana ${act.title}-nya tadi, Mas Firman? Apakah berjalan lancar? Ada keputusan penting atau to-do list baru yang mau saya bantu catatkan?`,
            suggestedReplies: [
              'Alhamdulillah lancar & beres',
              'Belum selesai, mau lanjut nanti',
              'Ada to-do list baru',
            ],
            timestamp: referenceDate.toISOString(),
          });
        }
      }
    }

    // SCENARIO 2: MID-EVENT ENDURANCE & SAFETY CHECK-IN (Touring / Berkendara / Perjalanan Luar Kota)
    const isTouringOrTravel =
      combined.includes('touring') ||
      combined.includes('berkendara') ||
      combined.includes('perjalanan') ||
      combined.includes('jogja') ||
      combined.includes('otw') ||
      combined.includes('motor') ||
      combined.includes('gowes');

    if (isTouringOrTravel && !isCompleted) {
      // If started >= 2 hours ago
      let startedHoursAgo = 2;
      if (startTotalMinutes !== null) {
        const diffMinutes = currentTotalMinutes - startTotalMinutes;
        startedHoursAgo = diffMinutes / 60;
      }

      if (startedHoursAgo >= 2) {
        const cacheKey = `mid_event_${actId}_${todayDateStr}_${Math.floor(startedHoursAgo)}`;
        if (!sentCheckInCache.has(cacheKey)) {
          sentCheckInCache.add(cacheKey);
          checkIns.push({
            id: cacheKey,
            activityId: actId,
            type: 'mid_event_endurance',
            title: `Cek Keselamatan Perjalanan: ${act.title}`,
            message: `Belum ada kabar nih Mas Firman, apakah masih berkendara? Menepi sejenak yuk untuk istirahat & minum air. Tadi selama beberapa jam di jalan situasinya aman dan ada cerita menarik apa aja?`,
            suggestedReplies: [
              'Aman, lagi menepi istirahat',
              'Masih lancar di jalan',
              'Sudah sampai di tujuan!',
            ],
            timestamp: referenceDate.toISOString(),
          });
        }
      }
    }

    // SCENARIO 3: NOON / MILESTONE CHECK-IN (Kampus, Kantor, Urus Berkas melintasi jam istirahat siang)
    const isMiddayTask =
      combined.includes('kampus') ||
      combined.includes('berkas') ||
      combined.includes('kantor') ||
      combined.includes('dinas') ||
      combined.includes('surat') ||
      combined.includes('bank') ||
      (startTotalMinutes !== null && endTotalMinutes !== null && startTotalMinutes <= 600 && endTotalMinutes >= 840);

    // Midday interval: 11:30 (690m) - 13:00 (780m)
    if (isMiddayTask && !isCompleted && currentTotalMinutes >= 690 && currentTotalMinutes <= 800) {
      const cacheKey = `noon_milestone_${actId}_${todayDateStr}`;
      if (!sentCheckInCache.has(cacheKey)) {
        sentCheckInCache.add(cacheKey);
        checkIns.push({
          id: cacheKey,
          activityId: actId,
          type: 'noon_milestone',
          title: `Istirahat Siang: ${act.title}`,
          message: `Gimana Mas Firman, urusan di ${act.title} sudah dapat yang diurus? Sudah jam 12 siang nih, biasanya kantor atau loket masuk jam istirahat.`,
          suggestedReplies: [
            'Belum nih, habis makan siang jam 1 balik lagi',
            'Alhamdulillah sudah beres semua',
            'Masih antre di loket',
          ],
          suggestedReminderTime: '13:00',
          timestamp: referenceDate.toISOString(),
        });
      }
    }
  }

  return checkIns;
}
