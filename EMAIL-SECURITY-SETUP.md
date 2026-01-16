# Email Security Configuration Guide

## Overview

This guide provides step-by-step instructions for configuring SPF, DKIM, and DMARC DNS records for the AVFY email system using Resend as the email service provider.

## Prerequisites

- Access to your domain DNS management console (e.g., Cloudflare, GoDaddy, Namecheap)
- Resend account with verified domain
- Domain: `avisionforyou.org` (update this to your actual domain)

---

## 1. SPF (Sender Policy Framework)

SPF helps prevent email spoofing by specifying which mail servers are authorized to send email on behalf of your domain.

### What is SPF?

SPF is a DNS TXT record that lists the IP addresses and domains authorized to send emails from your domain. When a receiving mail server gets an email from your domain, it checks the SPF record to verify the sender is legitimate.

### SPF Record Configuration

Add the following TXT record to your domain's DNS:

**Record Type:** TXT  
**Name/Host:** `@` or `avisionforyou.org`  
**Value:**
```
v=spf1 include:_spf.resend.com ~all
```

**Explanation:**
- `v=spf1` - SPF version 1
- `include:_spf.resend.com` - Authorize Resend's mail servers
- `~all` - Soft fail for unauthorized servers (recommended for initial setup)

### Alternative with Multiple Email Services

If you use multiple email services (e.g., Google Workspace + Resend):

```
v=spf1 include:_spf.google.com include:_spf.resend.com ~all
```

### Testing SPF

After adding the record, test it using:
- Online tool: https://mxtoolbox.com/spf.aspx
- Command line: `dig TXT avisionforyou.org`

Expected result: The SPF record should be visible and include `_spf.resend.com`

---

## 2. DKIM (DomainKeys Identified Mail)

DKIM adds a digital signature to your emails, verifying they haven't been tampered with in transit.

### What is DKIM?

DKIM uses cryptographic signatures to verify email authenticity. When you send an email, Resend signs it with a private key. Receiving servers verify the signature using a public key published in your DNS.

### DKIM Configuration Steps

#### Step 1: Get DKIM Records from Resend

1. Log in to your Resend dashboard
2. Go to **Settings** → **Domains**
3. Select your domain (`avisionforyou.org`)
4. Click **View DNS Records**
5. Copy the DKIM record values

#### Step 2: Add DKIM DNS Records

Resend typically provides 3 DKIM records. Add each as a separate DNS record:

**Record 1:**
- **Type:** CNAME
- **Name:** `resend._domainkey.avisionforyou.org` (or as provided by Resend)
- **Value:** `[value provided by Resend]`

**Record 2:**
- **Type:** CNAME
- **Name:** `resend2._domainkey.avisionforyou.org`
- **Value:** `[value provided by Resend]`

**Record 3:**
- **Type:** CNAME
- **Name:** `resend3._domainkey.avisionforyou.org`
- **Value:** `[value provided by Resend]`

**Note:** The exact number and format of DKIM records depend on Resend's configuration. Always use the values provided in your Resend dashboard.

#### Step 3: Verify DKIM in Resend

1. Return to Resend dashboard
2. Click **Verify DNS** or **Verify Records**
3. Wait for DNS propagation (can take up to 48 hours, usually 10-30 minutes)
4. Status should change to "Verified"

### Testing DKIM

- Use Resend's verification tool in the dashboard
- Send a test email and check headers for `DKIM-Signature`
- Online tool: https://mxtoolbox.com/dkim.aspx

---

## 3. DMARC (Domain-based Message Authentication, Reporting, and Conformance)

DMARC builds on SPF and DKIM, providing reporting and policy enforcement for email authentication.

### What is DMARC?

DMARC tells receiving mail servers what to do with emails that fail SPF or DKIM checks, and where to send authentication reports.

### DMARC Record Configuration

Add the following TXT record to your DNS:

