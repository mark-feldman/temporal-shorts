// ===================== Workflow Streams helpers (shared by the scenes of this theme)
// Most of them build chapter 1's components (the stream log, its publishers and its subscriber); the intro reuses
// the PAYMENT UI heading, the outro the running example's events and the offset chips. The scenes cut hard into each
// other: the intro's UI tile turns into chapter 1's subscriber tile (SUB_TILE), and chapter 1's offset copies fly
// into the outro's strip (OFFSET_STRIP).
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
// The six events of the stream, in offset order: their topic, their text and who publishes them, the Workflow code
// itself or the Activity (in batches)
const STREAM_EVENTS = [
  { topic: 'status', text: 'validation started', by: 'code' },
  { topic: 'progress', text: 'checking account', by: 'activity' },
  { topic: 'progress', text: 'balance ok', by: 'activity' },
  { topic: 'status', text: 'validation passed', by: 'code' },
  { topic: 'status', text: 'approval started', by: 'code' },
  { topic: 'progress', text: 'risk check', by: 'activity' },
];

// A topic name as a small lowercase mono tag in its color (HTML), for a log cell
const topicTagHtml = topic => {
  const { color, rgb } = TOPICS[topic];
  return `<div class="mono" style="display:inline-block;font-size:18px;line-height:24px;padding:0 6px;`
    + `border:1px solid ${color};border-radius:var(--rs);background:rgba(${rgb},.18)">${topic}</div>`;
};

// A chip that flies between components: lowercase mono text on a solid fill, a border in `color` (a CSS color)
// over `fill`; 40 px high, its width rounded up to even pixels by fitTag() in update()
function makeChip(root, html, color, fill) {
  return E(root, html, 'mono', {
    fontSize: '18px', lineHeight: '26px', padding: '6px 12px', border: `1px solid ${color}`,
    borderRadius: 'var(--rs)', background: fill, whiteSpace: 'nowrap', textAlign: 'center',
  });
}

// A cell of the stream log, w x h: empty, a dashed slot; filled, a solid border in its topic's color round the
// offset number in large mono, the topic tag and the event's text (see setLogCell)
const LOG_CELL = { w: 116, h: 176 };
function makeLogCell(root, offset, { topic, text }) {
  const cell = E(root,
    '<div class="body" style="padding-top:12px;opacity:0">'
    + `<div class="num mono" style="font-size:44px;line-height:52px">${offset}</div>`
    + `<div style="margin-top:6px">${topicTagHtml(topic)}</div>`
    + `<div style="font-size:18px;line-height:22px;margin-top:10px;padding:0 6px">${text}</div>`
    + '</div>',
    '', {
      width: LOG_CELL.w + 'px', height: LOG_CELL.h + 'px', borderRadius: 'var(--r)', textAlign: 'center',
      border: `1px dashed ${C.lineLight}`,
    });
  cell.body = cell.querySelector('.body');
  cell.num = cell.querySelector('.num');
  cell.topic = TOPICS[topic];
  return cell;
}
// fill: 0 empty to 1 filled (the event's content fades in once the slot turns solid); pulse: 0 to 1, a glow in its
// topic's color and swell of the offset number while it is read out
function setLogCell(cell, fill, pulse = 0) {
  const { color, rgb } = cell.topic;
  cell.style.border = fill > 0 ? `1px solid ${color}` : `1px dashed ${C.lineLight}`;
  cell.style.background = fill > 0 ? `rgba(${rgb},${(0.1 * fill).toFixed(3)})` : 'transparent';
  cell.body.style.opacity = fill;
  cell.num.style.transform = `scale(${1 + 0.22 * pulse})`;
  cell.num.style.textShadow = glowShadow(rgb, pulse, { blur: 18 });
}

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

// The Activity publisher: a tile with its icon, ACTIVITY and its task, size x size
function makeActivityTile(root, task, size) {
  return E(root,
    ICON('bolt', 52, C.ink, 1.6)
    + '<div class="mono" style="font-size:20px;letter-spacing:.1em;padding-left:.1em;margin-top:12px">ACTIVITY</div>'
    + `<div style="font-size:18px;color:var(--slate);margin-top:6px">${task}</div>`,
    'tile', {
      width: size + 'px', height: size + 'px', display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center',
    });
}

