// API Key Format Checker
import { config } from "dotenv";
import { exit } from "process";

// Load environment variables from .env.local
config({ path: ".env.local" });

function checkApiKey() {
  console.log("🔍 Checking Perplexity API key format...\n");

  const apiKey = process.env.NEXT_PUBLIC_PERPLEXITY_API_KEY;

  if (!apiKey) {
    console.error(
      "❌ ERROR: No Perplexity API key found in environment variables"
    );
    console.log(
      "Make sure you have a .env.local file with PERPLEXITY_API_KEY set"
    );
    exit(1);
  }

  // Mask the API key for security
  const maskedKey =
    apiKey.substring(0, 4) + "..." + apiKey.substring(apiKey.length - 4);
  console.log(`API key found: ${maskedKey} (length: ${apiKey.length})`);

  // Check for common issues
  console.log("\n🔎 Analyzing API key format...");

  // Check prefix
  if (!apiKey.startsWith("pplx-")) {
    console.error('❌ ERROR: API key does not start with "pplx-" prefix');
    console.log('Valid Perplexity API keys should start with "pplx-"');
  } else {
    console.log('✅ API key has correct "pplx-" prefix');
  }

  // Check for whitespace
  if (apiKey.trim() !== apiKey) {
    console.error("❌ ERROR: API key contains leading or trailing whitespace");
    console.log("Actual length:", apiKey.length);
    console.log("Trimmed length:", apiKey.trim().length);
    console.log("This could cause authentication failures");
  } else {
    console.log("✅ API key does not contain leading or trailing whitespace");
  }

  // Check for invalid characters
  const validPattern = /^[a-zA-Z0-9_-]+$/;
  if (!validPattern.test(apiKey)) {
    console.error("❌ ERROR: API key contains invalid characters");
    console.log(
      "API key should only contain letters, numbers, underscores, and hyphens"
    );
  } else {
    console.log("✅ API key contains only valid characters");
  }

  // Check length
  if (apiKey.length < 30) {
    console.warn("⚠️ WARNING: API key seems too short");
    console.log("Typical Perplexity API keys are longer than 30 characters");
  } else {
    console.log("✅ API key length seems reasonable");
  }

  console.log("\n📋 API Key Details:");
  console.log("First 5 characters:", apiKey.substring(0, 5));
  console.log("Last 5 characters:", apiKey.substring(apiKey.length - 5));
  console.log("Total length:", apiKey.length);

  // Print the key with each character's ASCII code for debugging
  console.log("\n🔢 Character-by-character analysis:");
  const charArray = apiKey.split("");
  const charCodes = charArray.map((char) => char.charCodeAt(0));

  console.log("Character positions and ASCII codes:");
  charArray.forEach((char, index) => {
    if (index < 5 || index > apiKey.length - 6) {
      console.log(
        `Position ${index}: '${char}' (ASCII: ${char.charCodeAt(0)})`
      );
    } else if (index === 5) {
      console.log("...");
    }
  });

  console.log("\n✅ API key format check completed");
}

checkApiKey();
