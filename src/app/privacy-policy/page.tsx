import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";
import { legalStatus } from "@/content/legal";
import { business } from "@/content/site";
import { pageMetadata } from "@/lib/seo";

const status = legalStatus.privacy;

export const metadata = pageMetadata({
  title: "Privacy Policy",
  description: "How RenewBrick collects, uses and protects the personal information you share through this website.",
  path: "/privacy-policy",
  noindex: !status.approved,
});

/*
 * DRAFT FOR PROFESSIONAL REVIEW. Describes the data flows actually built into
 * this website. Do not set `legalStatus.privacy.approved` until reviewed.
 */
export default function PrivacyPolicyPage() {
  const entity = business.legalName ?? "[legal entity name]";
  const contact = business.email ?? "[privacy contact email]";
  return (
    <LegalPage title="Privacy Policy" approved={status.approved} approvedOn={status.approvedOn}>
      <p>
        This policy explains how {entity} (&ldquo;RenewBrick&rdquo;, &ldquo;we&rdquo;) handles personal information
        submitted through this website. It covers the website only; work we carry out for you will be governed by the
        documents we agree with you at the time.
      </p>

      <h2>What we collect</h2>
      <p>When you send an enquiry, we collect the information you enter:</p>
      <ul>
        <li>your name and phone number;</li>
        <li>your email address, if you choose to provide it;</li>
        <li>the city and locality of the property, its type, and the service you are interested in;</li>
        <li>your description of the work, and how you would like us to contact you;</li>
        <li>your confirmation that we may contact you, with the date and time it was given.</li>
      </ul>
      <p>
        We also record the page the enquiry was sent from, and a one-way encoded (hashed) version of your internet (IP)
        address. The hashed address is used only to limit repeated or automated submissions; we do not store your IP address
        itself.
      </p>
      <p>We do not ask for, and ask you not to include, payment details, identity documents or passwords.</p>

      <h2>How we use it</h2>
      <ul>
        <li>to contact you about your enquiry by phone, WhatsApp or email;</li>
        <li>to assess whether and how we can help, and to arrange an inspection if you agree;</li>
        <li>to keep a record of enquiries and their outcome;</li>
        <li>to protect the website from spam and abuse.</li>
      </ul>
      <p>We do not sell your information and do not use it for advertising.</p>

      <h2>Where it is stored and who processes it</h2>
      <p>
        Enquiries are stored in a database hosted by [database hosting provider and region]. When an enquiry arrives, a
        notification email containing its details is sent to our team through [email delivery provider]. These providers
        process the information on our behalf.
      </p>
      <p>
        If you contact us by phone or WhatsApp, that conversation takes place through your telephone or WhatsApp provider and
        is subject to their terms. If we need to share details with an execution partner to inspect or carry out work, we
        share only what is needed for that purpose and only once you have asked us to proceed.
      </p>

      <h2>Cookies and analytics</h2>
      <p>
        This website does not use advertising or analytics trackers and does not set cookies for those purposes. [Update this
        section before adding any analytics.]
      </p>

      <h2>How long we keep it</h2>
      <p>[Retention period to be confirmed.] After that period, enquiry records are deleted or anonymised.</p>

      <h2>Your choices and rights</h2>
      <p>
        You can ask us to access, correct or delete the personal information you have given us, or withdraw your consent to
        be contacted, by writing to {contact}. [Reviewer: confirm rights and grievance-officer requirements under the Digital
        Personal Data Protection Act, 2023 and applicable rules.]
      </p>

      <h2>Security</h2>
      <p>
        Information is sent to us over an encrypted connection and stored with access restricted to the people who need it to
        respond to enquiries.
      </p>

      <h2>Changes and contact</h2>
      <p>
        We will update this page if our practices change. Questions about this policy can be sent to {contact}. See also our{" "}
        <Link href="/terms">website terms</Link>.
      </p>
    </LegalPage>
  );
}
