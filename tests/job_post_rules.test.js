import test from "node:test";
import assert from "node:assert/strict";
import { render_markdown } from "../src/lib/portal/markdown.js";
import {
  new_job_form,
  job_form_error,
  normalise_job_post,
} from "../src/lib/portal/job_post_rules.js";

const valid_job = () => ({
  ...new_job_form(),
  title: "Product designer",
  skills: ["Figma"],
  locations: ["in-blr"],
  salary_max: 2500000,
  modes: ["Remote"],
  types: ["Full-time"],
  description: "Design and improve the product with our team.",
});

test("description previews format text without executing supplied HTML", () => {
  const html = render_markdown(
    "## The role\n**Design** with us\n- Research\n- Prototype\n<img src=x onerror=alert(1)>",
  );
  assert.match(html, /<h3>The role<\/h3>/);
  assert.match(html, /<strong>Design<\/strong>/);
  assert.match(html, /<ul><li>Research<\/li><li>Prototype<\/li><\/ul>/);
  assert.ok(!html.includes("<img"));
  assert.ok(html.includes("&lt;img"));
});

test("free posts discard paid-only settings and remain unlisted", () => {
  const result = normalise_job_post({
    ...valid_job(),
    company: "forma",
    payment: "credits",
    salary_hidden: true,
    application: "External",
    external_url: "https://example.com/apply",
  });
  assert.equal(result.company, "");
  assert.equal(result.payment, "personal");
  assert.equal(result.application, "Easy apply");
  assert.equal(result.salary_hidden, false);
  assert.equal(result.external_url, "");
  assert.equal(result.unlisted, true);
});

test("remote jobs still require locations and a real salary budget", () => {
  assert.equal(job_form_error(valid_job()), "");
  assert.match(job_form_error({ ...valid_job(), locations: [] }), /location/);
  for (const salary_max of [0, -1, Infinity, ""])
    assert.match(job_form_error({ ...valid_job(), salary_max }), /salary/);
});

test("skill and experience limits apply when reviewing a job", () => {
  assert.match(
    job_form_error({ ...valid_job(), skills: Array(16).fill("Skill") }),
    /15 skills/,
  );
  for (const min_experience of [-1, 100, 1.5])
    assert.match(
      job_form_error({ ...valid_job(), min_experience }),
      /whole number/,
    );
  assert.equal(
    job_form_error({ ...valid_job(), min_experience: 0, rounds: 0 }),
    "",
  );
});

test("external applications require an HTTPS URL without embedded credentials", () => {
  const form = { ...valid_job(), tier: "Premium", application: "External" };
  for (const external_url of [
    "https://",
    "http://example.com",
    "javascript:alert(1)",
    "https://name:secret@example.com",
  ])
    assert.match(job_form_error({ ...form, external_url }), /HTTPS/);
  assert.equal(
    job_form_error({ ...form, external_url: "https://example.com/jobs/123" }),
    "",
  );
  assert.equal(
    normalise_job_post({ ...form, company: "", payment: "credits" }).payment,
    "personal",
  );
});
