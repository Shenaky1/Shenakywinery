# Private cellar

The `/cellar` application runs in the existing winery Worker. Other paths continue to use existing static assets. The legacy `/cellar` redirects are not applied because this route runs the Worker first.

Cloudflare Access protects `/cellar` and its subpaths. The Worker additionally verifies the RS256 signature, fixed issuer, application audience, token expiration, and owner email digest. Requests on alternate hosts are denied. Keep this application owner-only. If the Access application is recreated, update its audience in `cellar-auth.mjs`.

Wine records are not in this repository. After signing in, import the exported JSON backup using the application's file chooser. Records are held in the SQLite-backed `CellarStore` Durable Object created by Wrangler's migration. All fields, event histories and original note texts are retained. The API uses revision checking to prevent overwriting changes from another session. The previous 20 saved revisions are retained in `cellar_history`.

Keep an exported JSON backup before changes. Session expiration can interrupt saving; export unsaved records, sign in again and reload before retrying.

To rebuild the generic interface: `cd cellar-src`, `npm install`, then `npm run build`. Commit both source changes and the regenerated `cellar-ui.mjs`. This build does not contain any wine data.

The original ChatGPT-protected cellar remains a fallback during migration; it is not made public or used as a data proxy.
