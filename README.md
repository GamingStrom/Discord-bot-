# Discord Everything Bot — Client Edition

A modular Discord.js v14 bot designed to run on Termux.

## Included modules

- AI chat assistant (`/ai`)
- AI image generation hook (`/imagine`) — requires an image API
- Q&A / writing / spelling help through `/ai`
- Moderation: `/warn`, `/warnings`, `/clear`
- Support tickets: `/ticket`, `/close`
- Announcements: `/announce`
- Welcome messages
- Invite tracking
- Daily social-media update command (`/social`)
- Music-ready command (`/music`) with provider hook
- Server/member information
- Persistent JSON data
- Central configuration
- Termux setup guide

## Requirements

- Android + Termux
- Node.js 20+
- A Discord application/bot
- A Discord server where the bot has been invited
- Optional API keys for AI/image/social/music providers

## Important

The bot token and API keys belong in `.env` only. Never publish `.env` to GitHub or send your private keys to anyone.

## Termux installation

```bash
pkg update -y
pkg install nodejs git unzip -y
cd ~/discord_everything_bot
npm install
cp .env.example .env
nano .env
npm start
```

To stop the bot: `CTRL+C`.

## Discord Developer Portal permissions

Use OAuth2 URL Generator:

Scopes:
- `bot`
- `applications.commands`

Recommended bot permissions:
- View Channels
- Send Messages
- Read Message History
- Manage Messages
- Moderate Members
- Manage Channels
- Embed Links
- Attach Files

For invite tracking, enable the **Server Members Intent** and **Message Content Intent** where required by your chosen features.

## Configuration

Open `.env` and set:

```env
DISCORD_TOKEN=
CLIENT_ID=
GUILD_ID=
OWNER_ID=

AI_API_URL=
AI_API_KEY=
AI_MODEL=

IMAGE_API_URL=
IMAGE_API_KEY=

SOCIAL_API_URL=
SOCIAL_API_KEY=

MUSIC_API_URL=
MUSIC_API_KEY=
```

The external API fields are optional. The bot still starts when they are blank.

## Commands

### General
`/help`, `/ping`, `/serverinfo`, `/userinfo`

### AI
`/ai prompt:<question>`
`/imagine prompt:<description>`

### Moderation
`/warn user:<member> reason:<reason>`
`/warnings user:<member>`
`/clear amount:<1-100>`

### Community
`/ticket`
`/close`
`/announce message:<text>`
`/social message:<text>`
`/invites user:<member>`

### Music
`/music action:<play|pause|resume|stop> query:<text>`

## Client handover

Give the client:
1. This project folder/ZIP.
2. `.env.example`.
3. This README.
4. The Discord Developer Portal setup instructions.

Do NOT give them your personal bot token or API keys.

The client should create their own Discord bot application and fill in `.env`.

## Keeping it online

Termux can run the bot while the phone is active. Android may stop background processes, so for reliable 24/7 operation a proper VPS or other always-on host is recommended.
