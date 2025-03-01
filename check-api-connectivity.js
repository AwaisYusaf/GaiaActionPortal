// Network connectivity check for Perplexity API
import fetch from 'node-fetch';
import { config } from 'dotenv';
import { exit } from 'process';

// Load environment variables from .env.local
config({ path: '.env.local' });

async function checkApiEndpoint() {
  console.log('🔍 Checking Perplexity API endpoint accessibility...\n');
  
  try {
    // First, check if we can reach the Perplexity website
    console.log('Testing connection to Perplexity website...');
    const websiteResponse = await fetch('https://www.perplexity.ai', {
      method: 'HEAD'
    });
    
    console.log(`Perplexity website response: ${websiteResponse.status} ${websiteResponse.statusText}`);
    
    if (!websiteResponse.ok) {
      console.error('❌ Cannot reach Perplexity website. This may indicate network connectivity issues.');
      exit(1);
    }
    
    console.log('✅ Successfully connected to Perplexity website\n');
    
    // Now check the API endpoint without authentication
    console.log('Testing connection to Perplexity API endpoint...');
    const apiResponse = await fetch('https://api.perplexity.ai', {
      method: 'HEAD'
    });
    
    console.log(`Perplexity API endpoint response: ${apiResponse.status} ${apiResponse.statusText}`);
    
    // Even if we get a 401 or 404, it means we can reach the API endpoint
    if (apiResponse.status === 401 || apiResponse.status === 403 || apiResponse.status === 404) {
      console.log('✅ Successfully connected to Perplexity API endpoint (authentication required)\n');
    } else if (!apiResponse.ok) {
      console.error('❌ Cannot reach Perplexity API endpoint. This may indicate network connectivity issues.');
      exit(1);
    } else {
      console.log('✅ Successfully connected to Perplexity API endpoint\n');
    }
    
    // Now try with the API key
    const apiKey = process.env.PERPLEXITY_API_KEY;
    
    if (!apiKey) {
      console.error('❌ No Perplexity API key found in environment variables');
      exit(1);
    }
    
    console.log('Testing API endpoint with authentication...');
    const authResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'HEAD',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });
    
    console.log(`API authentication response: ${authResponse.status} ${authResponse.statusText}`);
    
    if (authResponse.status === 401) {
      console.error('❌ API key is invalid or expired');
      console.log('\n🔑 API Key Troubleshooting:');
      console.log('1. Verify the API key in your .env.local file is correct and up-to-date');
      console.log('2. Check if your Perplexity API key has expired or been revoked');
      console.log('3. Generate a new API key from the Perplexity dashboard');
      console.log('4. Make sure you have sufficient credits in your Perplexity account');
      
      // Try to get more details about the error
      try {
        const errorDetails = await authResponse.text();
        console.log('\nError details:', errorDetails);
      } catch (e) {
        console.log('Could not retrieve detailed error information');
      }
      
      exit(1);
    } else if (authResponse.status === 405) {
      console.log('✅ API endpoint reached (Method Not Allowed is expected for HEAD request)');
    } else if (!authResponse.ok) {
      console.error(`❌ API endpoint returned unexpected status: ${authResponse.status}`);
      exit(1);
    } else {
      console.log('✅ API endpoint authentication successful');
    }
    
    console.log('\n✅ All connectivity checks completed');
    
  } catch (error) {
    console.error('❌ Error during connectivity check:', error);
    exit(1);
  }
}

checkApiEndpoint();
