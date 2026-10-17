# PACES Ward — Interactive patient practice

**Client demo:** https://gopi-aws-1.github.io/paces-simulator/

**Improved patient conversations:** The browser-only practice engine now recognises more naturally phrased clinical questions and case-specific follow-ups across all ten fictional patients. Answers remain anchored to the authored case histories, so it still cannot generate wholly open-ended, unscripted dialogue; for that, connect the optional secure realtime AI voice service. A personal dedication to Dr. Jyo appears at the top of every screen.

The main app now has just **two choices**: **Start Full Exam** (two consultant audio briefing, then 10 fictional patients in sequence) or **Practise One Case** (pick a patient and start immediately). Its core screen is a patient video area and Start Talking button, not a text-first dashboard. The patient portrait is an animated browser-generated video stream with spoken script fallback. Optional OpenAI real-time audio and Tavus two-way video can be activated with the protected backend documented in [DEMO.md](DEMO.md).

**Status:** The static demo runs without keys on supported browser speech features. Real unscripted AI speech and actual interactive avatar video need a deployed Worker and paid API credentials. The ten-patient route is extra practice; official PACES has eight encounters, five stations and two examiners at each station. Consultants are simulated, not human examiners, and their feedback is not official marking.

---

## Run

Use Node 22+ for tests: `npm test` and `npm run check`. No npm packages required.

Serve this directory with any static HTTP server, for example `python3 -m http.server 8000`, and open http://localhost:8000. Do not open index.html using file://; browser module security requires HTTP. GitHub Pages provides HTTPS.

## GitHub Pages deployment

1. Create a repository called `paces-simulator` in your GitHub account (public, or a plan supporting private Pages repositories).
2. Upload this directory's contents to the `Movie-date` branch, including `.github/workflows/pages.yml` and `assets/patients.png`.
3. In Settings → Pages, set Source to **GitHub Actions**. Run the deployment workflow if it has not run after this setting changes.
4. The workflow tests the timing engine, packages static files and deploys. The URL normally becomes `https://<username>.github.io/paces-simulator/` only after GitHub confirms a successful deployment.

All asset paths are relative, so project subpaths work. No backend, secret key or external runtime dependency is needed. No analytics are installed.

## New: live speech and two consultants

The official PACES format comprises **eight encounters at five stations with two examiners per station**. The default circuit remains unchanged. The optional extended mode provides **ten fictional patients**: two ten-minute encounters in each station, plus five minutes' reading before each. This extra mode is NOT the official format.

During an encounter, click **Start hands-free browser talk**. On supported browsers, your spoken question is recognised and the scripted patient's answer is read aloud. This fallback works on static GitHub Pages without a login, but the replies are not AI-generated and cannot improvise missing medical facts.

For genuine, interruptible, unscripted **AI voice conversations**, deploy the included Cloudflare Worker under server/. It issues short-lived client secrets and connects the browser to OpenAI Realtime over WebRTC. The two on-screen consultants always display separate clinical and communication observations based on logged evidence; when the Worker is configured, two independent AI assessment requests add feedback in the review. These are simulations, not certified PACES examiners or validated scores. Clicking an examination action cannot measure physical technique.

### Enable the secure voice service

1. Create a Cloudflare Workers project and an OpenAI API project with Realtime access and billing. From the server/ directory run 'npx wrangler login', then 'npx wrangler secret put OPENAI_API_KEY', then 'npx wrangler deploy'.
2. Set ALLOWED_ORIGIN in server/wrangler.toml to the GitHub Pages site's origin. The Worker binds a Cloudflare rate limiter; for public launch, add WAF/Turnstile protections and strict API spend limits. CORS and per-IP rate limiting alone are not enough to prevent abuse.
3. In PACES Ward, paste the deployed HTTPS Worker URL into the optional voice service URL box and save. **Never paste the OpenAI API key into your browser or GitHub.** Microphone access and the model account must work for real conversation.

GitHub Pages deploys the static frontend only. It does not deploy the Worker or provision credentials. Until the server is configured, the browser speaking mode is scripted. Fictional scenarios only; do not enter real patient details or confidential medical records. Browser speech and AI speech may be processed externally.

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
- `cases.js`: eight official-format fictional cases.
- `extra-cases.js`: two bonus practice patients.
- `voice.js`: WebRTC voice and browser hands-free mode.
- `examiner.js`: two simulated observer lenses.
- `server/`: secure voice credentials and AI assessment Worker.
- `app.js`: UI, persistence, countdown, speech and self-review.
- `style.css`: NHS-inspired blue/white ward design (no official logo).
- `tests/engine.test.js`: timing boundaries, station structure and content checks.

## Image provenance

`assets/patients.png` was generated with the built-in ChatGPT image generator. Prompt: eight equal portraits in a four-column, two-row contact sheet; fictional adults matching the eight case demographics; ordinary clothing; pale-blue UK hospital privacy curtains; realistic soft lighting; no diagnostic signs, logos or text. The sheet is displayed by CSS background positions without editing individual portraits.
