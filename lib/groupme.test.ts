import { afterEach, describe, expect, it, vi } from "vitest";
import { postToGroupMe } from "./groupme";

describe("postToGroupMe", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("posts the bot_id and text to the GroupMe bots endpoint", async () => {
    vi.stubEnv("GROUPME_BOT_ID", "test-bot-id");
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 202 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(postToGroupMe("hello chapter")).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.groupme.com/v3/bots/post",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bot_id: "test-bot-id", text: "hello chapter" }),
        signal: expect.any(AbortSignal),
      })
    );
  });

  it("holds a claim when GroupMe returns an ambiguous server error", async () => {
    vi.stubEnv("GROUPME_BOT_ID", "test-bot-id");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 500 })));

    await expect(postToGroupMe("hello chapter")).rejects.toMatchObject({
      statusCode: 502,
      outcome: "uncertain",
    });
  });

  it("allows retry after an explicit rejection", async () => {
    vi.stubEnv("GROUPME_BOT_ID", "test-bot-id");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 429 })));

    await expect(postToGroupMe("hello chapter")).rejects.toMatchObject({
      statusCode: 502,
      outcome: "failed",
    });
  });

  it("fails before sending when GROUPME_BOT_ID is not set", async () => {
    vi.stubEnv("GROUPME_BOT_ID", "");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(postToGroupMe("hello chapter")).rejects.toMatchObject({
      statusCode: 500,
      outcome: "failed",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("holds a claim when the connection drops", async () => {
    vi.stubEnv("GROUPME_BOT_ID", "test-bot-id");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));

    await expect(postToGroupMe("hello chapter")).rejects.toMatchObject({
      statusCode: 502,
      outcome: "uncertain",
    });
  });

  it("reports a gateway timeout without making the claim retryable", async () => {
    vi.stubEnv("GROUPME_BOT_ID", "test-bot-id");
    const timeout = vi.spyOn(AbortSignal, "timeout").mockReturnValue(AbortSignal.abort());
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("timed out")));
    try {
      await expect(postToGroupMe("hello chapter")).rejects.toMatchObject({
        statusCode: 504,
        outcome: "uncertain",
      });
      expect(timeout).toHaveBeenCalledWith(8_000);
    } finally {
      timeout.mockRestore();
    }
  });
});
