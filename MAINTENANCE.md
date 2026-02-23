# Maintenance Guide

## Running a Secret Scan

```bash
pip install detect-secrets
detect-secrets scan
```

Ensure no real secrets appear in the output.

## Running npm Audit

```bash
npm audit --audit-level=moderate
```

Fix critical/high vulnerabilities before deploying.

## Rotating Keys

1. Generate new credentials in Lovable Cloud settings
2. Update the corresponding secret in Lovable Cloud → Secrets
3. Edge functions will automatically pick up new values on next invocation

## Where Secrets Belong

| Secret | Location |
|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Lovable Cloud Secrets |
| `ADMIN_PASSWORD` | Lovable Cloud Secrets |
| `ALLOWED_ORIGIN` | Lovable Cloud Secrets |
| `VITE_SUPABASE_URL` | `.env` (auto-managed) |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `.env` (auto-managed) |

## Monitoring Recommendations

- Enable backend logging in Lovable Cloud
- Set up billing alerts to detect unexpected usage spikes
- Review admin audit logs regularly (logged to edge function console)
