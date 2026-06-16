import { afterEach, describe, expect, it, vi } from "vitest";

const selectMock = vi.fn();

vi.mock("@mirai-gikai/supabase", () => ({
  createAdminClient: () => ({
    from: () => ({ select: selectMock }),
  }),
}));

const { GET } = await import("./route");

describe("GET /api/health", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("DB 疎通に成功したら 200 と status:ok を返す", async () => {
    selectMock.mockResolvedValue({ error: null });

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.status).toBe("ok");
    expect(body.checks.database).toBe("ok");
    expect(body.checks.databaseError).toBeUndefined();
    expect(typeof body.timestamp).toBe("string");
    expect(typeof body.responseTimeMs).toBe("number");
  });

  it("DB がエラーを返したら 503 と status:error を返す", async () => {
    selectMock.mockResolvedValue({ error: { message: "connection refused" } });

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(503);
    expect(body.status).toBe("error");
    expect(body.checks.database).toBe("error");
    expect(body.checks.databaseError).toBe("connection refused");
  });

  it("クライアントが例外を投げても 503 を返す", async () => {
    selectMock.mockRejectedValue(new Error("boom"));

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(503);
    expect(body.checks.database).toBe("error");
    expect(body.checks.databaseError).toBe("boom");
  });
});
