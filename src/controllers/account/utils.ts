import { sendSimpleEmail } from "@/services/email"
import { renderMjmlTemplate } from "@/services/email/email-template"
import { accountHolderAuthorizationComplete } from "../application/post/utils"
import { format } from "date-fns"
import { supabase } from "@/services/supabase-client"
import { documentsTable } from "@/db/schema/documents-table"
import { db } from "@/db"

export const sendEmailToNewAccount = async (
    {
        isAlsoMedicalDirector,
        directorEmail,
        directorName,

        accountHolderPhone,
        accountHolderEmail,
        accountHolderName,
        clinicName,

        referenceCode,
        preferredLocation
    }:
        {
            isAlsoMedicalDirector: boolean;
            directorEmail: string;
            directorName: string;

            accountHolderPhone: string;
            accountHolderEmail: string;
            accountHolderName: string;
            clinicName: string;

            referenceCode: string;
            preferredLocation: number;
        }
) => {
    const dateTime = format(new Date(), "dd/MM/yyyy hh:mm aa")
    const contactEmail = preferredLocation === 1 ? "rx@pacepharmacy.com" : "info@pacepharmacy.com"
    const from = preferredLocation === 1 ? `Pace Pharmacy (Leaside) <rx@pacepharmacy.com>` : `Pace Pharmacy (Downtown) <info@pacepharmacy.com>`

    if (!isAlsoMedicalDirector) {
        await sendSimpleEmail({
            from: from,
            to: directorEmail,
            subject: 'Medical Director Authorization Request',
            body: renderMjmlTemplate('medical-director-authorization-request', {
                title: 'Medical Director Authorization Request',
                directorName,
                accountHolderName,
                accountHolderEmail,
                accountHolderPhone,
                clinicName,
                application: referenceCode,
                link: `https://intake.pacepharmacy.com/account-setup?code=${referenceCode}`
            })
        })

        await sendSimpleEmail({
            from,
            to: accountHolderEmail,
            ccEmail: contactEmail,
            subject: 'Account Holder Confirmation',
            body: renderMjmlTemplate('account-holder-confirmation', {
                title: 'Account Holder Confirmation',
                directorName,
                directorEmail: directorEmail,
                accountHolderName,
                clinicName,
                application: referenceCode,
                submittedDateTime: dateTime,
                contactEmail: contactEmail
            })
        })
    } else {
        await sendSimpleEmail({
            from,
            to: accountHolderEmail,
            ccEmail: contactEmail,
            subject: 'Account Holder - Medical Director Authorization Complete',
            body: renderMjmlTemplate('common', {
                title: 'Account Holder - Medical Director Authorization Complete',
                content: accountHolderAuthorizationComplete(
                    {
                        accountHolderName,
                        medicalDirectorName: directorName,
                        referenceCode,
                        dateTime,
                        skipAuthorization: true
                    }
                )
            })
        })
    }

}


export const fileUpload = async (formData: FormData, referenceCode: string) => {
    // Supabase client setup
    const BucketName = process.env.BUCKET_NAME!
    if (!BucketName) return;

    const files: any[] = formData.getAll('documents')
    if (!files || !files.length) return;

    const uploadedFiles: {
        referenceCode: string;
        id: string;
        path: string;
        fullPath: string;
    }[] = [];

    for (const file of files) {
        // In Node, file might not be instanceof File
        // So we check for basic properties
        if (!file || !('name' in file) || !('stream' in file)) continue;

        // Get the file stream
        const stream = (file as any).stream(); // Node File-like object
        const chunks: Uint8Array[] = [];

        for await (const chunk of stream) {
            chunks.push(chunk);
        }

        const buffer = Buffer.concat(chunks);
        const now = new Date();
        const date = format(now, 'yyyyMMdd')
        const fullPath = `public/documents/${date}/${referenceCode}/${Date.now()}_${file.name.replace(/ /g, "")}`
        const { data, error } = await supabase.storage
            .from(BucketName)
            .upload(fullPath, buffer, {
                contentType: (file as any).type || undefined,
                upsert: false
            });

        if (error) {
            console.error('Upload error:', error);
            continue;
        }
        uploadedFiles.push({ referenceCode, ...data });
    }

    await db.insert(documentsTable).values(uploadedFiles);
    return { uploadedFiles };
}