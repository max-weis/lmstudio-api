# LMStudio API Demo

This is a demo project to show how to use the LMStudio js library to interact with the LMStudio API.

## Getting Started

Run the following commands to get the http API started:

```bash
deno install
deno deno serve -A main.ts
```

## Test Calls

You can test the API by running the following curl commands:

```bash
curl -X POST -F "image=@receipt1.png" http://localhost:8000/upload/receipt1.png | jq
```

or

```bash
curl -X POST -F "image=@receipt2.png" http://localhost:8000/upload/receipt2.png | jq
```
