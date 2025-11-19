# Smart Campus Prototype - "Micro Smart City" for Universities
**Modules included:** Energy Monitoring (real-time + anomalies), Space Utilization (occupancy simulation + suggestions), Maintenance Alerts (auto-generation).


This is a minimal, self-contained prototype you can upload to GitHub and run locally.


## Structure
- backend/: Node.js backend (Express + WebSocket) and data simulator
- frontend/: Static dashboard (HTML/JS/CSS) that connects to backend WebSocket and REST APIs
- architecture.md: high-level architecture & data flow
- deployment.md: quick run steps

## Quick start (locally)
1. Install Node.js (v16+ recommended)
2. In `backend/` run:
   ```
   npm install
   node server.js
   ```
3. Open `frontend/index.html` in your browser (or serve it with a simple static server).

## Notes
- The backend simulates sensors and streams JSON messages over WebSocket (energy and occupancy).
- REST endpoints provide current aggregated status and maintenance tickets.
- The frontend shows real-time cards and charts (simple DOM manipulation).

Feel free to extend: add authentication, persistent DB (Postgres/Firebase), ML models, map visualization, or integrate real IoT devices.
