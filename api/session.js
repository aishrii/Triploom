const { getSession, setSecurityHeaders } = require("./_auth");

module.exports = async function sessionHandler(request, response) {
  setSecurityHeaders(response);

  if (request.method !== "GET") {
    response.status(405).json({ error: "Method not allowed." });
    return;
  }

  const session = getSession(request);
  response.status(200).json({
    authenticated: Boolean(session),
    email: session?.email || null
  });
};
