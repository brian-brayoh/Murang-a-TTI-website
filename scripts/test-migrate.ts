import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { mapWpPost, classify, originalImage, htmlToText, decodeEntities, extractImages, extractFileLinks, type WpPost } from "../lib/wp-migrate";

const fx = JSON.parse(readFileSync("scripts/fixtures/test-posts.json", "utf8")).posts as WpPost[];
const m = fx.map((p) => mapWpPost(p));

assert.equal(decodeEntities("A &amp; B &#8211; C &#x2019;"), "A & B – C ’");
assert.equal(originalImage("https://x.ke/a/tree-1024x684.jpg"), "https://x.ke/a/tree.jpg");
assert.equal(originalImage("https://x.ke/a/plain.jpg"), "https://x.ke/a/plain.jpg");
assert.equal(htmlToText("<p>One</p><p>Two<br>three</p>"), "One\n\nTwo\nthree");

assert.deepEqual(m.map((x) => x.kind), ["news", "tender", "document", "job", "notice"]);
assert.equal(m[0].title, "Tree planting at Maliki Dam – World Environment Day");
assert.equal(m[0].body.startsWith("Trainees & staff planted trees."), true);
assert.deepEqual(m[0].images, [
  "https://murangatech.ac.ke/wp-content/uploads/2026/06/tree.jpg",
  "https://murangatech.ac.ke/wp-content/uploads/2026/06/tree2.jpg",
]);
assert.equal(m[0].createdAt, "2026-09-12T07:00:00.000Z");
assert.equal(m[1].createdAt, "2026-08-01T06:00:00.000Z"); // +03:00 fallback
assert.equal(m[0].author, "Admin");
assert.equal(m[1].files[0].url, "https://murangatech.ac.ke/wp-content/uploads/2026/08/tender-doc.pdf");
assert.equal(m[1].files[0].label, "Tender doc"); // "Download" replaced
assert.equal(m[1].body, "Bids close soon."); // file block removed from text
assert.equal(m[2].files[0].url, "https://murangatech.ac.ke/wp-content/uploads/2026/07/fee-structure.pdf"); // relative -> absolute
assert.equal(m[2].files[0].label, "Fee structure 2026");
assert.ok(m[0].excerpt.length <= 181);
assert.equal(classify("Exam timetable Nov"), "notice");
assert.equal(classify("Graduation ceremony highlights"), "news");
assert.equal(extractImages("<p>none</p>").length, 0);
assert.equal(extractFileLinks("<a href='x.html'>x</a>").length, 0);
const emb = extractFileLinks('<iframe src="https://docs.google.com/viewer?url=https%3A%2F%2Fmurangatech.ac.ke%2Fwp-content%2Fuploads%2F2025%2F07%2Ftimetable.pdf&embedded=true"></iframe><object data="/wp-content/uploads/2025/07/other.pdf"></object>');
assert.deepEqual(emb.map((f) => f.url), ["https://murangatech.ac.ke/wp-content/uploads/2025/07/timetable.pdf", "https://murangatech.ac.ke/wp-content/uploads/2025/07/other.pdf"]);
console.log("migrate mapper: all assertions passed");
