// Test script that mimics the production API route
import fetch from 'node-fetch';
import { config } from 'dotenv';
import { exit } from 'process';

// Load environment variables from .env.local
config({ path: '.env.local' });

async function testProductionCode() {
  console.log('🔍 Testing with production-like code...\n');
  
  try {
    // Use environment variable for API key
    const apiKey = process.env.PERPLEXITY_API_KEY;
    
    if (!apiKey) {
      console.error('❌ ERROR: No Perplexity API key found in environment variables');
      exit(1);
    }
    
    // Mask the API key for security
    const maskedKey = apiKey.substring(0, 4) + '...' + apiKey.substring(apiKey.length - 4);
    console.log(`Using API key: ${maskedKey}`);
    
    // Construct a simple query
    const query = "What are 3 simple ways to reduce plastic waste?";
    console.log(`Query: "${query}"`);
    
    // Prepare the request body exactly as in production
    const requestBody = {
      model: 'sonar-deep-research',  // Using the original model that works
      messages: [
        {
          role: 'system',
          content: `You are an environmental research assistant focused on providing actionable insights and solutions to environmental problems. Your responses should be comprehensive, well-researched, and include specific actions that can be taken to address the issue.

IMPORTANT: Unless the query specifies otherwise, please optimize your responses to help individuals and small groups of people understand what they can do to make things better for our planet. Unless you are prompted otherwise, don't tell us the steps that the government or large organizations can take; rather focus on what the individual or small groups can do to impact positive change (which can include lobbying the government, big organizations, raising awareness, etc).

Format your response as a valid JSON object with the following structure:
{
  "title": "A clear title summarizing the environmental question",
  "summary": "A brief summary of the answer (1-2 paragraphs)",
  "details": "Detailed information about the environmental topic",
  "actionableSteps": ["Step 1", "Step 2", "..."],
  "resources": ["Resource 1 with URL (https://example.com)", "Resource 2 with URL (https://example.com)", "..."]
}

CRITICAL INSTRUCTIONS:
1. DO NOT include any thinking, reasoning, or planning sections in your response
2. DO NOT include any <think> tags or similar markers
3. DO NOT include any text outside of the JSON object
4. Your entire response must be a valid JSON object that can be parsed with JSON.parse()
5. DO NOT include markdown code blocks or any other formatting - just the raw JSON object
6. For the resources array, always include URLs in parentheses after the resource name when available`
        },
        {
          role: 'user',
          content: query
        }
      ],
      max_tokens: 2000
    };
    
    console.log('Sending request to Perplexity API...');
    
    // Call the Perplexity API with the exact same code as production
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });
    
    console.log(`Response status: ${response.status} ${response.statusText}`);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error details:', errorText);
      exit(1);
    }
    
    const data = await response.json();
    console.log('API Response received successfully!');
    
    if (data.choices && data.choices[0] && data.choices[0].message) {
      console.log('\nContent preview:');
      console.log(data.choices[0].message.content.substring(0, 200) + '...');
      
      // Try to parse the content as JSON
      try {
        const content = data.choices[0].message.content;
        
        // Remove any thinking sections if they exist
        let cleanedContent = content;
        if (content.includes('<think>') && content.includes('</think>')) {
          cleanedContent = content.replace(/<think>[\s\S]*?<\/think>/g, '');
          console.log('Content after removing thinking sections:', cleanedContent.substring(0, 100) + '...');
        }
        
        // Remove markdown code blocks if they exist
        if (cleanedContent.includes('```json')) {
          cleanedContent = cleanedContent.replace(/```json\n|\n```/g, '');
          console.log('Content after removing markdown code blocks:', cleanedContent.substring(0, 100) + '...');
        }
        
        // Try to parse the JSON
        const parsedContent = JSON.parse(cleanedContent);
        console.log('Successfully parsed content as JSON');
        console.log('Parsed content preview:', JSON.stringify(parsedContent).substring(0, 200) + '...');
      } catch (parseError) {
        console.error('Error parsing content as JSON:', parseError);
      }
    } else {
      console.error('Unexpected API response structure:', JSON.stringify(data).substring(0, 500));
    }
    
    console.log('\n✅ Test completed successfully!');
  } catch (error) {
    console.error('❌ Error during test:', error);
    exit(1);
  }
}

testProductionCode();
