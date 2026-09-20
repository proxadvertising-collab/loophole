# AGENTS.md

## How to work in this repo

- Always run from the repo root. Never launch in $HOME and ask the human to describe the repo.
- Read this file at session start. Don't ask the human to re-explain the stack.
- Reference files with @path, like @src/lib/deals.ts. Never paste whole files into chat.
- Multi-file work: use /plan first, get approval, then write code.
- Don't invent APIs, props, or file paths. Verify against the repo and node_modules before writing code.
- Don't paste session transcripts into Notion or anywhere else to "recover" context. If context is lost, re-read the repo.
- Product decisions live in the Notion Projects pages. This file is for how to work, not what to build.
- The agent should never need a Notion transcript or chat history to do its job. If it does, the repo docs are incomplete. Fix them here.
- Explain everything in plain human language. No jargon, no code dumps unless asked.

## Jev decision layer

- Routing, scoring, risk-checking, and "which approach" decisions go to Jev via the API, not frontier reasoning. Jev proposes, code disposes.
- Endpoint: POST https://api.typesafe.ai/v1/systemone. Key comes from the environment. Never hardcode it.
- Dev calls: is this diff risky, which implementation approach, does this need human review, is this tool call necessary.

## Token discipline (Jev gate active)

A PreToolUse hook asks Jev whether each tool call is necessary before it runs.
Work with it, not around it:

- If a call is denied as redundant, do not reissue it with slightly
  different arguments. Find another way or move on.
- Prefer fewer, bigger tool calls over many small speculative ones.
- Keep responses concise. No preamble, no play-by-play of tool calls,
  no summary of what you just did unless asked.
- For narrow decisions (which approach, is this diff risky, should this
  escalate to the human), call the TypeSafe API directly instead of
  reasoning it out in the big model. Judgments are Jev's job.
- When context gets long, start a fresh session instead of dragging a
  marathon thread. Long sessions are the #1 token burner.
