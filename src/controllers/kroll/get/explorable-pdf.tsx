import {
    Page,
    Text,
    View,
    Document,
    StyleSheet,
    Image
} from "@react-pdf/renderer";
import { format } from "date-fns";

export const ProvincesEnum = {
    alberta: "Alberta",
    british_columbia: "British Columbia",
    manitoba: "Manitoba",
    new_brunswick: "New Brunswick",
    newfoundland_and_labrador: "Newfoundland and Labrador",
    nova_scotia: "Nova Scotia",
    ontario: "Ontario",
    prince_edward_island: "Prince Edward Island",
    quebec: "Quebec",
    saskatchewan: "Saskatchewan",
};

export type DocumentsType = {
    id: string;
    referenceCode: string;
    path: string;
    fullPath: string;
    createdAt: string; // ISO date string
    updatedAt: string; // ISO date string
    publicUrl: string;
};


export type PatientResponse = {
    accounts: {
        id: number;
        holderName: string;
        designation: string;
        organizationName: string;
        contactPerson: string;
        phone: string;
        emailAddress: string;
        fax: string;
        documents: null | any;
        createdAt: string;
        updatedAt: string;
        preferredLocation: number;
        shippingSameAsBilling: boolean | null
    };
    acknowledgements: {
        id: number;
        accountId: number;
        nameToAcknowledge: string;
        acknowledgementConsent: boolean;
        consentDate: string;
    };
    delivery_settings: {
        id: number;
        accountId: number;
        instruction: string | null;
        deliveryHours: {
            Monday: string;
            Tuesday: string;
            Wednesday: string;
            Thursday: string;
            Friday: string;
        };
    };
    medical_directors: {
        id: number;
        accountId: number;
        isAlsoMedicalDirector: boolean;
        name: string;
        licenseNo: string;
        email: string;
    };
    payment_information: {
        id: number;
        accountId: number;
        paymentMethod: 'visa' | 'mastercard' | 'amex' | 'bank_transfer';
        cardNumber: string;
        cardCvv: string;
        cardNumberLast4: string;
        nameOnCard: string;
        cardExpiryMonth: string;
        cardExpiryYear: string;
        paymentAuthorization: boolean;
        createdAt: string;
    };
    applications: {
        id: number;
        accountId: number;
        referenceCode: string;
        expiryDate: string;
        isActive: boolean;
        isExpired: boolean;
        isSubmitted: boolean;
        submittedDate: string | null;
        prescriptionRequirement: "withPrescription" | "withoutPrescription" | null;
    };
    documents: DocumentsType;
    addresses: Array<{
        id: number;
        accountId: number;
        addressType: string;
        addressLine1: string;
        addressLine2: string;
        city: string;
        province: string;
        postalCode: string;
    }>;
};


const styles = StyleSheet.create({
    page: {
        padding: 24,
        fontSize: 10,
        fontFamily: "Helvetica",
    },
    logoRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    logo: {
        width: 278,
        // height: 70,
        // objectFit: "contain",
    },
    hr: {
        marginVertical: 4,
        borderBottomWidth: 1,
        borderBottomColor: "#E2E2E2",
    },
    labelRow: {
        flexDirection: "row",
        marginTop: 4,
        marginBottom: 4,
    },
    label: {
        width: 135,
        fontWeight: "bold",
    },
    text: {
        fontSize: 10,
        margin: '2px 0'
    },
    small: {
        fontSize: 9,
        color: "#444444",
    },
    listItem: {
        flexDirection: "row",
        marginBottom: 4,
    },
    listIndex: {
        width: 16,
    },
    checkboxRow: {
        flexDirection: "row",
        marginVertical: 6,
    },
    bold: {
        fontWeight: "bold",
    },
    footnote: {
        marginTop: 20,
        fontSize: 9,
        fontWeight: "bold",
    },
});

