import { GenerationInputs, GenerationResult } from "../types";

// Declare types for the Window object to support Google Identity Services
declare global {
  interface Window {
    google: {
      accounts: {
        oauth2: {
          initTokenClient: (config: any) => any;
        };
      };
    };
  }
}

export interface SheetConfig {
  clientId: string;
  spreadsheetId: string;
}

let tokenClient: any;
let accessToken: string | null = null;

export const initGoogleAuth = (clientId: string) => {
  if (!window.google || !window.google.accounts) {
    console.error("Google Identity Services script not loaded");
    return;
  }

  tokenClient = window.google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: "https://www.googleapis.com/auth/spreadsheets",
    callback: (tokenResponse: any) => {
      accessToken = tokenResponse.access_token;
      console.log("Google Auth Success: Token received");
    },
  });
};

export const triggerAuth = () => {
  if (tokenClient) {
    // Prompt the user to select an account.
    tokenClient.requestAccessToken();
  } else {
    console.error("Token client not initialized. Call initGoogleAuth first.");
    alert("Please configure your Client ID in the settings first.");
  }
};

export const saveToSheet = async (
  spreadsheetId: string,
  inputs: GenerationInputs,
  result: GenerationResult,
  activeFormat?: string
): Promise<boolean> => {
  if (!accessToken) {
    triggerAuth();
    return false;
  }

  const timestamp = new Date().toLocaleString();
  
  // Format content based on type (Batch, Carousel, Standard)
  let finalContent = "";
  let finalFormat = inputs.format;

  if (result.multiFormatOutput && activeFormat) {
     finalContent = (result.multiFormatOutput as any)[activeFormat];
     finalFormat = `${inputs.format} (${activeFormat})`;
  } else if (result.carouselOutput) {
     finalContent = result.carouselOutput.map(s => `[Slide ${s.slideNumber}] ${s.title}: ${s.content}`).join("\n");
     finalFormat = "Instagram Carousel";
  } else if (result.batchOutput) {
     finalContent = result.batchOutput.join("\n\n---\n\n");
     finalFormat = `Batch (${inputs.batchCount})`;
  } else {
     finalContent = result.content;
  }

  // Row Data: [Timestamp, Persona, Topic, Format, Audience, Drift Score, Content]
  const values = [
    [
      timestamp,
      inputs.persona.substring(0, 100) + (inputs.persona.length > 100 ? "..." : ""), // Truncate persona prompt
      inputs.topic,
      finalFormat,
      inputs.audience,
      result.driftScore ? `${result.driftScore}%` : "N/A",
      finalContent
    ]
  ];

  const body = {
    values: values,
  };

  try {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A1:append?valueInputOption=USER_ENTERED`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    if (response.ok) {
      return true;
    } else {
      const errorData = await response.json();
      console.error("Sheets API Error:", errorData);
      throw new Error(errorData.error?.message || "Failed to save to Sheets");
    }
  } catch (error) {
    console.error("Save to Sheets failed", error);
    throw error;
  }
};

export const isAuthorized = () => !!accessToken;