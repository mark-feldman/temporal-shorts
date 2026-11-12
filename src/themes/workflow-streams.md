# Workflow Streams with Temporal

How a Temporal Workflow Stream lets a UI follow a Workflow's progress live, and
resume from an offset after a disconnect.

[Watch the video](/themes/workflow-streams/)

A payment runs seven stages. How does a UI show each one while the Workflow is
still running?

## Chapter 1: What a Workflow Stream is

[Watch from 0:09](/themes/workflow-streams/#t=9)

A Workflow Stream is an event log inside a Workflow: publishers add events to
named topics. Each event gets the next offset: 0, 1, 2, 3, one count across
every topic. A subscriber attaches by Workflow Id and long-polls from an offset:
it gets every event from there on. If it drops, events keep arriving; it
reconnects from offset 4 and misses nothing.

Source: [Workflow Streams (Temporal docs)](https://docs.temporal.io/workflow-streams)

## Outro

[Watch from 0:38](/themes/workflow-streams/#t=38)

Workflow Streams: live progress from a Workflow, with no broker to run.
