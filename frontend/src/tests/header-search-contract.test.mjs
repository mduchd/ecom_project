import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const srcDir = resolve(__dirname, "..");

const headerSource = readFileSync(resolve(srcDir, "components", "Header.jsx"), "utf8");
const shopSource = readFileSync(resolve(srcDir, "pages", "Shop.jsx"), "utf8");

assert.match(
  shopSource,
  /searchParams\.get\(["']search["']\)/,
  "Shop must hydrate the toolbar search state from the search URL parameter."
);

assert.match(
  headerSource,
  /getProducts/,
  "Header search must fetch product suggestions for its dropdown."
);

assert.match(
  headerSource,
  /suggestions\.map/,
  "Header search must render a suggestions dropdown."
);

for (const field of ["imageUrl", "name", "brand", "category", "stockQuantity"]) {
  assert.match(
    headerSource,
    new RegExp(`product\\.${field}`),
    `Suggestion rows must display product.${field}.`
  );
}

assert.match(
  headerSource,
  /discountPrice/,
  "Suggestion rows must display sale/discount pricing information when present."
);

console.log("Header search contract passed.");
