// The contact-form Lambda builds an SES v2 SendEmail request (infra/aws/renewbrick-site.yaml).
// On the server the same request goes out over SES's SMTP interface; this turns one into the other.

/** @param {Record<string, any>} input SESv2 SendEmailCommand input with Content.Simple */
export function toMail(input) {
  const simple = input.Content.Simple;
  return {
    from: input.FromEmailAddress,
    to: input.Destination.ToAddresses,
    replyTo: input.ReplyToAddresses?.[0],
    subject: simple.Subject.Data,
    text: simple.Body.Text.Data,
  };
}
