# Netlify API Key Update Guide

## Instructions for Updating the Perplexity API Key in Netlify

Follow these steps to update your Perplexity API key in the Netlify environment:

1. **Log in to your Netlify account**
   - Go to [https://app.netlify.com/](https://app.netlify.com/)
   - Sign in with your credentials

2. **Navigate to your Gaia Action Portal site**
   - Click on the site name in your Netlify dashboard

3. **Access Environment Variables**
   - Click on "Site settings" in the top navigation
   - Select "Environment variables" from the left sidebar

4. **Update the API Key**
   - Find the `PERPLEXITY_API_KEY` variable in the list
   - Click "Edit" next to it
   - Replace the current value with your new API key:
     ```
     YOUR_NEW_API_KEY_HERE
     ```
   - Click "Save"

5. **Redeploy Your Site**
   - Go to the "Deploys" tab in the top navigation
   - Click "Trigger deploy" and select "Deploy site"
   - This will rebuild your site with the new API key

6. **Verify the Update**
   - After deployment completes, visit your site
   - Try making a search query to test the Perplexity API integration
   - You can also check the function logs in Netlify to verify the API calls are working

## Troubleshooting

If you encounter any issues after updating the API key:

1. **Check Function Logs**
   - Go to "Functions" in the Netlify dashboard
   - Look for any error messages related to the Perplexity API

2. **Verify Environment Variable Scope**
   - Make sure the API key is set for all deployment contexts (Production, Deploy Previews, and Branch deploys)
   - You can check this by clicking "Show advanced" when editing the environment variable

3. **Test API Key Locally**
   - Run `node test-production-code.js` locally to verify the API key works
   - If it works locally but not in production, there might be an issue with how Netlify is handling the environment variable

Remember to keep your API key secure and never commit it to your repository.
