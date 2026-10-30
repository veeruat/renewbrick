"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import {
  ENQUIRY_ENDPOINT,
  cityOptions,
  contactMethodOptions,
  limits,
  propertyTypeOptions,
  serviceOptionFor,
  serviceOptions,
  validateEnquiry,
  type EnquiryErrors,
  type EnquiryField,
} from "@/lib/enquiry";

type Status =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "error"; message: string }
  | { kind: "success"; reference: string; contactMethod: string };

const fieldOrder: EnquiryField[] = [
  "name", "phone", "email", "contactMethod", "city", "locality", "propertyType", "service", "description", "consent",
];

// Shown after a plain HTML form post (no JavaScript) is redirected back here.
const noJsErrors: Record<string, string> = {
  invalid: "Some details were missing or invalid. Please check the form and send it again.",
  server: "We could not send your enquiry just now. Please try again in a few minutes.",
};

/**
 * Enquiry form. Posts to /api/contact, which emails the enquiry to RenewBrick
 * (see the ContactFunction in infra/aws/renewbrick-site.yaml). Works without
 * JavaScript too: the browser posts the form and the API redirects back.
 */
export function EnquiryForm() {
  const [service, setService] = useState("");
  const [errors, setErrors] = useState<EnquiryErrors>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [descLength, setDescLength] = useState(0);
  const summaryRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);
  const inFlight = useRef(false);
  const showUrlError = useCallback((message: string) => setStatus({ kind: "error", message }), []);

  useEffect(() => {
    if (status.kind === "success") successRef.current?.focus();
    if (status.kind === "error") summaryRef.current?.focus();
  }, [status]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (inFlight.current) return;
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<string, unknown>;
    data.consent = data.consent === "on";

    const found = validateEnquiry(data);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      setStatus({ kind: "idle" });
      const first = fieldOrder.find((f) => found[f]);
      if (first) (form.elements.namedItem(first) as HTMLElement | null)?.focus();
      return;
    }
    setErrors({});

    inFlight.current = true;
    setStatus({ kind: "submitting" });
    try {
      const res = await fetch(ENQUIRY_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, sourcePath: window.location.pathname }),
      });
      const body = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        reference?: string;
        message?: string;
        errors?: EnquiryErrors;
      };
      if (res.ok && body.ok && body.reference) {
        setStatus({ kind: "success", reference: body.reference, contactMethod: String(data.contactMethod) });
        form.reset();
        setService("");
        setDescLength(0);
        return;
      }
      if (body.errors) setErrors(body.errors);
      setStatus({
        kind: "error",
        message:
          res.status === 429
            ? "We have received several enquiries from your connection. Please wait a minute and try again."
            : (body.message ?? "Something went wrong and your enquiry was not sent. Please try again."),
      });
    } catch {
      setStatus({
        kind: "error",
        message: "We could not reach our server, so your enquiry was not sent. Please check your connection and try again.",
      });
    } finally {
      inFlight.current = false;
    }
  }

  if (status.kind === "success") {
    const method = contactMethodOptions.find((o) => o.value === status.contactMethod)?.label ?? "phone";
    return (
      <div className="border-t-2 border-gold bg-grey p-6 sm:p-10" role="status">
        <p className="label text-gold-ink">Enquiry sent</p>
        <h3 ref={successRef} tabIndex={-1} className="display mt-3 text-display-sm text-navy outline-none">
          Thank you. We have your details.
        </h3>
        <p className="mt-4 text-slate">
          Your reference is <strong className="font-semibold tabular-nums text-navy">{status.reference}</strong>. We will
          contact you by {method.toLowerCase()} to talk through your requirement.
        </p>
        <p className="mt-3 text-slate">
          This is an enquiry, not a booking. If a site inspection makes sense, we will agree the date, time and any
          applicable charges with you before anything is arranged.
        </p>
        <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
          <button type="button" onClick={() => setStatus({ kind: "idle" })} className="draw-link min-h-11 font-semibold text-navy">
            Send another enquiry
          </button>
          <Link href="/" className="draw-link inline-flex min-h-11 items-center font-semibold text-navy">
            Back to the homepage
          </Link>
        </div>
      </div>
    );
  }

  const submitting = status.kind === "submitting";
  const errorCount = Object.keys(errors).length;

  return (
    <form action={ENQUIRY_ENDPOINT} method="post" noValidate onSubmit={onSubmit} aria-describedby="form-note" className="surface-light">
      <Suspense fallback={null}>
        <UrlState onService={setService} onError={showUrlError} />
      </Suspense>
      {/* Stamped when the form mounts in the browser: the API treats near-instant submissions as bots. */}
      <input ref={stampStart} type="hidden" name="startedAt" defaultValue="" />

      <div ref={summaryRef} tabIndex={-1} aria-live="assertive" className="outline-none">
        {(status.kind === "error" || errorCount > 0) && (
          <div className="mb-8 border-l-4 border-error bg-[#fdf2f1] p-4 text-[0.95rem] text-error">
            <p className="font-semibold">
              {status.kind === "error" ? status.message : `Please check ${errorCount === 1 ? "1 field" : `${errorCount} fields`} below.`}
            </p>
            {errorCount > 0 && (
              <ul className="mt-2 list-disc pl-5">
                {fieldOrder
                  .filter((f) => errors[f])
                  .map((f) => (
                    <li key={f}>
                      <a href={`#f-${f}`} className="underline">
                        {errors[f]}
                      </a>
                    </li>
                  ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <p id="form-note" className="mb-8 text-[0.95rem] text-slate">
        Fields marked <span className="font-semibold text-navy">optional</span> can be left blank. Everything else is needed
        to respond to your enquiry.
      </p>

      <fieldset className="grid gap-x-6 gap-y-7 md:grid-cols-2">
        <legend className="label mb-5 text-gold-ink">01 · You</legend>
        <Field id="name" label="Your name" error={errors.name}>
          <input id="f-name" name="name" type="text" autoComplete="name" maxLength={limits.name} required {...a11y("name", errors)} className={inputClass(errors.name)} />
        </Field>
        <Field id="phone" label="Phone number" hint="Indian mobile, or international with + and country code." error={errors.phone}>
          <input id="f-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" maxLength={20} required {...a11y("phone", errors, true)} className={inputClass(errors.phone)} />
        </Field>
        <Field id="email" label="Email" optional error={errors.email}>
          <input id="f-email" name="email" type="email" autoComplete="email" maxLength={limits.email} {...a11y("email", errors)} className={inputClass(errors.email)} />
        </Field>
        <Field id="contactMethod" label="How should we contact you?" error={errors.contactMethod}>
          <select id="f-contactMethod" name="contactMethod" defaultValue="" required {...a11y("contactMethod", errors)} className={inputClass(errors.contactMethod)}>
            <option value="" disabled>
              Choose one
            </option>
            {contactMethodOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>
      </fieldset>

      <fieldset className="mt-12 grid gap-x-6 gap-y-7 md:grid-cols-2">
        <legend className="label mb-5 text-gold-ink">02 · The property</legend>
        <Field id="city" label="City" error={errors.city}>
          <select id="f-city" name="city" defaultValue="" required {...a11y("city", errors)} className={inputClass(errors.city)}>
            <option value="" disabled>
              Choose a city
            </option>
            {cityOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>
        <Field id="locality" label="Locality or area" hint="For example, the neighbourhood or colony." error={errors.locality}>
          <input id="f-locality" name="locality" type="text" autoComplete="address-level3" maxLength={limits.locality} required {...a11y("locality", errors, true)} className={inputClass(errors.locality)} />
        </Field>
        <Field id="propertyType" label="Property type" error={errors.propertyType}>
          <select id="f-propertyType" name="propertyType" defaultValue="" required {...a11y("propertyType", errors)} className={inputClass(errors.propertyType)}>
            <option value="" disabled>
              Choose a type
            </option>
            {propertyTypeOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>
        <Field id="service" label="Service required" error={errors.service}>
          <select
            id="f-service"
            name="service"
            value={service}
            onChange={(e) => setService(e.target.value)}
            required
            {...a11y("service", errors)}
            className={inputClass(errors.service)}
          >
            <option value="" disabled>
              Choose a service
            </option>
            {serviceOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>
        <div className="md:col-span-2">
          <Field
            id="description"
            label="What would you like done?"
            hint={`A sentence or two is enough. ${descLength}/${limits.descriptionMax} characters.`}
            error={errors.description}
          >
            <textarea
              id="f-description"
              name="description"
              rows={5}
              maxLength={limits.descriptionMax}
              required
              onChange={(e) => setDescLength(e.target.value.length)}
              {...a11y("description", errors, true)}
              className={`${inputClass(errors.description)} min-h-36 resize-y py-3`}
            />
          </Field>
        </div>
      </fieldset>

      {/* Honeypot: hidden from people and assistive technology. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="f-website">Website</label>
        <input id="f-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="mt-10 border-t border-grey-line pt-8">
        <div className="flex gap-4">
          <input id="f-consent" name="consent" type="checkbox" required {...a11y("consent", errors)} className="mt-1 h-5 w-5 shrink-0 accent-navy" />
          <label htmlFor="f-consent" className="text-[0.95rem] text-slate">
            I agree that RenewBrick may contact me by phone, WhatsApp or email about this enquiry, and I have read the{" "}
            <Link href="/privacy-policy" className="font-semibold text-navy underline decoration-gold underline-offset-4">
              privacy policy
            </Link>
            .
          </label>
        </div>
        {errors.consent && (
          <p id="f-consent-error" className="mt-2 pl-9 text-[0.9rem] font-medium text-error">
            {errors.consent}
          </p>
        )}

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
          <button
            type="submit"
            disabled={submitting}
            aria-disabled={submitting}
            className="inline-flex min-h-13 items-center justify-center gap-3 bg-navy px-8 font-semibold text-white transition-colors hover:bg-navy-deep disabled:cursor-wait disabled:opacity-70"
          >
            {submitting && <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
            {submitting ? "Sending…" : "Send enquiry"}
          </button>
          <p className="text-sm text-slate">This sends an enquiry. It does not book a visit.</p>
        </div>
        <p className="sr-only" aria-live="polite">
          {submitting ? "Sending your enquiry" : ""}
        </p>
      </div>
    </form>
  );
}

/** Reads ?service= (preselects a service) and ?error= (no-JavaScript fallback) from the URL. */
function UrlState({ onService, onError }: { onService: (s: string) => void; onError: (m: string) => void }) {
  const params = useSearchParams();
  const service = params.get("service");
  const error = params.get("error");
  useEffect(() => {
    const option = service ? serviceOptionFor(service) : null;
    if (option) onService(option);
  }, [service, onService]);
  useEffect(() => {
    if (error && noJsErrors[error]) onError(noJsErrors[error]);
  }, [error, onError]);
  return null;
}

function stampStart(input: HTMLInputElement | null) {
  if (input && !input.value) input.value = String(Date.now());
}

function a11y(field: EnquiryField, errors: EnquiryErrors, hasHint = false) {
  const ids = [hasHint && `f-${field}-hint`, errors[field] && `f-${field}-error`].filter(Boolean).join(" ");
  return {
    "aria-invalid": errors[field] ? (true as const) : undefined,
    "aria-describedby": ids || undefined,
  };
}

function inputClass(error?: string) {
  return `block min-h-12 w-full border bg-white px-4 text-base text-navy transition-colors placeholder:text-slate/70 focus:border-navy ${
    error ? "border-error" : "border-navy/25 hover:border-navy/50"
  }`;
}

function Field({
  id,
  label,
  hint,
  optional,
  error,
  children,
}: {
  id: EnquiryField;
  label: string;
  hint?: string;
  optional?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={`f-${id}`} className="mb-2 flex items-baseline justify-between gap-3 font-medium text-navy">
        {label}
        {optional && <span className="label font-medium text-slate">Optional</span>}
      </label>
      {children}
      {hint && (
        <p id={`f-${id}-hint`} className="mt-2 text-sm text-slate">
          {hint}
        </p>
      )}
      {error && (
        <p id={`f-${id}-error`} className="mt-2 text-[0.9rem] font-medium text-error">
          {error}
        </p>
      )}
    </div>
  );
}
