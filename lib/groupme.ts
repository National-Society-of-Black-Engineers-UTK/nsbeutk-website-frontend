export class GroupMeDeliveryError extends Error {
  constructor(
    message: string,
    readonly statusCode: 500 | 502 | 504,
    readonly outcome: "failed" | "uncertain",
  ) {
    super(message);
    this.name = "GroupMeDeliveryError";
  }
}

export async function postToGroupMe(text: string): Promise<void> {
  const botId = process.env.GROUPME_BOT_ID;
  if (!botId) {
    throw new GroupMeDeliveryError("GroupMe bot is not configured.", 500, "failed");
  }

  const signal = AbortSignal.timeout(8_000);
  let response: Response;
  try {
    response = await fetch("https://api.groupme.com/v3/bots/post", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bot_id: botId, text }),
      redirect: "error",
      signal,
    });
  } catch {
    if (signal.aborted) {
      throw new GroupMeDeliveryError("GroupMe request timed out.", 504, "uncertain");
    }
    throw new GroupMeDeliveryError("GroupMe delivery could not be confirmed.", 502, "uncertain");
  }

  if (!response.ok) {
    const rejected = response.status >= 400 && response.status < 500 && response.status !== 408;
    throw new GroupMeDeliveryError(
      `GroupMe returned HTTP ${response.status}.`,
      502,
      rejected ? "failed" : "uncertain",
    );
  }
}
