// Test script for our Perplexity API route
import fetch from 'node-fetch';

// DO NOT set API keys in code - use environment variables
// process.env.PERPLEXITY_API_KEY should be set before running this script

async function testPerplexityAPIRoute() {
  console.log('Testing our Perplexity API route...');
  
  // Check if API key is set
  if (!process.env.PERPLEXITY_API_KEY) {
    console.error('Error: PERPLEXITY_API_KEY environment variable is not set');
    console.log('Please set the PERPLEXITY_API_KEY environment variable and try again');
    return;
  }
  
  const query = "How can I reduce plastic waste in my daily life?";
  
  try {
    console.log(`Sending query: "${query}"`);
    
    // Test the API route locally
    const response = await fetch('http://localhost:3000/api/perplexity', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query,
        followUpQuestions: []
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Route Error (${response.status}):`, errorText);
      return;
    }
    
    const data = await response.json();
    console.log('API Route Response:');
    
    if (data.choices && data.choices[0] && data.choices[0].message) {
      if (data.choices[0].message.parsedContent) {
        console.log('\nParsed Content:');
        console.log(JSON.stringify(data.choices[0].message.parsedContent, null, 2));
      } else {
        console.log('\nRaw Content:');
        console.log(data.choices[0].message.content);
      }
    } else {
      console.log(JSON.stringify(data, null, 2));
    }
    
    console.log('\nAPI route test completed!');
  } catch (error) {
    console.error('Error testing API route:', error);
  }
}

testPerplexityAPIRoute();
