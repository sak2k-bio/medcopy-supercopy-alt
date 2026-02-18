# Google Sheets Integration Guide for MedCopy

MedCopy supports "One-Click Save" to Google Sheets to organize your generated content. 

Because this application runs entirely in the browser (client-side), you must set up a project in the Google Cloud Console to allow the app to talk to your personal Google Sheet.

## Prerequisites
* A Google Account
* A Google Sheet created (keep the ID handy)

---

## Step 1: Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Click **Create Project**.
3. Name it `MedCopy` (or similar) and click **Create**.

## Step 2: Enable the Google Sheets API
1. In the sidebar, go to **APIs & Services > Library**.
2. Search for `Google Sheets API`.
3. Click **Enable**.

## Step 3: Configure OAuth Consent Screen
1. Go to **APIs & Services > OAuth consent screen**.
2. Select **External** (unless you have a Google Workspace organization, then Internal is easier).
3. Fill in the required fields:
   * **App Name**: MedCopy
   * **User Support Email**: Your email.
   * **Developer Contact Info**: Your email.
4. Click **Save and Continue**.
5. **Scopes**: Click **Add or Remove Scopes**.
   * Search for `spreadsheets`.
   * Select `.../auth/spreadsheets` (See, edit, create, and delete all your Google Sheets spreadsheets).
   * Click **Update** then **Save and Continue**.
6. **Test Users** (Important for External apps):
   * Click **Add Users**.
   * Add your own email address. (Only users listed here can use the app while it's in "Testing" mode).
   * Click **Save and Continue**.

## Step 4: Create Credentials (Client ID)
1. Go to **APIs & Services > Credentials**.
2. Click **Create Credentials > OAuth client ID**.
3. **Application Type**: Select `Web application`.
4. **Name**: `MedCopy Client`.
5. **Authorized JavaScript origins**:
   * Add the URL where you are running the app.
   * If running locally: `http://localhost:3000` (or your specific port).
   * If deployed (e.g., Vercel/Netlify): `https://your-app-name.vercel.app`.
   * **Note:** Do not use trailing slashes (e.g., use `http://localhost:3000`, NOT `http://localhost:3000/`).
6. Click **Create**.
7. Copy the **Client ID** (It looks like `123456789-abcdefg.apps.googleusercontent.com`).

## Step 5: Prepare your Spreadsheet
1. Create a new Google Sheet at [sheets.new](https://sheets.new).
2. Copy the **Spreadsheet ID** from the URL.
   * URL format: `docs.google.com/spreadsheets/d/SPREADSHEET_ID_IS_HERE/edit`
3. (Optional) Create a header row in the first row:
   * A1: Timestamp
   * B1: Persona
   * C1: Topic
   * D1: Format
   * E1: Audience
   * F1: Drift Score
   * G1: Content

## Step 6: Connect in MedCopy
1. Open the MedCopy app.
2. Click the **"Link Sheets"** button (next to the Persona selector) or look for the Table icon.
3. Paste your **Client ID** and **Spreadsheet ID**.
4. Click **Save Config**.

Now, whenever you generate content, a **"Save to Sheets"** button will appear. Clicking it will prompt you to sign in with Google (once per session) and append the content to your sheet.
