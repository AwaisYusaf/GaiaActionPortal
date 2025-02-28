import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { query, followUpQuestions } = await req.json();
    
    const apiKey = process.env.PERPLEXITY_API_KEY || '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';
    
    // Construct the prompt with follow-up questions if available
    let fullQuery = query;
    if (followUpQuestions && followUpQuestions.length > 0) {
      fullQuery += "\n\nAdditional context:\n" + followUpQuestions.join("\n");
    }
    
    console.log('Sending request to Perplexity API with query:', query);
    
    // Use a supported model from Perplexity API documentation
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
          content: fullQuery
        }
      ],
      max_tokens: 2000
    };
    
    console.log('Request body:', JSON.stringify(requestBody));
    
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
      
      try {
        const errorData = JSON.parse(errorText);
        console.error('Parsed error data:', errorData);
        return NextResponse.json(
          { error: 'Error from Perplexity API', details: errorData },
          { status: response.status }
        );
      } catch (e) {
        console.error('Could not parse error response as JSON:', e);
        return NextResponse.json(
          { error: 'Error from Perplexity API', message: errorText },
          { status: response.status }
        );
      }
    }

    const data = await response.json();
    console.log('Raw API response:', JSON.stringify(data, null, 2));
    
    // Check if the response contains the expected structure
    if (data.choices && data.choices[0] && data.choices[0].message) {
      console.log('Message content:', data.choices[0].message.content);
      
      // Try to parse the content as JSON
      try {
        const content = data.choices[0].message.content;
        console.log('Raw content length:', content.length);
        
        // Remove any thinking sections if they exist
        let cleanedContent = content;
        if (content.includes('<think>') && content.includes('</think>')) {
          cleanedContent = content.replace(/<think>[\s\S]*?<\/think>/g, '');
          console.log('Content after removing thinking sections:', cleanedContent.substring(0, 100) + '...');
        }
        
        // Remove markdown code blocks if they exist
        if (cleanedContent.includes('```json')) {
          cleanedContent = cleanedContent.replace(/```json\n|\n```/g, '');
          console.log('Content after removing code blocks:', cleanedContent.substring(0, 100) + '...');
        }
        
        // Remove any other non-JSON text
        const jsonStartIndex = cleanedContent.indexOf('{');
        const jsonEndIndex = cleanedContent.lastIndexOf('}') + 1;
        
        if (jsonStartIndex !== -1 && jsonEndIndex !== -1) {
          cleanedContent = cleanedContent.substring(jsonStartIndex, jsonEndIndex);
          console.log('Extracted JSON content length:', cleanedContent.length);
        }
        
        cleanedContent = cleanedContent.trim();
        
        // Try multiple parsing approaches
        try {
          // First try direct parsing
          const parsedContent = JSON.parse(cleanedContent);
          console.log('Successfully parsed JSON');
          
          // Replace the content with the parsed JSON
          data.choices[0].message.parsedContent = parsedContent;
          
          // Also replace the original content with the cleaned content
          data.choices[0].message.content = cleanedContent;
        } catch (parseError) {
          console.error('Initial JSON parse failed:', parseError);
          
          // If that fails, try a more aggressive approach to find valid JSON
          const possibleJsonMatch = cleanedContent.match(/{[\s\S]*}/);
          if (possibleJsonMatch && possibleJsonMatch[0]) {
            try {
              const extractedJson = possibleJsonMatch[0];
              console.log('Attempting to parse extracted JSON length:', extractedJson.length);
              const parsedJson = JSON.parse(extractedJson);
              console.log('Successfully parsed extracted JSON');
              
              // Replace the content with the parsed JSON
              data.choices[0].message.parsedContent = parsedJson;
              
              // Also replace the original content with the cleaned content
              data.choices[0].message.content = extractedJson;
            } catch (e) {
              console.error('Failed to parse extracted JSON:', e);
              return NextResponse.json(
                { error: 'Failed to parse the response from the API', message: 'The API returned invalid JSON' },
                { status: 500 }
              );
            }
          } else {
            console.error('No JSON-like structure found in the response');
            return NextResponse.json(
              { error: 'Failed to parse the response from the API', message: 'The API response did not contain valid JSON' },
              { status: 500 }
            );
          }
        }
        
        // Now that we have valid JSON content, send it to the Gaia rewrite endpoint
        try {
          console.log('Sending content to Gaia rewrite endpoint');
          
          // Use the full URL for the API endpoint
          const host = req.headers.get('host') || 'localhost:3006';
          const protocol = host.includes('localhost') ? 'http' : 'https';
          const rewriteUrl = `${protocol}://${host}/api/perplexity/gaia-rewrite`;
          
          console.log(`Using rewrite URL: ${rewriteUrl}`);
          
          const rewriteResponse = await fetch(rewriteUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              content: data.choices[0].message.content
            })
          });
          
          if (rewriteResponse.ok) {
            const rewriteData = await rewriteResponse.json();
            
            if (rewriteData.content) {
              console.log('Successfully received rewritten content');
              
              try {
                // Parse the rewritten content
                const rewrittenParsedContent = JSON.parse(rewriteData.content);
                
                // Update the response with the rewritten content
                data.choices[0].message.content = rewriteData.content;
                data.choices[0].message.parsedContent = rewrittenParsedContent;
                
                console.log('Updated response with rewritten content');
              } catch (parseError) {
                console.error('Error parsing rewritten content:', parseError);
                // Keep the original content if there's an error parsing the rewritten content
              }
            }
          } else {
            console.error('Error from Gaia rewrite endpoint:', rewriteResponse.status);
            // Continue with the original content if there's an error from the rewrite endpoint
          }
        } catch (rewriteError) {
          console.error('Error calling Gaia rewrite endpoint:', rewriteError);
          // Continue with the original content if there's an error calling the rewrite endpoint
        }
      } catch (e) {
        console.error('Failed to process API response:', e);
        return NextResponse.json(
          { error: 'Failed to process the API response', message: e instanceof Error ? e.message : 'Unknown error' },
          { status: 500 }
        );
      }
    } else {
      console.error('Unexpected API response structure:', data);
      return NextResponse.json(
        { error: 'Unexpected API response structure', message: 'The API response did not contain the expected data structure' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
