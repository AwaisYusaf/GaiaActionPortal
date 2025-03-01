'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AnimatedEllipsis from '@/components/AnimatedEllipsis';

// Define the type for our structured response
interface StructuredResponse {
  title: string;
  summary: string;
  details: string;
  actionableSteps: string[];
  resources?: string[];
}

export default function ResultsPage() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<StructuredResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rawResponse, setRawResponse] = useState('');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Load search history
    const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    setSearchHistory(history);

    // Get current query
    const currentQuery = localStorage.getItem('currentQuery');

    if (!currentQuery) {
      router.push('/');
      return;
    }

    setQuery(currentQuery);

    // Fetch results from Perplexity API
    const fetchResults = async () => {
      try {
        setLoading(true);
        setError('');
        setRawResponse('');
        
        console.log('Fetching results for query:', currentQuery);
        const response = await fetch('/api/perplexity', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: currentQuery,
            followUpQuestions: [],
          }),
        });
        
        // First try to get the response text
        const responseText = await response.text();
        
        // Try to parse it as JSON
        let data;
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error('Failed to parse API response as JSON:', responseText);
          throw new Error(`Invalid JSON response from API: ${responseText.substring(0, 100)}...`);
        }
        
        if (!response.ok) {
          console.error('API error:', data);
          throw new Error(data.error || data.message || 'Failed to fetch results');
        }

        if (data.error) {
          throw new Error(data.error);
        }

        console.log('Full API response:', data);

        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
          console.error('Invalid response structure:', data);
          throw new Error('Invalid response format from API');
        }

        // Check if we have parsedContent from the API
        if (data.choices[0].message.parsedContent) {
          console.log('Using pre-parsed content from API');
          setResult(data.choices[0].message.parsedContent);
          setRawResponse(JSON.stringify(data.choices[0].message.parsedContent, null, 2));
          return;
        }

        const content = data.choices[0].message.content;
        console.log('Content to parse:', content);
        setRawResponse(content);

        // Parse the JSON content
        try {
          let parsedContent;
          
          // If the content is already an object, use it directly
          if (typeof content === 'object' && content !== null) {
            parsedContent = content;
          } else {
            // Try to extract JSON from the content
            const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
            
            if (jsonMatch && jsonMatch[1]) {
              // Found JSON in markdown code block
              parsedContent = JSON.parse(jsonMatch[1]);
            } else {
              // Try to parse the entire content as JSON
              parsedContent = JSON.parse(content);
            }
          }
          
          console.log('Parsed content:', parsedContent);
          
          // Check if the parsed content is incomplete due to token limit
          if (data.choices[0].finish_reason === 'length' && parsedContent) {
            // Try to fix incomplete resources array if it exists but is truncated
            if (parsedContent.resources && Array.isArray(parsedContent.resources)) {
              // If the last item appears to be cut off, remove it
              const lastResource = parsedContent.resources[parsedContent.resources.length - 1];
              if (lastResource && !lastResource.endsWith(']') && !lastResource.endsWith('.')) {
                parsedContent.resources.pop();
                
                // Add a note about truncation
                parsedContent.resources.push('(Additional resources truncated due to length limits)');
              }
            }
          }
          
          // Set the result
          setResult(parsedContent);
        } catch (parseError) {
          console.error('Error parsing JSON response:', parseError);
          throw new Error('Failed to parse the response from the API. Check the console for details.');
        }
      } catch (err) {
        console.error('Error fetching results:', err);
        setError(err instanceof Error ? err.message : 'An error occurred while fetching results. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [router]);

  const handleCopyText = () => {
    if (!result) return;
    
    // Format the result as text
    const textResult = `
${result.title}

${result.summary}

${result.details}

Actionable Steps:
${result.actionableSteps.map((step, index) => `${index + 1}. ${step}`).join('\n')}

${result.resources && result.resources.length > 0 ? `Resources:
${result.resources.map((resource, index) => `${index + 1}. ${resource}`).join('\n')}` : ''}
    `;
    
    navigator.clipboard.writeText(textResult.trim());
    alert('Result copied to clipboard!');
  };

  const handleSelectHistoryItem = (selectedQuery: string) => {
    localStorage.setItem('currentQuery', selectedQuery);
    localStorage.setItem('currentFollowUps', JSON.stringify([]));
    window.location.reload();
  };

  const toggleHistory = () => {
    setShowHistory(!showHistory);
  };

  return (
    <main className="min-h-screen bg-black text-[#00ff7f] p-4 md:p-8">
      <div className="flex flex-col">
        <div className="mb-6 text-center">
          <h1 className="text-xl md:text-4xl font-mono text-[#00ff7f] mb-4 font-normal tracking-widest whitespace-nowrap">[ GAIA ACTION PORTAL ]</h1>
          
          {/* Mobile History Button */}
          <div className="md:hidden mb-4">
            <button 
              onClick={toggleHistory} 
              className="gaia-button w-full"
            >
              {showHistory ? 'Hide Search History' : 'View Search History'}
            </button>
          </div>
          
          <h2 className="text-xl font-mono text-[#00ff7f] mb-2">Research Results</h2>
          <p className="text-[#00aa55] font-mono">Query: {query}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Mobile History Panel (conditionally shown) */}
          {showHistory && (
            <div className="md:hidden mb-6">
              <div className="p-4 border border-[#00ff7f] rounded">
                <h3 className="text-[#00ff7f] font-mono text-lg mb-2">search history</h3>
                {searchHistory.length === 0 ? (
                  <p className="text-[#00aa55] font-mono text-sm">No search history yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {searchHistory.map((historyQuery, index) => (
                      <li key={index} className="text-[#00ff7f] font-mono">
                        <button
                          onClick={() => handleSelectHistoryItem(historyQuery)}
                          className="text-left hover:text-[#00aa55] transition-colors w-full overflow-hidden text-ellipsis"
                        >
                          {index + 1}. {historyQuery}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
          
          {/* Desktop History Panel (always shown on desktop) */}
          <div className="hidden md:block md:col-span-1">
            <div className="p-4 border border-[#00ff7f] rounded">
              <h3 className="text-[#00ff7f] font-mono text-lg mb-2">search history</h3>
              {searchHistory.length === 0 ? (
                <p className="text-[#00aa55] font-mono text-sm">No search history yet.</p>
              ) : (
                <ul className="space-y-2">
                  {searchHistory.map((historyQuery, index) => (
                    <li key={index} className="text-[#00ff7f] font-mono">
                      <button
                        onClick={() => handleSelectHistoryItem(historyQuery)}
                        className="text-left hover:text-[#00aa55] transition-colors w-full overflow-hidden text-ellipsis"
                      >
                        {index + 1}. {historyQuery}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          
          <div className="md:col-span-3">
            {loading ? (
              <div className="border border-[#00ff7f] p-6 rounded">
                <div className="flex items-center">
                  <p className="text-[#00ff7f] font-mono text-lg">We are researching and reasoning</p>
                  <AnimatedEllipsis />
                </div>
                <p className="text-[#00ff7f] font-mono opacity-70 mt-4">This may take multiple minutes. Please go grab some fresh air and check back shortly.</p>
              </div>
            ) : error ? (
              <div className="border border-[#00ff7f] p-6 rounded">
                <p className="text-red-500 font-mono">An error occurred while fetching results. Please try again.</p>
                <p className="text-red-500 font-mono">{error}</p>
                
                {rawResponse && (
                  <div className="mt-4">
                    <h3 className="text-[#00ff7f] font-mono text-lg mb-2">Raw Response (for debugging):</h3>
                    <pre className="whitespace-pre-wrap text-xs text-[#00aa55] font-mono border border-[#00aa55] p-2 rounded max-h-60 overflow-auto">
                      {rawResponse}
                    </pre>
                  </div>
                )}
              </div>
            ) : result ? (
              <div className="space-y-6">
                <div className="border border-[#00ff7f] p-6 rounded">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-mono text-[#00ff7f]">{result.title}</h2>
                    <button 
                      onClick={handleCopyText}
                      className="gaia-button text-sm"
                    >
                      Copy
                    </button>
                  </div>
                  
                  <div className="space-y-6 font-mono text-[#00ff7f]">
                    <div>
                      <h3 className="text-lg font-mono text-[#00ff7f] mb-2">Summary</h3>
                      <p className="whitespace-pre-wrap">{result.summary}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-mono text-[#00ff7f] mb-2">Details</h3>
                      <p className="whitespace-pre-wrap">{result.details}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-mono text-[#00ff7f] mb-2">Actionable Steps</h3>
                      <ul className="list-decimal pl-5 space-y-2">
                        {result.actionableSteps.map((step, index) => (
                          <li key={index} className="whitespace-pre-wrap">{step}</li>
                        ))}
                      </ul>
                    </div>
                    
                    {result.resources && result.resources.length > 0 && (
                      <div>
                        <h3 className="text-lg font-mono text-[#00ff7f] mb-2">Resources</h3>
                        <ul className="list-decimal pl-5 space-y-2">
                          {result.resources.map((resource, index) => {
                            // Extract URL if it exists in the format "text (url)"
                            const urlMatch = resource.match(/\((https?:\/\/[^\s)]+)\)/);
                            const url = urlMatch ? urlMatch[1] : null;
                            const text = url ? resource.replace(` (${url})`, '') : resource;
                            
                            return (
                              <li key={index} className="whitespace-pre-wrap">
                                {url ? (
                                  <a 
                                    href={url} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="gaia-link"
                                  >
                                    {text}
                                  </a>
                                ) : (
                                  <span>{resource}</span>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-center mt-8">
                  <Link href="/" className="gaia-button">
                    New Search
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  );
}
