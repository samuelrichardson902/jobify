import { JSDOM } from "jsdom";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import { rateLimit } from "@/lib/rateLimit";

const ai = new GoogleGenAI({});

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    // Authentication check
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const accessToken = authHeader.replace("Bearer ", "");

    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.getUser(accessToken);
    if (error || !user) {
      return Response.json({ error: "Invalid token" }, { status: 401 });
    }

    // Rate limiting
    const rateLimitResult = rateLimit(user.id, 10, 60000);
    if (!rateLimitResult.allowed) {
      return Response.json(
        {
          error: "Rate limit exceeded. Please try again later.",
          resetTime: rateLimitResult.resetTime,
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
            "X-RateLimit-Reset": rateLimitResult.resetTime.toString(),
          },
        }
      );
    }

    const { url } = await request.json();
    if (!url) {
      return Response.json({ error: "Missing URL" }, { status: 400 });
    }

    // Fetch rendered HTML using Browserless
    const browserlessResponse = await fetch(
      `https://chrome.browserless.io/content?token=${process.env.BROWSERLESS_TOKEN}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: url,
          waitFor: 2000, // Wait 2 seconds for dynamic content
        }),
        timeout: 30000,
      }
    );

    if (!browserlessResponse.ok) {
      throw new Error(`Browserless error: ${browserlessResponse.status}`);
    }

    const html = await browserlessResponse.text();
    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Step 1: Try extracting structured data (JSON-LD)
    let jobData = null;
    const jsonLdScripts = document.querySelectorAll(
      "script[type='application/ld+json']"
    );

    for (const script of jsonLdScripts) {
      try {
        const data = JSON.parse(script.textContent);
        if (data["@type"] === "JobPosting") {
          jobData = {
            company: data.hiringOrganization?.name || null,
            location:
              data.jobLocation?.address?.addressLocality ||
              data.jobLocation?.address?.addressRegion ||
              null,
            salary: extractSalary(data.baseSalary),
            notes: data.description
              ? stripHtml(data.description).slice(0, 300)
              : null,
            deadline: data.validThrough || null,
          };
          break;
        }
      } catch (parseError) {
        console.warn("Failed to parse JSON-LD:", parseError.message);
      }
    }

    // Step 2: Fallback to Gemini if JSON-LD missing
    if (!jobData) {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("Google AI API key not configured");
      }

      const plainText = document.body.textContent
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 10000);

      const prompt = `
Extract job information from this text and return ONLY a valid JSON object with these exact keys:
{ "company": string|null, "location": string|null, "salary": string|null, "notes": string|null, "deadline": string|null }

Job posting text:
"""${plainText}"""

Return only the JSON object, no other text.
      `;

      const response = await ai.models.generateContent({
        model: process.env.GEMINI_MODEL_VERSION,
        contents: prompt,
      });

      jobData = safeParseJSON(response.text);
    }

    if (!jobData) {
      throw new Error("Could not extract job data from the provided URL");
    }

    return Response.json(
      { success: true, data: jobData },
      {
        headers: {
          "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
          "X-RateLimit-Reset": rateLimitResult.resetTime.toString(),
        },
      }
    );
  } catch (err) {
    console.error("Job extraction error:", err);

    if (err.code === "ENOTFOUND" || err.code === "ECONNREFUSED") {
      return Response.json(
        { error: "Invalid URL or website unreachable" },
        { status: 400 }
      );
    }

    if (
      err.message.includes("API key") ||
      err.message.includes("Browserless")
    ) {
      return Response.json(
        { error: "API configuration error" },
        { status: 500 }
      );
    }

    return Response.json(
      { error: "Failed to extract job data" },
      { status: 500 }
    );
  }
}

function stripHtml(html) {
  if (typeof html !== "string") return "";
  return html.replace(/<\/?[^>]+(>|$)/g, "").trim();
}

function extractSalary(baseSalary) {
  if (!baseSalary) return null;

  if (baseSalary.value?.value) {
    const currency = baseSalary.currency || "$";
    return `${currency}${baseSalary.value.value}`;
  }

  if (baseSalary.value?.minValue && baseSalary.value?.maxValue) {
    const currency = baseSalary.currency || "$";
    return `${currency}${baseSalary.value.minValue} - ${currency}${baseSalary.value.maxValue}`;
  }

  return null;
}

function safeParseJSON(text) {
  try {
    const jsonMatch = text.match(/\{[\s\S]*?\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);

    if (typeof parsed === "object" && parsed !== null) {
      return {
        company: parsed.company || null,
        location: parsed.location || null,
        salary: parsed.salary || null,
        notes: parsed.notes || null,
        deadline: parsed.deadline || null,
      };
    }

    return null;
  } catch (parseError) {
    console.warn("Failed to parse AI response:", parseError.message);
    return null;
  }
}
