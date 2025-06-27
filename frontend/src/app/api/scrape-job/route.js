import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      );
    }

    // Simulate API delay for realistic behavior
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Generate placeholder data based on the URL domain
    const domain = new URL(url).hostname.replace(/^www\./, "");
    const placeholderData = generatePlaceholderData(domain, url);

    return NextResponse.json(placeholderData);
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Failed to process job data" },
      { status: 500 }
    );
  }
}

function generatePlaceholderData(domain, url) {
  const company = `${domain.split(".")[0]} Corp`;

  const locations = [
    "Remote",
    "London, UK",
    "Manchester, UK",
    "Birmingham, UK",
    "Edinburgh, Scotland",
    "Cardiff, Wales",
    "Hybrid - London",
    "Remote (UK only)",
  ];

  const salaries = [
    "45000",
    "55000",
    "65000",
    "75000",
    "85000",
    "95000",
    "105000",
    "120000",
  ];

  const positions = [
    "Senior Software Engineer",
    "Full Stack Developer",
    "Frontend Developer",
    "Backend Developer",
    "DevOps Engineer",
    "Product Manager",
    "UX/UI Designer",
    "Data Scientist",
  ];

  // Random selections for variety
  const location = locations[Math.floor(Math.random() * locations.length)];
  const salary = salaries[Math.floor(Math.random() * salaries.length)];
  const position = positions[Math.floor(Math.random() * positions.length)];

  const notes = `Position: ${position}
Company: ${company}
Auto-filled from: ${url}
Requirements: 3+ years experience, strong communication skills
Benefits: Health insurance, pension, flexible working
Application deadline: Apply ASAP`;

  const applyBy = new Date(
    Date.now() + Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000
  );

  return {
    company,
    location,
    salary,
    notes,
    applyBy,
  };
}
