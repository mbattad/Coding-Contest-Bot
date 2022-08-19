# Coding Contest Helper Bot
*(last edit on 19/08/22)*

A helper bot to manage coding contests in a Discord server. Currently only one contest at a time is supported.

We assume "advent of code" style judging, in which questions provide a problem statement and **one input**. Users
write their solutions independently, then can submit their program's output.

## Functions
The bot can:
- Register participants for a contest
- Deregister participants for a contest
- Submit responses to a question (WIP)

## Command Glossary
### /register
This command adds a user to the table of participants. Soon it will assign them a role to be notified when questions are posted.

### /deregister
This command deletes a user's entry in the table of participants.

### /submit [question] [solution]
This command takes two arguments: a question identifier and a solution. It currently doesn't interact with the database.
