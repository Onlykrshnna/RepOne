import { createServerFn } from '@tanstack/react-start';

export interface SendEmailPayload {
  to: string;
  subject: string;
  html: string;
}

export const sendEmailFn = createServerFn({ method: 'POST' })
  .validator((d: SendEmailPayload) => d)
  .handler(async ({ data }) => {
    try {
      console.log('Sending email via Resend to:', data.to);
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer re_aeu3cKSX_2gesA8J146h2KZYsZ24v8RPc',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'onboarding@resend.dev',
          to: data.to,
          subject: data.subject,
          html: data.html
        })
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(JSON.stringify(result));
      }
      return result;
    } catch (err: any) {
      console.error('Error in sendEmailFn server handler:', err);
      throw err;
    }
  });

export const emailService = {
  async send({ to, subject, html }: SendEmailPayload) {
    try {
      // Call the server function from the client
      const res = await sendEmailFn({ data: { to, subject, html } });
      return res;
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }
};
