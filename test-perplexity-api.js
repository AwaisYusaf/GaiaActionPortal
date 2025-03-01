// Test script for Perplexity API
import fetch from 'node-fetch';

async function testPerplexityAPI() {
  console.log('Testing Perplexity API...');
  
  const apiKey = process.env.PERPLEXITY_API_KEY || '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';
  
  const requestBody = {
    model: 'sonar',  // Updated to use a valid model
    messages: [
      {
        role: 'system',
        content: 'You are a helpful assistant that provides concise responses.'
      },
      {
        role: 'user',
        content: 'What are 3 simple actions to reduce plastic waste?'
      }
    ],
    max_tokens: 500
  };
  
  try {
    console.log('Sending request to Perplexity API...');
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
      console.error(`API Error (${response.status}):`, errorText);
      return;
    }
    
    const data = await response.json();
    console.log('API Response:');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.choices && data.choices[0] && data.choices[0].message) {
      console.log('\nContent:');
      console.log(data.choices[0].message.content);
    }
    
    console.log('\nAPI test completed successfully!');
  } catch (error) {
    console.error('Error testing API:', error);
  }
}

testPerplexityAPI();
