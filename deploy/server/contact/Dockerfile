# Build context: the repository root at the commit being shipped (ship.sh uploads only these files).
FROM node:24-alpine
WORKDIR /app
COPY deploy/server/contact/package.json deploy/server/contact/package-lock.json deploy/server/contact/
RUN cd deploy/server/contact && npm ci --omit=dev --no-audit --no-fund
# The Lambda's code lives in the template; the loader reads it from there at start-up.
COPY infra/aws/renewbrick-site.yaml infra/aws/
COPY scripts/lib/contact-function.mjs scripts/lib/
COPY deploy/server/contact/server.mjs deploy/server/contact/mail.mjs deploy/server/contact/
USER node
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1:8080/healthz || exit 1
CMD ["node", "deploy/server/contact/server.mjs"]
