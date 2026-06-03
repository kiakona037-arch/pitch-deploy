#!/usr/bin/env node
/* =================================================================================
 * FILE: pitch-deploy/scripts/gen_seedance_videos.mjs
 * MODEL: ByteDance Seedance 2.0 via fal.ai (text/image/reference -> video, native audio)
 * --------------------------------------------------------------------------------
 * LOGIC SUMMARY  (one.md / Sonar Core Operating Matrix applied for a seamless run):
 *  0. RULE 0 (prove-with-data): DRY-RUN BY DEFAULT. Loads + validates the manifest,
 *     prints the exact plan + an APPROX cost estimate, and makes ZERO API calls /
 *     spends $0. Real generation needs the explicit --live flag (verify -> apply).
 *  1. IDEMPOTENT: a shot whose output .mp4 already exists (non-empty) is SKIPPED, so
 *     re-runs never re-spend. --force overrides.
 *  2. RESILIENT (Cynic): each shot is isolated in try/catch — one failure (network,
 *     non-2xx, missing video url, write error) logs an errorCode and the batch keeps
 *     going. Per-request timeout via AbortController.
 *  3. OBSERVABLE (GEMINI.md S9): console.log at every handler start; ASCII-only
 *     [OK]/[FAIL]/[SKIP] signatures; a SELF-VERIFY pass re-stats every expected output
 *     and prints a final RESULT line so success is provable from the log, not narrated.
 *  4. OPTIMAL / no bloated payloads: streams each clip straight to disk; never echoes
 *     API payloads; prints counts only.
 *  5. SECRETS: FAL_KEY read from env ONLY — never a literal, never committed.
 *  6. ASCII-ONLY output (Windows cp1252-safe per GEMINI.md C). No Unicode glyphs.
 *
 * USAGE (run from pitch-deploy/):
 *   node scripts/gen_seedance_videos.mjs                         # DRY-RUN: validate + plan + cost
 *   FAL_KEY=xxx node scripts/gen_seedance_videos.mjs --live      # generate (SPENDS MONEY)
 *   ... --manifest scripts/seedance_manifest.json                # custom manifest
 *   ... --only hero-loop,events-slot                             # subset by id
 *   ... --fast                                                   # force cheaper /fast/ variant
 *   ... --force                                                  # regenerate even if output exists
 *
 * ENDPOINTS: text-to-video | image-to-video (image_url[,end_image_url]) |
 *            reference-to-video (image_urls<=9, video_urls<=3, audio_urls<=3;
 *            use @Image1 refs + "Cut scene to..."/"At 5s..." in the prompt for multi-shot)
 * OUTPUT: scripts/seedance_out/<id>.mp4  (gitignored; web-encode before public/).
 * ================================================================================= */

import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, 'seedance_out');
const FAL_BASE = 'https://fal.run/bytedance/seedance-2.0';

// APPROX pay-per-second rates (USD) for the cost ESTIMATE ONLY.
// VERIFY current pricing on fal.ai — these are ballpark and may drift (Rule 0).
const RATE_PER_SEC = { standard: 0.12, fast: 0.022 };
const REQUEST_TIMEOUT_MS = 15 * 60 * 1000; // generations can take several minutes

const VALID_ENDPOINTS = new Set(['text-to-video', 'image-to-video', 'reference-to-video']);
const VALID_ASPECT = new Set(['auto', '21:9', '16:9', '4:3', '1:1', '3:4', '9:16']);
const VALID_RES = new Set(['480p', '720p']);

function parseArgs(argv) {
  const a = { live: false, fast: false, force: false, manifest: 'scripts/seedance_manifest.json', only: null };
  for (let i = 2; i < argv.length; i++) {
    const t = argv[i];
    if (t === '--live') a.live = true;
    else if (t === '--fast') a.fast = true;
    else if (t === '--force') a.force = true;
    else if (t === '--manifest') a.manifest = argv[++i];
    else if (t === '--only') a.only = (argv[++i] || '').split(',').map((s) => s.trim()).filter(Boolean);
    else console.error(`[args] unknown flag ignored: ${t}`);
  }
  return a;
}

