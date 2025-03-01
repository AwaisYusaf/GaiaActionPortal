# Gaia Action Environmental Research Portal

An AI-powered platform for environmental sustainability research and guidance.

## Features

- AI-powered environmental research using Perplexity API
- Personalized environmental action recommendations
- User-friendly interface with responsive design
- Robust error handling and timeout management

## Deployment

This application is deployed on Vercel with custom configuration for optimal performance.

Last deployment: March 1, 2025

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