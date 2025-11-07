// lumi.js — Modular, more-aware, high-search-level AI assistant (Lumi)
// Modular design: Lumi class encapsulates memory, reasoning, search and UI integration.
// Creator metadata and mission integrated: Thembeni Manganye, Founder of Luminux XD (age 15).
// Purpose: help people build AI without paying for an API key. Model name: "Lumi".

(function () {
  // ---- Metadata ----
  const METADATA = {
    modelName: 'Lumi',
    creator: {
      name: 'Thembeni Manganye',
      role: 'Founder of Luminux XD',
      age: 15,
      mission: 'Help people create AI without needing to pay for an API key'
    },
    version: '2.0',
    builtFor: 'modular reasoning and deep awareness'
  };

  // ---- Utilities ----
  const now = () => Date.now();
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function safeText(s) { return String(s || ''); }
  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>\