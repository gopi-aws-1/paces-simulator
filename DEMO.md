# PACES Ward — simplified client-demo workflow

This branch replaces the crowded dashboard with a focused consultation-first interface.

**Public demo URL after GitHub Pages deploy:** https://gopi-aws-1.github.io/paces-simulator/

## Tomorrow's demo in 60 seconds

1. Open the site and press **Start Full Exam**.
2. Two simulated consultants introduce themselves and speak the briefing. You can ask a question through the microphone or text, skip, or let the briefing finish; **the first patient then starts automatically**.
3. A moving illustrated patient video is shown. Press **Start Talking** and speak through the browser microphone (Chrome or Edge support is recommended). The scripted patient responds aloud, and the transcript appears below. Use **Examine** to reveal relevant fictional physical findings. Press **Next Patient** to advance. Ten patients are included.
4. Choose **Practise One Case** instead to pick one patient and start the consultation immediately.
5. After the last patient, see both simulated consultant feedback perspectives and download your practice record.

This works on static GitHub Pages **without login or payments**, subject to the user's browser supporting speech recognition and speech synthesis. The consultation now uses illustrated talking/blinking faces and prefers distinct male/female device voices; exact voice fidelity depends on the voices installed on the device. If microphone recognition is unavailable, typed questions and patient spoken replies remain possible in compatible browsers.

### Important distinction: demo animation vs genuine live video

Without a video service, the patient video is **an original animated still-portrait video stream**, not the recording or live image of a real human. The voice answers come from authored case facts and will not improvise. Do not describe this as a real human video consultation.

- **Optional live AI speech:** `server/worker.js` issues short-lived OpenAI Realtime credentials. Deploy the Cloudflare Worker with a private `OPENAI_API_KEY` secret; enter the public Worker URL in the site's Optional live AI setup field. This is unscripted spoken AI but still uses the animated video portrait.
- **Optional genuine two-way AI patient video:** Configure Tavus Conversational Video on the same Worker with private `TAVUS_API_KEY`, `TAVUS_PAL_ID` and JSON `TAVUS_FACE_IDS` mapping of each patient ID (0 to 9) to a valid, ethically licensed face. The Worker creates a private Tavus/Daily room using the case facts, and the patient can respond in real time with a moving, synchronised avatar on video. The app uses this video service first if available; otherwise it falls back to OpenAI audio or browser speech. Video room links are created server-side and shut down between patients.
- The Tavus PAL needs to be configured as a **patient role-play actor** before the client demo. The per-case context supplied by the Worker supplements that PAL. Ensure the persona does not volunteer hidden case answers. Test accounts, paid usage and browser camera/microphone permissions.

### Deploy backend

From the `server/` directory:

```bash
npx wrangler login
npx wrangler secret put OPENAI_API_KEY
npx wrangler secret put TAVUS_API_KEY
npx wrangler secret put TAVUS_PAL_ID
npx wrangler secret put TAVUS_FACE_IDS
npx wrangler deploy
```

For `TAVUS_FACE_IDS`, enter a JSON object mapping each fictional patient number to a matching Tavus face ID, for example `{"0":"<your-face-0>","1":"<your-face-1>"}`. Only configured patient IDs will use live Tavus video. OpenAI configuration is independent of Tavus configuration. **Do not add service API keys to GitHub Pages or frontend code.**

Cloudflare rate limiting is present but not sufficient for a public, unlimited paid demo. Before expanding access, protect the endpoint with bot challenge/Turnstile or authentication and strict account spend caps; make sure the video room cannot be abused. Third-party video and AI sessions incur costs. Users should not disclose real patient or confidential health information.

### What the simulator can and cannot assess

- The real MRCP(UK) PACES format has **eight encounters, five stations and two examiners per station**, rather than ten patients. The ten-patient circuit is labelled as *extended practice*.
- The two simulated consultants' automatic observations are evidence coverage hints, **not real NHS consultants or official scores**. With the AI Worker configured, the same two perspectives generate an end-of-case review of recorded interactions.
- A video meeting provider may not return a transcript to this site: in Tavus mode, the conversation happens inside the embedded room, so transcript-based scoring may be limited unless you configure Tavus callbacks/transcripts separately.
- Clinical scenarios remain uncalibrated educational examples; manual technique is not verified by clicking examination actions.

## Mobile voices and animated patients (new)

- The consultation now fits phone screens, including small iPhones: portrait area scales down, typing fields use a 16px mobile-safe font, and the call controls are touch-sized and sticky above the iOS home-indicator safe area.
- Ten fictional patients now have **gender-matched, individually tuned device speech profiles**. On-device male/female selection is best-effort: available voices vary by Safari/iOS/Android, and devices that don't have a matching voice installed may fall back to their default voice. Use the operating system's downloaded enhanced voices for better results.
- The illustrated patient is a **distinct character per case**, with blinking eyes, gentle head motion and lips that move while the patient speaks. This is a stylised avatar, **not video of an actual actor** and not accurate phoneme-level lip-sync; optional Tavus video remains the lifelike-video route.
- With a deployed Cloudflare Worker and private `OPENAI_API_KEY`, the new `/speech` route can use `gpt-4o-mini-tts` for richer, distinct case voices and audio-amplitude-assisted lip movement. The app tries this optional speech route for typed patient replies when the Worker URL is configured. Genuine spontaneous AI voice calls still use the separately configured Realtime route.
- **The cloud Worker is not deployed by GitHub Pages.** The public site without backend credentials still speaks using built-in browser voices, which may sound mechanical. Never expose provider API keys in frontend code. Additional paid API security/quotas are required for public use.

