# MAX Chat

Minimal chat UI for sending and receiving text messages in MAX via [GREEN-API](https://green-api.com/max).

React, TypeScript, Vite, Tailwind CSS, daisyUI, zustand.

## Run locally

```
npm install
npm run dev
```

Open http://localhost:5173 and sign in with `idInstance` and `apiTokenInstance`.

## Usage

1. Sign in with the GREEN-API instance credentials. The instance must be authorized.
2. Enter the recipient phone number (for example `79991234567`) and press `+` to create a chat.
3. Send a text message. Replies appear in the chat automatically.

On sign in the app calls `SetSettings` to enable incoming and outgoing notifications (`webhookUrl` stays empty, notifications are received over HTTP API).

## API methods

`GetStateInstance`, `SetSettings`, `CheckAccount`, `SendMessage`, `ReceiveNotification`, `DeleteNotification`.