// The Workflow, w x h, in TEMPORAL's look: WORKFLOW and its id on a heading row centered headY px under its top
// edge, and STREAM over its log, whose left edge is streamLeft px from the panel's and whose label is centered
// streamY px under its top edge
function makeWorkflowPanel(root, w, h, { headY, streamLeft, streamY }) {
  return E(root,
    `<div style="position:absolute;left:24px;top:${headY - 15}px;height:30px;display:flex;align-items:center;`
    + 'gap:16px"><span class="lbl">Workflow</span>'
    + `<span class="mono" style="font-size:20px">${WORKFLOW_ID}</span></div>`
    + `<div class="lbl" style="position:absolute;left:${streamLeft}px;top:${streamY - 12}px;font-size:18px;`
    + 'line-height:24px">Stream</div>',
    'tile', { width: w + 'px', height: h + 'px', borderColor: C.uv, background: C.temporalSurface });
}
// The Workflow code that publishes to the stream: a violet chip with the code icon
function makeCodeChip(root) {
  return makeChip(root,
    `<span style="display:flex;align-items:center;gap:10px">${ICON('code', 22, C.violet, 1.8)}workflow code</span>`,
    C.violet, 'var(--violet-solid)');
}

// Chapter 1's subscriber tile on screen (its scene's shift included), x y its center, w x h: the intro's PAYMENT UI
// tile turns into it, then chapter 1 opens on it
const SUB_TILE = { x: 1650, y: 545, w: 300, h: 270 };
// The heading of a PAYMENT UI tile, its browser icon and label, top px under the tile's top edge (HTML)
const uiHeadingHtml = top => `<div style="position:absolute;left:20px;top:${top}px;height:32px;display:flex;`
  + `align-items:center;gap:12px">${ICON('browser', 32, C.ink, 1.6)}<span class="lbl">Payment UI</span></div>`;

// The subscriber, w x h: a PAYMENT UI tile with a fixed-width readout of the next offset it asks for (SUB_READOUT),
// then its list of the offsets received, a 3 x 2 grid of dashed slots (SUB_LIST), both from its top left corner;
// tile.slots: the slots, which the scene hides once an offset chip rests on one, so no dash shows round it
const SUB_READOUT = { w: 240, h: 40, top: 66 };
const SUB_LIST = { left: 18, top: 122, w: 80, h: 56, gapX: 12, gapY: 12, font: 26 };
// The center of list slot i in the tile, from its top left corner
const subSlotAt = i => ({
  x: SUB_LIST.left + SUB_LIST.w / 2 + (i % 3) * (SUB_LIST.w + SUB_LIST.gapX),
  y: SUB_LIST.top + SUB_LIST.h / 2 + Math.floor(i / 3) * (SUB_LIST.h + SUB_LIST.gapY),
});
function makeSubscriberTile(root, w, h) {
  const slots = Array.from({ length: 6 }, (_, i) => {
    const at = subSlotAt(i);
    return `<div class="slot" style="position:absolute;left:${at.x - SUB_LIST.w / 2}px;top:${at.y - SUB_LIST.h / 2}px;`
      + `width:${SUB_LIST.w}px;height:${SUB_LIST.h}px;border:1px dashed ${C.lineLight};border-radius:var(--rs)">`
      + '</div>';
  }).join('');
  const tile = E(root,
    uiHeadingHtml(18)
    + slots
    + `<div class="readout mono" style="position:absolute;left:${(w - SUB_READOUT.w) / 2}px;`
    + `top:${SUB_READOUT.top}px;width:${SUB_READOUT.w}px;height:${SUB_READOUT.h}px;line-height:${SUB_READOUT.h - 2}px;`
    + `font-size:20px;color:var(--slate);border:1px solid ${C.line};border-radius:var(--rs);opacity:0"></div>`,
    'tile', { width: w + 'px', height: h + 'px' });
  tile.readout = tile.querySelector('.readout');
  tile.slots = [...tile.querySelectorAll('.slot')];
  return tile;
}
// The readout: "next offset n" at opacity o, swelling as n changes at `changedAt`
function setReadout(tile, t, n, o, changedAt = -1) {
  setHtml(tile.readout, `next offset <span style="color:${C.ink}">${n}</span>`);
  tile.readout.style.opacity = o;
  tile.readout.style.transform = `scale(${swell(t, changedAt, 0.08)})`;
}

// A subscriber's long poll from an offset: a neutral chip; one that waits carries a violet spinner, hidden until
// setPollChip() shows it
function makePollChip(root, from, waits = false) {
  const wait = waits ? `<span class="wait" style="opacity:0">${spinnerRing(18)}</span>` : '';
  const chip = makeChip(root,
    `<span style="display:flex;align-items:center;gap:10px">poll from ${from}${wait}</span>`,
    C.slate, 'var(--surface)');
  chip.wait = chip.querySelector('.wait');
  chip.spin = chip.querySelector('.spin');
  return chip;
}
// A poll chip that waits: wait, the opacity of its spinner, which turns on the ambient clock; failed, its connection
// dropped (red border)
function setPollChip(chip, { wait, failed }) {
  chip.style.borderColor = failed ? C.red : C.slate;
  chip.wait.style.opacity = wait;
  chip.spin.style.transform = `rotate(${G * 400}deg)`;
}
