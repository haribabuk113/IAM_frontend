import { auth_configuration } from "$lib/server/password_auth.js";
export function load({ setHeaders: set_headers }) {
  set_headers({ "cache-control": "no-store" });
  return auth_configuration();
}
