import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { SignJWT, jwtVerify } from "jose";

const scryptAsync = promisify(scrypt);

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "thekabari-secret-change-in-prod"
);

export const PARTNER_COOKIE = "kb_partner_session";
export const PARTNER_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const hash = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${hash.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  try {
    const [salt, hash] = stored.split(":");
    if (!salt || !hash) return false;
    const hashBuffer = Buffer.from(hash, "hex");
    const verifyHash = (await scryptAsync(password, salt, 64)) as Buffer;
    return timingSafeEqual(hashBuffer, verifyHash);
  } catch {
    return false;
  }
}

export async function signPartnerToken(partnerId: string, slug: string): Promise<string> {
  return new SignJWT({ partnerId, slug, type: "partner" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .sign(SECRET);
}

export async function verifyPartnerToken(
  token: string
): Promise<{ partnerId: string; slug: string } | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    if (payload.type !== "partner") return null;
    return { partnerId: payload.partnerId as string, slug: payload.slug as string };
  } catch {
    return null;
  }
}
