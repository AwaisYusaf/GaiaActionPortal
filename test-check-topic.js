// Test script for check-topic endpoint
import fetch from 'node-fetch';

// DO NOT set API keys in code - use environment variables
// process.env.PERPLEXITY_API_KEY should be set before running this script

async function testCheckTopicEndpoint() {
  console.log('Testing check-topic endpoint...');
  
  // Check if API key is set
  if (!process.env.PERPLEXITY_API_KEY) {
    console.error('Error: PERPLEXITY_API_KEY environment variable is not set');
    console.log('Please set the PERPLEXITY_API_KEY environment variable and try again');
    return;
  }
  
  // Test queries - one environmental, one not
  const queries = [
    "How can I reduce my carbon footprint?",
    "What is the capital of France?"
  ];
  
  for (const query of queries) {
    try {
      console.log(`\nSending query: "${query}"`);
      
      // Test the check-topic endpoint locally
      const response = await fetch('http://localhost:3000/api/perplexity/check-topic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Check Topic Error (${response.status}):`, errorText);
        continue;
      }
      
      const data = await response.json();
      console.log('Check Topic Response:');
      console.log(JSON.stringify(data, null, 2));
      
      console.log(`Is environmental topic: ${data.isEnvironmentalTopic ? 'Yes' : 'No'}`);
    } catch (error) {
      console.error('Error testing check-topic endpoint:', error);
    }
  }
  
  console.log('\nCheck-topic test completed!');
}

testCheckTopicEndpoint();
