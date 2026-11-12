// ===================== Workflow Streams helpers (shared by the scenes of this theme)
// The running example, and what crosses the hard cuts between the scenes: the intro's UI tile turns into chapter 1's
// subscriber tile (SUB_TILE, with its PAYMENT UI heading), and chapter 1's offset copies fly into the outro's strip
// (OFFSET_STRIP). Chapter 1's own components are in its scene file.
// Extra stroke icons (24 grid), in the hand-drawn style of engine.js
Object.assign(ICONS, {
  // a browser window: its frame, the tab bar and two dots on it
  browser: '<rect x="3" y="4" width="18" height="16"/><path d="M3 8.5h18M6.5 6.3h.01M9.5 6.3h.01"/>',
});

// The running example: payment-7731 publishes to two topics, each with its color (and RGB triplet, for tints) and
// the solid fill of a chip of that color, which must not show what it flies over
const WORKFLOW_ID = 'payment-7731';
const TOPICS = {
  status: { color: C.violet, rgb: RGB.violet, solid: 'var(--violet-solid)' },
  progress: { color: C.uv, rgb: RGB.uv, solid: 'var(--uv-solid)' },
};
// The six events of the stream, in offset order: their topic and their text
const STREAM_EVENTS = [
  { topic: 'status', text: 'validation started' },
  { topic: 'progress', text: 'checking account' },
  { topic: 'progress', text: 'balance ok' },
  { topic: 'status', text: 'validation passed' },
  { topic: 'status', text: 'approval started' },
  { topic: 'progress', text: 'risk check' },
];

// An offset received, as a small chip in its topic's color holding the offset number: the copies that travel back
// to the subscriber, its list, the outro's strip
function makeOffsetChip(root, offset, topic, size) {
  const { color, solid } = TOPICS[topic];
  const chip = E(root, String(offset), 'mono', {
    textAlign: 'center', border: `1px solid ${color}`, borderRadius: 'var(--rs)', background: solid,
  });
  sizeOffsetChip(chip, size);
  return chip;
}
// An offset chip's size, w x h px, and the font size of its number: chapter 1's copies take the strip's size as they
// fly into it
function sizeOffsetChip(chip, { w, h, font }) {
  Object.assign(chip.style, { width: w + 'px', height: h + 'px', lineHeight: (h - 2) + 'px', fontSize: font + 'px' });
}
// The outro's strip of offset chips on screen (scene shifts included): six square chips, size px, pitch px apart,
// centered on x 960, their centers on the line y, at the tagline-to-logo gap (about 80 px) above the end card's
// title; chapter 1's copies fly into it, then the outro opens on it
const OFFSET_STRIP = { y: 278, size: 64, pitch: 76, font: 28 };
const stripX = i => 960 + (i - (STREAM_EVENTS.length - 1) / 2) * OFFSET_STRIP.pitch;

// Chapter 1's subscriber tile on screen (its scene's shift included), x y its center, w x h: the intro's PAYMENT UI
// tile turns into it, then chapter 1 opens on it
const SUB_TILE = { x: 1650, y: 545, w: 300, h: 270 };
// The heading of a PAYMENT UI tile, its browser icon and label, top px under the tile's top edge (HTML)
const uiHeadingHtml = top => `<div style="position:absolute;left:20px;top:${top}px;height:32px;display:flex;`
  + `align-items:center;gap:12px">${ICON('browser', 32, C.ink, 1.6)}<span class="lbl">Payment UI</span></div>`;
