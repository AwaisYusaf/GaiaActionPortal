// Simple test script to check if the Perplexity API is working through our application
import fetch from 'node-fetch';

async function testPerplexityAPI() {
  try {
    console.log('Testing Perplexity API through our application...');
    
    const response = await fetch('http://localhost:3001/api/perplexity', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: 'What are the effects of deforestation on local ecosystems?',
        followUpQuestions: []
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error:', response.status, errorText);
      return;
    }
    
    const data = await response.json();
    
    console.log('API Response Status: Success');
    console.log('Model Used:', data.model);
    console.log('Response ID:', data.id);
    console.log('Token Usage:', data.usage);
    console.log('Number of Citations:', data.citations ? data.citations.length : 0);
    
    // Show a snippet of the response content
    if (data.choices && data.choices[0] && data.choices[0].message) {
      const content = data.choices[0].message.content;
      console.log('\nResponse Preview (first 200 chars):');
      console.log(content.substring(0, 200) + '...');
    }
    
    console.log('\nAPI integration is working correctly!');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testPerplexityAPI();