const ExportPDF = ({ data }: { data: PatientResponse }) => {

    const billingAddress = data?.addresses?.find(address => address.addressType?.toLowerCase() === "billing") ?? data?.addresses?.[0]
    const shippingAddress = data?.addresses?.find(address => address.addressType?.toLowerCase() === "shipping") ?? data?.addresses?.[1]

    const cardNumberDisplay = data?.payment_information
        ? `${data.payment_information.cardNumber ?? "----"}`
        : "—"

    const cardExpiryDisplay = data?.payment_information
        ? `${data.payment_information.cardExpiryMonth}/${data.payment_information.cardExpiryYear?.slice(-2) ?? "--"}`
        : "—"

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.logoRow}>
                    <Image src={'/logo.png'} style={styles.logo} />
                </View>

                <Text style={{ marginBottom: 10, fontWeight: "bold" }}>
                    New Professional Account Setup :
                </Text>

                {/* Fields */}
                <View style={{ ...styles.labelRow, justifyContent: 'space-between' }}>
                    <View style={{ ...styles.labelRow, width: "50%", marginBottom: 0 }}>
                        <Text style={styles.label}>Account Holder's Name :</Text>
                        <Text style={styles.text}>
                            {data.accounts.holderName}
                        </Text>
                    </View>

                    <View style={{ ...styles.labelRow, width: "50%", marginBottom: 0 }}>
                        <Text style={styles.label}>Designation/License :</Text>
                        <Text style={styles.text}>
                            {data.accounts.designation}
                        </Text>
                    </View>
                </View>
                <View style={styles.hr} />

                <View style={styles.labelRow}>
                    <Text style={styles.label}>Clinic/Organization Name :</Text>
                    <Text style={styles.text}>
                        {data.accounts.organizationName}
                    </Text>
                </View>
                <View style={styles.hr} />

                <View style={styles.labelRow}>
                    <Text style={styles.label}>Billing Address :</Text>
                    <View>
                        <Text style={styles.text}>
                            {billingAddress.addressLine1},
                            {billingAddress.addressLine2},
                        </Text>
                        <Text style={styles.text}>
                            City : {billingAddress.city}   Province : Province : {ProvincesEnum[billingAddress.province as keyof typeof ProvincesEnum]}   Postal Code : {billingAddress.postalCode}
                        </Text>
                    </View>
                </View>
                <View style={styles.hr} />

                <View style={styles.labelRow}>
                    <Text style={styles.label}>Shipping Address :</Text>
                    <View>
                        <Text style={styles.text}>
                            {shippingAddress.addressLine1},
                            {shippingAddress.addressLine2},
                        </Text>
                        <Text style={styles.text}>
                            City : {shippingAddress.city}   Province : {ProvincesEnum[shippingAddress.province as keyof typeof ProvincesEnum]}   Postal Code : {shippingAddress.postalCode}
                        </Text>
                        <Text style={styles.text}>Ph : {data.accounts.phone}   Email : {data.accounts.emailAddress}</Text>
                    </View>
                </View>
                <View style={styles.hr} />

                <View style={{ ...styles.labelRow }}>
                    <Text style={styles.label}>Delivery Hours :</Text>
                    <View>
                        <Text style={{ ...styles.text, margin: "2px 0" }}>
                            Monday : 9am-5pm, Tuesday : 9am-5pm, Wednesday : 9am-5pm, Thursday : 9am-5pm,
                        </Text>
                        <Text style={{ ...styles.text, margin: "2px 0" }}>
                            Friday : 9am-5pm
                        </Text>
                    </View>
                </View>
                <View style={styles.hr} />

                <View style={styles.labelRow}>
                    <Text style={styles.label}>Payment Information :</Text>
                    <View>
                        <Text style={{ ...styles.text, margin: "2px 0" }}>[{data.payment_information.paymentMethod === 'visa' && '*'}] Visa   [{data.payment_information.paymentMethod === 'mastercard' && '*'}] Master Card   [{data.payment_information.paymentMethod === 'bank_transfer' && '*'}] E-Transfer</Text>
                        {data.payment_information.paymentMethod !== 'bank_transfer' &&
                            <>
                                <Text style={{ ...styles.text, margin: "2px 0" }}>
                                    Card Number : {cardNumberDisplay}   Exp : {cardExpiryDisplay}   CVV : {data.payment_information ? data.payment_information.cardCvv : "—"}
                                </Text>
                                <Text style={{ ...styles.text, margin: "2px 0" }}>Name on Card : {data.payment_information.nameOnCard}</Text>
                            </>
                        }
                    </View>
                </View>

                <View style={styles.hr} />

                <Text style={styles.text}>
                    <Text style={styles.bold}>I {data.accounts.holderName}</Text>, am financially responsible for all purchases made on this account. I will keep it current
                    and agree to maintain the account in good standing. I acknowledge that a late fee will apply to late payments, and a restocking fee to orders never picked up.
                </Text>

                <Text style={{ ...styles.text, marginTop: 8, marginBottom: 6 }}>
                    <Text style={styles.bold}>I {data.accounts.holderName}</Text>, acknowledge all of the following:
                </Text>

                {[
                    "Pace Pharmacy is not a manufacturer, and",
                    "Compounded products are only to be used within an established and valid patient-healthcare professional relationship, and",
                    "Compounded products may not be sold to a third party, and",
                    "A healthcare professional must assess and document the clinical appropriateness for every patient, and",
                    "Pace Pharmacy is available to answer patients' questions and offer counselling on our compounded products.",
                ].map((item, i) => (
                    <View key={i} style={styles.listItem}>
                        <Text style={styles.listIndex}>{i + 1}.</Text>
                        <Text style={styles.text}>{item}</Text>
                    </View>
                ))}

                <Text style={{ ...styles.text, marginTop: 8 }}>
                    I authorize Pace Pharmacy to process my account according to the terms above and confirm that I have read and understand all acknowledgements on{" "}
                    <Text style={styles.bold}>{format(new Date(data.accounts.createdAt), 'dd MMM yyyy')}</Text>.
                </Text>

                <View style={styles.hr} />

                <View style={{ ...styles.labelRow, justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <View style={{ ...styles.labelRow, width: "50%", marginBottom: 0 }}>
                        <Text style={styles.label}>Medical Director's Name :</Text>
                        <Text style={styles.text}>
                            {data.medical_directors?.name}
                        </Text>
                    </View>

                    <View style={{ ...styles.labelRow, width: "50%", marginBottom: 0 }}>
                        <Text style={styles.label}>License :</Text>
                        <Text style={styles.text}>
                            {data.medical_directors?.licenseNo}
                        </Text>
                    </View>
                </View>

                <Text style={{ ...styles.text, marginTop: 6 }}>
                    I authorize Pace Pharmacy to process my account according to the terms above and confirm that I have read and understand all acknowledgements on{" "}
                    <Text style={styles.bold}>
                        {data.applications && data.applications.submittedDate
                            ? format(
                                new Date(data.applications.submittedDate),
                                "dd MMM yyyy"
                            )
                            : ""}
                    </Text>.
                </Text>

                <View style={styles.checkboxRow}>
                    <Text style={styles.text}>[{data.applications.prescriptionRequirement === 'withoutPrescription' && '*'}]</Text>
                    <Text style={{ ...styles.text, marginLeft: 6 }}>
                        I authorize <Text style={styles.bold}>{data.accounts.holderName}</Text> account holder to order under my name for <Text style={styles.bold}>{data.accounts.organizationName}</Text> at their discretion, <Text style={styles.bold}>Without a written and signed prescription for each order.</Text>
                    </Text>
                </View>

                <Text style={styles.text}>[{data.applications.prescriptionRequirement === 'withPrescription' && '*'}] I require a written and signed prescription for each order under my medical direction.</Text>

                <Text style={styles.footnote}>
                    *Please Return Forms by Email or Fax. Only Completed Forms Will Be Accepted*
                </Text>
            </Page>
        </Document >
    )
};

export default ExportPDF;
