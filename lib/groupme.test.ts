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

    const result = await postToGroupMe("hello chapter");

    expect(result).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.groupme.com/v3/bots/post",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bot_id: "test-bot-id", text: "hello chapter" }),
      })
    );
  });

  it("returns false when the GroupMe API responds with an error status", async () => {
    vi.stubEnv("GROUPME_BOT_ID", "test-bot-id");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 500 })));

    expect(await postToGroupMe("hello chapter")).toBe(false);
  });

  it("returns false when GROUPME_BOT_ID is not set", async () => {
    vi.stubEnv("GROUPME_BOT_ID", "");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    expect(await postToGroupMe("hello chapter")).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns false when the fetch call throws", async () => {
    vi.stubEnv("GROUPME_BOT_ID", "test-bot-id");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));

    expect(await postToGroupMe("hello chapter")).toBe(false);
  });
});
