import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { createServer as create_vite_server } from "vite";

test("auth pages and server actions follow the IAM contract", async (context) => {
  let reply_status = 401;
  let reply_body = { error: "signin_failed" };
  const requests = [];
  const backend = http.createServer(async (request, response) => {
    let body = "";
    for await (const chunk of request) body += chunk;
    requests.push({ path: request.url, body: JSON.parse(body || "{}") });
    response.writeHead(reply_status, { "Content-Type": "application/json" });
    response.end(JSON.stringify(reply_body));
  });
  await new Promise((resolve) => backend.listen(0, "127.0.0.1", resolve));
  const previous_url = process.env.PUBLIC_IAM_BASE_URL;
  process.env.PUBLIC_IAM_BASE_URL = `http://127.0.0.1:${backend.address().port}`;
  let server;
  context.after(async () => {
    await server?.close();
    backend.closeAllConnections();
    await new Promise((resolve) => backend.close(resolve));
    if (previous_url === undefined) delete process.env.PUBLIC_IAM_BASE_URL;
    else process.env.PUBLIC_IAM_BASE_URL = previous_url;
  });
  server = await create_vite_server({
    server: { port: 0, host: "127.0.0.1", watch: null },
    logLevel: "error",
  });
  await server.listen();
  const origin = `http://127.0.0.1:${server.httpServer.address().port}`;
  const post = (path, values, source = origin) =>
    fetch(origin + path, {
      method: "POST",
      redirect: "manual",
      headers: {
        Accept: "text/html",
        Origin: source,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(values),
    });
  const values = {
    email: "review@example.test",
    password: "sample-only-password",
    full_name: "Preview Reviewer",
    confirm_password: "sample-only-password",
  };

  for (const [route, heading] of [
    ["/login", "Welcome back."],
    ["/signup", "Make yourself known."],
    ["/auth/check-email", "Check your inbox."],
    ["/auth/help", "Forgot your password?"],
  ]) {
    const response = await fetch(origin + route);
    assert.equal(response.status, 200, route);
    const html = await response.text();
    assert.ok(html.includes(heading), route);
  }
  for (const [route, destination] of [
    ["/register", "/signup"],
    ["/signin", "/login"],
  ]) {
    const response = await fetch(origin + route, { redirect: "manual" });
    assert.equal(response.status, 303);
    assert.equal(response.headers.get("location"), destination);
  }
  for (const route of ["/login", "/signup"]) {
    const response = await post(route, values);
    assert.equal(response.status, 405, "Password actions are not available");
    const html = await (await fetch(origin + route)).text();
    assert.ok(!html.includes('type="password"'));
    for (const provider of [
      "Google",
      "Microsoft",
      "LinkedIn",
      "Facebook",
      "GitHub",
      "Discord",
      "GitLab",
      "Snapchat",
    ])
      assert.ok(html.includes(provider));
  }
  assert.equal(requests.length, 0, "No password request reaches IAM");
});
