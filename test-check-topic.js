// Test script for check-topic endpoint
import fetch from 'node-fetch';

// Set environment variable for testing
process.env.PERPLEXITY_API_KEY = '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';

async function testCheckTopicEndpoint() {
  console.log('Testing check-topic endpoint...');
  
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
