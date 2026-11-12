// ===================== OUTRO
// The end card, with a mini stream log above it: six offset cells, 0 to 5 in their topics' colors, that fill left to
// right.
// The block keeps every name declared in this file local to this scene.
{
  // the strip's cells, size px square, pitch px apart, centered on x 960, at the tagline-to-logo gap (about 80 px)
  // above the end card's title
  const STRIP = { y: 250, size: 64, pitch: 76, font: 28 };

  scene({
    pre: 0.4, post: 2.6,
    // the strip and the end card span about y 218-757: centered on y 515
    shift: [0, 28],
    subs: [
      { text: "Workflow Streams: live progress from a Workflow, with no broker to run." },
    ],
    build(root, s) {
      s.t = makeEndCard(root, 'Workflow Streams', 'LIVE PROGRESS FROM YOUR WORKFLOWS', { pill: 'Public Preview' });
      s.cells = STREAM_EVENTS.map((event, i) => makeOffsetChip(root, i, event.topic,
        { w: STRIP.size, h: STRIP.size, font: STRIP.font }));
    },
    update(t, c, s) {
      placeEndCard(s.t, t);
      s.cells.forEach((cell, i) => {
        const p = backPop(t, 0.1 + i * 0.12);
        place(cell, 960 + (i - (s.cells.length - 1) / 2) * STRIP.pitch, STRIP.y, p.s, p.o);
      });
    }
  });
}
