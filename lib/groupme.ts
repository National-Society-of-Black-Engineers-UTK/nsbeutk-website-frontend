export async function postToGroupMe(text: string): Promise<boolean> {
  const botId = process.env.GROUPME_BOT_ID;

  if (!botId) {
    console.error("postToGroupMe: GROUPME_BOT_ID is not set");
    return false;
  }

  try {
    const response = await fetch("https://api.groupme.com/v3/bots/post", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bot_id: botId, text }),
    });

    return response.ok;
  } catch (error) {
    console.error("postToGroupMe: request failed", error);
    return false;
  }
}
