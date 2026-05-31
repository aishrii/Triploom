const { createSessionToken, sessionCookie, setSecurityHeaders, validateCredentials } = require("./_auth");

module.exports = async function loginHandler(request, response) {
  setSecurityHeaders(response);

  if (request.method !== "POST") {
    response.status(405).json({ error: "Method not allowed." });
    return;
  }

  const { email = "", password = "" } = request.body || {};
  if (!validateCredentials(email, password)) {
    response.status(401).json({ error: "Incorrect email or password. Please try again." });
    return;
  }

  response.setHeader("Set-Cookie", sessionCookie(createSessionToken(String(email).toLowerCase()), request));
  response.status(200).json({ ok: true });
};
