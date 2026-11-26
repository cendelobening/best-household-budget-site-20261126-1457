// Hearth Ledger — a best-household-budget-site entry (Node 22, standard
// library only). The site is this directory's app/ folder: plain static
// files a browser opens at app/index.html (ES modules, CSS, canvas charts,
// no build step, no network). The program hands it in: it copies app/ and
// screenshots/ from beside this file to /output and writes
// /output/dossier.json, the summary the judge reads (screenshots, the first
// load's files and bytes, and the source), with the vendored make.fun
// library. Leave vendor/makefun-frontend.ts as it is: the scorer requires
// dossier.json to be byte for byte what its own copy writes.
//
// This VM's umask is 0007, so a plain copy would leave graded files at
// 0640. Every file this program writes is therefore chmodded to 0644
// explicitly (directories 0755), so the grader can read the output
// whichever umask the run inherits.
//
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { chmodSync, cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Copy a tree, then force world-readable modes on everything it holds:
// files 0644, directories 0755. The copy itself is recursive; the walk
// afterwards only fixes modes, so a rerun over an existing /output stays
// deterministic and byte-identical.
function copyTreeWithModes(src, dest) {
  cpSync(src, dest, { recursive: true });
  const walk = (dir) => {
    chmodSync(dir, 0o755);
    for (const name of readdirSync(dir).sort()) {
      const p = join(dir, name);
      if (statSync(p).isDirectory()) walk(p);
      else chmodSync(p, 0o644);
    }
  };
  walk(dest);
}

mkdirSync(out, { recursive: true });
copyTreeWithModes(join(here, 'app'), join(out, 'app'));
// A reused output directory may hold screenshots from an earlier run that
// this repository no longer ships; clear the destination first so the two
// grader runs write exactly the repository's screenshots and nothing stale.
rmSync(join(out, 'screenshots'), { recursive: true, force: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  copyTreeWithModes(join(here, 'screenshots'), join(out, 'screenshots'));
}

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes
// the bytes; the others refuse an entry the scorer would refuse (more than
// 4 screenshots or one over 256 KiB; more than 993 files and directories
// in app/ or 16 MiB of app files: app/ counts beside /output's own
// 1000-entry cap, its screenshots/ and dossier.json).
const dossierPath = join(out, 'dossier.json');
writeFileSync(
  dossierPath,
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 16777216 }),
);
chmodSync(dossierPath, 0o644);

// Verify the hand-in before exiting: the dossier must exist, and every
// file under /output must be world-readable (0644) — a run that silently
// left a 0640 file behind would fail the grader's read. Fail loudly here
// instead of handing in a broken output.
const verify = (dir) => {
  for (const name of readdirSync(dir).sort()) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) verify(p);
    else if ((st.mode & 0o777) !== 0o644) throw new Error(`output file is not 0644: ${p}`);
  }
};
if (!existsSync(dossierPath)) throw new Error('dossier.json was not written');
verify(out);

// A short summary for the run log: what was handed in and how big the
// dossier is. Written to stdout only — never into /output, so the two
// grader runs stay byte-identical.
const countFiles = (dir) => readdirSync(dir).reduce((n, name) => {
  const p = join(dir, name);
  return n + (statSync(p).isDirectory() ? countFiles(p) : 1);
}, 0);
console.log(`hearth-ledger: app=${countFiles(join(out, 'app'))} files, screenshots=${readdirSync(join(out, 'screenshots')).length}, dossier=${statSync(dossierPath).size} bytes`);
