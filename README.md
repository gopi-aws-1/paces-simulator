# PACES Ward

A buildless, responsive PACES23 simulator for GitHub Pages. Eight fictional patient encounters; AI-generated portraits; case-specific scripted patient conversations; optional browser dictation and speech; hidden examination signs; strict wall-clock timing; saved notes; examiner questions and self-review.

## Run

Use Node 22+ for tests: `npm test` and `npm run check`. No npm packages required.

Serve this directory with any static HTTP server, for example `python3 -m http.server 8000`, and open http://localhost:8000. Do not open index.html using file://; browser module security requires HTTP. GitHub Pages provides HTTPS.

## GitHub Pages deployment

1. Create a repository called `paces-simulator` in your GitHub account (public, or a plan supporting private Pages repositories).
2. Upload this directory's contents to the `Movie-date` branch, including `.github/workflows/pages.yml` and `assets/patients.png`.
3. In Settings → Pages, set Source to **GitHub Actions**. Run the deployment workflow if it has not run after this setting changes.
4. The workflow tests the timing engine, packages static files and deploys. The URL normally becomes `https://<username>.github.io/paces-simulator/` only after GitHub confirms a successful deployment.

All asset paths are relative, so project subpaths work. No backend, secret key or external runtime dependency is needed. No analytics are installed.

## Timing contract

A 300-second reading period precedes each 1,200-second station. Five such blocks are 7,500 seconds / 125 minutes. There is an initial reading period and four inter-station intervals, not an additional final interval.

- Station 1: communication 600 s; respiratory examination 360 s + questions 240 s.
- Station 2: consultation 900 s + questions 300 s.
- Station 3: cardiovascular 360+240 s; neurology 360+240 s.
- Station 4: communication 600 s; abdominal 360+240 s.
- Station 5: consultation 900 s + questions 300 s.

The exam is one circuit, ending automatically. Practice offers pause and next phase. Communication has no live examiner questions; its Q&A is debrief material only. Warnings occur at 2 minutes left in patient conversations and 1 minute left in clinical examination. Exact centre announcements and room layouts vary; this is an approximation of the environment, not official delivery software.

The persisted clock catches up after refresh or backgrounding. Browsers cannot sound bells while suspended or when audio is blocked. Keep the tab visible and the device awake. Re-enable audio after refresh. A local static app is not tamper-proof and cannot prevent clock changes or inspection of bundled answer data.

## Content and limitations

Cases are original educational scenarios, not purported recalled questions or predictions. References and sourcing notes are in SOURCES.md and the in-app Sources dialog. Clinical content has not had independent clinician/examiner review. Portraits are fictional and not evidence of examination findings. Clicking actions cannot assess manual examination technique. Review checklists are not official marks or validated pass predictions.

The dialogue engine is deliberately labelled scripted, not a live LLM. It returns authored facts for matching topics and explicitly reports unsupported questions instead of inventing medical facts. It is not a full semantic conversational model. Optional dictation uses browser speech recognition (where available); the browser vendor may process audio. Replies can be read by browser speech synthesis. No real patient information should be entered.

All typed data remain in localStorage on the device. Session exports download locally as JSON. Delete saved session clears the application record. A new session replaces the previous saved session. Storage can be blocked by browser settings. No multi-device sync or accounts.

## Files

- `engine.js`: pure timeline and dialogue logic.
- `cases.js`: eight case definitions, signs, patient facts, Q&A and references.
- `app.js`: UI, persistence, countdown, speech and self-review.
- `style.css`: NHS-inspired blue/white ward design (no official logo).
- `tests/engine.test.js`: timing boundaries, station structure and content checks.

## Image provenance

`assets/patients.png` was generated with the built-in ChatGPT image generator. Prompt: eight equal portraits in a four-column, two-row contact sheet; fictional adults matching the eight case demographics; ordinary clothing; pale-blue UK hospital privacy curtains; realistic soft lighting; no diagnostic signs, logos or text. The sheet is displayed by CSS background positions without editing individual portraits.
