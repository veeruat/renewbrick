// RenewBrick enquiry form on the shared server: POST /api/contact runs the contact-form Lambda exactly
// as written in infra/aws/renewbrick-site.yaml (validation, honeypot, timing and origin checks, the
// email text), loaded by scripts/lib/contact-function.mjs. Only the sending differs: SMTP to Amazon
// SES instead of the SES API. nginx in front adds the per-IP rate limit and the 64 KB body cap.
import { createServer } from "node:http";
import nodemailer from "nodemailer";
import { loadContactHandler } from "../../../scripts/lib/contact-function.mjs";
import { toMail } from "./mail.mjs";

const need = (k) => process.env[k] || (console.error(`${k} is not set`), process.exit(1));
const env = { RECIPIENT: need("RECIPIENT"), SENDER: need("SENDER"), SITE_ORIGIN: need("SITE_ORIGIN") };
const transport = nodemailer.createTransport({
  host: need("SMTP_HOST"),
  port: Number(process.env.SMTP_PORT || 587),
  requireTLS: true,
  auth: { user: need("SMTP_USER"), pass: need("SMTP_PASSWORD") },
  connectionTimeout: 10_000,
  socketTimeout: 15_000,
});

const handler = loadContactHandler({
  env,
  send: async (input) => {
    await transport.sendMail(toMail(input));
  },
  log: (line) => console.log(line),
});

const MAX_BODY = 20_000; // the Lambda's own limit; anything longer is rejected there too

createServer(async (req, res) => {
  if (req.url === "/healthz") return res.writeHead(200).end("ok");
  if (req.method !== "POST" || req.url?.split("?")[0] !== "/api/contact") return res.writeHead(404).end();
  try {
    const chunks = [];
    let size = 0;
    for await (const chunk of req) {
      size += chunk.length;
      if (size > MAX_BODY + 1) break;
      chunks.push(chunk);
    }
    const result = await handler({
      headers: Object.fromEntries(Object.entries(req.headers).map(([k, v]) => [k, String(v)])),
      body: Buffer.concat(chunks).toString("base64"),
      isBase64Encoded: true,
    });
    res.writeHead(result.statusCode, result.headers).end(result.body);
  } catch (err) {
    console.log(JSON.stringify({ outcome: "crash", error: err && err.name }));
    if (!res.headersSent) res.writeHead(500).end();
  }
}).listen(8080, () => console.log("contact form listening on :8080"));
