# SETUP-NOTES

## OpenClaw access

- Dashboard over Tailscale: `https://srv1498201.tail93471e.ts.net`
- Pairing/setup route comes from:
  ```bash
  openclaw qr --json
  ```
- Current advertised gateway URL:
  `wss://srv1498201.tail93471e.ts.net`

## Gateway auth

- Auth mode: token
- Gateway token location:
  `~/.openclaw/openclaw.json`
- Config path:
  `gateway.auth.token`

## Tailscale

- OpenClaw is configured with:
  `gateway.tailscale.mode=serve`
- Local loopback listener is expected; Tailscale Serve fronts it remotely.

## Useful commands

```bash
openclaw status
openclaw qr --json
openclaw devices list
openclaw devices approve --latest
openclaw gateway restart
openclaw config get gateway.tailscale.mode
```

## Notes

- If pairing fails after config changes, generate a fresh setup code.
- Do not use `127.0.0.1:18789` remotely; use the Tailscale URL instead.
