# Square Donations Setup Guide

## Quick Check

Visit: `https://YOUR_VERCEL_URL/api/donate/status` to see Square configuration status.

## Configuration

Square donations require two environment variables in Vercel:

| Variable | Value | Notes |
|----------|-------|-------|
| `SQUARE_ACCESS_TOKEN` | Your Square API access token | Get from Square Developer Dashboard |
| `SQUARE_ENVIRONMENT` | `production` or `sandbox` | Use `sandbox` for testing |

## Getting Square Credentials

### 1. Go to Square Developer Dashboard
- Visit: https://developer.squareup.com/apps
- Sign in with your Square account (or create one)

### 2. Create or Select Your Application
- Click "Applications" → "Create Application"
- Name it "A Vision For You Recovery"

### 3. Get Your Access Token
- Navigate to your app
- Click "Credentials"
- Find "Access Token" (or "Personal Access Token" for testing)
- Copy the access token

### 4. Add to Vercel
1. Go to your Vercel project dashboard
2. Settings → Environment Variables
3. Add:
   - `SQUARE_ACCESS_TOKEN` = your access token
   - `SQUARE_ENVIRONMENT` = `sandbox` (for testing) or `production`

### 5. Redeploy
Push a new commit to trigger Vercel rebuild with the new environment variables.

## Testing Square Donations

### Test Card Numbers
- **4532 0151 1283 0366** - Standard test card
- **4532 0151 1283 0366** - Visa test
- **5105 1051 0510 5100** - Mastercard test

### Test Flow
1. Go to `/donate`
2. Select "Square (Sandbox Test)" as payment method
3. Enter amount and donor info
4. Click "Donate Now"
5. Use test card numbers to complete payment

## Troubleshooting

### "Square credentials are invalid"
- Verify `SQUARE_ACCESS_TOKEN` is set correctly in Vercel
- Check token hasn't expired (regenerate if needed)
- Make sure it's the full token, not truncated

### "Failed to create payment link"
- Check Square API status: https://status.squareup.com
- Verify amount is valid (must be > 0)
- Ensure `SQUARE_ENVIRONMENT` matches your token environment

### Payment link doesn't work
- Confirm you're using sandbox token for sandbox environment
- Try a different test card
- Check browser console for error details

## API Endpoints

### Create Payment Link
```
POST /api/donate/square
```
Request:
```json
{
  "amount": 50,
  "frequency": "ONE_TIME",
  "email": "donor@example.com",
  "name": "John Doe"
}
```

Response:
```json
{
  "url": "https://square.link/pay/...",
  "donationId": "donation_uuid"
}
```

### Check Status
```
GET /api/donate/status
```

Returns configuration status and which payment methods are enabled.

## Square Payment Links Features

- ✅ One-time donations
- ✅ Custom donation amounts
- ✅ Optional shipping address (disabled for donations)
- ✅ Pre-filled email
- ✅ PCI compliant (uses Square-hosted checkout)
- ❌ Recurring/subscription donations (not yet supported)

## Production Considerations

Before going live with Square:

1. **Switch to Production Environment**
   - Change `SQUARE_ENVIRONMENT` to `production`
   - Use production access token (different from sandbox)

2. **Update Payment Method Selector**
   - Hide/remove "Sandbox Test" label
   - Display "Square" normally

3. **Test with Real Cards** (on sandbox first)
   - Use real payment methods to test
   - Monitor transaction settlement

4. **Set Up Webhooks** (optional)
   - Listen for `payment_link.created`, `payment_link.updated` events
   - Track donation completion

5. **Enable Both Payment Methods**
   - Keep Stripe and Square available
   - Let donors choose their preferred method

## Support

For Square API issues:
- Docs: https://developer.squareup.com/docs
- Status: https://status.squareup.com
- Support: https://squareup.com/help