function validateShot(shot, idx) {
  const errs = [];
  const id = shot.id || `shot[${idx}]`;
  if (!shot.id) errs.push(`${id}: missing id`);
  if (!VALID_ENDPOINTS.has(shot.endpoint)) errs.push(`${id}: bad endpoint '${shot.endpoint}'`);
  if (!shot.prompt || !String(shot.prompt).trim()) errs.push(`${id}: empty prompt`);
  if (shot.aspect_ratio && !VALID_ASPECT.has(shot.aspect_ratio)) errs.push(`${id}: bad aspect_ratio '${shot.aspect_ratio}'`);
  if (shot.resolution && !VALID_RES.has(shot.resolution)) errs.push(`${id}: bad resolution '${shot.resolution}'`);
  const d = Number(shot.duration);
  if (shot.duration !== 'auto' && (!Number.isFinite(d) || d < 4 || d > 15)) errs.push(`${id}: duration must be 'auto' or 4-15`);
  if (shot.endpoint === 'image-to-video' && !shot.image_url) errs.push(`${id}: image-to-video needs image_url`);
  if (shot.endpoint === 'reference-to-video' && !(shot.image_urls || shot.video_urls)) errs.push(`${id}: reference-to-video needs image_urls or video_urls`);
  return errs;
}

function isFast(shot, forceFast) {
  return forceFast || shot.fast === true;
}

function modelUrlFor(shot, forceFast) {
  return `${FAL_BASE}${isFast(shot, forceFast) ? '/fast' : ''}/${shot.endpoint}`;
}

function buildBody(shot) {
  const b = { prompt: shot.prompt };
  if (shot.resolution) b.resolution = shot.resolution;
  if (shot.duration) b.duration = String(shot.duration);
  if (shot.aspect_ratio) b.aspect_ratio = shot.aspect_ratio;
  if (shot.generate_audio !== undefined) b.generate_audio = !!shot.generate_audio;
  if (shot.seed !== undefined) b.seed = shot.seed;
  if (shot.endpoint === 'image-to-video') {
    b.image_url = shot.image_url;
    if (shot.end_image_url) b.end_image_url = shot.end_image_url;
  }
  if (shot.endpoint === 'reference-to-video') {
    if (shot.image_urls) b.image_urls = shot.image_urls;
    if (shot.video_urls) b.video_urls = shot.video_urls;
    if (shot.audio_urls) b.audio_urls = shot.audio_urls;
  }
  return b;
}

function estCost(shot, forceFast) {
  const secs = shot.duration === 'auto' ? 10 : Number(shot.duration);
  const rate = isFast(shot, forceFast) ? RATE_PER_SEC.fast : RATE_PER_SEC.standard;
  return secs * rate;
}

async function outExists(id) {
  try {
    const s = await stat(join(OUT_DIR, `${id}.mp4`));
    return s.size > 0;
  } catch {
    return false;
  }
}

async function generateOne(shot, args) {
  console.log(`[gen] start id=${shot.id} endpoint=${shot.endpoint} dur=${shot.duration} ar=${shot.aspect_ratio || 'auto'} audio=${!!shot.generate_audio}`);
  const url = modelUrlFor(shot, args.fast);
  const body = buildBody(shot);
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), REQUEST_TIMEOUT_MS);
  let res;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Key ${process.env.FAL_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
  } finally {
    clearTimeout(timer);
  }
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`HTTP_${res.status}:${txt.slice(0, 160).replace(/\s+/g, ' ')}`);
  }
  const json = await res.json();
  // Defensive: fal sync returns the output directly; some SDKs nest under data.
  const videoUrl = json?.video?.url || json?.data?.video?.url || (Array.isArray(json?.videos) ? json.videos[0]?.url : null);
  if (!videoUrl) throw new Error('NO_VIDEO_URL_IN_RESPONSE');
  const vid = await fetch(videoUrl, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
  if (!vid.ok) throw new Error(`DOWNLOAD_HTTP_${vid.status}`);
  const buf = Buffer.from(await vid.arrayBuffer());
  if (buf.length === 0) throw new Error('EMPTY_DOWNLOAD');
  const dest = join(OUT_DIR, `${shot.id}.mp4`);
  await writeFile(dest, buf);
  console.log(`[gen] done  id=${shot.id} bytes=${buf.length} -> ${dest}`);
  return { dest, bytes: buf.length };
}

