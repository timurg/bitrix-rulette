import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { transform } from "esbuild";

const distDir = resolve("dist");
const sourceFile = resolve(distDir, "index.global.js");
const prettyTarget = resolve(distDir, "prize-wheel.js");
const minTarget = resolve(distDir, "prize-wheel.min.js");

const source = await readFile(sourceFile, "utf8");

function minifyCss(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*([{}:;,>+~()])\s*/g, "$1")
    .replace(/;}/g, "}")
    .trim();
}

function inlineMinifiedCss(bundleSource) {
  return bundleSource.replace(
    /([A-Za-z_$][\w$]*)\.textContent\s*=\s*`([\s\S]*?)`(?=;|\r?\n)/,
    (_, variableName, css) => {
      return `${variableName}.textContent=${JSON.stringify(minifyCss(css))}`;
    }
  );
}

await mkdir(distDir, { recursive: true });
await writeFile(prettyTarget, source, "utf8");

const compactSource = inlineMinifiedCss(source);

const minified = await transform(compactSource, {
  minify: true,
  target: "es2020",
  legalComments: "none"
});

await writeFile(minTarget, minified.code, "utf8");
