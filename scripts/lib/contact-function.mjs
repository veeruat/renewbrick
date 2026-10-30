// Loads the contact form Lambda exactly as written in the CloudFormation
// template (the single source of truth), with the SES client replaced by
// `send`. Used by the unit tests and by scripts/serve-static.mjs, so local
// form submissions run the real validation without sending email.
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const templatePath = path.join(path.dirname(fileURLToPath(import.meta.url)), "../../infra/aws/renewbrick-site.yaml");

export function contactFunctionSource() {
  const template = readFileSync(templatePath, "utf8").replace(/\r\n/g, "\n");
  const match = template.match(/\n( +)ZipFile: \|\n((?:\1  .*\n|\n)+)/);
  if (!match) throw new Error("ContactFunction ZipFile block not found in the template");
  const indent = match[1].length + 2;
  return match[2].replace(new RegExp(`^ {${indent}}`, "gm"), "");
}

/**
 * @param {{ send: (input: Record<string, unknown>) => Promise<void> | void, env: Record<string, string>, log?: (line: string) => void }} options
 */
export function loadContactHandler({ send, env, log = () => {} }) {
  class SendEmailCommand {
    constructor(input) {
      this.input = input;
    }
  }
  class SESv2Client {
    async send(command) {
      await send(command.input);
    }
  }
  const nodeRequire = createRequire(import.meta.url);
  const cjs = { exports: {} };
  const context = vm.createContext({
    module: cjs,
    exports: cjs.exports,
    require: (id) => (id === "@aws-sdk/client-sesv2" ? { SESv2Client, SendEmailCommand } : nodeRequire(id)),
    process: { env },
    console: { log, error: log },
    Buffer,
    URLSearchParams,
    Date,
  });
  vm.runInContext(contactFunctionSource(), context, { filename: "contact-function.js" });
  return cjs.exports.handler;
}
