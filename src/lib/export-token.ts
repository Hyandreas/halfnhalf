import { SignJWT, jwtVerify } from "jose";
import { createHash } from "crypto";
import { EXPORT_TOKEN_EXPIRY_SECONDS } from "./constants";

const secret = new TextEncoder().encode(process.env.EXPORT_TOKEN_SECRET);

export async function signExportToken(userId: string): Promise<string> {
  return new SignJWT({ purpose: "export" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${EXPORT_TOKEN_EXPIRY_SECONDS}s`)
    .sign(secret);
}

export async function verifyExportToken(
  token: string
): Promise<{ userId: string }> {
  const { payload } = await jwtVerify(token, secret);
  if (payload.purpose !== "export" || !payload.sub) {
    throw new Error("Invalid token");
  }
  return { userId: payload.sub };
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
