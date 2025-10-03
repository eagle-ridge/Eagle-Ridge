# Domain Reputation & Web Categorization Guide

This guide provides step-by-step instructions for submitting `eagleridge.io` to web categorization services to build domain reputation and resolve "Newly Observed Domain" blocking.

## Why This Matters

New domains are often blocked by corporate/government web filters as an anti-phishing measure. By proactively submitting to categorization services, you accelerate the process of being recognized as a legitimate business site.

---

## Required Submissions (Priority Order)

### 1. Webroot BrightCloud
**Used by:** Chesterfield County and many enterprise filters

1. Visit: https://brightcloud.com/tools/url-ip-lookup.php
2. Enter: `eagleridge.io`
3. Click "Lookup"
4. If miscategorized or "Unknown", click "Request Review"
5. Select category: **Business/Finance** or **Business Services**
6. Add description: "Technology consulting firm specializing in cybersecurity compliance for PE/VC portfolio companies"
7. Submit

**Expected timeline:** 1-3 business days

---

### 2. Cisco Talos Intelligence
**Used by:** Cisco security products (widely deployed)

1. Visit: https://www.talosintelligence.com/reputation_center
2. Enter: `eagleridge.io` in the search box
3. Click the domain result
4. If listed as "Unknown" or miscategorized, click "Report Incorrect Reputation"
5. Select: **Business Services** as category
6. Add note: "Legitimate technology consulting business - cybersecurity advisory services"
7. Submit

**Expected timeline:** 2-5 business days

---

### 3. McAfee TrustedSource
**Used by:** McAfee products, Skyhigh Security

1. Visit: https://trustedsource.org/
2. Click "Check a Site"
3. Enter: `eagleridge.io`
4. Complete CAPTCHA
5. If miscategorized, click "Dispute this categorization"
6. Log in or create account (required)
7. Select: **Business** → **Business Services**
8. Add justification: "Professional technology consulting firm"
9. Submit

**Expected timeline:** 3-7 business days

---

### 4. Forcepoint (formerly Websense)
**Used by:** Government and enterprise networks

1. Visit: https://www.forcepoint.com/support
2. Search for "URL categorization" in support portal
3. Submit recategorization request through support form
4. Suggested category: **Business and Economy** → **Business**
5. Provide website details and business description

**Expected timeline:** 5-10 business days

---

## Search Engine Indexing

### Google Search Console
1. Visit: https://search.google.com/search-console
2. Sign in with Google account
3. Click "Add Property"
4. Enter: `eagleridge.io`
5. Verify ownership via DNS TXT record or HTML file upload
6. Submit sitemap (if created)
7. Request indexing for key pages

**Benefit:** Faster Google indexing helps with domain reputation

### Bing Webmaster Tools
1. Visit: https://www.bing.com/webmasters
2. Sign in with Microsoft account
3. Add site: `eagleridge.io`
4. Verify ownership
5. Submit URL for indexing

---

## Additional Reputation Signals

### 1. SSL Certificate (Already Complete ✓)
- GitHub Pages provides Let's Encrypt SSL
- Valid through Dec 2025

### 2. WHOIS Privacy
Consider adding WHOIS information:
- Go to your domain registrar
- Add business contact information (builds trust)
- Make registration details public (optional but helps)

### 3. Email Authentication
Set up SPF, DKIM, and DMARC records for `@eagleridge.io`:
- Prevents email spoofing
- Improves domain reputation
- Required for sending business email

### 4. Social Media Presence ✓
- LinkedIn company page already established
- Consider adding to footer: Twitter/X, other platforms

---

## Timeline Expectations

| Service | Review Time | Impact |
|---------|-------------|--------|
| Webroot BrightCloud | 1-3 days | High (used by Chesterfield County) |
| Cisco Talos | 2-5 days | High (widely deployed) |
| McAfee TrustedSource | 3-7 days | Medium |
| Forcepoint | 5-10 days | Medium |
| Natural aging | 30-90 days | Automatic |

---

## Monitoring Progress

### Check Categorization Status
Revisit the lookup tools every 3-5 days:
- https://brightcloud.com/tools/url-ip-lookup.php
- https://www.talosintelligence.com/reputation_center

### Test Access
- Ask colleagues on different networks to test
- Use VPN services to test from different locations
- Check on mobile devices (cellular data)

---

## For Chesterfield County Network

### Short-term: Request Whitelist
Contact IT department:
> "Hi, I'm trying to access eagleridge.io, a legitimate technology consulting firm website. It's being blocked as 'Newly Observed Domain.' Could you please whitelist this domain? Company LinkedIn: https://www.linkedin.com/company/eagle-ridge-advisory/"

### Medium-term: Wait for Categorization
After submissions above, the domain should automatically be unblocked within 1-2 weeks as reputation databases update.

---

## Notes

- **No automation possible:** These services require manual submission to prevent spam
- **Be patient:** Reputation building takes time
- **Monitor results:** Check categorization status weekly
- **Update content:** Keep website content professional and complete

---

## Additional Resources

- GitHub Pages SSL: https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https
- Let's Encrypt: https://letsencrypt.org/
- Domain reputation best practices: https://www.cloudflare.com/learning/dns/dns-security/

---

*Last Updated: January 2025*
