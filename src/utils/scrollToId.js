// src/utils/scrollToId.js
export function scrollToId(id, offset = 0) {
  const el = document.getElementById(id);
  if (!el) return;
  const y = Math.max(0, el.getBoundingClientRect().top + window.scrollY - offset);
  window.scrollTo({ top: y, behavior: 'smooth' });
}