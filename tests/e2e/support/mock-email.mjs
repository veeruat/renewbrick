// Test-only stand-in for the Resend API: accepts every email with 200 OK.
import { createServer } from "node:http";
const port = Number(process.argv[2] ?? 54330);
createServer((req, res) => {
  req.resume();
  req.on("end", () => res.writeHead(200, { "Content-Type": "application/json" }).end('{"id":"mock"}'));
}).listen(port, "127.0.0.1", () => console.log(`mock email on ${port}`));
