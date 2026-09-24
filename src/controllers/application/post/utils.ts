export function medicalDirectorCompletionConfirmation(
  {
    accountHolderName,
    medicalDirectorName,
    referenceCode,
    organizationName,
    prescriptionRequirement,
    authorizedIndividuals,
    dateTime
  }:
    {
      accountHolderName: string;
      medicalDirectorName: string;
      referenceCode: string;
      organizationName: string;
      prescriptionRequirement: 'withPrescription' | 'withoutPrescription';
      authorizedIndividuals: string;
      dateTime: string
    }
) {
  const prescriptionText = prescriptionRequirement === 'withPrescription'
    ? `I require a signed prescription for each order.`
    : `I authorize the following individuals — ${authorizedIndividuals} — to place orders under my name for ${organizationName}, without a signed prescription for each order.`;

  return `<div style="padding: 8px; font-size: 14px;">
    <div style="margin-bottom:18px;">
      Dear ${medicalDirectorName},
    </div>

    <div style="margin-bottom:18px;">
      Thank you for completing your authorization for the Pace Pharmacy professional account application.
    </div>

    <div style="margin-bottom:18px;">
      <div style="margin: 8px 0;"><strong>Application Reference:</strong> ${referenceCode}</div>
      <div style="margin: 8px 0;"><strong>Account Holder:</strong> ${accountHolderName}</div>
      <div style="margin: 8px 0;"><strong>Clinic/Organization:</strong> ${organizationName}</div>
      <div style="margin: 8px 0;"><strong>Authorization Completed:</strong> ${dateTime}</div>
      <div style="margin: 8px 0;"><strong>Prescription Requirement:</strong> ${prescriptionText}</div>
    </div>

    <div style="margin-bottom:10px;">
      <strong>Medical Director Confirmations</strong>
    </div>

    <div style="margin-bottom:10px;">
      For medications ordered or prescribed under your medical direction, you confirmed that:
    </div>

    <ul style="margin:0 0 18px 0; padding-left:18px; line-height:1.7;">
      <li style="margin-bottom:6px;">Individuals administering medications have been appropriately trained and assessed as competent to administer the medications provided.</li>
      <li style="margin-bottom:6px;">Where an individual is not independently authorized to perform a controlled act, appropriate delegation and documentation are in place in accordance with applicable legislation and the requirements of your regulatory college.</li>
      <li style="margin-bottom:6px;">Appropriate emergency training, procedures, equipment and supplies are in place for the medications and procedures being provided.</li>
    </ul>

    <div style="margin-bottom:18px;">
      The complete application has now been submitted to Pace Pharmacy for review. Both you and ${accountHolderName} will receive confirmation once the account is activated.
    </div>

    <div style="margin-bottom:10px;">
      If you have any questions while we process your application, please contact us:
    </div>

    <div style="margin-bottom:6px;">
      <strong>Leaside:</strong> <span style="font-weight:500;">416-423-6223</span> | <a href="mailto:rx@pacepharmacy.com" style="color:#0b63c6; text-decoration:underline;">rx@pacepharmacy.com</a>
    </div>

    <div style="margin-bottom:22px;">
      <strong>Downtown:</strong> <span style="font-weight:500;">416-515-7223</span> | <a href="mailto:info@pacepharmacy.com" style="color:#0b63c6; text-decoration:underline;">info@pacepharmacy.com</a>
    </div>

    <div style="margin-top:12px;">
      Sincerely,<br>
      Pace Pharmacy Team
    </div>
  </div>`
}

export function accountHolderAuthorizationComplete(
  {
    accountHolderName,
    medicalDirectorName,
    referenceCode,
    dateTime,
    skipAuthorization
  }:
    {
      accountHolderName: string;
      medicalDirectorName: string;
      referenceCode: string;
      dateTime: string
      skipAuthorization?: boolean
    }
) {
  return `<div style="padding: 8px; font-size: 14px;">
   <div style="margin-bottom:18px;">
      Dear <span style="font-weight:500;">${accountHolderName}</span>,
    </div>

    <div style="margin-bottom:18px;">
      Good news! ${!skipAuthorization ? `<span style="font-weight:500;">${medicalDirectorName}</span> has completed their authorization for your Pace Pharmacy professional account application.` : ``}
    </div>

   ${!skipAuthorization ? `<div style="margin-bottom:18px;">
      <div style="display:block; margin-bottom:6px;"> <strong> Application Reference: </strong> <span >${referenceCode}</span></div>
      <div style="display:block;"> <strong> Authorization Completed: </strong> <span >${dateTime}</span></div>
    </div>` : ``}

    <div style="margin-bottom:18px;">
      Your complete application has been submitted to Pace Pharmacy for review.
    </div>

    <div style="margin:20px 0; font-weight:700;">
      NEXT STEPS:
    </div>

    <!-- Using a simple list with dashes to match the visual style in the image -->
    <ul style="margin:0 0 20px 0; padding-left:12px;">
      <li style="margin:6px 0 6px 0;">Our team will review your application (typically 1-2 business days)</li>
      <li style="margin:6px 0 6px 0;">You will receive an email confirmation once your account is activated</li>
      <li style="margin:6px 0 6px 0;">Upon activation, you can begin placing orders</li>
    </ul>

    <div style="margin-bottom:10px;">
      If you have any questions while we process your application, please contact us:
    </div>

    <div style="margin-bottom:6px;">
     <strong> Leaside: </strong>
      <span style="font-weight:500;">416-423-6223</span> | <a href="mailto:rx@pacepharmacy.com" style="color:#0b63c6; text-decoration:underline;">rx@pacepharmacy.com</a>
    </div>

    <div style="margin-bottom:22px;">
     <strong> Downtown: </strong>
     <span style="font-weight:500;">416-515-7223</span> | <a href="mailto:info@pacepharmacy.com" style="color:#0b63c6; text-decoration:underline;">info@pacepharmacy.com</a>
    </div>

    <div style="margin-top:12px;">
      Sincerely,<br>
      Pace Pharmacy Team
    </div>
</div>`
}