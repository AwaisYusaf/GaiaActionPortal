// Test script for Perplexity API and Gaia rewrite functionality
import fetch from 'node-fetch';

async function testPerplexityAPI() {
  console.log('Testing Perplexity API...');
  
  try {
    const response = await fetch('http://localhost:3000/api/perplexity', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: 'What are 3 simple ways to reduce plastic waste?'
      })
    });
    
    if (!response.ok) {
      console.error(`Error: ${response.status}`);
      const errorText = await response.text();
      console.error('Error response:', errorText);
      return;
    }
    
    const data = await response.json();
    console.log('Perplexity API Response:');
    console.log(JSON.stringify(data, null, 2).substring(0, 500) + '...');
    
    // Check if the response contains the expected structure
    if (data.choices && data.choices[0] && data.choices[0].message) {
      console.log(' Perplexity API test passed!');
      
      // Check if parsedContent exists
      if (data.choices[0].message.parsedContent) {
        console.log(' Parsed content available');
        console.log('Title:', data.choices[0].message.parsedContent.title);
      } else {
        console.log(' No parsed content available');
      }
    } else {
      console.log(' Perplexity API test failed: Unexpected response structure');
    }
  } catch (error) {
    console.error('Error testing Perplexity API:', error);
  }
}

async function testGaiaRewrite() {
  console.log('\nTesting Gaia Rewrite API...');
  
  const testContent = JSON.stringify({
    title: "Reducing Plastic Waste",
    summary: "Simple ways to reduce plastic waste in daily life.",
    details: "Plastic pollution is a major environmental issue affecting oceans and wildlife.",
    actionableSteps: [
      "Use reusable shopping bags",
      "Avoid single-use plastics",
      "Buy products with minimal packaging"
    ],
    resources: [
      { title: "Plastic Pollution Coalition", url: "https://www.plasticpollutioncoalition.org/" }
    ]
  });
  
  try {
    const response = await fetch('http://localhost:3000/api/perplexity/gaia-rewrite', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: testContent
      })
    });
    
    if (!response.ok) {
      console.error(`Error: ${response.status}`);
      const errorText = await response.text();
      console.error('Error response:', errorText);
      return;
    }
    
    const data = await response.json();
    console.log('Gaia Rewrite API Response:');
    console.log(JSON.stringify(data, null, 2).substring(0, 500) + '...');
    
    // Check if the response contains content
    if (data.content) {
      console.log(' Gaia Rewrite API test passed!');
      
      // Try to parse the content as JSON
      try {
        const parsedContent = JSON.parse(data.content);
        console.log(' Content is valid JSON');
        console.log('Title:', parsedContent.title);
      } catch (e) {
        console.log(' Content is not valid JSON:', e.message);
      }
    } else {
      console.log(' Gaia Rewrite API test failed: No content in response');
    }
  } catch (error) {
    console.error('Error testing Gaia Rewrite API:', error);
  }
}

async function runTests() {
  console.log('=== API Testing Suite ===');
  await testPerplexityAPI();
  await testGaiaRewrite();
  console.log('\n=== Testing Complete ===');
}

runTests();
