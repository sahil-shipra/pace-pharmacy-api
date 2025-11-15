import postmark from 'postmark';
import { renderMjmlTemplate } from './email-template';
import { db } from '@/db';
import { emails } from '@/db/schema/emails';

// Example 1: Send a simple email
export async function sendSimpleEmail(
    { to,
        subject,
        body
    }: {
        to: string,
        subject: string,
        body: string,
    }
) {
    const TOKEN = process.env.POSTMARK_SERVER_TOKEN || ''
    // Initialize the client with your Server Token
    const client = new postmark.ServerClient(TOKEN);

    if (!TOKEN || !client) return;

    try {
        const result = await client.sendEmail({
            From: `${'Pace Pharmacy'} <sahil@shipra.ca>`,
            To: to,
            Subject: subject,
            TextBody: 'This is a plain text email sent by Pace Pharmacy via Postmark!',
            HtmlBody: body,
            MessageStream: 'outbound'
        });

        await db.insert(emails).values({
            messageId: result.MessageID,
            status: result.Message,
            subject,
            submittedAt: new Date(result.SubmittedAt),
            to,
        });

        console.log('Email sent successfully!');
        console.log('Message ID:', result.MessageID);
    } catch (error) {
        console.error('Error sending email:', error);
    }
}