const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const { google } = require("googleapis");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const placementKeywords = [
  "placement",
  "internship",
  "interview",
  "campus drive",
  "recruiter",
  "shortlist",
  "final round",
  "assessment",
  "onboarding",
  "hr",
  "aptitude",
  "technical round",
  "tpo",
  "training and placement"
];

const sampleCandidates = [
  {
    id: "1",
    source: "gmail",
    subject: "Interview call for SDE Role - 12 Nov 2026, 3:30 PM",
    sender: "recruiter@company.com",
    dateTime: "2026-11-12T15:30:00+05:30",
    confidence: "High",
    summary: "Interview call for SDE Role",
    type: "Placement interview"
  },
  {
    id: "2",
    source: "gmail",
    subject: "Final round shortlist for campus placement",
    sender: "tpo@college.edu",
    dateTime: "2026-11-15T10:00:00+05:30",
    confidence: "Medium",
    summary: "Final round shortlist",
    type: "Campus placement"
  },
  {
    id: "3",
    source: "gmail",
    subject: "Weekly career newsletter from JobPortal",
    sender: "newsletter@jobportal.com",
    dateTime: null,
    confidence: "Low",
    summary: "Newsletter",
    type: "Ignore"
  }
];

function isPlacementEmail(subject, body, sender) {
  const text = `${subject} ${body} ${sender}`.toLowerCase();
  return placementKeywords.some((keyword) => text.includes(keyword));
}

function parseCandidateFromEmail(email) {
  const regex = /(\d{1,2}\s+[A-Za-z]{3,9}\s+\d{2,4}.*?(?:\d{1,2}:\d{2}\s*(?:AM|PM)?))/i;
  const match = email.subject.match(regex);
  const dateText = match ? match[0] : null;

  if (!dateText) return null;

  const parsedDate = new Date(dateText);
  if (Number.isNaN(parsedDate.getTime())) return null;

  return {
    id: String(Date.now() + Math.random()),
    source: "gmail",
    subject: email.subject,
    sender: email.sender,
    dateTime: parsedDate.toISOString(),
    confidence: "High",
    summary: email.subject,
    type: "Placement reminder"
  };
}

app.get("/api/candidates", (req, res) => {
  const candidates = sampleCandidates.filter((candidate) => candidate.dateTime);
  res.json({ candidates });
});

app.post("/api/approve", async (req, res) => {
  const { id, title, dateTime } = req.body;

  if (!id || !title || !dateTime) {
    return res.status(400).json({ error: "Missing id, title, or dateTime" });
  }

  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return res.status(400).json({
      ok: false,
      error: "Google credentials are not configured. Set GOOGLE_APPLICATION_CREDENTIALS to the service-account JSON path."
    });
  }

  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      scopes: ["https://www.googleapis.com/auth/calendar"]
    });

    const calendar = google.calendar({ version: "v3", auth });
    const start = new Date(dateTime);
    const end = new Date(start.getTime() + 60 * 60 * 1000);

    const event = {
      summary: title,
      start: { dateTime: start.toISOString() },
      end: { dateTime: end.toISOString() },
      reminders: {
        useDefault: false,
        overrides: [
          { method: "popup", minutes: 30 },
          { method: "email", minutes: 24 * 60 }
        ]
      }
    };

    const response = await calendar.events.insert({
      calendarId: process.env.CALENDAR_ID || "primary",
      requestBody: event
    });

    return res.json({
      ok: true,
      eventId: response.data.id,
      message: "Calendar reminder created successfully."
    });
  } catch (error) {
    console.error("Calendar API error:", error);
    return res.status(500).json({
      ok: false,
      error: "Failed to create calendar event. Check your Google Cloud credentials and calendar permissions."
    });
  }
});

app.get("/api/health", (req, res) => {
  res.json({ ok: true, status: "running" });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Dashboard running on http://localhost:${PORT}`);
});
