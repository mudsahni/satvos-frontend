import { decodeJwtPayload } from "../auth";

describe("decodeJwtPayload", () => {
  it("decodes a valid JWT payload", () => {
    // Create a JWT-like token with a known payload
    const payload = { user_id: "abc-123", sub: "abc-123", role: "admin" };
    const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const body = btoa(JSON.stringify(payload));
    const token = `${header}.${body}.fake-signature`;

    const result = decodeJwtPayload(token);
    expect(result).toEqual(payload);
  });

  it("returns user_id from JWT payload", () => {
    const payload = { user_id: "user-456", exp: 9999999999 };
    const header = btoa(JSON.stringify({ alg: "HS256" }));
    const body = btoa(JSON.stringify(payload));
    const token = `${header}.${body}.sig`;

    const result = decodeJwtPayload(token);
    expect(result?.user_id).toBe("user-456");
  });

  it("returns null for token with wrong number of parts", () => {
    expect(decodeJwtPayload("not-a-jwt")).toBeNull();
    expect(decodeJwtPayload("only.two")).toBeNull();
    expect(decodeJwtPayload("a.b.c.d")).toBeNull();
  });

  it("returns null for invalid base64 payload", () => {
    expect(decodeJwtPayload("header.!!!invalid!!!.signature")).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(decodeJwtPayload("")).toBeNull();
  });

  it("handles URL-safe base64 encoding", () => {
    // JWT uses URL-safe base64 (- instead of +, _ instead of /)
    const payload = { user_id: "test-user" };
    const header = btoa(JSON.stringify({ alg: "HS256" }));
    const body = btoa(JSON.stringify(payload))
      .replace(/\+/g, "-")
      .replace(/\//g, "_");
    const token = `${header}.${body}.sig`;

    const result = decodeJwtPayload(token);
    expect(result?.user_id).toBe("test-user");
  });
});
