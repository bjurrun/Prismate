import { auth, clerkClient } from "@clerk/nextjs/server";

export async function getMicrosoftToken() {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("Niet ingelogd");
    }

    try {
        // We vragen Clerk om het Microsoft token voor de huidige gebruiker
        const client = await clerkClient();
        const oauthToken = await client.users.getUserOauthAccessToken(
            userId,
            'microsoft'
        );

        if (oauthToken.data.length === 0) {
            throw new Error("Geen Microsoft token gevonden. Heb je ingelogd via Microsoft?");
        }

        // Pak het eerste (meest recente) token
        return oauthToken.data[0].token;
    } catch (error) {
        console.error("Fout bij ophalen Microsoft token:", error);
        throw error;
    }
}

// Een simpele helper om data van Microsoft Graph te fetchen
export async function fetchFromGraph(endpoint: string) {
    const token = await getMicrosoftToken();

    const response = await fetch(`https://graph.microsoft.com/v1.0${endpoint}`, {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Graph API Fout: ${errorData.error.message}`);
    }

    return response.json();
}

export async function mutateGraph(endpoint: string, method: "POST" | "PATCH" | "DELETE", body?: unknown) {
    const token = await getMicrosoftToken();

    const response = await fetch(`https://graph.microsoft.com/v1.0${endpoint}`, {
        method,
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Graph API Mutation Fout: ${errorData.error.message}`);
    }

    return response.json();
}
