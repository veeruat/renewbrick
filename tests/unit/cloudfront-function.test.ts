// Exercises the CloudFront viewer-request function exactly as written in the
// CloudFormation template (single source of truth), and checks every exported
// page resolves to a real file in out/ when one exists.
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { describe, expect, it } from "vitest";

type Req = { uri: string; headers: Record<string, { value: string }>; querystring: Record<string, { value: string; multiValue?: { value: string }[] }> };
type Res = { statusCode: number; headers: { location: { value: string } } };

const template = readFileSync(path.join(__dirname, "../../infra/aws/renewbrick-site.yaml"), "utf8").replace(/\r\n/g, "\n");

function loadHandler(primary: string) {
  const match = template.match(/FunctionCode: !Sub\n\s+- \|\n([\s\S]*?)\n\s+- Primary:/);
  if (!match) throw new Error("FunctionCode block not found in template");
  const code = match[1].replace(/^ {10}/gm, "").replace("${Primary}", primary);
  const context: { handler?: (e: { request: Req }) => Req | Res } = {};
  vm.runInNewContext(`${code}\nthis.handler = handler;`, context);
  return context.handler!;
}

const run = (uri: string, host = "renewbrick.com", querystring: Req["querystring"] = {}, primary = "renewbrick.com") =>
  loadHandler(primary)({ request: { uri, headers: { host: { value: host } }, querystring } });

describe("CloudFront URL function", () => {
  it("maps clean URLs to .html files", () => {
    expect((run("/") as Req).uri).toBe("/index.html");
    expect((run("/about") as Req).uri).toBe("/about.html");
    expect((run("/services/rental-ready") as Req).uri).toBe("/services/rental-ready.html");
    expect((run("/locations/warangal") as Req).uri).toBe("/locations/warangal.html");
  });

  it("leaves real files and the extensionless OG image alone", () => {
    for (const uri of ["/_next/static/chunks/app.js", "/sitemap.xml", "/robots.txt", "/icon.svg", "/about/__next._tree.txt", "/opengraph-image"]) {
      expect((run(uri) as Req).uri).toBe(uri);
    }
  });

  it("redirects the non-canonical host, keeping path and query", () => {
    const res = run("/about", "www.renewbrick.com", { a: { value: "1" }, b: { value: "", multiValue: [{ value: "" }, { value: "2" }] } }) as Res;
    expect(res.statusCode).toBe(301);
    expect(res.headers.location.value).toBe("https://renewbrick.com/about?a=1&b&b=2");
  });

  it("redirects the CloudFront default domain to the canonical host", () => {
    expect((run("/", "d1234abcd.cloudfront.net") as Res).headers.location.value).toBe("https://renewbrick.com/");
  });

  it("supports www as the canonical host", () => {
    expect((run("/faq", "renewbrick.com", {}, "www.renewbrick.com") as Res).headers.location.value).toBe("https://www.renewbrick.com/faq");
    expect((run("/faq", "www.renewbrick.com", {}, "www.renewbrick.com") as Req).uri).toBe("/faq.html");
  });

  it("removes trailing slashes with a redirect", () => {
    const res = run("/about/", "renewbrick.com", { x: { value: "y" } }) as Res;
    expect(res.statusCode).toBe(301);
    expect(res.headers.location.value).toBe("/about?x=y");
  });
});

const out = path.join(__dirname, "../../out");
describe.skipIf(!existsSync(path.join(out, "index.html")))("every exported page resolves", () => {
  const pages: string[] = [];
  const walk = (dir: string) => {
    for (const name of readdirSync(dir)) {
      const full = path.join(dir, name);
      if (statSync(full).isDirectory()) walk(full);
      else if (name.endsWith(".html") && name !== "404.html" && name !== "_not-found.html") pages.push(full);
    }
  };
  walk(out);

  it.each(pages.map((p) => "/" + path.relative(out, p).replace(/\\/g, "/").replace(/\.html$/, "").replace(/^index$/, "")))(
    "%s",
    (route) => {
      const req = run(route) as Req;
      expect(existsSync(path.join(out, req.uri))).toBe(true);
    },
  );
});
