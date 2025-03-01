// Test script for error handling in Perplexity API and Gaia rewrite functionality
import fetch from 'node-fetch';

async function testPerplexityAPITimeout() {
  console.log('Testing Perplexity API timeout handling...');
  
  try {
    // Use a non-existent API endpoint to simulate a timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 100); // Abort after 100ms
    
    const response = await fetch('http://localhost:3000/api/perplexity', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: 'What is climate change?',
        _simulateTimeout: true // This is a special flag we can check for in our API route
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    const data = await response.json();
    console.log('Perplexity API Timeout Test Response:');
    console.log(JSON.stringify(data, null, 2));
    
    // Check if the response contains error information
    if (data.error) {
      console.log('✅ Perplexity API timeout test passed! Error detected:', data.error);
    } else {
      console.log('❌ Perplexity API timeout test failed: No error detected');
    }
  } catch (error) {
    console.log('✅ Perplexity API timeout test passed! Error caught:', error.name);
  }
}

async function testGaiaRewriteInvalidJSON() {
  console.log('\nTesting Gaia Rewrite API with invalid JSON...');
  
  try {
    // Send invalid JSON to the Gaia rewrite endpoint
    const response = await fetch('http://localhost:3000/api/perplexity/gaia-rewrite', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: '{"title": "This is incomplete JSON, "summary": "Missing quotes and brackets'
      })
    });
    
    const data = await response.json();
    console.log('Gaia Rewrite Invalid JSON Test Response:');
    console.log(JSON.stringify(data, null, 2));
    
    // Check if the response contains error information but still returns content
    if (data.error && data.content) {
      console.log('✅ Gaia Rewrite invalid JSON test passed! Error detected but content returned:', data.error);
    } else if (data.error) {
      console.log('✅ Gaia Rewrite invalid JSON test partially passed! Error detected:', data.error);
    } else {
      console.log('❌ Gaia Rewrite invalid JSON test failed: No error detected');
    }
  } catch (error) {
    console.error('Error testing Gaia Rewrite with invalid JSON:', error);
  }
}

async function testMalformedRequest() {
  console.log('\nTesting API with malformed request...');
  
  try {
    // Send a malformed request to the Perplexity API
    const response = await fetch('http://localhost:3000/api/perplexity', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      // Missing the required 'query' field
      body: JSON.stringify({
        not_query: 'This is missing the required query field'
      })
    });
    
    const data = await response.json();
    console.log('Malformed Request Test Response:');
    console.log(JSON.stringify(data, null, 2));
    
    // Check if the response contains error information
    if (data.error) {
      console.log('✅ Malformed request test passed! Error detected:', data.error);
    } else {
      console.log('❌ Malformed request test failed: No error detected');
    }
  } catch (error) {
    console.error('Error testing malformed request:', error);
  }
}

async function runTests() {
  // Start the tests
  await testPerplexityAPITimeout();
  await testGaiaRewriteInvalidJSON();
  await testMalformedRequest();
  
  console.log('\nAll error handling tests completed!');
}

runTests();
