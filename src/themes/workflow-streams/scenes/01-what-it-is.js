// ===================== 1. WHAT A WORKFLOW STREAM IS
// The Workflow payment-7731 in the middle, its stream log of six offset slots; the Activity on its left, the
// PAYMENT UI subscriber on its right. The Workflow code and the Activity (in batches) publish to the topics status and
// progress, one offset count across both; the UI attaches by Workflow ID and long-polls from an offset, waits on the
// next one, drops, reconnects from offset 4 and misses nothing. A UV tag closes: no broker, the log lives in the
// Workflow.
// Opens on the PAYMENT UI tile that the intro ends on (SUB_TILE), the rest of the cast coming in round it. At the end,
// everything but the six copies in the UI's list recedes, and the copies fly into the outro's strip (OFFSET_STRIP):
// the outro opens on that frame.
// The block keeps every name declared in this file local to this scene.
{
  // A topic name as a small lowercase mono tag in its color (HTML), for a log cell
  const topicTagHtml = topic => {
    const { color, rgb } = TOPICS[topic];
    return `<div class="mono" style="display:inline-block;font-size:18px;line-height:24px;padding:0 6px;`
      + `border:1px solid ${color};border-radius:var(--rs);background:rgba(${rgb},.18)">${topic}</div>`;
  };

  // A chip that flies between components: lowercase mono text on a solid fill, a border in `color` (a CSS color)
  // over `fill`; 40 px high, its width rounded up to even pixels by fitTag() in update()
  const makeChip = (root, html, color, fill) => E(root, html, 'mono', {
    fontSize: '18px', lineHeight: '26px', padding: '6px 12px', border: `1px solid ${color}`,
    borderRadius: 'var(--rs)', background: fill, whiteSpace: 'nowrap', textAlign: 'center',
  });

  // A cell of the stream log, w x h: empty, a dashed slot; filled, a solid border in its topic's color round the
  // offset number in large mono, the topic tag and the event's text (see setLogCell)
  const LOG_CELL = { w: 116, h: 176 };
  const makeLogCell = (root, offset, { topic, text }) => {
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
  };
  // fill: 0 empty to 1 filled (the event's content fades in once the slot turns solid); pulse: 0 to 1, a glow in its
  // topic's color and swell of the offset number while it is read out
  const setLogCell = (cell, fill, pulse) => {
    const { color, rgb } = cell.topic;
    cell.style.border = fill > 0 ? `1px solid ${color}` : `1px dashed ${C.lineLight}`;
    cell.style.background = fill > 0 ? `rgba(${rgb},${(0.1 * fill).toFixed(3)})` : 'transparent';
    cell.body.style.opacity = fill;
    cell.num.style.transform = `scale(${1 + 0.22 * pulse})`;
    cell.num.style.textShadow = glowShadow(rgb, pulse, { blur: 18 });
  };

  // The Activity publisher: a tile with its icon, ACTIVITY and its task, size x size
  const makeActivityTile = (root, task, size) => E(root,
    ICON('bolt', 52, C.ink, 1.6)
    + '<div class="mono" style="font-size:20px;letter-spacing:.1em;padding-left:.1em;margin-top:12px">ACTIVITY</div>'
    + `<div style="font-size:18px;color:var(--slate);margin-top:6px">${task}</div>`,
    'tile', {
      width: size + 'px', height: size + 'px', display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center',
    });

  // The Workflow, w x h, in TEMPORAL's look: WORKFLOW and its id on a heading row centered headY px under its top
  // edge, and STREAM over its log, whose left edge is streamLeft px from the panel's and whose label is centered
  // streamY px under its top edge
  const makeWorkflowPanel = (root, w, h, { headY, streamLeft, streamY }) => E(root,
    `<div style="position:absolute;left:24px;top:${headY - 15}px;height:30px;display:flex;align-items:center;`
    + 'gap:16px"><span class="lbl">Workflow</span>'
    + `<span class="mono" style="font-size:20px">${WORKFLOW_ID}</span></div>`
    + `<div class="lbl" style="position:absolute;left:${streamLeft}px;top:${streamY - 12}px;font-size:18px;`
    + 'line-height:24px">Stream</div>',
    'tile', { width: w + 'px', height: h + 'px', borderColor: C.uv, background: C.temporalSurface });
  // The Workflow code that publishes to the stream: a chip in the status topic's color with the code icon
  const makeCodeChip = root => makeChip(root,
    '<span style="display:flex;align-items:center;gap:10px">'
    + `${ICON('code', 22, TOPICS.status.color, 1.8)}workflow code</span>`,
    TOPICS.status.color, TOPICS.status.solid);

  // The subscriber, SUB_TILE's size: a PAYMENT UI tile with a fixed-width readout of the next offset it asks for
  // (SUB_READOUT), then its list of the offsets received, a 3 x 2 grid of dashed slots (SUB_LIST), both from its top
  // left corner; tile.slots: the slots, which the scene hides once an offset chip rests on one, so no dash shows
  // round it
  const SUB_READOUT = { w: 240, h: 40, top: 66 };
  const SUB_LIST = { left: 18, top: 122, w: 80, h: 56, gapX: 12, gapY: 12, font: 26 };
  // The center of list slot i in the tile, from its top left corner
  const subSlotAt = i => ({
    x: SUB_LIST.left + SUB_LIST.w / 2 + (i % 3) * (SUB_LIST.w + SUB_LIST.gapX),
    y: SUB_LIST.top + SUB_LIST.h / 2 + Math.floor(i / 3) * (SUB_LIST.h + SUB_LIST.gapY),
  });
  const makeSubscriberTile = root => {
    const slots = Array.from({ length: 6 }, (_, i) => {
      const at = subSlotAt(i);
      return `<div class="slot" style="position:absolute;left:${at.x - SUB_LIST.w / 2}px;`
        + `top:${at.y - SUB_LIST.h / 2}px;width:${SUB_LIST.w}px;height:${SUB_LIST.h}px;`
        + `border:1px dashed ${C.lineLight};border-radius:var(--rs)"></div>`;
    }).join('');
    const tile = E(root,
      uiHeadingHtml(18)
      + slots
      + `<div class="readout mono" style="position:absolute;left:${(SUB_TILE.w - SUB_READOUT.w) / 2}px;`
      + `top:${SUB_READOUT.top}px;width:${SUB_READOUT.w}px;height:${SUB_READOUT.h}px;`
      + `line-height:${SUB_READOUT.h - 2}px;font-size:20px;color:var(--slate);border:1px solid ${C.line};`
      + 'border-radius:var(--rs);opacity:0"></div>',
      'tile', { width: SUB_TILE.w + 'px', height: SUB_TILE.h + 'px' });
    tile.readout = tile.querySelector('.readout');
    tile.slots = [...tile.querySelectorAll('.slot')];
    return tile;
  };
  // The readout: "next offset n" at opacity o, swelling as n changes at `changedAt`
  const setReadout = (tile, t, n, o, changedAt) => {
    setHtml(tile.readout, `next offset <span style="color:${C.ink}">${n}</span>`);
    tile.readout.style.opacity = o;
    tile.readout.style.transform = `scale(${swell(t, changedAt, 0.08)})`;
  };

  // A subscriber's long poll from an offset: a neutral chip; one that waits carries a violet spinner, hidden until
  // setPollChip() shows it
  const makePollChip = (root, from, waits = false) => {
    const wait = waits ? `<span class="wait" style="opacity:0">${spinnerRing(18)}</span>` : '';
    const chip = makeChip(root,
      `<span style="display:flex;align-items:center;gap:10px">poll from ${from}${wait}</span>`,
      C.slate, 'var(--surface)');
    chip.wait = chip.querySelector('.wait');
    chip.spin = chip.querySelector('.spin');
    return chip;
  };
  // A poll chip that waits: wait, the opacity of its spinner, which turns on the ambient clock; failed, its
  // connection dropped (red border)
  const setPollChip = (chip, { wait, failed }) => {
    chip.style.borderColor = failed ? C.red : C.slate;
    chip.wait.style.opacity = wait;
    chip.spin.style.transform = `rotate(${G * 400}deg)`;
  };

  // Layout, in stage px before the shift: the Workflow panel (x 400-1240) between the Activity (x 120-300) and the
  // UI (x 1500-1800). In the panel, top to bottom: the heading row with the code chip on its right (HEAD_Y), STREAM
  // over the log (STREAM_Y), the lane the Activity's batches travel along (LANE_Y, level with the Activity's center
  // and with its line, which runs to the panel's left edge), the log's six cells (CELL_Y, 128 px apart, x 442-1198),
  // and the poll row under them (POLL_Y), on the line that joins the UI. The UI tile is SUB_TILE, less the scene's
  // shift (SHIFT_Y): its top is level with the cells' top, its bottom with the panel's.
  // The composition spans y 240-782 with the closing tag: SHIFT_Y centers it on y 515.
  const SHIFT_Y = 4;
  const PANEL = { x0: 400, x1: 1240, y0: 240, y1: 676 };
  const HEAD_Y = 290, STREAM_Y = 332, LANE_Y = 376, CELL_Y = 494, POLL_Y = 632;
  const cellX = i => 500 + i * 128;
  const CELL_BOTTOM = CELL_Y + LOG_CELL.h / 2;
  const ACTIVITY = { x: 210, size: 180 };
  const CODE = { x: 1112, y: HEAD_Y };
  const UI = {
    x0: SUB_TILE.x - SUB_TILE.w / 2, x1: SUB_TILE.x + SUB_TILE.w / 2,
    y0: SUB_TILE.y - SHIFT_Y - SUB_TILE.h / 2, y1: SUB_TILE.y - SHIFT_Y + SUB_TILE.h / 2,
  };
  // the middle of the gap between the panel and the UI: the connection's label and the DISCONNECTED tag
  const GAP_X = (PANEL.x1 + UI.x0) / 2;
  // the connection's label, LINK_LABEL.w px wide (even: it rests on whole pixels), centered 72 px above the poll row:
  // 20 px clear of the 56 px high copies that travel along the row
  const LINK_LABEL = { w: 160, y: POLL_Y - 72 };
  // where a poll pops in, beside the UI
  const POLL_FROM_X = 1420;
  // the closing tag, 40 px under the panel
  const NO_BROKER_Y = PANEL.y1 + 40 + 33;
  // a list slot of the UI, on the stage
  const slotAt = i => {
    const at = subSlotAt(i);
    return { x: UI.x0 + at.x, y: UI.y0 + at.y };
  };
  // the copies of the events travel back at constant speed (px/s), each leaving `step` s after the previous one: a
  // train along the poll row, in offset order. Route: down out of its cell, along the row and the line to dropX,
  // short of the UI, down to belowY, under the UI tile (12 px clear of its bottom edge), along to under its list slot,
  // then up into it. Each copy enters the list from below, so it never passes over a copy already there.
  const COPY = { speed: 1300, step: 0.3, dropX: UI.x0 - 60, belowY: UI.y1 + 12 + SUB_LIST.h / 2 };
  const copyRoute = i => {
    const slot = slotAt(i);
    return [[cellX(i), CELL_BOTTOM], [cellX(i), POLL_Y], [COPY.dropX, POLL_Y], [COPY.dropX, COPY.belowY],
      [slot.x, COPY.belowY], [slot.x, slot.y]];
  };
  const routeLength = points => points.slice(1)
    .reduce((sum, p, k) => sum + Math.hypot(p[0] - points[k][0], p[1] - points[k][1]), 0);

  // Beats, in seconds from the cue of each subtitle
  // sub 1: the cells show; the code publishes offset 0; the Activity's batch carries offsets 1 and 2
  const T1 = { cells: 0.2, publish0: 1.0, batch: 2.3 };
  // sub 2: the code publishes offset 3; the offsets 0 to 3 pulse as the subtitle reads them
  const T2 = { publish3: 0.4, pulse: 2.3, pulseStep: 0.22 };
  // sub 3: the line draws, its label and the readout show; poll from 0, the copies of 0 to 3, then poll from 4 waits
  const T3 = { connect: 0.2, label: 0.6, poll0: 1.1, copies: 2.4, poll4: 4.4 };
  // sub 4: the connection drops; offset 4 (code) and 5 (batch) land; the UI reconnects and polls from 4; the copies
  // of 4 and 5; the closing tag
  const T4 = { drop: 0.2, publish4: 0.7, batch: 1.2, reconnect: 2.8, poll4: 3.1, copies: 4.2, noBroker: 5.5 };

  // A status event published by the code: it pops on the code chip at `at` and flies to its cell (flyChip), whose
  // fill starts at at + STATUS_LAND, as the chip is absorbed there.
  const STATUS_LAND = 0.5;
  // An Activity batch: one chip pops in at the end of the Activity's line, its left edge on the panel's, travels
  // along the lane until it is over its cells, and splits there into one chip per event, which drop into their cells.
  // Its cells fill at at + BATCH_LAND.
  const BATCH_LAND = 1.25;
  const flyBatch = (batch, t, at) => {
    const xs = batch.offsets.map(cellX);
    const overX = (xs[0] + xs[xs.length - 1]) / 2;
    const fromX = PANEL.x0 + batch.chip.offsetWidth / 2;
    fly(batch.chip, t, at, fromX, LANE_Y, at + 0.15, 0.7, overX, LANE_Y, at + 0.85, overX, LANE_Y);
    batch.parts.forEach((part, k) => fly(part, t, at + 0.85, overX, LANE_Y, at + 0.9, 0.4, xs[k], CELL_Y, at + 1.3,
      xs[k], CELL_Y));
  };
  // A poll: it pops beside the UI at `at`, then slides along the line and the poll row to x
  const pollX = (t, at, x) => lerp(POLL_FROM_X, x, P(t, at + 0.15, 0.7));

  // The ending, from END_BEFORE seconds before the end of the scene: everything but the copies recedes, shrinking a
  // little round the composition's center as it fades (restD, restK); the copies leave the list one after the
  // other, in offset order (copies, copyStep, copyD), and fly into the outro's strip, taking its size. The last one
  // lands 0.1 s before the cut.
  const END_BEFORE = 1.5;
  const END = { restD: 0.6, restK: 0.08, copies: 0.2, copyStep: 0.08, copyD: 0.8 };

  scene({
    chapter: 1, title: 'What a Workflow Stream is',
    sources: [{ label: 'Workflow Streams (Temporal docs)', url: 'https://docs.temporal.io/workflow-streams' }],
    shift: [0, SHIFT_Y],
    // hard cuts: the intro ends on this chapter's first frame (the UI tile alone, at SUB_TILE), this chapter on the
    // outro's (the six copies in OFFSET_STRIP)
    fadeIn: 0, fadeOut: 0,
    // presenter mode holds on the final frame, then plays the ending into the outro in one go
    holdBeforeEnd: END_BEFORE,
    subs: [
      { text: "A <b>Workflow Stream</b> is an event log inside a Workflow: publishers add events to named topics." },
      { text: "Each event gets the next <b>offset</b>: 0, 1, 2, 3, one count across every topic." },
      {
        text: "A subscriber attaches by Workflow ID and long-polls from an offset: it gets every event from there on.",
      },
      // a long hold on the final frame (about 2.5 s), for a presenter to talk over, then the ending
      { text: "If the UI drops, events keep arriving; it reconnects from offset 4 and misses nothing.", after: 3.4 },
    ],
    build(stage, s) {
      // everything but the copies in one layer, which recedes as a whole at the ending; its scale centers on the
      // composition's
      const root = s.rest = E(stage, '', 'layer', { transformOrigin: `960px ${515 - SHIFT_Y}px` });
      s.svg = svgLayer(root);
      // the Activity's line, from its tile to the panel's left edge, where its batches pop in
      s.activityLink = path(s.svg, `M ${ACTIVITY.x + ACTIVITY.size / 2 + 4} ${LANE_Y} L ${PANEL.x0} ${LANE_Y}`,
        C.slate, 2, false);
      // the subscriber's connection, drawn from the UI to the panel; its red dashed twin while it is down
      const lineD = `M ${UI.x0 - 2} ${POLL_Y} L ${PANEL.x1 + 2} ${POLL_Y}`;
      s.link = path(s.svg, lineD, C.slate, 3, false);
      s.broken = path(s.svg, lineD, C.red, 3, false);
      s.broken.setAttribute('stroke-dasharray', '10 12');

      s.panel = makeWorkflowPanel(root, PANEL.x1 - PANEL.x0, PANEL.y1 - PANEL.y0, {
        headY: HEAD_Y - PANEL.y0, streamLeft: cellX(0) - LOG_CELL.w / 2 - PANEL.x0, streamY: STREAM_Y - PANEL.y0,
      });
      s.activity = makeActivityTile(root, 'funds check', ACTIVITY.size);
      s.ui = makeSubscriberTile(root);
      s.cells = STREAM_EVENTS.map((event, i) => makeLogCell(root, i, event));
      s.code = makeCodeChip(root);

      s.linkLabel = E(root,
        '<div class="lbl" style="font-size:18px;line-height:24px">Workflow ID</div>'
        + `<div class="mono" style="font-size:18px;line-height:24px">${WORKFLOW_ID}</div>`,
        '', { width: LINK_LABEL.w + 'px', textAlign: 'center' });
      s.down = fixedTag(root, 'Disconnected', 'red solid', null);
      Object.assign(s.down.style, { fontSize: '18px', lineHeight: '26px', padding: '6px 12px 6px calc(12px + .1em)' });

      // the publishers' chips, which also say who publishes each offset: one per status event, one per batch with one
      // part per event it carries
      const { status, progress } = TOPICS;
      s.status = [0, 3, 4].map(i => ({ i, chip: makeChip(root, 'status', status.color, status.solid) }));
      s.batches = [[1, 2], [5]].map(offsets => ({
        offsets,
        chip: makeChip(root, `batch: ${offsets.length} event${offsets.length > 1 ? 's' : ''}`, progress.color,
          progress.solid),
        parts: offsets.map(() => makeChip(root, 'progress', progress.color, progress.solid)),
      }));
      // the polls: from 0, from 4 (it waits, then drops with the connection), from 4 again after the reconnect
      s.poll0 = makePollChip(root, 0);
      s.pollWait = makePollChip(root, 4, true);
      s.pollAgain = makePollChip(root, 4);
      s.noBroker = fixedTag(root, 'No broker: the log lives in the Workflow', 'uv big', null);
      s.chips = [s.code, s.down, s.noBroker, ...s.status.map(e => e.chip),
        ...s.batches.flatMap(b => [b.chip, ...b.parts]), s.poll0, s.pollWait, s.pollAgain];

      // one copy per offset, which stays in its list slot once there, over the rest: at the ending, it flies on alone
      s.copies = STREAM_EVENTS.map((event, i) => makeOffsetChip(stage, i, event.topic,
        { w: SUB_LIST.w, h: SUB_LIST.h, font: SUB_LIST.font }));
    },
    update(t, c, s) {
      s.chips.forEach(fitTag);
      const at1 = k => c[0] + T1[k], at2 = k => c[1] + T2[k], at3 = k => c[2] + T3[k], at4 = k => c[3] + T4[k];

      const endAt = this.dur - END_BEFORE;

      // the cast round the UI, which the intro left in place: the panel fades in, the Activity pops in, the
      // Activity's link draws, the code chip shows
      place(s.panel, (PANEL.x0 + PANEL.x1) / 2, (PANEL.y0 + PANEL.y1) / 2, 1, P(t, 0.05, 0.4));
      const ap = backPop(t, 0.2);
      const statusAts = [at1('publish0'), at2('publish3'), at4('publish4')];
      const batchAts = [at1('batch'), at4('batch')];
      const activityK = batchAts.reduce((k, at) => k * swell(t, at, 0.06), 1);
      place(s.activity, ACTIVITY.x, LANE_Y, ap.s * activityK, ap.o);
      draw(s.activityLink, P(t, 0.4, 0.3));
      place(s.ui, (UI.x0 + UI.x1) / 2, (UI.y0 + UI.y1) / 2);
      const codeK = statusAts.reduce((k, at) => k * swell(t, at, 0.08), 1);
      const cp = popIn(t, 0.35);
      place(s.code, CODE.x, CODE.y, cp.s * codeK, cp.o);

      // the log: six empty slots, each filling as its event lands; the offsets 0 to 3 pulse as the subtitle reads them
      const fillAts = [];
      s.status.forEach(({ i }, k) => { fillAts[i] = statusAts[k] + STATUS_LAND; });
      s.batches.forEach(({ offsets }, k) => offsets.forEach(i => { fillAts[i] = batchAts[k] + BATCH_LAND; }));
      s.cells.forEach((cell, i) => {
        const pulseAt = at2('pulse') + i * T2.pulseStep;
        const pulse = i < 4 ? Math.max(0, 1 - Math.abs(t - pulseAt) / 0.25) : 0;
        setLogCell(cell, P(t, fillAts[i], 0.25), pulse);
        place(cell, cellX(i), CELL_Y, 1 + 0.06 * bumpAt(t, fillAts[i]), P(t, at1('cells') + i * 0.06, 0.25));
      });

      // the publishers
      s.status.forEach(({ i, chip }, k) => flyChip(chip, t, statusAts[k], CODE.x, CODE.y, cellX(i), CELL_Y));
      s.batches.forEach((batch, k) => flyBatch(batch, t, batchAts[k]));

      // the connection: drawn as the UI attaches, red and dashed while it is down, drawn again on the reconnect
      const reconnected = t >= at4('reconnect');
      const linkP = reconnected ? P(t, at4('reconnect'), 0.4) : P(t, at3('connect'), 0.5);
      draw(s.link, linkP, reconnected ? 1 : 1 - P(t, at4('drop'), 0.15));
      s.broken.style.opacity = win(t, at4('drop'), at4('reconnect'), 0.15);
      const lp = popIn(t, at3('label'));
      const downDim = 1 - 0.6 * win(t, at4('drop'), at4('reconnect'), 0.15);
      place(s.linkLabel, GAP_X, LINK_LABEL.y, lp.s, lp.o * downDim);
      const dp = popIn(t, at4('drop') + 0.15);
      place(s.down, GAP_X, POLL_Y + 44, dp.s, dp.o * (1 - P(t, at4('reconnect'), 0.3)));

      // poll from 0: slides under offset 0 and is taken in there
      const p0 = backPop(t, at3('poll0'), 0.35);
      const p0In = P(t, at3('poll0') + 0.9, 0.3, easeIn);
      place(s.poll0, pollX(t, at3('poll0'), cellX(0)), POLL_Y, p0.s * (1 - 0.6 * p0In), p0.o * (1 - p0In));
      // poll from 4: slides under the empty slot 4 and waits there (the long poll), until the connection drops
      const pw = backPop(t, at3('poll4'), 0.35);
      const dropped = P(t, at4('drop') + 0.1, 0.4);
      setPollChip(s.pollWait, { wait: P(t, at3('poll4') + 0.9, 0.2), failed: t >= at4('drop') });
      place(s.pollWait, pollX(t, at3('poll4'), cellX(4)), POLL_Y + 20 * dropped, pw.s, pw.o * (1 - dropped));
      // poll from 4 again, after the reconnect: slot 4 and 5 are filled, so it is answered at once
      const pa = backPop(t, at4('poll4'), 0.35);
      const paIn = P(t, at4('poll4') + 0.9, 0.3, easeIn);
      place(s.pollAgain, pollX(t, at4('poll4'), cellX(4)), POLL_Y, pa.s * (1 - 0.6 * paIn), pa.o * (1 - paIn));

      // the copies: 0 to 3 answer the first poll, 4 and 5 the poll after the reconnect; each one stays in its slot
      const arrivals = s.copies.map((copy, i) => {
        const leaveAt = i < 4 ? at3('copies') + i * COPY.step : at4('copies') + (i - 4) * COPY.step;
        const route = copyRoute(i);
        const arriveAt = leaveAt + routeLength(route) / COPY.speed;
        const [x, y] = pointAlong(route, (t - leaveAt) / (arriveAt - leaveAt));
        const pop = popIn(t, leaveAt);
        // the ending: from its list slot to its place in the outro's strip, taking the strip's size on the way
        const out = P(t, endAt + END.copies + i * END.copyStep, END.copyD);
        sizeOffsetChip(copy, {
          w: lerp(SUB_LIST.w, OFFSET_STRIP.size, out), h: lerp(SUB_LIST.h, OFFSET_STRIP.size, out),
          font: lerp(SUB_LIST.font, OFFSET_STRIP.font, out),
        });
        place(copy, lerp(x, stripX(i), out), lerp(y, OFFSET_STRIP.y - SHIFT_Y, out), pop.s * swell(t, arriveAt, 0.1),
          pop.o);
        return arriveAt;
      });
      // the readout counts the copies in: the next offset the UI asks for
      const arrived = arrivals.filter(at => t >= at);
      setReadout(s.ui, t, arrived.length, P(t, at3('label'), 0.3), arrived.length ? Math.max(...arrived) : -1);
      // the slots show as the panel comes in; a slot with its copy resting on it hides its dashed outline, so every
      // received entry looks solid
      const slotsO = P(t, 0.2, 0.4);
      s.ui.slots.forEach((slot, i) => { slot.style.opacity = t >= arrivals[i] ? 0 : slotsO; });

      // the closing tag, under the composition
      const nb = backPop(t, at4('noBroker'));
      place(s.noBroker, 960, NO_BROKER_Y, nb.s, nb.o);

      // the ending: the rest recedes, under the copies flying off
      const leave = P(t, endAt, END.restD, easeIn);
      s.rest.style.opacity = 1 - leave;
      s.rest.style.transform = leave > 0 ? `scale(${1 - END.restK * leave})` : '';
    }
  });
}
