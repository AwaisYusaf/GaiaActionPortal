import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { query, context } = await req.json();

    // Use environment variable for API key
    const apiKey = process.env.NEXT_PUBLIC_PERPLEXITY_API_KEY;

    if (!apiKey) {
      console.error("No Perplexity API key found in environment variables");
      return NextResponse.json(
        {
          error: "API key not configured",
          details:
            "The PERPLEXITY_API_KEY environment variable is not set in the server environment.",
        },
        { status: 500 }
      );
    }

    console.log(
      "Sending request to Perplexity API (fast model) with query:",
      query
    );

    // Use a faster model from Perplexity API
    const requestBody = {
      model: "sonar", // Using the base sonar model which is faster than sonar-deep-research
      messages: [
        {
          role: "system",
          content:
            "You are an assistant that generates follow-up questions for environmental research. Be concise and specific.",
        },
        {
          role: "user",
          content: query + (context ? `\n\nContext: ${context}` : ""),
        },
      ],
      max_tokens: 200, // Limiting token count for faster response
    };

    console.log("Request body for fast model:", JSON.stringify(requestBody));

    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "Perplexity API error (fast model):",
        response.status,
        errorText
      );

      try {
        const errorData = JSON.parse(errorText);
        console.error("Parsed error data:", errorData);
        return NextResponse.json(
          { error: "Error from Perplexity API", details: errorData },
          { status: response.status }
        );
      } catch (e) {
        console.error("Could not parse error response as JSON:", e);
        return NextResponse.json(
          { error: "Error from Perplexity API", message: errorText },
          { status: response.status }
        );
      }
    }

    const data = await response.json();
    console.log("Received response from Perplexity API (fast model)");
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
