// ===================== OUTRO
// Opens on the strip of six offset chips, 0 to 5 in their topics' colors, that chapter 1's copies fly into
// (OFFSET_STRIP); the end card fades in under it.
// The block keeps every name declared in this file local to this scene.
{
  // the strip and the end card span about y 218-757 before the shift: SHIFT_Y centers them on y 515
  const SHIFT_Y = 28;

  scene({
    pre: 0.4, post: 2.6,
    shift: [0, SHIFT_Y],
    // a hard cut: chapter 1 ends on this scene's first frame
    fadeIn: 0,
    subs: [
      { text: "Workflow Streams: live progress from a Workflow, with no broker to run." },
    ],
    build(root, s) {
      s.t = makeEndCard(root, 'Workflow Streams', 'LIVE PROGRESS FROM YOUR WORKFLOWS', { pill: 'Public Preview' });
      s.cells = STREAM_EVENTS.map((event, i) => makeOffsetChip(root, i, event.topic,
        { w: OFFSET_STRIP.size, h: OFFSET_STRIP.size, font: OFFSET_STRIP.font }));
    },
    update(t, c, s) {
      placeEndCard(s.t, t);
      s.cells.forEach((cell, i) => place(cell, stripX(i), OFFSET_STRIP.y - SHIFT_Y));
    }
  });
}
