import postmark from 'postmark';
import { db } from '@/db';
import { emails } from '@/db/schema/emails';


const emailLogToDb = async (result: postmark.Models.MessageSendingResponse, subject: string, to: string) => {
    await db.insert(emails).values({
        messageId: result.MessageID,
        status: result.Message,
        subject,
        submittedAt: new Date(result.SubmittedAt),
        to,
    });
}

// Example 1: Send a simple email
export async function sendSimpleEmail(
    {
        from,
        to,
        subject,
        body,
        ccEmail
    }: {
        from?: string,
        to: string,
        subject: string,
        body: string,
        ccEmail?: string
    }
) {
    const TOKEN = process.env.POSTMARK_SERVER_TOKEN || ''
    const SENDER_EMAIL = process.env.POSTMARK_SENDER_EMAIL
    // Initialize the client with your Server Token
    const client = new postmark.ServerClient(TOKEN);
    const env_mode = process.env.NODE_ENV

    if (!TOKEN || !client) return;

    try {
        const isDevelopment = env_mode === 'development';

        const defaultFrom = `Pace Pharmacy <${SENDER_EMAIL}>`;

        // If development → always use default
        // If not development → use provided `from` or fallback to default
        const resolvedFrom = isDevelopment
            ? defaultFrom
            : (from || defaultFrom);

        const emailPayload: any = {
            From: resolvedFrom,
            To: to,
            Subject: subject,
            TextBody: 'This is a plain text email sent by Pace Pharmacy via Postmark!',
            HtmlBody: body,
            MessageStream: 'outbound',
        };

        // Only add CC + ReplyTo in non-development mode
        if (!isDevelopment && ccEmail) {
            emailPayload.Cc = ccEmail;
            emailPayload.ReplyTo = ccEmail;
        }
        const result = await client.sendEmail(emailPayload);
        emailLogToDb(
            result,
            subject,
            to
        )

        console.log('Email sent successfully!');
        console.log('Message ID:', result.MessageID);
    } catch (error) {
        console.error('Error sending email:', error);
    }
}