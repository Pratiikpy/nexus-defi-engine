# Deployment Guide - Nexus DeFi Engine

## Quick Deploy to Vercel

### Prerequisites
- Vercel account
- GitHub repository connected to Vercel

### Deploy Command
```bash
vercel --prod
```

### Environment Variables
Set these in your Vercel project settings:

```env
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_HELIUS_API_KEY=your_helius_api_key_here
NEXT_PUBLIC_NETWORK=devnet
```

### For Mainnet Deployment

1. Update environment variables:
```env
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
NEXT_PUBLIC_NETWORK=mainnet-beta
```

2. Ensure you have a production Helius API key

3. Deploy:
```bash
vercel --prod
```

## Alternative: Deploy to Other Platforms

### Netlify
```bash
npm run build
# Upload the .next folder to Netlify
```

### Railway
```bash
# Connect your GitHub repo to Railway
# Set environment variables in Railway dashboard
# Deploy automatically on push
```

### Self-Hosted
```bash
npm install
npm run build
npm start
```

Server will run on port 3000 by default.

## Troubleshooting

### Build Fails on Dependencies
If you see dependency errors during build:
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Solana Connection Issues
- Verify RPC URL is correct
- Check Helius API key is valid
- Ensure network (devnet/mainnet) matches your configuration

### Next.js Build Errors
- Ensure all TypeScript errors are resolved
- Check that all components are properly exported
- Verify tailwind configuration is correct

## Performance Optimization

### For Production
1. Enable Vercel Analytics
2. Use CDN for static assets
3. Configure caching headers
4. Enable compression

### Monitoring
- Set up Vercel logs monitoring
- Configure error tracking (Sentry recommended)
- Monitor Solana RPC usage
- Track user analytics

## Security Checklist
- [ ] Environment variables are set correctly
- [ ] No private keys in code or environment variables
- [ ] Rate limiting configured for API calls
- [ ] CORS configured properly
- [ ] Dependencies are up to date
- [ ] Security headers configured

## Scaling Considerations
- Use Helius premium RPC for higher throughput
- Implement caching for yield data
- Consider using Vercel Edge Functions for real-time updates
- Set up database for position tracking (if needed)

## Post-Deployment
1. Test all features on deployed site
2. Verify Solana connections work
3. Test wallet connection
4. Monitor error logs
5. Share deployment URL in forum post
