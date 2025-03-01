// Test script to verify Perplexity API key in Netlify environment
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // Check if API key is available
    const apiKey = process.env.NEXT_PUBLIC_PERPLEXITY_API_KEY;

    if (!apiKey) {
      console.error("No Perplexity API key found in environment variables");
      return NextResponse.json(
        {
          status: "error",
          message: "API key not configured",
          details:
            "The PERPLEXITY_API_KEY environment variable is not set in the server environment.",
        },
        { status: 500 }
      );
    }

    // Mask the API key for security
    const maskedKey =
      apiKey.substring(0, 4) + "..." + apiKey.substring(apiKey.length - 4);

    // Make a simple API call to verify the key works
    try {
      console.log("Testing Perplexity API key with a simple request");

      const requestBody = {
        model: "sonar",
        messages: [
          {
            role: "user",
            content:
              "Hello, this is a test message to verify the API key is working.",
          },
        ],
        max_tokens: 10,
      };

      const response = await fetch(
        "https://api.perplexity.ai/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Perplexity API error:", response.status, errorText);
        return NextResponse.json(
          {
            status: "error",
            message: `API key verification failed with status ${response.status}`,
            details: errorText.substring(0, 500),
          },
          { status: response.status }
        );
      }

      // If we get here, the API key is valid
      return NextResponse.json({
        status: "success",
        message: "API key is valid and working",
        keyInfo: {
          masked: maskedKey,
          length: apiKey.length,
        },
        environment: process.env.NODE_ENV || "unknown",
      });
    } catch (apiError) {
      console.error("Error testing API key:", apiError);
      return NextResponse.json(
        {
          status: "error",
          message: "Error testing API key",
          error: apiError instanceof Error ? apiError.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("General error in API key test:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "An unexpected error occurred while testing the API key",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
