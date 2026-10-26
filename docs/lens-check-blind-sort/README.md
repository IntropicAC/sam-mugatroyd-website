# Mindset Test blind sort (2026-10-25)

A second opinion on which statements measure their archetype, from a judge
that hasn't seen Claude's review. ChatGPT sorts each statement under one of
14 unnamed patterns (letters A–N, with the definitions and boundaries from
the design file) without being told the intended answer.

- `prompt-1-sam.md`: Sam's 50 v0.3 statements, shuffled (ids S01–S50).
- `prompt-2-rewrites.md`: the same set with Claude's 9 rewrites in place of
  the questioned statements, shuffled differently (ids T01–T50).
- `key.json`: the answer key and the decision rule, fixed before any results.
  Never paste it into ChatGPT.
- `score.mjs`: scores the runs: `node docs/lens-check-blind-sort/score.mjs results/*.csv`

Run each prompt three times, each in a new ChatGPT Temporary Chat so earlier
Mindset Test chats can't inform it, and save each reply as its own CSV file.
The 41 unchanged statements act as a control: if ChatGPT places fewer than
70% of them correctly, the check can't settle anything.

Applied on 2026-10-25, after one run of each prompt: Q04, Q23, Q29 and Q42 now
use the rewrites in the live v0.3 content. The other five questioned
statements keep Sam's wording, because both versions sorted correctly.
