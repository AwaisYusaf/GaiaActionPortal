// Perplexity API Key Regeneration Guide
// This document provides a step-by-step guide to fix the Perplexity API key issues

/**
 * PERPLEXITY API TROUBLESHOOTING GUIDE
 * 
 * Based on our diagnostics, we've identified that the Perplexity API key is being rejected
 * with a 401 Unauthorized error. Additionally, there may be network connectivity issues
 * affecting access to the Perplexity API.
 * 
 * Follow these steps to resolve the issue:
 */

/**
 * STEP 1: Regenerate your Perplexity API Key
 * 
 * 1. Go to https://www.perplexity.ai/settings/api
 * 2. Click on "Regenerate API Key" to create a new key
 * 3. Copy the new API key (it should start with "pplx-")
 */

/**
 * STEP 2: Update your local environment
 * 
 * 1. Open your .env.local file in the project root
 * 2. Replace the existing PERPLEXITY_API_KEY with your new key:
 *    PERPLEXITY_API_KEY=pplx-your-new-key-here
 * 3. Save the file
 */

/**
 * STEP 3: Update your Netlify environment variables
 * 
 * 1. Go to your Netlify dashboard
 * 2. Navigate to Site settings > Environment variables
 * 3. Find the PERPLEXITY_API_KEY variable
 * 4. Click "Edit" and update it with your new key
 * 5. Save the changes
 * 6. Trigger a new deployment to apply the changes
 */

/**
 * STEP 4: Test your API key locally
 * 
 * Run the following command to test your API key:
 * node test-production-code.js
 * 
 * If successful, you should see a response with content from the API
 */

/**
 * STEP 5: Check for network restrictions
 * 
 * If you're still experiencing issues, there may be network restrictions:
 * 
 * 1. Check if your network has firewall rules blocking AI API services
 * 2. Try accessing the API from a different network
 * 3. Consider using a VPN if necessary
 */

/**
 * STEP 6: Update your API integration code
 * 
 * If the issue persists, you may need to update your API integration code:
 * 
 * 1. Check for any changes in the Perplexity API documentation
 * 2. Ensure you're using the correct API endpoint and parameters
 * 3. Consider implementing a retry mechanism for failed requests
 */

/**
 * STEP 7: Contact Perplexity Support
 * 
 * If all else fails, contact Perplexity support:
 * 
 * 1. Go to https://www.perplexity.ai/help
 * 2. Provide details about your issue, including error messages
 * 3. Include your API key usage patterns and requirements
 */

// This guide was created based on diagnostics run on March 1, 2025
// For the latest information, always refer to the official Perplexity documentation
