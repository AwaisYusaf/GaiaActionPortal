import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    console.log('Perplexity API route called');
    
    const { query, followUpQuestions, _simulateTimeout } = await req.json();
    
    // For testing: simulate a timeout if the special flag is set
    if (_simulateTimeout) {
      console.log('Simulating a timeout for testing purposes');
      const error = new Error('AbortError');
      error.name = 'AbortError';
      throw error;
    }
    
    if (!query) {
      return NextResponse.json({ error: 'Missing query parameter' }, { status: 400 });
    }
    
    // Use environment variable for API key
    const apiKey = process.env.PERPLEXITY_API_KEY;
    
    if (!apiKey) {
      console.error('No Perplexity API key found in environment variables');
      return NextResponse.json({ 
        error: 'API key not configured',
        details: 'The PERPLEXITY_API_KEY environment variable is not set in the server environment.'
      }, { status: 500 });
    }
    
    // Log masked API key for debugging
    const maskedKey = apiKey.substring(0, 4) + '...' + apiKey.substring(apiKey.length - 4);
    console.log(`Using API key: ${maskedKey} (length: ${apiKey.length})`);
    
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
    
    console.log('Request body prepared');
    
    // Create an AbortController for the fetch request
    const controller = new AbortController();
    // Set a timeout of 90 seconds (increased from 60 seconds)
    const timeoutId = setTimeout(() => controller.abort(), 90000);
    
    // Implement retry logic
    const maxRetries = 3;
    let retryCount = 0;
    let lastError = null;
    
    while (retryCount < maxRetries) {
      try {
        console.log(`API request attempt ${retryCount + 1} of ${maxRetries}`);
        
        // Call the Perplexity API
        const response = await fetch('https://api.perplexity.ai/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal
        });
        
        // Clear the timeout
        clearTimeout(timeoutId);
        
        console.log('Perplexity API response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Perplexity API error:', response.status, errorText);
          
          // If we get a 401 Unauthorized error, don't retry as it's likely an API key issue
          if (response.status === 401) {
            console.error('API key authentication failed. Please check your API key.');
            return NextResponse.json({ 
              error: 'API key authentication failed',
              errorDetails: 'The Perplexity API key was rejected. Please check that your API key is valid and has not expired.',
              choices: [{
                message: {
                  content: JSON.stringify({
                    title: "API Authentication Error",
                    summary: "We encountered an authentication issue while trying to research your query.",
                    details: "The API key used to access the research service is invalid or has expired. This requires administrative attention.",
                    actionableSteps: [
                      "Try again later after the API key has been updated",
                      "Contact the site administrator about this issue"
                    ],
                    resources: []
                  }),
                  parsedContent: {
                    title: "API Authentication Error",
                    summary: "We encountered an authentication issue while trying to research your query.",
                    details: "The API key used to access the research service is invalid or has expired. This requires administrative attention.",
                    actionableSteps: [
                      "Try again later after the API key has been updated",
                      "Contact the site administrator about this issue"
                    ],
                    resources: []
                  }
                }
              }]
            }, { status: 500 });
          }
          
          // For network-related errors, retry
          if (response.status >= 500 || response.status === 429) {
            lastError = new Error(`API error: ${response.status} ${errorText}`);
            retryCount++;
            if (retryCount < maxRetries) {
              console.log(`Retrying in ${retryCount * 2} seconds...`);
              await new Promise(resolve => setTimeout(resolve, retryCount * 2000));
              continue;
            }
          }
          
          // Return a structured error response with a fallback JSON
          return NextResponse.json({ 
            error: `Perplexity API error: ${response.status}`,
            errorDetails: errorText.substring(0, 500),
            choices: [{
              message: {
                content: JSON.stringify({
                  title: "Error Connecting to Research Service",
                  summary: "We encountered an issue while trying to research your query.",
                  details: "The research service is currently unavailable. This could be due to high demand or temporary service disruption.",
                  actionableSteps: [
                    "Try again in a few minutes",
                    "Refresh the page and submit your query again",
                    "Try a different, more specific query"
                  ],
                  resources: []
                }),
                parsedContent: {
                  title: "Error Connecting to Research Service",
                  summary: "We encountered an issue while trying to research your query.",
                  details: "The research service is currently unavailable. This could be due to high demand or temporary service disruption.",
                  actionableSteps: [
                    "Try again in a few minutes",
                    "Refresh the page and submit your query again",
                    "Try a different, more specific query"
                  ],
                  resources: []
                }
              }
            }]
          }, { status: 500 });
        }

        console.log('Parsing Perplexity API response');
        const data = await response.json();
        console.log('Successfully parsed API response');
        
        // Check if the response contains the expected structure
        if (data.choices && data.choices[0] && data.choices[0].message) {
          console.log('Response has expected structure');
          
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
              console.log('Content after removing markdown code blocks:', cleanedContent.substring(0, 100) + '...');
            }
            
            // Try to parse the JSON
            let parsedContent;
            try {
              parsedContent = JSON.parse(cleanedContent);
              console.log('Successfully parsed content as JSON');
            } catch (jsonError) {
              console.error('Error parsing content as JSON:', jsonError);
              
              // Try to extract JSON from the content using regex
              const jsonMatch = cleanedContent.match(/(\{[\s\S]*\})/);
              if (jsonMatch && jsonMatch[1]) {
                try {
                  parsedContent = JSON.parse(jsonMatch[1]);
                  console.log('Successfully extracted and parsed JSON using regex');
                } catch (extractError) {
                  console.error('Error parsing extracted JSON:', extractError);
                  throw new Error('Failed to parse content as JSON');
                }
              } else {
                throw new Error('No valid JSON found in content');
              }
            }
            
            // Add the parsed content to the response
            data.choices[0].message.parsedContent = parsedContent;
            
            console.log('Returning successful response with parsed content');
            return NextResponse.json(data);
          } catch (parseError) {
            console.error('Error processing content:', parseError);
            
            // Return the raw response if we can't parse it
            console.log('Returning raw response without parsed content');
            return NextResponse.json(data);
          }
        } else {
          console.error('Unexpected API response structure:', JSON.stringify(data).substring(0, 500));
          
          // Return a structured error response
          return NextResponse.json({ 
            error: 'Unexpected API response structure',
            data: data,
            choices: [{
              message: {
                content: JSON.stringify({
                  title: "Unexpected Response Format",
                  summary: "We received an unexpected response format from the research service.",
                  details: "The research service returned data in a format that we couldn't process. This is likely a temporary issue.",
                  actionableSteps: [
                    "Try again in a few minutes",
                    "Refresh the page and submit your query again",
                    "Try a different, more specific query"
                  ],
                  resources: []
                }),
                parsedContent: {
                  title: "Unexpected Response Format",
                  summary: "We received an unexpected response format from the research service.",
                  details: "The research service returned data in a format that we couldn't process. This is likely a temporary issue.",
                  actionableSteps: [
                    "Try again in a few minutes",
                    "Refresh the page and submit your query again",
                    "Try a different, more specific query"
                  ],
                  resources: []
                }
              }
            }]
          }, { status: 500 });
        }
      } catch (error) {
        console.error('Error during API request:', error);
        
        // Store the error for potential retry
        lastError = error;
        
        // If it's an abort error (timeout), don't retry
        if (error instanceof Error && error.name === 'AbortError') {
          console.error('Request timed out');
          clearTimeout(timeoutId);
          
          return NextResponse.json({ 
            error: 'Request timed out',
            errorDetails: 'The request to the Perplexity API timed out after 90 seconds.',
            choices: [{
              message: {
                content: JSON.stringify({
                  title: "Research Request Timed Out",
                  summary: "Your research query took too long to process and timed out.",
                  details: "This can happen with complex queries or during periods of high demand. The research service was unable to complete your request within the allocated time.",
                  actionableSteps: [
                    "Try a simpler, more focused query",
                    "Break your question into smaller, more specific questions",
                    "Try again during a less busy time"
                  ],
                  resources: []
                }),
                parsedContent: {
                  title: "Research Request Timed Out",
                  summary: "Your research query took too long to process and timed out.",
                  details: "This can happen with complex queries or during periods of high demand. The research service was unable to complete your request within the allocated time.",
                  actionableSteps: [
                    "Try a simpler, more focused query",
                    "Break your question into smaller, more specific questions",
                    "Try again during a less busy time"
                  ],
                  resources: []
                }
              }
            }]
          }, { status: 504 });
        }
        
        // For network-related errors, retry
        retryCount++;
        if (retryCount < maxRetries) {
          console.log(`Retrying in ${retryCount * 2} seconds...`);
          await new Promise(resolve => setTimeout(resolve, retryCount * 2000));
          continue;
        }
      }
    }
    
    // If we've exhausted all retries, return an error
    console.error('All retry attempts failed');
    return NextResponse.json({ 
      error: 'All API request attempts failed',
      errorDetails: lastError instanceof Error ? lastError.message : 'Unknown error',
      choices: [{
        message: {
          content: JSON.stringify({
            title: "Unable to Complete Research",
            summary: "We were unable to complete your research query after multiple attempts.",
            details: "The research service is experiencing persistent issues. This could be due to network problems, service outages, or high demand.",
            actionableSteps: [
              "Try again later when the service may be less busy",
              "Check your internet connection",
              "Try a different, simpler query"
            ],
            resources: []
          }),
          parsedContent: {
            title: "Unable to Complete Research",
            summary: "We were unable to complete your research query after multiple attempts.",
            details: "The research service is experiencing persistent issues. This could be due to network problems, service outages, or high demand.",
            actionableSteps: [
              "Try again later when the service may be less busy",
              "Check your internet connection",
              "Try a different, simpler query"
            ],
            resources: []
          }
        }
      }]
    }, { status: 500 });
    
  } catch (error) {
    console.error('Unhandled error in Perplexity API route:', error);
    
    // Return a generic error response
    return NextResponse.json({ 
      error: 'An unexpected error occurred',
      errorDetails: error instanceof Error ? error.message : 'Unknown error',
      choices: [{
        message: {
          content: JSON.stringify({
            title: "Unexpected Error",
            summary: "An unexpected error occurred while processing your research query.",
            details: "Our system encountered an error that it wasn't expecting. This has been logged for investigation.",
            actionableSteps: [
              "Try again later",
              "Refresh the page and submit your query again",
              "If the problem persists, please contact support"
            ],
            resources: []
          }),
          parsedContent: {
            title: "Unexpected Error",
            summary: "An unexpected error occurred while processing your research query.",
            details: "Our system encountered an error that it wasn't expecting. This has been logged for investigation.",
            actionableSteps: [
              "Try again later",
              "Refresh the page and submit your query again",
              "If the problem persists, please contact support"
            ],
            resources: []
          }
        }
      }]
    }, { status: 500 });
  }
}
