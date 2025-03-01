#!/bin/bash
# This script sets the API key and runs the tests
# IMPORTANT: Never commit this file to version control if it contains your actual API key

# Set the API key as an environment variable
export PERPLEXITY_API_KEY=your_api_key_here

# Run the tests
echo "Running Perplexity API test..."
node test-perplexity-api.js

echo -e "\nRunning API route test..."
node test-api-route.js

echo -e "\nRunning Gaia rewrite test..."
node test-gaia-rewrite.js

echo -e "\nRunning check-topic test..."
node test-check-topic.js
