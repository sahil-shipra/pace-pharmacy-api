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
    { to,
        subject,
        body,
        ccEmail
    }: {
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

    if (!TOKEN || !client) return;

    try {
        const result = await client.sendEmail({
            From: `${'Pace Pharmacy'} <${SENDER_EMAIL}>`,
            To: to,
            ...(ccEmail && { Cc: ccEmail }),
            Subject: subject,
            TextBody: 'This is a plain text email sent by Pace Pharmacy via Postmark!',
            HtmlBody: body,
            MessageStream: 'outbound'
        });

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