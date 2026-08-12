import { Resend } from 'resend';
import { generateBriefingHtmlEmail, BriefingEmailData } from './briefing-html-template';

let resendClient: Resend | null = null;

function getResendClient(): Resend | null {
  if (!resendClient && process.env.RESEND_API_KEY) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

export async function sendBriefingEmail(toEmail: string, data: BriefingEmailData): Promise<{ ok: boolean; id?: string; error?: string }> {
  const client = getResendClient();

  if (!client) {
    console.warn(`[SendEmail] RESEND_API_KEY is missing. Skipping email briefing to ${toEmail}.`);
    return { ok: false, error: 'RESEND_API_KEY is not configured in environment variables.' };
  }

  if (!toEmail || !toEmail.includes('@')) {
    console.warn(`[SendEmail] Invalid destination email: ${toEmail}`);
    return { ok: false, error: 'Invalid email address' };
  }

  try {
    const htmlContent = generateBriefingHtmlEmail(data);
    const fromAddress = process.env.RESEND_FROM_EMAIL || 'DATA_CORE_V1 <onboarding@resend.dev>';

    const result = await client.emails.send({
      from: fromAddress,
      to: [toEmail],
      subject: `☀️ Morning Briefing Harian — ${data.todayDateStr || new Date().toLocaleDateString('id-ID')}`,
      html: htmlContent,
    });

    if (result.error) {
      console.error('[SendEmail] Resend API returned error:', result.error);
      return { ok: false, error: result.error.message };
    }

    console.log(`[SendEmail] Briefing email successfully delivered to ${toEmail} (ID: ${result.data?.id})`);
    return { ok: true, id: result.data?.id };
  } catch (err: any) {
    console.error('[SendEmail] Exception during email delivery:', err);
    return { ok: false, error: err.message || 'Unknown email delivery error' };
  }
}
