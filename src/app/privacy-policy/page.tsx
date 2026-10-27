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
 * this website (static pages; contact by WhatsApp or phone only; no forms,
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
        This website has no forms, accounts, cookies, advertising or analytics trackers, and it does not ask you for personal
        information. Like most websites, our hosting provider, [hosting provider], may automatically record standard
        technical information such as your IP address, browser type and the pages requested, to deliver the site and keep
        it secure. [Reviewer: confirm the host and its log retention.]
      </p>

      <h2>Contacting us by WhatsApp or phone</h2>
      <p>
        The &ldquo;Request a Site Inspection&rdquo; and call buttons open WhatsApp or your phone&rsquo;s dialler. The website
        itself does not see, record or store what you send. Your conversation takes place through WhatsApp or your telephone
        provider and is also subject to their terms and privacy policies.
      </p>
      <p>When you contact us, we receive the information you choose to share, typically:</p>
      <ul>
        <li>your name and phone number (and WhatsApp profile details);</li>
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
        We will update this page if our practices change, for example if we add an enquiry form or analytics. Questions about
        this policy can be sent to {contact}. See also our <Link href="/terms">website terms</Link>.
      </p>
    </LegalPage>
  );
}
