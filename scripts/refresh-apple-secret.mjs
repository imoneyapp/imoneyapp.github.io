// Regenerates the "Sign in with Apple" client secret (a short-lived ES256 JWT,
// max 6 months) and writes it into the Supabase project's Apple provider via
// the Management API. Run monthly by .github/workflows/apple-secret-refresh.yml
// so the secret can never lapse and break website Apple sign-in.
//
// Zero dependencies — Node's built-in crypto signs ES256 in JOSE (r||s) format
// via dsaEncoding:'ieee-p1363'.
//
// Required env (GitHub Actions secrets):
//   APPLE_P8_KEY           contents of the AuthKey_XXXX.p8 file (PEM)
//   SUPABASE_ACCESS_TOKEN  Supabase personal access token (Management API)
// Config env (safe, non-secret — set in the workflow):
//   APPLE_KEY_ID, APPLE_TEAM_ID, APPLE_SERVICES_ID, SUPABASE_PROJECT_REF
import crypto from 'node:crypto';

const {
  APPLE_P8_KEY, SUPABASE_ACCESS_TOKEN,
  APPLE_KEY_ID, APPLE_TEAM_ID, APPLE_SERVICES_ID, SUPABASE_PROJECT_REF,
} = process.env;

for (const [k, v] of Object.entries({ APPLE_P8_KEY, SUPABASE_ACCESS_TOKEN, APPLE_KEY_ID, APPLE_TEAM_ID, APPLE_SERVICES_ID, SUPABASE_PROJECT_REF })) {
  if (!v) { console.error(`Missing required env: ${k}`); process.exit(1); }
}

const b64url = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
const now = Math.floor(Date.now() / 1000);
const EXP_SECONDS = 180 * 24 * 60 * 60; // 180 days — safely under Apple's 6-month cap

const signingInput =
  b64url({ alg: 'ES256', kid: APPLE_KEY_ID }) + '.' +
  b64url({ iss: APPLE_TEAM_ID, iat: now, exp: now + EXP_SECONDS, aud: 'https://appleid.apple.com', sub: APPLE_SERVICES_ID });

const signature = crypto
  .sign('sha256', Buffer.from(signingInput), { key: APPLE_P8_KEY, dsaEncoding: 'ieee-p1363' })
  .toString('base64url');

const clientSecret = `${signingInput}.${signature}`;

const dryRun = process.argv.includes('--dry-run');
if (dryRun) {
  console.log(`[dry-run] generated secret, len=${clientSecret.length}, sub=${APPLE_SERVICES_ID}, expires in 180 days`);
  process.exit(0);
}

const res = await fetch(`https://api.supabase.com/v1/projects/${SUPABASE_PROJECT_REF}/config/auth`, {
  method: 'PATCH',
  headers: { Authorization: `Bearer ${SUPABASE_ACCESS_TOKEN}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ external_apple_secret: clientSecret }),
});

if (!res.ok) {
  console.error(`Supabase PATCH failed: HTTP ${res.status}\n${(await res.text()).slice(0, 500)}`);
  process.exit(1);
}
const cfg = await res.json();
if (!cfg.external_apple_secret) { console.error('PATCH returned but secret is still empty'); process.exit(1); }
console.log(`✅ Apple client secret rotated. Provider enabled=${cfg.external_apple_enabled}, client_id=${cfg.external_apple_client_id}, expires ${new Date((now + EXP_SECONDS) * 1000).toISOString().slice(0,10)}`);
