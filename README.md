# Placement Email Calendar Agent

A review-first Gmail + Google Calendar agent for placement communication.

## What it does
- Scans placement-related email candidates
- Lists them in a browser dashboard
- Lets the user approve or reject reminders before adding them to Google Calendar
- Creates approved calendar events with reminders

## Project structure

```text
placement-email-calendar-agent/
├─ package.json
├─ .env.example
├─ server.js
├─ public/
│  ├─ index.html
│  ├─ app.js
│  └─ styles.css
└─ README.md
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy the environment file and configure it:

```bash
cp .env.example .env
```

3. Set up Google Cloud credentials:
- Create a Google Cloud project
- Enable the Google Calendar API
- Create a service account or OAuth app
- Download a JSON credentials file
- Set `GOOGLE_APPLICATION_CREDENTIALS` to the file path
- Optionally set `CALENDAR_ID` if you want a calendar other than your primary calendar

4. Start the dashboard:

```bash
npm start
```

5. Open:

```text
http://localhost:3000
```

## Approval flow
- The dashboard shows likely placement reminders
- You review each item in the browser
- Click `Approve` to create a calendar event
- Click `Reject` to discard the item

## Notes
This scaffold is intentionally conservative:
- it only surfaces likely placement-related opportunities
- it does not auto-create events without explicit approval
- ambiguous or generic messages are filtered out

## Next step
Once this is running locally, the next enhancement is connecting the dashboard to the real Gmail API to pull live placement emails instead of the sample data list.
