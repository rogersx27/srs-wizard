import { createHmac, timingSafeEqual } from "crypto";

const COOKIE_NAME = "dashboard_session";
const MAX_AGE_MS = 1000 * 60 * 60 * 24 * 7;

export class DashboardSessionService {
  static readonly cookieName = COOKIE_NAME;

  private get secret(): string {
    const secret = process.env.DASHBOARD_SESSION_SECRET;
    if (!secret) throw new Error("DASHBOARD_SESSION_SECRET no está configurado.");
    return secret;
  }

  sign(): string {
    const issuedAt = Date.now().toString();
    return `${issuedAt}.${this.hmac(issuedAt)}`;
  }

  verify(token: string | undefined | null): boolean {
    if (!token) return false;

    const [issuedAt, signature] = token.split(".");
    if (!issuedAt || !signature) return false;

    const expected = this.hmac(issuedAt);
    const expectedBuffer = Buffer.from(expected);
    const actualBuffer = Buffer.from(signature);
    if (expectedBuffer.length !== actualBuffer.length) return false;
    if (!timingSafeEqual(expectedBuffer, actualBuffer)) return false;

    const age = Date.now() - Number(issuedAt);
    return age >= 0 && age <= MAX_AGE_MS;
  }

  checkPassword(candidate: string): boolean {
    const expected = process.env.DASHBOARD_PASSWORD;
    if (!expected) throw new Error("DASHBOARD_PASSWORD no está configurado.");

    const candidateBuffer = Buffer.from(candidate);
    const expectedBuffer = Buffer.from(expected);
    if (candidateBuffer.length !== expectedBuffer.length) return false;
    return timingSafeEqual(candidateBuffer, expectedBuffer);
  }

  private hmac(value: string): string {
    return createHmac("sha256", this.secret).update(value).digest("hex");
  }
}
