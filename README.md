# Coding Contest Helper Bot
*(last edit on 19/08/22)*

A helper bot to manage coding contests in a Discord server. Currently only one contest at a time is supported.

We assume "advent of code" style judging, in which questions provide a problem statement and **one input**. Users
write their solutions independently, then can submit their program's output.

## Functions
The bot can:
- Register participants for a contest
- Deregister participants for a contest
- Submit responses to a question

## Command Glossary
### /register
This command adds a user to the table of participants and assigns them a role that lets them participate in the contest.

### /deregister
This command deletes a user's entry in the table of participants and removes their participant role.

### /submit [question] [solution]
This command takes two arguments: a question identifier and a solution. The user's response to the indicated question is recorded in a table.
