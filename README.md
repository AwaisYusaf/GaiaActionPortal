# Gaia Action Environmental Research Portal

An AI-powered platform for environmental sustainability research and guidance.

## Features

- AI-powered environmental research using Perplexity API
- Personalized environmental action recommendations
- User-friendly interface with responsive design
- Robust error handling and timeout management

## Deployment

This application is deployed on Netlify with custom configuration for optimal performance.

### Netlify Deployment Instructions

1. Push your code to GitHub
2. Connect your GitHub repository to Netlify
3. Set the following build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
4. Add the following environment variable in Netlify's dashboard:
   - Key: `PERPLEXITY_API_KEY`
   - Value: Your Perplexity API key
   - Make sure to set it for all deployment contexts (Production, Deploy Previews, and Branch deploys)
5. Deploy the site

The application includes a `netlify.toml` file with the necessary configuration for API routes, including increased function timeouts for the Perplexity API calls.

Last deployment: March 1, 2025

## Troubleshooting Deployment Issues

If you encounter issues with the API in production, try these steps:

1. **Verify API Key Configuration**:
   - Check that the `PERPLEXITY_API_KEY` is correctly set in Netlify's environment variables
   - Ensure the API key is enabled for all required scopes (Builds, Functions, Runtime)
   - Verify the API key is set for all deployment contexts if using different values per context

2. **Test API Key**:
   - Visit `/api/test-key` endpoint to verify if the API key is correctly configured
   - This endpoint will return information about the API key status without exposing the full key

3. **Check Netlify Function Logs**:
   - Review the function logs in the Netlify dashboard for any error messages
   - Look for timeout issues or API connection problems

4. **Common Issues**:
   - **Timeout Errors**: The API might be taking too long to respond. Check the timeout settings in `netlify.toml`
   - **CORS Issues**: Ensure the CORS headers are correctly set in `netlify.toml`
   - **API Key Format**: Make sure the API key doesn't have any extra spaces or characters

### API Key Troubleshooting

If you're experiencing "Failed to fetch results" errors or 401 Unauthorized responses from the Perplexity API, follow these steps:

1. **Verify API Key Validity**:
   - Check if your Perplexity API key is still valid and has not expired
   - Ensure your account has sufficient credits for API usage
   - Run the diagnostic script to test your API key: `node test-production-code.js`

2. **Regenerate API Key**:
   - If you suspect your API key has been compromised or is invalid, generate a new one:
     1. Go to the [Perplexity AI dashboard](https://www.perplexity.ai/settings/api)
     2. Click on "Regenerate API Key"
     3. Update both your local `.env.local` file and Netlify environment variables

3. **Check API Key Format**:
   - Ensure the API key starts with `pplx-`
   - Verify there are no whitespace characters or line breaks in the key
   - Run `node check-api-key-format.js` to analyze your API key format

4. **Network Connectivity**:
   - Some networks may block AI API services
   - Try accessing the API from a different network or using a VPN
   - Run `node check-general-connectivity.js` to test connectivity to various services

5. **API Endpoint Changes**:
   - Check the [Perplexity API documentation](https://docs.perplexity.ai) for any endpoint changes
   - Verify the API request format matches the current API specification

6. **Debugging Tools**:
   - Use the provided diagnostic scripts in the project root:
     - `perplexity-diagnostics.js`: Comprehensive API diagnostics
     - `check-api-connectivity.js`: Network connectivity testing
     - `test-api-key.js`: Simple API key verification

If all else fails, contact Perplexity support for assistance with your API key issues.

## Overview

Gaia Action Portal is an AI-powered web application designed to help individuals and small groups explore and address environmental challenges through deep, actionable research. The portal leverages the Perplexity AI API to provide comprehensive, well-researched information on environmental topics with a focus on practical, individual-level actions.

## Technology Stack

- **Frontend**: React with Next.js 14 (App Router)
- **Styling**: Tailwind CSS with custom terminal-inspired theme
- **API Integration**: Perplexity AI API for deep research capabilities
- **State Management**: React hooks for local state management
- **Deployment**: GitHub for version control

## Getting Started

### Prerequisites

- Node.js 18.0.0 or later
- npm or yarn
- Perplexity API key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/vanhalenrules420/GaiaActionPortal.git
   cd GaiaActionPortal
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env.local` file in the root directory and add your Perplexity API key:
   ```
   PERPLEXITY_API_KEY=your_api_key_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Usage

1. Enter an environmental question or topic in the search field
2. Click "Take action" to submit your query
3. Wait for the AI to research and provide results (this may take a minute)
4. Review the structured results including:
   - Title and summary
   - Detailed information
   - Actionable steps you can take
   - Resources with links for further learning
5. Use the "Copy" button to copy the results or "New Search" to start a new query
6. Access your search history to revisit previous queries

## Project Structure

```
/src
  /app                  # Next.js app router files
    /api                # API routes
      /perplexity       # Perplexity API integration
      /test-key         # API key testing endpoint
    /results            # Results page
    page.tsx            # Home page
    globals.css         # Global styles
  /components           # Reusable components
    AnimatedEllipsis.tsx  # Loading animation
    SearchHistory.tsx     # Search history component
    TypingEffect.tsx      # Typing effect for search examples
```

## Key Features Implementation

### Perplexity API Integration

The application uses the Perplexity API with the `sonar-deep-research` model to provide comprehensive environmental research. The API integration includes:

- Custom system prompts to focus on individual actions
- Robust JSON parsing for consistent results
- Error handling for various response formats
- Support for resource links

### Mobile Responsiveness

The UI is optimized for mobile devices with:

- Responsive typography that adjusts based on screen size
- Collapsible search history on mobile devices
- Touch-friendly buttons and inputs
- No horizontal scrolling on small screens

### Loading State

- Custom animated ellipsis component for visual feedback during API calls
- Clear messaging about the research process

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Perplexity AI for providing the research API
- Next.js team for the excellent React framework
- All contributors to open-source packages used in this project