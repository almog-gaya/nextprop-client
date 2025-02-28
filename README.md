# NextProp Client

A Next.js application for property management with Go High Level integration.

## Local Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file with your environment variables (see `.env.example`)
4. Run the development server:
   ```bash
   npm run dev
   ```

## Deployment to Vercel

### Prerequisites

- A Vercel account
- Git repository with your code

### Steps to Deploy

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Log in to your Vercel account
3. Click "New Project"
4. Import your Git repository
5. Configure the project:
   - Set the Framework Preset to "Next.js"
   - Set the Root Directory to "nextprop-client" if your repository has multiple projects
   - Configure Build and Output settings if needed

### Environment Variables

Add the following environment variables in the Vercel project settings:

```
NEXTAUTH_URL=https://your-production-domain.vercel.app
NEXTAUTH_SECRET=your-production-secret-key

GHL_CLIENT_ID=your-ghl-client-id
GHL_CLIENT_SECRET=your-ghl-client-secret
GHL_REDIRECT_URI=https://your-production-domain.vercel.app/api/auth/callback

GHL_API_KEY=your-ghl-api-key
GHL_AGENCY_API_TOKEN=your-ghl-agency-api-token

GHL_API_V1_BASE_URL=https://rest.gohighlevel.com/v1
GHL_API_V2_BASE_URL=https://services.leadconnectorhq.com
```

Replace `your-production-domain.vercel.app` with your actual Vercel deployment URL.

### Important Notes for Production

1. **Update Go High Level OAuth Settings**: Make sure to update your redirect URI in the Go High Level developer portal to match your production URL.
   - Log in to your Go High Level account
   - Navigate to Settings > Developer Portal
   - Select your OAuth application
   - Update the Redirect URI to your production URL (e.g., `https://your-production-domain.vercel.app/api/auth/callback`)
   - Save your changes

2. **Secure Your Secrets**: Ensure that your production secrets are different from development and are kept secure.

3. **Verify OAuth Flow**: After deployment, test the OAuth flow to ensure it works correctly with the production URLs.

4. **Cookies and Security**: The application uses secure cookies in production. Ensure your domain is served over HTTPS.

## Troubleshooting

### OAuth Redirect Issues

If you encounter OAuth redirect issues:

1. Verify that your `GHL_REDIRECT_URI` in Vercel environment variables matches exactly what's configured in the Go High Level developer portal.
2. Check that the URL is correctly URL-encoded in the OAuth requests.
3. Ensure your application is properly handling the dynamic base URL in both the OAuth initiation and callback routes.

### API Connection Issues

If you have issues connecting to the Go High Level API:

1. Verify your API keys are correctly set in the environment variables.
2. Check that your Go High Level account has the necessary permissions.
3. Look at the server logs in Vercel for any error messages.

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Go High Level API Documentation](https://highlevel.stoplight.io/docs/integrations/) # nextprop-client
