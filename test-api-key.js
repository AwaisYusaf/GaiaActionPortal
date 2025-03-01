// Test script to verify Perplexity API key locally
import { config } from 'dotenv';
import { readFile } from 'fs/promises';
import { exit } from 'process';

// Load environment variables from .env.local
config({ path: '.env.local' });

const apiKey = process.env.PERPLEXITY_API_KEY;

if (!apiKey) {
  console.error('❌ ERROR: No Perplexity API key found in environment variables');
  console.log('Make sure you have a .env.local file with PERPLEXITY_API_KEY set');
  exit(1);
}

// Mask the API key for security
const maskedKey = apiKey.substring(0, 4) + '...' + apiKey.substring(apiKey.length - 4);
console.log(`✅ API key found: ${maskedKey} (length: ${apiKey.length})`);

// Make a simple API call to verify the key works
async function testApiKey() {
  try {
    console.log('🔍 Testing Perplexity API key with a simple request...');
    
    const requestBody = {
      model: 'sonar',
      messages: [
        {
          role: 'user',
          content: 'Hello, this is a test message to verify the API key is working.'
        }
      ],
      max_tokens: 10
    };
    
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API key verification failed with status ${response.status}: ${errorText}`);
      exit(1);
    }
    
    const data = await response.json();
    console.log('✅ API key is valid and working!');
    console.log('📊 Response:', JSON.stringify(data, null, 2).substring(0, 200) + '...');
    exit(0);
    
  } catch (error) {
    console.error('❌ Error testing API key:', error);
    exit(1);
  }
}

testApiKey();