**Record Type:** TXT  
**Name/Host:** `_dmarc.avisionforyou.org` or `_dmarc`  
**Value:**
```
v=DMARC1; p=quarantine; rua=mailto:dmarc-reports@avisionforyou.org; ruf=mailto:dmarc-failures@avisionforyou.org; fo=1; pct=100
```

**Explanation:**
- `v=DMARC1` - DMARC version 1
- `p=quarantine` - Policy: quarantine emails that fail (alternative: `none` or `reject`)
- `rua=mailto:...` - Aggregate reports destination
- `ruf=mailto:...` - Forensic (failure) reports destination
- `fo=1` - Generate failure report if any mechanism fails
- `pct=100` - Apply policy to 100% of emails

### DMARC Policy Levels

Start with `p=none` for monitoring only, then gradually increase enforcement:

1. **Initial Setup (Monitoring):**
   ```
   v=DMARC1; p=none; rua=mailto:dmarc-reports@avisionforyou.org
   ```

2. **After 1-2 Weeks (Quarantine):**
   ```
   v=DMARC1; p=quarantine; rua=mailto:dmarc-reports@avisionforyou.org; pct=10
   ```

3. **After 1 Month (Full Quarantine):**
   ```
   v=DMARC1; p=quarantine; rua=mailto:dmarc-reports@avisionforyou.org; pct=100
   ```

4. **After 3 Months (Reject):**
   ```
   v=DMARC1; p=reject; rua=mailto:dmarc-reports@avisionforyou.org; pct=100
   ```

### DMARC Report Email Addresses

Set up these email addresses to receive DMARC reports:
- `dmarc-reports@avisionforyou.org` - Daily aggregate reports
- `dmarc-failures@avisionforyou.org` - Real-time failure alerts

**Note:** These mailboxes can receive a lot of reports. Consider using a DMARC analysis service like:
- DMARC Analyzer
- Postmark DMARC Digests
- dmarcian

### Testing DMARC

- Online tool: https://mxtoolbox.com/dmarc.aspx
- Command line: `dig TXT _dmarc.avisionforyou.org`
- Send test emails and check DMARC reports after 24-48 hours

---

## Complete DNS Configuration Summary

Here's a summary of all DNS records you need to add:

| Record Type | Name/Host | Value | TTL |
|-------------|-----------|-------|-----|
| TXT | `@` or `avisionforyou.org` | `v=spf1 include:_spf.resend.com ~all` | 3600 |
| CNAME | `resend._domainkey` | `[Resend DKIM value]` | 3600 |
| CNAME | `resend2._domainkey` | `[Resend DKIM value]` | 3600 |
| CNAME | `resend3._domainkey` | `[Resend DKIM value]` | 3600 |
| TXT | `_dmarc` | `v=DMARC1; p=quarantine; rua=mailto:dmarc-reports@avisionforyou.org` | 3600 |

---

## Verification Checklist

Use this checklist to ensure everything is configured correctly:

### Pre-Configuration
- [ ] Access to domain DNS management console
- [ ] Resend account verified and active
- [ ] Domain added and verified in Resend

### SPF Configuration
- [ ] SPF TXT record added to DNS
- [ ] Record includes `_spf.resend.com`
- [ ] SPF record verified using MXToolbox or similar
- [ ] Test email sent and SPF passes

### DKIM Configuration
- [ ] All DKIM records copied from Resend dashboard
- [ ] DKIM CNAME records added to DNS
- [ ] DNS propagation complete (check with `dig`)
- [ ] DKIM verified in Resend dashboard
- [ ] Test email sent and DKIM signature present

### DMARC Configuration
- [ ] DMARC TXT record added at `_dmarc` subdomain
- [ ] DMARC report email addresses created
- [ ] DMARC record verified using MXToolbox
- [ ] Policy set to `p=none` initially for monitoring
- [ ] First DMARC reports received (after 24-48 hours)

### Post-Configuration
- [ ] Monitor DMARC reports for 1-2 weeks
- [ ] No legitimate emails failing authentication
- [ ] Gradually increase DMARC policy enforcement
- [ ] Update documentation with actual record values

