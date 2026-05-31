const crypto = require("node:crypto");

const COOKIE_NAME = "triploom_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

function getAuthConfig() {
  return {
    demoEmail: process.env.DEMO_EMAIL || "demo@triploom.ai",
    demoPassword: process.env.DEMO_PASSWORD || "Triploom@123",
    secret: process.env.AUTH_SECRET || "triploom-local-dev-secret"
  };
}

function timingSafeEqual(left, right) {
  const leftBuffer = Buffer.from(String(left));
  const rightBuffer = Buffer.from(String(right));
  if (leftBuffer.length !== rightBuffer.length) return false;
  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function sign(value, secret) {
  return crypto.createHmac("sha256", secret).update(value).digest("base64url");
}

function createSessionToken(email) {
  const { secret } = getAuthConfig();
  const expiresAt = Date.now() + SESSION_MAX_AGE_SECONDS * 1000;
  const payload = Buffer.from(JSON.stringify({ email, expiresAt })).toString("base64url");
  return `${payload}.${sign(payload, secret)}`;
}

function readCookie(request, name) {
  const cookieHeader = request.headers.cookie || "";
  return cookieHeader
    .split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

function verifySessionToken(token) {
  if (!token || !token.includes(".")) return null;

  const { secret } = getAuthConfig();
  const [payload, signature] = token.split(".");
  if (!payload || !signature || !timingSafeEqual(signature, sign(payload, secret))) return null;

  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!session.email || Number(session.expiresAt) <= Date.now()) return null;
    return session;
  } catch {
    return null;
  }
}

function getSession(request) {
  return verifySessionToken(readCookie(request, COOKIE_NAME));
}

function isAuthenticated(request) {
  return Boolean(getSession(request));
}

function sessionCookie(token, request) {
  const isSecure = request.headers["x-forwarded-proto"] === "https" || process.env.VERCEL;
  return [
    `${COOKIE_NAME}=${token}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${SESSION_MAX_AGE_SECONDS}`,
    isSecure ? "Secure" : ""
  ].filter(Boolean).join("; ");
}

function clearSessionCookie(request) {
  const isSecure = request.headers["x-forwarded-proto"] === "https" || process.env.VERCEL;
  return [
    `${COOKIE_NAME}=`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=0",
    isSecure ? "Secure" : ""
  ].filter(Boolean).join("; ");
}

function validateCredentials(email, password) {
  const { demoEmail, demoPassword } = getAuthConfig();
  return timingSafeEqual(String(email).toLowerCase(), demoEmail.toLowerCase()) &&
    timingSafeEqual(password, demoPassword);
}

function setSecurityHeaders(response) {
  response.setHeader("Cache-Control", "no-store");
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("Referrer-Policy", "no-referrer");
}

module.exports = {
  clearSessionCookie,
  createSessionToken,
  getSession,
  isAuthenticated,
  setSecurityHeaders,
  sessionCookie,
  validateCredentials
};
