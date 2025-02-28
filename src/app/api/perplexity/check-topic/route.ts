import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    
    const apiKey = process.env.PERPLEXITY_API_KEY || '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';
    
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

Respond with a JSON object with a single field "isEnvironmentalTopic" that is true if the query is related to any of these topics, and false otherwise.

Example response:
{
  "isEnvironmentalTopic": true
}

Do not include any explanation or additional text in your response. Only return the JSON object.`
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
        
        // Clean up the content to extract JSON
        let cleanedContent = content;
        
        // Remove markdown code blocks if they exist
        if (cleanedContent.includes('```json')) {
          cleanedContent = cleanedContent.replace(/```json\n|\n```/g, '');
        }
        
        // Extract JSON object if it's embedded in text
        const jsonStartIndex = cleanedContent.indexOf('{');
        const jsonEndIndex = cleanedContent.lastIndexOf('}') + 1;
        
        if (jsonStartIndex !== -1 && jsonEndIndex !== -1) {
          cleanedContent = cleanedContent.substring(jsonStartIndex, jsonEndIndex);
        }
        
        cleanedContent = cleanedContent.trim();
        
        // Parse the JSON to get the classification
        const parsedContent = JSON.parse(cleanedContent);
        isEnvironmentalTopic = parsedContent.isEnvironmentalTopic === true;
        
      } catch (e) {
        console.error('Failed to parse topic check response:', e);
        // Default to true if parsing fails, to err on the side of caution
        isEnvironmentalTopic = true;
      }
    }
    
    return NextResponse.json({ isEnvironmentalTopic });
  } catch (error) {
    console.error('Error processing topic check request:', error);
    // Default to true if there's an error, to err on the side of caution
    return NextResponse.json({ isEnvironmentalTopic: true });
  }
}
