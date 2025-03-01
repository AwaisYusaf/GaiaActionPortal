import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    
    const apiKey = process.env.PERPLEXITY_API_KEY;
    
    if (!apiKey) {
      console.error('No Perplexity API key found in environment variables');
      // For topic check, we'll fail open and assume it's an environmental topic
      return NextResponse.json({ isEnvironmentalTopic: true });
    }
    
    console.log('Sending topic check request to Perplexity API with query:', query);
    
    // Use the cheaper sonar model for the topic check
    const requestBody = {
      model: 'sonar',
      messages: [
        {
          role: 'system',
          content: `You are a classifier that determines if a query is related to environmental topics.
          
Your task is to determine if the user's question is related to any of the following topics:
- The environment
- Sustainability
- Climate
- The planet
- Regeneration
- Permaculture
- Improving humanity's relationship with the planet
- Environmental action
- Conservation
- Ecological systems
- Biodiversity
- Pollution
- Renewable energy
- Green living
- Eco-friendly practices

Respond with ONLY a JSON object with a single field "isEnvironmentalTopic" that is true if the query is related to any of these topics, and false otherwise.

Example response:
{
  "isEnvironmentalTopic": true
}

CRITICAL INSTRUCTIONS:
1. DO NOT include any thinking, reasoning, or planning sections in your response
2. DO NOT include any <think> tags or similar markers
3. DO NOT include any text outside of the JSON object
4. Your entire response must be a valid JSON object that can be parsed with JSON.parse()
5. DO NOT include markdown code blocks or any other formatting - just the raw JSON object`
        },
        {
          role: 'user',
          content: query
        }
      ],
      max_tokens: 100 // Small token limit since we only need a simple yes/no response
    };
    
    console.log('Topic check request body:', JSON.stringify(requestBody));
    
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
      console.error('Perplexity API error:', response.status, errorText);
      return NextResponse.json(
        { error: 'Error from Perplexity API', message: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Topic check API response:', JSON.stringify(data, null, 2));
    
    // Parse the response to get the classification result
    let isEnvironmentalTopic = false;
    
    if (data.choices && data.choices[0] && data.choices[0].message) {
      try {
        const content = data.choices[0].message.content;
        console.log('Raw content from API:', content);
        
        // Remove thinking sections if they exist
        let cleanedContent = content;
        if (content.includes('<think>') && content.includes('</think>')) {
          cleanedContent = content.replace(/<think>[\s\S]*?<\/think>/g, '');
          console.log('Content after removing thinking sections:', cleanedContent);
        }
        
        // Remove markdown code blocks if they exist
        if (cleanedContent.includes('```json')) {
          cleanedContent = cleanedContent.replace(/```json\n|\n```/g, '');
          console.log('Content after removing code blocks:', cleanedContent);
        }
        
        // Extract JSON object if it's embedded in text
        const jsonStartIndex = cleanedContent.indexOf('{');
        const jsonEndIndex = cleanedContent.lastIndexOf('}') + 1;
        
        if (jsonStartIndex !== -1 && jsonEndIndex !== -1) {
          cleanedContent = cleanedContent.substring(jsonStartIndex, jsonEndIndex);
          console.log('Extracted JSON content:', cleanedContent);
        }
        
        cleanedContent = cleanedContent.trim();
        
        // Try multiple parsing approaches
        try {
          // First try direct parsing
          const parsedContent = JSON.parse(cleanedContent);
          isEnvironmentalTopic = parsedContent.isEnvironmentalTopic === true;
          console.log('Successfully parsed JSON, isEnvironmentalTopic:', isEnvironmentalTopic);
        } catch (parseError) {
          console.error('Initial JSON parse failed:', parseError);
          
          // If that fails, try a more aggressive approach to find valid JSON
          const possibleJsonMatch = cleanedContent.match(/{[\s\S]*?}/);
          if (possibleJsonMatch && possibleJsonMatch[0]) {
            try {
              const extractedJson = possibleJsonMatch[0];
              console.log('Attempting to parse extracted JSON:', extractedJson);
              const parsedJson = JSON.parse(extractedJson);
              isEnvironmentalTopic = parsedJson.isEnvironmentalTopic === true;
              console.log('Successfully parsed extracted JSON, isEnvironmentalTopic:', isEnvironmentalTopic);
            } catch (e) {
              console.error('Failed to parse extracted JSON:', e);
              // As a fallback, check if the content contains "true" related to environmental topics
              isEnvironmentalTopic = cleanedContent.toLowerCase().includes('"isenvironmentaltopic": true') || 
                                    cleanedContent.toLowerCase().includes('"isenvironmentaltopic":true');
              console.log('Using string matching fallback, isEnvironmentalTopic:', isEnvironmentalTopic);
            }
          } else {
            // If no JSON-like structure found, default to true to be safe
            console.log('No JSON-like structure found, defaulting to true');
            isEnvironmentalTopic = true;
          }
        }
      } catch (e) {
        console.error('Failed to process topic check response:', e);
        // Default to true if parsing fails, to err on the side of caution
        isEnvironmentalTopic = true;
      }
    } else {
      console.error('Unexpected API response structure:', data);
      // Default to true if response structure is unexpected
      isEnvironmentalTopic = true;
    }
    
    console.log('Final determination - isEnvironmentalTopic:', isEnvironmentalTopic);
    return NextResponse.json({ isEnvironmentalTopic });
  } catch (error) {
    console.error('Error processing topic check request:', error);
    // Default to true if there's an error, to err on the side of caution
    return NextResponse.json({ isEnvironmentalTopic: true });
  }
}
