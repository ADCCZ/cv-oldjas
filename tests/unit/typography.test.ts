/**
 * Unit tests of lib/typography – the no-break spaces that keep lone words and prepositions off line ends.
 * Run with `npm run test:unit` (Node's own test runner on type stripping, no bundler).
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { glueArrows, keepCompounds, nbsp, prose, typeset, widont } from "../../lib/typography.ts";

const NBSP = String.fromCharCode(0xa0);
const WORD_JOINER = String.fromCharCode(0x2060);
/** Writes the expected text with "~" for a no-break space, which keeps the assertions readable. */
const t = (text: string) => text.replaceAll("~", NBSP);

describe("nbsp", () => {
  it("glues one-letter Czech prepositions and conjunctions to the next word", () => {
    assert.equal(nbsp("Bydlím v Plzni a u lesa", "cs"), t("Bydlím v~Plzni a~u~lesa"));
  });

  it("handles the start of the text, parentheses and Czech quotes", () => {
    assert.equal(nbsp("V Plzni (s kytarou) „k ohni“", "cs"), t("V~Plzni (s~kytarou) „k~ohni“"));
  });

  it("collapses several spaces after the letter into one no-break space", () => {
    assert.equal(nbsp("zdar a  sbohem", "cs"), t("zdar a~sbohem"));
  });

  it("leaves one-letter endings of longer words alone", () => {
    assert.equal(nbsp("Praha a Brno", "cs"), t("Praha a~Brno"));
  });

  it("does nothing in English", () => {
    assert.equal(nbsp("I see a cat", "en"), "I see a cat");
  });
});

describe("widont", () => {
  it("joins the last two words of running text", () => {
    assert.equal(widont("one two three four five six"), t("one two three four five~six"));
  });

  it("leaves short labels for CSS balancing", () => {
    assert.equal(widont("one two three four five"), "one two three four five");
  });

  it("leaves a tail too long for a narrow column", () => {
    const text = "one two three four five abcdefghijklmnopqrstuvwxyz";
    assert.equal(widont(text), text);
  });
});

describe("glueArrows", () => {
  it("keeps every arrow on the line of its word", () => {
    assert.equal(glueArrows("Live demo ↗ and → next ↓"), t("Live demo~↗ and~→ next~↓"));
  });
});

describe("keepCompounds", () => {
  it("puts a word joiner after the hyphen of a short compound", () => {
    assert.equal(keepCompounds("a self-service kiosk"), `a self-${WORD_JOINER}service kiosk`);
  });

  it("lets long compounds and chains of hyphens break as usual", () => {
    assert.equal(keepCompounds("a special-purpose machine"), "a special-purpose machine");
    assert.equal(keepCompounds("state-of-the-art code"), "state-of-the-art code");
  });

  it("leaves single values such as locale codes untouched", () => {
    assert.equal(keepCompounds("en-GB"), "en-GB");
  });
});

describe("prose", () => {
  it("combines the Czech spaces, the glued arrow and the last two words", () => {
    assert.equal(
      prose("Pracuji v týmu a vidím věci až do posledního detailu →", "cs"),
      t("Pracuji v~týmu a~vidím věci až do posledního~detailu~→"),
    );
  });

  it("keeps compounds only when asked to", () => {
    assert.equal(prose("part-time role", "en"), "part-time role");
    assert.equal(prose("part-time role", "en", { compounds: true }), `part-${WORD_JOINER}time role`);
  });
});

describe("typeset", () => {
  it("typesets every string in nested objects and arrays and keeps other values", () => {
    const value = { title: "k ohni", items: ["s kytarou", { text: "v lese" }], count: 3, link: null };
    assert.deepEqual(typeset(value, "cs"), {
      title: t("k~ohni"),
      items: [t("s~kytarou"), { text: t("v~lese") }],
      count: 3,
      link: null,
    });
  });
});
