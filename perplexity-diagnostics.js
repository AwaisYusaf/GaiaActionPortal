// Comprehensive Perplexity API diagnostic script
import fetch from 'node-fetch';
import { config } from 'dotenv';
import { exit } from 'process';

// Load environment variables from .env.local
config({ path: '.env.local' });

async function runDiagnostics() {
  console.log('🔍 Running Perplexity API diagnostics...\n');
  
  // Step 1: Check for API key
  const apiKey = process.env.PERPLEXITY_API_KEY;
  
  if (!apiKey) {
    console.error('❌ ERROR: No Perplexity API key found in environment variables');
    console.log('Make sure you have a .env.local file with PERPLEXITY_API_KEY set');
    exit(1);
  }
  
  // Mask the API key for security
  const maskedKey = apiKey.substring(0, 4) + '...' + apiKey.substring(apiKey.length - 4);
  console.log(`✅ API key found: ${maskedKey} (length: ${apiKey.length})`);
  
  // Step 2: Check API key format
  if (!apiKey.startsWith('pplx-')) {
    console.warn('⚠️ WARNING: API key does not start with "pplx-" prefix. This may cause issues.');
  }
  
  // Step 3: Test API connection
  console.log('\n📡 Testing API connectivity...');
  try {
    const response = await fetch('https://api.perplexity.ai/health', {
      method: 'GET'
    });
    
    if (response.ok) {
      console.log('✅ API endpoint is reachable');
    } else {
      console.error(`❌ API endpoint returned status ${response.status}`);
      try {
        const errorText = await response.text();
        console.error('Error details:', errorText);
      } catch (e) {
        console.error('Could not read error details');
      }
    }
  } catch (error) {
    console.error('❌ Could not connect to API endpoint:', error.message);
    console.log('This may indicate network connectivity issues or DNS problems');
  }
  
  // Step 4: Test API authentication
  console.log('\n🔐 Testing API authentication...');
  try {
    // Make a minimal request to test authentication
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          {
            role: 'user',
            content: 'Hello'
          }
        ],
        max_tokens: 5
      })
    });
    
    const status = response.status;
    const statusText = response.statusText;
    const headers = Object.fromEntries(response.headers.entries());
    
    console.log(`API response status: ${status} ${statusText}`);
    console.log('Response headers:', headers);
    
    if (status === 401) {
      console.error('❌ Authentication failed (401 Unauthorized)');
      console.error('This indicates your API key is invalid or has been revoked');
      
      try {
        const errorText = await response.text();
        console.error('Error details:', errorText);
      } catch (e) {
        console.error('Could not read error details');
      }
      
      exit(1);
    } else if (status === 403) {
      console.error('❌ Authorization failed (403 Forbidden)');
      console.error('This indicates your API key does not have permission to access this resource');
      
      try {
        const errorText = await response.text();
        console.error('Error details:', errorText);
      } catch (e) {
        console.error('Could not read error details');
      }
      
      exit(1);
    } else if (!response.ok) {
      console.error(`❌ API request failed with status ${status}`);
      
      try {
        const errorText = await response.text();
        console.error('Error details:', errorText);
      } catch (e) {
        console.error('Could not read error details');
      }
      
      exit(1);
    } else {
      console.log('✅ Authentication successful');
      
      try {
        const data = await response.json();
        console.log('✅ API returned valid JSON response');
        console.log('Response preview:', JSON.stringify(data).substring(0, 100) + '...');
      } catch (e) {
        console.error('❌ Could not parse JSON response:', e.message);
        try {
          const text = await response.text();
          console.log('Raw response:', text.substring(0, 200) + '...');
        } catch (e) {
          console.error('Could not read response body');
        }
      }
    }
  } catch (error) {
    console.error('❌ Error testing API authentication:', error.message);
    if (error.code === 'ENOTFOUND') {
      console.error('This indicates a DNS resolution error. Check your internet connection.');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('This indicates the server refused the connection. The service might be down.');
    }
    exit(1);
  }
  
  // Step 5: Test full API functionality
  console.log('\n🧪 Testing full API functionality...');
  try {
    console.log('Sending a complete request to the Perplexity API...');
    
    const requestBody = {
      model: 'sonar',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that provides concise responses.'
        },
        {
          role: 'user',
          content: 'What is the capital of France?'
        }
      ],
      max_tokens: 50
    };
    
    console.log('Request body:', JSON.stringify(requestBody));
    
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      console.error(`❌ API request failed with status ${response.status}`);
      
      try {
        const errorText = await response.text();
        console.error('Error details:', errorText);
      } catch (e) {
        console.error('Could not read error details');
      }
      
      exit(1);
    }
    
    try {
      const data = await response.json();
      console.log('✅ Full API request successful');
      
      if (data.choices && data.choices[0] && data.choices[0].message) {
        console.log('Response content:', data.choices[0].message.content);
      } else {
        console.warn('⚠️ Response format is unexpected:', JSON.stringify(data).substring(0, 200) + '...');
      }
    } catch (e) {
      console.error('❌ Could not parse JSON response:', e.message);
      exit(1);
    }
  } catch (error) {
    console.error('❌ Error testing full API functionality:', error.message);
    exit(1);
  }
  
  console.log('\n✅ All diagnostics completed!');
}

runDiagnostics().catch(error => {
  console.error('❌ Unhandled error during diagnostics:', error);
  exit(1);
});
