FSJS: E2E Testing of Routes and Models
===

1. You can use any online resources and refer to any of your prior work, including paired work. Other students' work is off-limits.
1. You have **70** minutes to complete the quiz. Make sure that any commits are made prior to the deadline.

## Process

### Setup

1. Fork the quiz repository
1. Clone your fork locally and `cd` into the repository directory
1. Install dependencies with `npm i`

### Work

Follow the lab requirements listed below, make a commit after each task is complete. 
1. Do not make any commits **after** the allotted time.
1. Do not open your PR **until** time has expired

### Submission

1. Do not make your submission until work time has expired
1. Your quiz is expected to pass both linting and testing via travis
    * Running `npm test` locally will run the same command as travis
    * If your fork is running travis, you should be able to see it passing there prior to submit
1. Open a Pull Request (PR) from your fork to the quiz repository
`master` branch.
1. Submit the `url` of your PR in canvas

## Goal

Write tested E2E routes for a `Story` model. You should only do the work outlined below, do not add any additional routes or model features.

1. You do **not** need to unit test your model.
1. You are not required to use snapshots, but are welcome to do so.
1. While not required for testing, if you want to run your server, rename `.env.example` to `.env`

## Save a Story

The following `JSON` posted (`POST`) to `/api/stories` should save and return a story (with added `_id` and `__v` properties):

```json
{
  "title": "A Tale of Two Tests",
  "description": "A heartening tale of love in the era of testing.",
  "minutes": 30,
  "chapters": [
    "What I Expect",
    ".toBe or .not.toBe",
    "All Green, All Good"
  ],
  "safeForWork": true
}
```

**You will need to add middleware to `app.js` to parse the body!**

## Get a Story

Doing a `GET` to `/api/stories/:id`, with an `_id` of a valid
story should return a full copy (all properties) of the story.

## Get a List of Stories

Doing a `GET` to `/api/stories`, should return JSON like:

```json
[{
  "_id": "<mongo-id-1>",
  "title": "Story 1 Title"
}, {
  "_id": "<mongo-id-2>",
  "title": "Story 2 Title"
}]
```