---

## Troubleshooting

### Common Issues

#### SPF Record Not Found
- **Cause:** DNS not propagated or incorrect record name
- **Solution:** Wait 24-48 hours for propagation. Verify record name is `@` or root domain.

#### DKIM Verification Fails
- **Cause:** Incorrect DKIM record values or DNS propagation delay
- **Solution:** Double-check values from Resend dashboard. Wait for DNS propagation.

#### DMARC Reports Not Received
- **Cause:** Email address not configured or DNS record incorrect
- **Solution:** Verify mailbox exists and accepts emails. Check DMARC record syntax.

#### Emails Going to Spam
- **Cause:** DMARC policy too strict or reputation issues
- **Solution:** Start with `p=none`, warm up sending reputation gradually.

### DNS Propagation Check

Check if DNS records have propagated globally:
- https://www.whatsmydns.net/
- Command: `dig TXT avisionforyou.org @8.8.8.8`

---

## Testing Email Deliverability

### Send Test Emails

1. Use Resend API or dashboard to send test email
2. Send to your own email addresses (Gmail, Outlook, etc.)
3. Check email headers for SPF, DKIM, DMARC results

### Check Email Headers

In Gmail:
1. Open the test email
2. Click three dots (⋮) → Show original
3. Look for:
   - `SPF: PASS`
   - `DKIM: PASS`
   - `DMARC: PASS`

### Mail Tester

Send a test email to: `test@mail-tester.com`
- Visit https://www.mail-tester.com/
- Enter the test ID
- Get a deliverability score and recommendations

---

## Production Configuration

### Resend Environment Variables

Ensure these are set in your production environment (Vercel):

```bash
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM=noreply@avisionforyou.org
```

### Email Sending Best Practices

1. **Warm-up Period:** Gradually increase sending volume
2. **List Hygiene:** Remove bounced/invalid addresses
3. **Engagement:** Monitor open rates and engagement
4. **Content:** Avoid spam trigger words
5. **Unsubscribe:** Always include unsubscribe link

### Monitoring

Monitor email deliverability using:
- Resend dashboard analytics
- DMARC aggregate reports
- Bounce rate tracking
- Spam complaint monitoring

---

## Additional Security Measures

### 1. BIMI (Brand Indicators for Message Identification)

After DMARC is enforced (`p=quarantine` or `p=reject`), consider adding BIMI:
- Displays your logo in supported email clients
- Requires verified DMARC with `p=quarantine` or `p=reject`
- Requires verified trademark for some providers

### 2. MTA-STS (Mail Transfer Agent Strict Transport Security)

Enforce TLS for email delivery:
- Prevents downgrade attacks
- Requires HTTPS-hosted policy file
- More advanced, implement after basic records are stable

### 3. TLS-RPT (TLS Reporting)

Receive reports about TLS negotiation failures:
```
_smtp._tls.avisionforyou.org TXT "v=TLSRPTv1; rua=mailto:tls-reports@avisionforyou.org"
```

---

## Support and Resources

### Resend Documentation
- https://resend.com/docs
- https://resend.com/docs/dashboard/domains/introduction

### Email Authentication Resources
- SPF: https://www.rfc-editor.org/rfc/rfc7208
- DKIM: https://www.rfc-editor.org/rfc/rfc6376
- DMARC: https://dmarc.org/

### Testing Tools
- MXToolbox: https://mxtoolbox.com/
- Mail Tester: https://www.mail-tester.com/
- Google Admin Toolbox: https://toolbox.googleapps.com/apps/messageheader/

### Contact

For questions about email configuration:
- Technical Support: tech@avisionforyou.org
- Resend Support: support@resend.com

---

## Change Log

| Date | Version | Changes |
|------|---------|---------|
| 2026-01-16 | 1.0 | Initial documentation created |

---

**Note:** Replace `avisionforyou.org` with your actual domain name throughout this document. Update DKIM record values with actual values from your Resend dashboard.
