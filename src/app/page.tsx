'use client';

import { useState } from 'react';
import Link from 'next/link';
import TypingEffect from '@/components/TypingEffect';
import { useRouter } from 'next/navigation';

const environmentalQuestions = [
  "How can we get plastic off of the beaches of Sian Ka'an in Mexico?",
  "How we we reduce pollution in Boise, Idaho during January?",
  "What steps can individuals take to improve humanity's impact on the planet?",
  "I drive an Italka scooter. Is there anything I can do to it to minimize emmissions?",
  "I want to organize a litter clean up day in Mexico City. Any tips on how to make this successful?"
];

export default function Home() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || loading) return;
    
    setLoading(true);
    setErrorMessage('');
    
    try {
      // First check if the query is about environmental topics using the cheaper Sonar model
      const topicCheckResponse = await fetch('/api/perplexity/check-topic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });
      
      if (!topicCheckResponse.ok) {
        throw new Error('Failed to check topic');
      }
      
      const topicData = await topicCheckResponse.json();
      
      if (topicData.isEnvironmentalTopic) {
        // If it's environmental, proceed as normal
        // Store the query in search history
        const searchHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');
        searchHistory.push(query);
        localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
        
        // Store the current query for the results page
        localStorage.setItem('currentQuery', query);
        localStorage.setItem('currentFollowUps', JSON.stringify([]));
        
        // Navigate to results page
        router.push('/results');
      } else {
        // If not environmental, show error message
        setErrorMessage('This app only answers questions around how people can take action to regenerate the planet :)');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error checking topic:', error);
      // If there's an error in the check, proceed to results page anyway (fail open)
      const searchHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');
      searchHistory.push(query);
      localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
      localStorage.setItem('currentQuery', query);
      localStorage.setItem('currentFollowUps', JSON.stringify([]));
      router.push('/results');
    }
  };

  return (
    <main className="min-h-screen bg-black text-[#00ff7f] p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-xl md:text-4xl font-mono text-[#00ff7f] mb-4 text-center font-normal tracking-widest whitespace-nowrap">[ GAIA ACTION PORTAL ]</h1>
        <h2 className="text-sm md:text-xl font-mono text-[#00ff7f] mb-12 text-center opacity-70 px-4 max-w-2xl mx-auto leading-relaxed">Use Deep Research to understand environmental problems, as well as actions you can take to fix them.</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative border border-[#00ff7f] rounded">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full p-4 bg-black text-[#00ff7f] font-mono rounded focus:outline-none focus:border-[#00aa55]"
              rows={4}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e as unknown as React.FormEvent);
                }
              }}
            />
            {!query && (
              <div className="absolute top-4 left-4 pointer-events-none w-full pr-8">
                <TypingEffect 
                  questions={environmentalQuestions} 
                  typingSpeed={80}
                  pauseBetweenQuestions={2500}
                  className="text-[#5affaa] font-mono opacity-60"
                />
              </div>
            )}
          </div>
          
          {errorMessage && (
            <div className="text-yellow-300 font-mono text-center p-4 border border-yellow-300 rounded">
              {errorMessage}
            </div>
          )}
          
          <div className="flex justify-center">
            <button
              type="submit"
              className="gaia-button text-lg px-8 py-2"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Take action'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
