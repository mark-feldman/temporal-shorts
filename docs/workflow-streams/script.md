# Script and timeline: Workflow Streams

Subtitles are the only narration (no audio). Each subtitle lasts as long
as its text needs (`autoDur` in `src/engine.js`), plus its `after` pause.
Run `make timeline THEME=workflow-streams` for the live values; the start
times below are a snapshot from 2026-11-12.

Each entry gives the subtitle start time and its exact text, then what the
animation shows.

## Audience and goal

Developers learn what a Temporal Workflow Stream is, in one chapter: an
event log inside a Workflow, filled by publishers on named topics, read by
subscribers that long-poll from an offset and resume after a disconnect.
The video is one animation for a forum slide, so it has no recap and no
"What you can build" chapter. The chapter's last frame holds so a presenter
can talk over it.

Running example: a payment Workflow, `payment-7731`, with the topics
`status` (published by the Workflow code) and `progress` (published by an
Activity in batches), read by a PAYMENT UI. No customer name appears.

### Sources

- [Workflow Streams](https://docs.temporal.io/workflow-streams): Public
  Preview; a durable, offset-addressed event log hosted in a Workflow;
  Workflow code appends in memory; Activities and clients buffer events and
  flush each batch as one Signal; a subscriber long-polls from an offset.
- [Java SDK guide](https://docs.temporal.io/develop/java/workflows/workflow-streams)
  and [Go SDK guide](https://docs.temporal.io/develop/go/workflows/workflow-streams):
  offsets are global across all topics, not per topic; a subscriber
  resumes from one past the last offset it consumed.

## Intro

- **0:01** A payment runs seven stages. How does a UI show each one while
  the Workflow is still running?
  - Visuals: Temporal logo, kicker "AN EXPLAINER FOR DEVELOPERS", title
    "What is a Workflow Stream?", tagline "WORKFLOW STREAMS WITH TEMPORAL";
    on the right the seven payment stages (validation, approval, funds
    transfer, ledgering, verification, confirmation, settlement) light up
    in turn beside a PAYMENT UI tile showing a "?".

## 01 What a Workflow Stream is

- **0:09** A Workflow Stream is an event log inside a Workflow: publishers
  add events to named topics.
  - Visuals: ACTIVITY tile ("funds check") on the left, its line running
    to the edge of the WORKFLOW `payment-7731` panel; a "workflow code"
    chip in the panel heading; the STREAM, six empty dashed slots. The
    Workflow code publishes `status` "validation started" into offset 0;
    a "batch: 2 events" chip pops in where the Activity's line meets the
    panel and travels above the log, then splits into `progress`
    "checking account" and "balance ok", offsets 1 and 2.
- **0:15** Each event gets the next offset: 0, 1, 2, 3, one count across
  every topic.
  - Visuals: the Workflow code publishes `status` "validation passed" into
    offset 3; the offsets 0 to 3 pulse in turn, each in its topic's color,
    as the subtitle reads them.
- **0:21** A subscriber attaches by Workflow ID and long-polls from an
  offset: it gets every event from there on.
  - Visuals: the PAYMENT UI connects (WORKFLOW ID `payment-7731` above
    the line); "poll from 0" goes to the log, copies of 0 to 3 travel back
    into the UI's list, "next offset 4"; a second "poll from 4" waits at
    slot 4 with a spinner: the long poll.
- **0:28** If the UI drops, events keep arriving; it reconnects from
  offset 4 and misses nothing.
  - Visuals: the line turns red and dashed, DISCONNECTED; `status`
    "approval started" lands in offset 4 and a one-event batch from the
    Activity, `progress` "risk check", in offset 5; the UI reconnects,
    polls from 4, receives 4 and 5, "next offset 6", its list complete;
    the tag "No broker: the log lives in the Workflow" pops under the
    composition and holds.

## Outro

- **0:38** Workflow Streams: live progress from a Workflow, with no broker
  to run.
  - Visuals: six offset chips colored by topic above the end card
    "Workflow Streams", tagline "LIVE PROGRESS FROM YOUR WORKFLOWS", pill
    "Public Preview", Temporal logo.
