// Test script for Gaia rewrite endpoint
import fetch from 'node-fetch';

// Set environment variable for testing
process.env.PERPLEXITY_API_KEY = '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';

async function testGaiaRewriteEndpoint() {
  console.log('Testing Gaia rewrite endpoint...');
  
  // Sample content to rewrite
  const sampleContent = JSON.stringify({
    title: "Reducing Plastic Waste",
    summary: "Plastic waste is a major environmental problem. This guide provides practical steps to reduce plastic waste in daily life.",
    details: "Plastic pollution affects wildlife, ecosystems, and human health. By reducing plastic consumption and properly disposing of plastic waste, individuals can make a significant impact.",
    actionableSteps: [
      "Use reusable shopping bags",
      "Avoid single-use plastics",
      "Buy in bulk to reduce packaging"
    ],
    resources: [
      "Earth Day Network (https://www.earthday.org)",
      "Plastic Pollution Coalition (https://www.plasticpollutioncoalition.org)"
    ]
  });
  
  try {
    console.log('Sending content to Gaia rewrite endpoint...');
    
    // Test the Gaia rewrite endpoint locally
    const response = await fetch('http://localhost:3000/api/perplexity/gaia-rewrite', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: sampleContent
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Gaia Rewrite Error (${response.status}):`, errorText);
      return;
    }
    
    const data = await response.json();
    console.log('Gaia Rewrite Response:');
    
    if (data.content) {
      console.log('\nRewritten Content:');
      try {
        const parsedContent = JSON.parse(data.content);
        console.log(JSON.stringify(parsedContent, null, 2));
      } catch (e) {
        console.log(data.content);
      }
    } else if (data.error) {
      console.log('\nError:', data.error);
    } else {
      console.log(JSON.stringify(data, null, 2));
    }
    
    console.log('\nGaia rewrite test completed!');
  } catch (error) {
    console.error('Error testing Gaia rewrite endpoint:', error);
  }
}

testGaiaRewriteEndpoint();
