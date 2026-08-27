import { chmod, copyFile, mkdir, readFile, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const bundleRoot = join(projectRoot, "build", "mcpb");
const serverDir = join(bundleRoot, "server");
const dataDir = join(bundleRoot, "data");
const packageJson = JSON.parse(
  await readFile(join(projectRoot, "package.json"), "utf8"),
);
const manifest = JSON.parse(
  await readFile(join(projectRoot, "mcpb", "manifest.json"), "utf8"),
);

if (manifest.version !== packageJson.version) {
  throw new Error(
    `MCPB manifest version ${manifest.version} does not match package version ${packageJson.version}.`,
  );
}

await rm(bundleRoot, { recursive: true, force: true });
await mkdir(serverDir, { recursive: true });
await mkdir(dataDir, { recursive: true });

const entryPoint = join(serverDir, "index.js");
await build({
  entryPoints: [join(projectRoot, "src", "index.ts")],
  outfile: entryPoint,
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node18",
  legalComments: "none",
});

await chmod(entryPoint, 0o755);
await copyFile(
  join(projectRoot, "data", "tarot_card_meanings.csv"),
  join(dataDir, "tarot_card_meanings.csv"),
);
await copyFile(
  join(projectRoot, "mcpb", "manifest.json"),
  join(bundleRoot, "manifest.json"),
);

console.log(`Prepared MCPB bundle directory at ${bundleRoot}`);
