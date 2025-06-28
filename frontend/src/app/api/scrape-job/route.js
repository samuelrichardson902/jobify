import axios from "axios";
import { JSDOM } from "jsdom";
import { GoogleGenAI } from "@google/genai";

// Initialize with API key
const ai = new GoogleGenAI({});

export async function POST(request) {
  try {
    const { url } = await request.json();
    if (!url) {
      return Response.json({ error: "Missing URL" }, { status: 400 });
    }

    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
      timeout: 10000,
    });

    const dom = new JSDOM(response.data);
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
            applyBy: data.validThrough || null,
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
        .slice(0, 10000);
      const prompt = `
Extract job information from this text and return ONLY a valid JSON object with these exact keys:
{ "company": string|null, "location": string|null, "salary": string|null, "notes": string|null, "applyBy": string|null }

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

    return Response.json({ success: true, data: jobData });
  } catch (err) {
    console.error("Job extraction error:", err);

    if (err.code === "ENOTFOUND" || err.code === "ECONNREFUSED") {
      return Response.json(
        { error: "Invalid URL or website unreachable" },
        { status: 400 }
      );
    }

    if (err.message.includes("API key")) {
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

// Utility: Remove HTML tags safely
function stripHtml(html) {
  if (typeof html !== "string") return "";
  return html.replace(/<\/?[^>]+(>|$)/g, "").trim();
}

// Utility: Extract salary information
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

// Utility: Parse JSON safely (NO eval!)
function safeParseJSON(text) {
  try {
    // Try to find JSON object in the response
    const jsonMatch = text.match(/\{[\s\S]*?\}/);
    if (!jsonMatch) return null;

    // Use JSON.parse instead of eval for security
    const parsed = JSON.parse(jsonMatch[0]);

    // Validate the structure
    if (typeof parsed === "object" && parsed !== null) {
      return {
        company: parsed.company || null,
        location: parsed.location || null,
        salary: parsed.salary || null,
        notes: parsed.notes || null,
        applyBy: parsed.applyBy || null,
      };
    }

    return null;
  } catch (parseError) {
    console.warn("Failed to parse AI response:", parseError.message);
    return null;
  }
}
