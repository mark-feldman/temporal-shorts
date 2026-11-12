// ===================== INTRO
// Title on the left; on the right, the payment's seven stages as a column of rows that light up in turn (violet, a
// loop on the ambient clock), and a PAYMENT UI tile beside them, joined by a dashed line, that shows only a "?".
// The block keeps every name declared in this file local to this scene.
{
  const TITLE = { x: 560, y: 515 };
  // the stage rows, w x h, gap px apart, centered on x and on the content frame's middle (y 515): they span y 245-785
  const ROWS = { x: 1240, w: 300, h: 64, gap: 14 };
  const STAGES = ['validation', 'approval', 'funds transfer', 'ledgering', 'verification', 'confirmation',
    'settlement'];
  const rowY = i => 515 + (i - (STAGES.length - 1) / 2) * (ROWS.h + ROWS.gap);
  // the UI tile, centered on y 515, 140 px right of the rows
  const UI = { x: 1660, w: 260, h: 400 };
  // the rows light one after the other, `step` s apart, hold all lit, then start over (ambient loop)
  const LIGHT = { step: 0.6, hold: 1.4 };
  const LOOP = STAGES.length * LIGHT.step + LIGHT.hold;

  scene({
    pre: 1.0,
    subs: [
      {
        text: "A payment runs seven stages. How does a UI show each one while the Workflow is still running?",
        after: 0.8,
      },
    ],
    build(root, s) {
      s.svg = svgLayer(root);
      const x0 = ROWS.x + ROWS.w / 2 + 4, x1 = UI.x - UI.w / 2 - 4;
      s.link = path(s.svg, `M ${x0} 515 L ${x1} 515`, C.slate, 2, false);
      s.link.setAttribute('stroke-dasharray', '8 10');
      s.rows = STAGES.map((stage, i) => {
        const row = E(root,
          `<span class="num mono" style="font-size:20px;color:var(--slate);width:22px">${i + 1}</span>`
          + `<span style="font-size:24px">${stage}</span>`,
          'tile', {
            width: ROWS.w + 'px', height: ROWS.h + 'px', display: 'flex', alignItems: 'center', gap: '16px',
            padding: '0 18px', textAlign: 'left',
          });
        row.num = row.querySelector('.num');
        return row;
      });
      s.ui = E(root,
        '<div style="position:absolute;left:20px;top:22px;height:32px;display:flex;align-items:center;gap:12px">'
        + `${ICON('browser', 32, C.ink, 1.6)}<span class="lbl">Payment UI</span></div>`
        + `<div class="q mono" style="position:absolute;left:0;right:0;top:140px;font-size:140px;line-height:160px;`
        + `color:${C.violet}">?</div>`,
        'tile', { width: UI.w + 'px', height: UI.h + 'px' });
      s.q = s.ui.querySelector('.q');
      s.t = makeTitleBlock(root, 'AN EXPLAINER FOR DEVELOPERS', 'What is a<br>Workflow Stream?',
        'WORKFLOW STREAMS WITH TEMPORAL', { titleFont: 100, titleLineHeight: 1.04 });
    },
    update(t, c, s) {
      rise(s.t, TITLE.x, TITLE.y, P(t, 0.15, 0.9));

      // the stages light up in turn: lit rows turn violet, the current one glows
      const lit = Math.floor((G % LOOP) / LIGHT.step);
      s.rows.forEach((row, i) => {
        const on = i <= lit;
        row.style.borderColor = on ? C.violet : C.line;
        row.style.background = on ? `rgba(${RGB.violet},.14)` : '';
        row.style.boxShadow = i === lit ? glowShadow(RGB.violet, 1, { blur: 18, alpha: 0.45 }) : '';
        row.num.style.color = on ? C.violet : C.slate;
        const p = backPop(t, 0.5 + i * 0.08);
        place(row, ROWS.x, rowY(i), p.s, p.o);
      });

      // the UI, which cannot see them: a "?" that breathes
      const up = backPop(t, 1.1);
      place(s.ui, UI.x, 515, up.s, up.o);
      s.q.style.opacity = 0.6 + 0.4 * Math.sin(G * 2.4) ** 2;
      s.link.style.opacity = P(t, 1.3, 0.4);
    }
  });
}
