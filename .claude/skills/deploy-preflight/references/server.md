# Server / deploy mechanics — context only, never yours to execute

- `deploy.sh` builds with `--minify --cleanDestinationDir` and rsyncs
  `public/` to `$DEPLOY_HOST:$DEPLOY_PATH` (configured via `.env`, gitignored).
- Host is the DigitalOcean droplet (see the global `digitalocean` skill:
  68.183.63.41, vhost `owneroperators.online (+www)`, static root +
  proxy to the `owneroperators-api` Node app on :3005).
- `NOTES.md` in the repo root holds the raw rsync + nginx vhost steps and the
  `error_page 404 → /404.html` wiring — that's Eric's runbook, not a trigger.
- TLS is certbot-managed on the droplet; nothing TLS-related is done from
  this repo.

The reason this file exists: so a preflight can sanity-check _against_ the
deploy's real behavior (what gets uploaded, from where, to where) without
anyone "helpfully" running it. The deploy itself — `./deploy.sh`, rsync,
anything that touches the server — is Eric's, always.
