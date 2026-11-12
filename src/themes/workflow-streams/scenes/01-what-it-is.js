// ===================== 1. WHAT A WORKFLOW STREAM IS
// The Workflow payment-7731 in the middle, its stream log of six offset slots; the Activity on its left, the
// PAYMENT UI subscriber on its right. The Workflow code and the Activity (in batches) publish to the topics status and
// progress, one offset count across both; the UI attaches by Workflow Id and long-polls from an offset, waits on the
// next one, drops, reconnects from offset 4 and misses nothing. A UV tag closes: no broker, the log lives in the
// Workflow.
// The block keeps every name declared in this file local to this scene.
{
  // Layout, in stage px before the shift: the Workflow panel (x 400-1240) between the Activity (x 120-300) and the
  // UI (x 1500-1800). In the panel, top to bottom: the heading row with the code chip on its right (HEAD_Y), STREAM
  // over the log (STREAM_Y), the lane the Activity's batches travel along (LANE_Y, level with the Activity's center:
  // its line enters the panel and ends with an arrow just above and left of slot 0), the log's six cells (CELL_Y,
  // 128 px apart, x 442-1198), and the poll row under them (POLL_Y), on the line that joins the UI. The UI tile's top
  // is level with the cells' top, its bottom with the panel's.
  const PANEL = { x0: 400, x1: 1240, y0: 240, y1: 676 };
  const HEAD_Y = 290, STREAM_Y = 332, LANE_Y = 376, CELL_Y = 494, POLL_Y = 632;
  const cellX = i => 500 + i * 128;
  const CELL_BOTTOM = CELL_Y + LOG_CELL.h / 2;
  const ACTIVITY = { x: 210, size: 180 };
  const CODE = { x: 1112, y: HEAD_Y };
  const UI = { x0: 1500, x1: 1800, y0: CELL_Y - LOG_CELL.h / 2, y1: PANEL.y1 };
  // the middle of the gap between the panel and the UI: the connection's label and the DISCONNECTED tag
  const GAP_X = (PANEL.x1 + UI.x0) / 2;
  // where a batch pops in, between the Activity and the panel; where a poll pops in, beside the UI
  const BATCH_FROM_X = 350, POLL_FROM_X = 1420;
  // the closing tag, 40 px under the panel
  const NO_BROKER_Y = PANEL.y1 + 40 + 33;
  // a list slot of the UI, on the stage
  const slotAt = i => {
    const at = subSlotAt(i);
    return { x: UI.x0 + at.x, y: UI.y0 + at.y };
  };
  // the copies of the events travel back at constant speed (px/s), each leaving `step` s after the previous one: a
  // train along the poll row, in offset order. Route: down out of its cell, along the row and the line into the UI,
  // then to its list slot.
  const COPY = { speed: 1300, step: 0.3 };
  const copyRoute = i => [[cellX(i), CELL_BOTTOM], [cellX(i), POLL_Y], [UI.x0, POLL_Y], [slotAt(i).x, slotAt(i).y]];
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

  // A status event published by the code: it pops on the code chip at `at`, flies to its cell and is absorbed there.
  // Its cell fills at at + STATUS_LAND.
  const STATUS_LAND = 0.6;
  const flyStatus = (chip, t, at, i) => fly(chip, t, at, CODE.x, CODE.y, at + 0.1, 0.55, cellX(i), CELL_Y, at + 0.65,
    cellX(i), CELL_Y);
  // An Activity batch: one chip pops between the Activity and the panel, travels along the Activity's line and on
  // along the lane until it is over its cells, and splits there into one chip per event, which drop into their cells.
  // Its cells fill at at + BATCH_LAND.
  const BATCH_LAND = 1.25;
  const flyBatch = (batch, t, at) => {
    const xs = batch.offsets.map(cellX);
    const overX = (xs[0] + xs[xs.length - 1]) / 2;
    fly(batch.chip, t, at, BATCH_FROM_X, LANE_Y, at + 0.15, 0.7, overX, LANE_Y, at + 0.85, overX, LANE_Y);
    batch.parts.forEach((part, k) => fly(part, t, at + 0.85, overX, LANE_Y, at + 0.9, 0.4, xs[k], CELL_Y, at + 1.3,
      xs[k], CELL_Y));
  };
  // A poll: it pops beside the UI at `at`, then slides along the line and the poll row to x
  const pollX = (t, at, x) => lerp(POLL_FROM_X, x, P(t, at + 0.15, 0.7));

  scene({
    chapter: 1, title: 'What a Workflow Stream is',
    sources: [{ label: 'Workflow Streams (Temporal docs)', url: 'https://docs.temporal.io/workflow-streams' }],
    // the composition spans y 240-782 with the closing tag: centered on y 515
    shift: [0, 4],
    subs: [
      { text: "A <b>Workflow Stream</b> is an event log inside a Workflow: publishers add events to named topics." },
      { text: "Each event gets the next <b>offset</b>: 0, 1, 2, 3, one count across every topic." },
      {
        text: "A subscriber attaches by Workflow Id and long-polls from an offset: it gets every event from there on.",
      },
      // a long hold on the final frame, for a presenter to talk over
      { text: "If it drops, events keep arriving; it reconnects from offset 4 and misses nothing.", after: 2.5 },
    ],
    build(root, s) {
      s.svg = svgLayer(root);
      // the Activity's line runs into the panel and points at the stream, just above and left of slot 0
      const laneEnd = cellX(0) - LOG_CELL.w / 2 - 6;
      s.activityLink = path(s.svg, `M ${ACTIVITY.x + ACTIVITY.size / 2 + 4} ${LANE_Y} L ${laneEnd} ${LANE_Y}`,
        C.slate, 2);
      // the subscriber's connection, drawn from the UI to the panel; its red dashed twin while it is down
      const lineD = `M ${UI.x0 - 2} ${POLL_Y} L ${PANEL.x1 + 2} ${POLL_Y}`;
      s.link = path(s.svg, lineD, C.slate, 3, false);
      s.broken = path(s.svg, lineD, C.red, 3, false);
      s.broken.setAttribute('stroke-dasharray', '10 12');

      s.panel = makeWorkflowPanel(root, PANEL.x1 - PANEL.x0, PANEL.y1 - PANEL.y0, {
        headY: HEAD_Y - PANEL.y0, streamLeft: cellX(0) - LOG_CELL.w / 2 - PANEL.x0, streamY: STREAM_Y - PANEL.y0,
      });
      s.activity = makeActivityTile(root, 'funds check', ACTIVITY.size);
      s.ui = makeSubscriberTile(root, UI.x1 - UI.x0, UI.y1 - UI.y0);
      s.cells = STREAM_EVENTS.map((event, i) => makeLogCell(root, i, event));
      s.code = makeCodeChip(root);

      s.linkLabel = E(root,
        '<div class="lbl" style="font-size:18px;line-height:24px">Workflow ID</div>'
        + `<div class="mono" style="font-size:18px;line-height:24px">${WORKFLOW_ID}</div>`,
        '', { textAlign: 'center' });
      s.down = fixedTag(root, 'Disconnected', 'red solid', null);
      Object.assign(s.down.style, { fontSize: '18px', lineHeight: '26px', padding: '6px 12px 6px calc(12px + .1em)' });

      // the publishers' chips: one per status event, one per batch with one part per event it carries
      s.status = [0, 3, 4].map(i => ({ i, chip: makeChip(root, 'status', C.violet, TOPICS.status.solid) }));
      s.batches = [[1, 2], [5]].map(offsets => ({
        offsets,
        chip: makeChip(root, `batch: ${offsets.length} event${offsets.length > 1 ? 's' : ''}`, C.uv,
          TOPICS.progress.solid),
        parts: offsets.map(() => makeChip(root, 'progress', C.uv, TOPICS.progress.solid)),
      }));
      // the polls: from 0, from 4 (it waits, then drops with the connection), from 4 again after the reconnect
      s.poll0 = makePollChip(root, 0);
      s.pollWait = makePollChip(root, 4, true);
      s.pollAgain = makePollChip(root, 4);
      // one copy per offset, which stays in its list slot once there
      s.copies = STREAM_EVENTS.map((event, i) => makeOffsetChip(root, i, event.topic,
        { w: SUB_LIST.w, h: SUB_LIST.h, font: SUB_LIST.font }));

      s.noBroker = tag(root, 'No broker: the log lives in the Workflow', 'uv big');
      s.chips = [s.code, s.down, ...s.status.map(e => e.chip), ...s.batches.flatMap(b => [b.chip, ...b.parts]),
        s.poll0, s.pollWait, s.pollAgain];
    },
    update(t, c, s) {
      s.chips.forEach(fitTag);
      const at1 = k => c[0] + T1[k], at2 = k => c[1] + T2[k], at3 = k => c[2] + T3[k], at4 = k => c[3] + T4[k];

      // the cast: the panel fades in, the Activity and the UI pop in, the Activity's link draws, the code chip shows
      place(s.panel, (PANEL.x0 + PANEL.x1) / 2, (PANEL.y0 + PANEL.y1) / 2, 1, P(t, 0.05, 0.4));
      const ap = backPop(t, 0.2);
      const statusAts = [at1('publish0'), at2('publish3'), at4('publish4')];
      const batchAts = [at1('batch'), at4('batch')];
      const activityK = batchAts.reduce((k, at) => k * swell(t, at, 0.06), 1);
      place(s.activity, ACTIVITY.x, LANE_Y, ap.s * activityK, ap.o);
      draw(s.activityLink, P(t, 0.4, 0.3));
      const up = backPop(t, 0.3);
      place(s.ui, (UI.x0 + UI.x1) / 2, (UI.y0 + UI.y1) / 2, up.s, up.o);
      const codeK = statusAts.reduce((k, at) => k * swell(t, at, 0.08), 1);
      place(s.code, CODE.x, CODE.y, popIn(t, 0.35).s * codeK, popIn(t, 0.35).o);

      // the log: six empty slots, each filling as its event lands; the offsets 0 to 3 pulse as the subtitle reads them
      const fillAts = [statusAts[0], batchAts[0], batchAts[0], statusAts[1], statusAts[2], batchAts[1]]
        .map((at, i) => at + (STREAM_EVENTS[i].by === 'code' ? STATUS_LAND : BATCH_LAND));
      s.cells.forEach((cell, i) => {
        const pulseAt = at2('pulse') + i * T2.pulseStep;
        const pulse = i < 4 ? Math.max(0, 1 - Math.abs(t - pulseAt) / 0.25) : 0;
        setLogCell(cell, P(t, fillAts[i], 0.25), pulse);
        place(cell, cellX(i), CELL_Y, 1 + 0.06 * bumpAt(t, fillAts[i]), P(t, at1('cells') + i * 0.06, 0.25));
      });

      // the publishers
      s.status.forEach(({ i, chip }, k) => flyStatus(chip, t, statusAts[k], i));
      s.batches.forEach((batch, k) => flyBatch(batch, t, batchAts[k]));

      // the connection: drawn as the UI attaches, red and dashed while it is down, drawn again on the reconnect
      const reconnected = t >= at4('reconnect');
      const linkP = reconnected ? P(t, at4('reconnect'), 0.4) : P(t, at3('connect'), 0.5);
      draw(s.link, linkP, reconnected ? 1 : 1 - P(t, at4('drop'), 0.15));
      s.broken.style.opacity = win(t, at4('drop'), at4('reconnect'), 0.15);
      const lp = popIn(t, at3('label'));
      const downDim = 1 - 0.6 * win(t, at4('drop'), at4('reconnect'), 0.15);
      place(s.linkLabel, GAP_X, POLL_Y - 48, lp.s, lp.o * downDim);
      const dp = popIn(t, at4('drop') + 0.15);
      place(s.down, GAP_X, POLL_Y + 44, dp.s, dp.o * (1 - P(t, at4('reconnect'), 0.3)));

      // poll from 0: slides under offset 0 and is taken in there
      const p0 = backPop(t, at3('poll0'), 0.35);
      const p0In = P(t, at3('poll0') + 0.9, 0.3, easeIn);
      setPollChip(s.poll0);
      place(s.poll0, pollX(t, at3('poll0'), cellX(0)), POLL_Y, p0.s * (1 - 0.6 * p0In), p0.o * (1 - p0In));
      // poll from 4: slides under the empty slot 4 and waits there (the long poll), until the connection drops
      const pw = backPop(t, at3('poll4'), 0.35);
      const dropped = P(t, at4('drop') + 0.1, 0.4);
      setPollChip(s.pollWait, { wait: P(t, at3('poll4') + 0.9, 0.2), failed: t >= at4('drop') });
      place(s.pollWait, pollX(t, at3('poll4'), cellX(4)), POLL_Y + 20 * dropped, pw.s, pw.o * (1 - dropped));
      // poll from 4 again, after the reconnect: slot 4 and 5 are filled, so it is answered at once
      const pa = backPop(t, at4('poll4'), 0.35);
      const paIn = P(t, at4('poll4') + 0.9, 0.3, easeIn);
      setPollChip(s.pollAgain);
      place(s.pollAgain, pollX(t, at4('poll4'), cellX(4)), POLL_Y, pa.s * (1 - 0.6 * paIn), pa.o * (1 - paIn));

      // the copies: 0 to 3 answer the first poll, 4 and 5 the poll after the reconnect; each one stays in its slot
      const arrivals = s.copies.map((copy, i) => {
        const leaveAt = i < 4 ? at3('copies') + i * COPY.step : at4('copies') + (i - 4) * COPY.step;
        const route = copyRoute(i);
        const arriveAt = leaveAt + routeLength(route) / COPY.speed;
        const [x, y] = pointAlong(route, (t - leaveAt) / (arriveAt - leaveAt));
        const pop = popIn(t, leaveAt);
        place(copy, x, y, pop.s * swell(t, arriveAt, 0.1), pop.o);
        return arriveAt;
      });
      // the readout counts the copies in: the next offset the UI asks for
      const arrived = arrivals.filter(at => t >= at);
      setReadout(s.ui, t, arrived.length, P(t, at3('label'), 0.3), arrived.length ? Math.max(...arrived) : -1);
      // a slot with its copy resting on it hides its dashed outline, so every received entry looks solid
      s.ui.slots.forEach((slot, i) => { slot.style.opacity = t >= arrivals[i] ? 0 : 1; });

      // the closing tag, under the composition
      const nb = backPop(t, at4('noBroker'));
      place(s.noBroker, 960, NO_BROKER_Y, nb.s, nb.o);
    }
  });
}
