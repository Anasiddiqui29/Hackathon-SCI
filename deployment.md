# Deployment & Next Steps

- For production, separate simulator from backend.
- Use persistent storage for maintenance tickets and history (Postgres + TimescaleDB recommended).
- Add auth (JWT) for admin actions.
- For connectivity without WiFi, consider LoRaWAN gateways or a mesh network (cjdns, libp2p).
