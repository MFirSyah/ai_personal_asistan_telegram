import { Resend } from 'resend';
import { generateBriefingHtmlEmail, BriefingEmailData } from './briefing-html-template';

let resendClient: Resend | null = null;

function getResendClient(): Resend | null {
  if (!resendClient && process.env.RESEND_API_KEY) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

export async function sendBriefingEmail(
  toEmail: string,
  data: BriefingEmailData
): Promise<{ ok: boolean; id?: string; error?: string }> {
  if (!toEmail || !toEmail.includes('@')) {
    console.warn(`[SendEmail] Invalid destination email: ${toEmail}`);
    return { ok: false, error: 'Alamat email tidak valid.' };
  }

  const brevoApiKey = process.env.BREVO_API_KEY;
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!brevoApiKey && !resendApiKey) {
    console.warn(`[SendEmail] Neither BREVO_API_KEY nor RESEND_API_KEY is configured.`);
    return { ok: false, error: 'BREVO_API_KEY atau RESEND_API_KEY belum dikonfigurasi di environment variables.' };
  }

  const htmlContent = generateBriefingHtmlEmail(data);
  const subject = `☀️ Morning Briefing Harian — ${data.todayDateStr || new Date().toLocaleDateString('id-ID')}`;

  // 1. Primary Email Dispatcher: Brevo API (Supports sending to ANY recipient email address)
  if (brevoApiKey) {
    try {
      const senderEmail = process.env.BREVO_SENDER_EMAIL || process.env.RESEND_FROM_EMAIL || 'briefing@datacore.app';
      const senderName = process.env.BREVO_SENDER_NAME || 'DATA_CORE_V1 Assistant';

      const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'api-key': brevoApiKey,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          sender: { name: senderName, email: senderEmail },
          to: [{ email: toEmail, name: data.userName || 'Pengguna' }],
          subject: subject,
          htmlContent: htmlContent,
        }),
      });

      const responseData = await res.json();
      if (!res.ok) {
        console.error('[SendEmail] Brevo API error:', responseData);
        return { ok: false, error: responseData.message || 'Gagal mengirim email via Brevo API' };
      }

      console.log(`[SendEmail] Briefing email successfully delivered via Brevo to ${toEmail} (MessageID: ${responseData.messageId})`);
      return { ok: true, id: responseData.messageId, provider: 'brevo' };
    } catch (err: any) {
      console.error('[SendEmail] Exception during Brevo delivery:', err);
      return { ok: false, error: err.message || 'Terjadi kesalahan saat memanggil Brevo API', provider: 'brevo' };
    }
  }

  // 2. Secondary Fallback: Resend API
  const resend = getResendClient();
  if (resend) {
    try {
      const fromAddress = process.env.RESEND_FROM_EMAIL || 'DATA_CORE_V1 <onboarding@resend.dev>';
      const result = await resend.emails.send({
        from: fromAddress,
        to: [toEmail],
        subject: subject,
        html: htmlContent,
      });

      if (result.error) {
        console.error('[SendEmail] Resend API error:', result.error);
        return { ok: false, error: result.error.message, provider: 'resend (sandbox fallback)' };
      }

      console.log(`[SendEmail] Briefing email successfully delivered via Resend to ${toEmail} (ID: ${result.data?.id})`);
      return { ok: true, id: result.data?.id, provider: 'resend' };
    } catch (err: any) {
      console.error('[SendEmail] Exception during Resend delivery:', err);
      return { ok: false, error: err.message || 'Terjadi kesalahan saat memanggil Resend API', provider: 'resend' };
    }
  }

  return { ok: false, error: 'No active email provider configured' };
}
