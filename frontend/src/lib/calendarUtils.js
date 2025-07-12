// Utility functions for calendar integration

export function createGoogleCalendarEvent(company, deadline, notes = "") {
  // Format the deadline date for Google Calendar
  const date = new Date(deadline);

  // Ensure the date is in the correct timezone and format
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const formattedDate = `${year}${month}${day}`; // YYYYMMDD format for Google Calendar

  // Create event title
  const eventTitle = `${company} Application Due`;

  // Create event description with notes if available
  const description = notes
    ? `Notes: ${notes}\n\nAdded from Jobify\n\n💡 Tip: Set a reminder for 1 day before this deadline!`
    : "Added from Jobify\n\n💡 Tip: Set a reminder for 1 day before this deadline!";

  // Build Google Calendar URL with automatic reminder
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: eventTitle,
    dates: `${formattedDate}/${formattedDate}`, // All day event
    details: description,
    ctz: Intl.DateTimeFormat().resolvedOptions().timeZone, // User's timezone
    trp: "false", // Not transparent
    sf: "true", // Show form
    output: "xml",
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function createOutlookCalendarEvent(company, deadline, notes = "") {
  // Format the deadline date for Outlook
  const date = new Date(deadline);

  // Ensure the date is in the correct timezone and format
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const formattedDate = `${year}-${month}-${day}`; // YYYY-MM-DD format for Outlook

  // Create event title
  const eventTitle = `${company} Application Due`;

  // Create event description
  const description = notes
    ? `Notes: ${notes}\n\nAdded from Jobify\n\n💡 Tip: Set a reminder for 1 day before this deadline!`
    : "Added from Jobify\n\n💡 Tip: Set a reminder for 1 day before this deadline!";

  // Build Outlook Calendar URL with reminder
  const params = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    subject: eventTitle,
    startdt: formattedDate,
    enddt: formattedDate,
    body: description,
    allday: "true",
    reminder: "1440", // 1440 minutes = 1 day before
  });

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

export function addToCalendar(company, deadline, notes = "") {
  // Try to detect user's preferred calendar
  const userAgent = navigator.userAgent.toLowerCase();

  if (userAgent.includes("outlook") || userAgent.includes("microsoft")) {
    return createOutlookCalendarEvent(company, deadline, notes);
  } else {
    // Default to Google Calendar
    return createGoogleCalendarEvent(company, deadline, notes);
  }
}