async function main() {
  const args = parseArgs(process.argv);
  console.log(`[main] mode=${args.live ? 'LIVE' : 'DRY-RUN'} manifest=${args.manifest} fast=${args.fast} force=${args.force}`);

  const manPath = resolve(process.cwd(), args.manifest);
  let manifest;
  try {
    manifest = JSON.parse(await readFile(manPath, 'utf-8'));
  } catch (e) {
    console.error(`[main] FAIL cannot read/parse manifest ${manPath}: ${e.message}`);
    process.exit(1);
  }

  const defaults = manifest.defaults || {};
  let shots = (manifest.shots || []).map((s) => ({ resolution: defaults.resolution, fast: defaults.fast, ...s }));
  if (args.only) shots = shots.filter((s) => args.only.includes(s.id));
  if (!shots.length) {
    console.error('[main] FAIL no shots to process');
    process.exit(1);
  }

  // VALIDATE before spending a cent (Rule 0).
  const errs = shots.flatMap((s, i) => validateShot(s, i));
  if (errs.length) {
    console.error('[validate] FAIL:');
    errs.forEach((e) => console.error('  - ' + e));
    process.exit(1);
  }

  // PLAN + cost estimate.
  let total = 0;
  console.log(`\n=== PLAN (${shots.length} shots) ===`);
  for (const s of shots) {
    const c = estCost(s, args.fast);
    total += c;
    const tag = isFast(s, args.fast) ? 'fast ' : '     ';
    console.log(`  ${s.id.padEnd(16)} ${tag}${s.endpoint.padEnd(18)} ${String(s.duration).padStart(4)}s ${(s.aspect_ratio || 'auto').padStart(5)} audio=${!!s.generate_audio} ~$${c.toFixed(2)}`);
  }
  console.log('  ' + '-'.repeat(62));
  console.log(`  EST TOTAL ~$${total.toFixed(2)}  (APPROX - verify fal.ai pricing)`);

  if (!args.live) {
    console.log('\n[DRY-RUN] no API calls made, $0 spent. Re-run with --live to generate.');
    console.log(`RESULT: DRY-RUN OK - ${shots.length} shots validated, est ~$${total.toFixed(2)}`);
    return;
  }

  // LIVE path: require the key, then generate.
  if (!process.env.FAL_KEY) {
    console.error('[main] FAIL --live requires the FAL_KEY env var (never hardcode it)');
    process.exit(1);
  }
  await mkdir(OUT_DIR, { recursive: true });

  let ok = 0, skip = 0, fail = 0;
  const failed = [];
  for (const s of shots) {
    if (!args.force && (await outExists(s.id))) {
      console.log(`[SKIP] ${s.id} (output exists; --force to redo)`);
      skip++;
      continue;
    }
    try {
      await generateOne(s, args);
      console.log(`[OK]   ${s.id}`);
      ok++;
    } catch (e) {
      console.error(`[FAIL] ${s.id} errorCode=${e.message}`);
      fail++;
      failed.push(s.id);
    }
  }

  // SELF-VERIFY: re-stat every expected output (prove with data).
  let verified = 0;
  for (const s of shots) if (await outExists(s.id)) verified++;
  console.log('\n=== SUMMARY ===');
  console.log(`  generated=${ok} skipped=${skip} failed=${fail} verified_on_disk=${verified}/${shots.length}`);
  if (failed.length) console.log('  failed_ids: ' + failed.join(','));
  console.log(`RESULT: ${fail === 0 ? 'PASS' : 'PARTIAL'} - ${verified}/${shots.length} clips present in ${OUT_DIR}`);
  if (fail > 0) process.exitCode = 2;
}

main().catch((e) => {
  console.error('[main] UNCAUGHT ' + ((e && e.stack) || e));
  process.exit(1);
});
