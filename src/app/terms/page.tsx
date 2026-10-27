import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";
import { legalStatus } from "@/content/legal";
import { business } from "@/content/site";
import { pageMetadata } from "@/lib/seo";

const status = legalStatus.terms;

export const metadata = pageMetadata({
  title: "Website Terms",
  description: "Terms for using the RenewBrick website and submitting enquiries.",
  path: "/terms",
  noindex: !status.approved,
});

/*
 * DRAFT FOR PROFESSIONAL REVIEW. These are website terms only; they do not
 * set payment, warranty or cancellation terms, which belong in project documents.
 */
export default function TermsPage() {
  const entity = business.legalName ?? "[legal entity name]";
  return (
    <LegalPage title="Website Terms" approved={status.approved} approvedOn={status.approvedOn}>
      <p>
        These terms apply to your use of this website, which is operated by {entity} (&ldquo;RenewBrick&rdquo;,
        &ldquo;we&rdquo;). By using the website you agree to them.
      </p>

      <h2>Information on this website</h2>
      <p>
        The website describes the services RenewBrick offers in general terms. It is not an offer to carry out any particular
        work. Services marked &ldquo;planned&rdquo; are not currently available.
      </p>
      <p>
        Drawings on this website are illustrations. They do not depict completed RenewBrick projects.
      </p>

      <h2>Enquiries</h2>
      <p>
        Submitting an enquiry does not create a contract, book an inspection or commit either of us to anything. We will
        contact you to discuss your requirement. Any inspection, work or charge is agreed separately with you.
      </p>

      <h2>Estimates and work</h2>
      <p>
        Work is carried out only on the basis of a written scope and estimate that you have approved. The terms that apply to
        that work — including price, payment, schedule and any warranty — are those set out in the documents we agree with you,
        not on this website.
      </p>
      <p>
        RenewBrick coordinates execution partners and specialist vendors, who are independent businesses and not RenewBrick
        employees. [Reviewer: confirm how contractual responsibility for partners&rsquo; work is allocated.]
      </p>

      <h2>Use of the website</h2>
      <p>
        Please do not misuse the website, including by submitting false enquiries, attempting to gain unauthorised access, or
        interfering with its operation.
      </p>

      <h2>Intellectual property</h2>
      <p>
        The RenewBrick name, logo, text and drawings on this website belong to {entity} or are used with permission, and may not
        be reused without our consent.
      </p>

      <h2>Liability</h2>
      <p>
        We aim to keep the website accurate and available, but it is provided as is. [Reviewer: confirm appropriate limitation
        of liability wording.]
      </p>

      <h2>Governing law</h2>
      <p>These terms are governed by the laws of India. [Reviewer: confirm jurisdiction.]</p>

      <h2>Privacy</h2>
      <p>
        How we handle personal information is explained in our <Link href="/privacy-policy">privacy policy</Link>.
      </p>
    </LegalPage>
  );
}
