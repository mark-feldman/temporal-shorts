# Workflow Streams with Temporal

How a Temporal Workflow Stream lets a UI follow a Workflow's progress live, and
resume from an offset after a disconnect.

[Watch the video](/themes/workflow-streams/)

A payment runs seven stages. How does a UI show each one while the Workflow is
still running?

## Chapter 1: What a Workflow Stream is

[Watch from 0:10](/themes/workflow-streams/#t=10)

A Workflow Stream is an event log inside a Workflow: publishers add events to
named topics. Each event gets the next offset: 0, 1, 2, 3, one count across
every topic. A subscriber attaches by Workflow ID and long-polls from an offset:
it gets every event from there on. If the UI drops, the log keeps growing; it
reconnects from offset 4 and misses nothing.

Source: [Workflow Streams (Temporal docs)](https://docs.temporal.io/workflow-streams)

## Outro

[Watch from 0:40](/themes/workflow-streams/#t=40)

Workflow Streams: live progress from a Workflow, with no broker to run.
