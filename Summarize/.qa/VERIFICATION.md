# Verification

Verified locally on 14 September 2026 with an isolated headless Brave browser through Playwright. The user's browser profile and study progress were not modified.

- 4 chapters, 23 topics, 8 formula groups, 51 glossary entries.
- 5 study days, each 240 minutes, with 20 independently tracked activities.
- 54 file/page references checked against the existing PDF catalog and actual files.
- All linked PDFs returned HTTP 200 and application/pdf; 35 distinct PDF/page links collected from rendered routes.
- A document button opened Course_Detail.pdf in a separate tab with #page=5. Page rendering/fragment support inside native PDF viewers remains viewer-dependent.
- Checkbox check/uncheck, 100% completion, date changes, consecutive dates, persistence after reload: passed.
- Desktop and 390-pixel mobile layouts: no page-wide horizontal overflow across the main views and all four chapters. Diagrams and tables can scroll within their containers.
- Direct lesson anchor navigation and mouse/keyboard formula disclosure controls: passed.
- Direct file opening with networking disabled and progress persistence: passed.
- Disabled-storage fallback remains usable and explains that progress cannot be saved.
- Unknown chapter route shows a recovery link.
- No JavaScript page errors during the browser checks.
- Optional WebMCP registration, valid mutation, readback, and invalid-input rejection tested with an injected mock registry. Native WebMCP browser context was unavailable; no native compatibility claim is made.

Run `node .qa/verify.cjs` from Summarize while the parent EC212 directory is served at http://127.0.0.1:8765. The verification script uses this machine's bundled Playwright and Brave executable; adjust their paths on another machine.

Screenshots in this folder are QA captures, not user state backups. Test screenshots may show completed activities and dates used only by the isolated test browser.
