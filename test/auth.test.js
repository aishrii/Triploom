const test = require("node:test");
const assert = require("node:assert/strict");
const loginHandler = require("../api/login");
const logoutHandler = require("../api/logout");
const sessionHandler = require("../api/session");

function createResponse() {
  return {
    headers: {},
    statusCode: 200,
    body: undefined,
    setHeader(name, value) {
      this.headers[name] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    }
  };
}

test("login rejects wrong credentials", async () => {
  const response = createResponse();
  await loginHandler({
    method: "POST",
    headers: {},
    body: { email: "demo@triploom.ai", password: "wrong" }
  }, response);

  assert.equal(response.statusCode, 401);
  assert.match(response.body.error, /incorrect/i);
  assert.equal(response.headers["Set-Cookie"], undefined);
  assert.equal(response.headers["X-Content-Type-Options"], "nosniff");
});

test("login creates an httpOnly session cookie", async () => {
  const response = createResponse();
  await loginHandler({
    method: "POST",
    headers: {},
    body: { email: "demo@triploom.ai", password: "Triploom@123" }
  }, response);

  assert.equal(response.statusCode, 200);
  assert.match(response.headers["Set-Cookie"], /triploom_session=/);
  assert.match(response.headers["Set-Cookie"], /HttpOnly/);
  assert.match(response.headers["Set-Cookie"], /SameSite=Lax/);
});

test("session reports authenticated users", async () => {
  const loginResponse = createResponse();
  await loginHandler({
    method: "POST",
    headers: {},
    body: { email: "demo@triploom.ai", password: "Triploom@123" }
  }, loginResponse);

  const response = createResponse();
  await sessionHandler({
    method: "GET",
    headers: { cookie: loginResponse.headers["Set-Cookie"] }
  }, response);

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.authenticated, true);
  assert.equal(response.body.email, "demo@triploom.ai");
});

test("logout clears the session cookie", async () => {
  const response = createResponse();
  await logoutHandler({ method: "POST", headers: {} }, response);

  assert.equal(response.statusCode, 200);
  assert.match(response.headers["Set-Cookie"], /Max-Age=0/);
});
