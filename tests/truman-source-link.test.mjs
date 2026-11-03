import test from "node:test";
import assert from "node:assert/strict";
import {
  PARAMOUNT_FILM_URL,
  assertParamountFilmPage,
  verifyParamountFilmPage,
} from "../scripts/verify-truman-paramount.mjs";

const card = `<!doctype html><html><head><title>Paramount</title></head><body>
  <h1>The Truman Show</h1><section><h4>Year</h4><h3>1998</h3>
  <h4>Running Time</h4><h3>104&nbsp;MIN</h3></section></body></html>`;
const page = (overrides = {}) => ({ status: 200, finalUrl: PARAMOUNT_FILM_URL, html: card, ...overrides });

test("Paramount card requires the final film URL and visible title, year and runtime", () => {
  assert.doesNotThrow(() => assertParamountFilmPage(page()));
  assert.doesNotThrow(() => assertParamountFilmPage(page({ finalUrl: `${PARAMOUNT_FILM_URL}/?ref=test` })));
  assert.throws(() => assertParamountFilmPage(page({ status: 404 })), /HTTP 404/);
  assert.throws(() => assertParamountFilmPage(page({ html: card.replace("The Truman Show", "Another Film") })), /title/);
  assert.throws(() => assertParamountFilmPage(page({ html: card.replace("1998", "1999") })), /Year 1998/);
  assert.throws(() => assertParamountFilmPage(page({ html: card.replace("104&nbsp;MIN", "103 MIN") })), /Running Time 104 MIN/);
  assert.throws(() => assertParamountFilmPage(page({ html: card.replace("Running Time", "Unrelated label") })), /Running Time 104 MIN/);
  assert.throws(() => assertParamountFilmPage(page({ html: "<html><head><title>The Truman Show</title></head><body>Other film</body></html>" })), /title/);
  assert.throws(() => assertParamountFilmPage(page({ html: `<body><script>${card}</script>Other film</body>` })), /title/);
});

test("a 200 homepage after redirect is a failure, even if it mentions the film", async () => {
  // Mimic a successful fetch whose followed redirect ended at the homepage. Put
  // every expected text in that page: checking only HTTP or body would pass it.
  const homepage = { status: 200, url: "https://www.paramount.com/", text: async () => card };
  await assert.rejects(verifyParamountFilmPage(async (url, options) => {
    assert.equal(url, PARAMOUNT_FILM_URL);
    assert.equal(options.redirect, "follow");
    return homepage;
  }), /final URL is not the film card/);

  assert.throws(() => assertParamountFilmPage(page({ finalUrl: "https://www.paramountpictures.com/movies/the-truman-show" })), /film card/);
  assert.throws(() => assertParamountFilmPage(page({ finalUrl: "https://www.paramount.com/movies/the-truman-showing" })), /film card/);
  assert.throws(() => assertParamountFilmPage(page({ finalUrl: "http://www.paramount.com/movies/the-truman-show" })), /film card/);
});

test("a valid response passes through the same async verifier used by the CLI", async () => {
  const result = await verifyParamountFilmPage(async () => ({
    status: 200, url: PARAMOUNT_FILM_URL, text: async () => card,
  }));
  assert.deepEqual(result, { finalUrl: PARAMOUNT_FILM_URL, status: 200 });
});
