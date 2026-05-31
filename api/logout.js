const { clearSessionCookie, setSecurityHeaders } = require("./_auth");

module.exports = async function logoutHandler(request, response) {
  setSecurityHeaders(response);

  if (request.method !== "POST") {
    response.status(405).json({ error: "Method not allowed." });
    return;
  }

  response.setHeader("Set-Cookie", clearSessionCookie(request));
  response.status(200).json({ ok: true });
};
