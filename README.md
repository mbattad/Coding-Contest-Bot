# Coding Contest Helper Bot
*(last edit on 20/08/22)*

A helper bot to manage coding contests in a Discord server. Currently only one contest at a time is supported.

We assume "advent of code" style judging, in which questions provide a problem statement and **one input**. Users
write their solutions independently, then can submit their program's output.

## Functions
The bot can:
- Register participants for a contest
- Deregister participants for a contest
- Record users' submitted answers

Features in progress:
- Score users' answers
- Let users request solutions

## Command Glossary
### /register
This command adds a user to the table of participants and assigns them a role that lets them participate in the contest.

![/register command](readme-images/register_example.png)

### /deregister
This command deletes a user's entry in the table of participants and removes their participant role.

![/deregister command](readme-images/deregister_example.png)

### /submit [question] [solution]
This command takes two arguments: a question identifier and a solution. The user's response to the indicated question is recorded in a table.

On a correct answer, the submitter will be allowed to view discussion channels for the question where they can talk about how they solved it.