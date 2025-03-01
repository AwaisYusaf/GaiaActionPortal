// General API connectivity check
import fetch from 'node-fetch';
import { exit } from 'process';

async function checkGeneralConnectivity() {
  console.log('🔍 Checking general API connectivity...\n');
  
  const endpoints = [
    { name: 'Perplexity Website', url: 'https://www.perplexity.ai' },
    { name: 'Perplexity API', url: 'https://api.perplexity.ai' },
    { name: 'OpenAI Website', url: 'https://www.openai.com' },
    { name: 'OpenAI API', url: 'https://api.openai.com' },
    { name: 'Google', url: 'https://www.google.com' },
    { name: 'Cloudflare', url: 'https://www.cloudflare.com' },
    { name: 'GitHub', url: 'https://www.github.com' }
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`Testing connection to ${endpoint.name}...`);
      const response = await fetch(endpoint.url, {
        method: 'HEAD',
        timeout: 10000 // 10 second timeout
      });
      
      console.log(`${endpoint.name} response: ${response.status} ${response.statusText}`);
      
      if (response.ok || response.status === 403) {
        console.log(`✅ Successfully connected to ${endpoint.name}\n`);
      } else {
        console.log(`❌ Could not connect to ${endpoint.name} (Status: ${response.status})\n`);
      }
    } catch (error) {
      console.error(`❌ Error connecting to ${endpoint.name}:`, error.message);
      console.log('');
    }
  }
  
  console.log('\n✅ General connectivity check completed');
}

checkGeneralConnectivity();
