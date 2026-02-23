# Security Policy

## Environment Variables

| Variable | Scope | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | Client | Public project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Client | Anon/public key (safe for browser) |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server only** | Full database access — never expose in client |
| `ADMIN_PASSWORD` | **Server only** | Protects admin API write operations |
| `ALLOWED_ORIGIN` | **Server only** | CORS origin for admin API |

## Where to Store Secrets

- **Lovable Cloud**: Use Settings → Cloud → Secrets
- **CI/CD**: Use GitHub Actions encrypted secrets
- **Never** commit secrets to the repository or `.env` file

## Rotating the Service Role Key

1. Go to your Lovable Cloud settings
2. Generate a new service role key
3. Update the `SUPABASE_SERVICE_ROLE_KEY` secret in Lovable Cloud
4. Redeploy edge functions

## Revoking Leaked Keys

If a key has been exposed:

1. **Immediately** rotate the key (see above)
2. Review audit logs for unauthorized access
3. If the key was committed to git history, run:
   ```bash
   bfg --delete-files .env
   git reflog expire --expire=now --all
   git gc --prune=now --aggressive
   git push --force
   ```
4. Rotate **all** credentials after history cleanup

## Admin API Security

- All POST endpoints require `x-admin-password` header
- CORS is restricted to `ALLOWED_ORIGIN` (no wildcard)
- All admin actions are audit-logged to console
- Service role key is server-side only, never returned in responses

## Reporting Vulnerabilities

If you discover a security vulnerability, please report it privately to the repository owner. Do not open a public issue.
