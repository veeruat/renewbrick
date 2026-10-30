import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";
import { legalStatus } from "@/content/legal";
import { business } from "@/content/site";
import { pageMetadata } from "@/lib/seo";

const status = legalStatus.privacy;

export const metadata = pageMetadata({
  title: "Privacy Policy",
  description: "How RenewBrick handles personal information when you visit this website or contact us.",
  path: "/privacy-policy",
  noindex: !status.approved,
});

/*
 * DRAFT FOR PROFESSIONAL REVIEW. Describes the data flows actually built into
 * this website (static pages; an enquiry form whose submissions are emailed
 * to RenewBrick and not stored by the site; WhatsApp/phone/email links; no
 * cookies or analytics). Do not set `legalStatus.privacy.approved` until reviewed.
 */
export default function PrivacyPolicyPage() {
  const entity = business.legalName ?? "[legal entity name]";
  const contact = business.email ?? "[privacy contact email]";
  return (
    <LegalPage title="Privacy Policy" approved={status.approved} approvedOn={status.approvedOn}>
      <p>
        This policy explains how {entity} (&ldquo;RenewBrick&rdquo;, &ldquo;we&rdquo;) handles personal information when
        you visit this website or contact us through it. Work we carry out for you will be governed by the documents we
        agree with you at the time.
      </p>

      <h2>Visiting the website</h2>
      <p>
        This website has no accounts, cookies, advertising or analytics trackers. It asks for personal information only in
        the enquiry form, if you choose to use it. Like most websites, our hosting provider, Amazon Web Services, may
        automatically record standard technical information such as your IP address, browser type and the pages
        requested, to deliver the site and keep it secure. [Reviewer: confirm the log settings and retention.]
      </p>

      <h2>The enquiry form</h2>
      <p>
        When you send the enquiry form on our contact page, the details you enter are checked and emailed to our team inbox
        so that we can reply. They are sent using Amazon Web Services (Amazon Simple Email Service) and received in our
        email account, which is provided by Google (Gmail). The website does not keep its own copy of your enquiry; our
        server logs record only a reference number and whether the email was sent. [Reviewer: confirm the processor
        names and any cross-border transfer wording.]
      </p>

      <h2>Contacting us by WhatsApp, phone or email</h2>
      <p>
        The WhatsApp, call and email buttons open WhatsApp, your phone&rsquo;s dialler or your email app. The website itself
        does not see, record or store what you send. Your conversation takes place through those services and is also
        subject to their terms and privacy policies.
      </p>
      <p>Whichever way you contact us, we receive the information you choose to share, typically:</p>
      <ul>
        <li>your name, phone number and, if you give it, your email address (and WhatsApp profile details);</li>
        <li>the city, locality and type of your property;</li>
        <li>a description of the work, and any photographs you send.</li>
      </ul>
      <p>Please do not send payment details, identity documents or passwords.</p>

      <h2>How we use it</h2>
      <ul>
        <li>to respond to your enquiry and discuss your requirement;</li>
        <li>to arrange an inspection if you agree, and to prepare a scope and estimate;</li>
        <li>to keep a record of enquiries and their outcome.</li>
      </ul>
      <p>
        We do not sell your information and do not use it for advertising. If we need to share details with an execution
        partner to inspect or carry out work, we share only what is needed, and only once you have asked us to proceed.
      </p>

      <h2>How long we keep it</h2>
      <p>[Retention period to be confirmed.]</p>

      <h2>Your choices and rights</h2>
      <p>
        You can ask us to access, correct or delete the personal information you have shared with us by writing to {contact}.
        [Reviewer: confirm rights and grievance-officer requirements under the Digital Personal Data Protection Act, 2023 and
        applicable rules.]
      </p>

      <h2>Changes and contact</h2>
      <p>
        We will update this page if our practices change, for example if we add analytics. Questions about
        this policy can be sent to {contact}. See also our <Link href="/terms">website terms</Link>.
      </p>
    </LegalPage>
  );
}
