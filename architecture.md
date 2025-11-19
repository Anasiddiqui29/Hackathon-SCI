# Architecture & Data Flow

Modules (Sensors / Simulators)
- Energy sensors (per building meters)
- Occupancy sensors (per room)
- Maintenance agents (auto-ticket generator)

Data Flow:
1. Simulated sensors -> WebSocket stream to Backend (or Backend generates data itself)
2. Backend Decision Brain:
   - Aggregates data, applies rules (anomaly detection, occupancy heuristics)
   - Generates alerts and maintenance tickets
   - Exposes REST API for dashboard queries
3. Dashboard (frontend): subscribes to WebSocket for real-time updates + polls REST for history

Optional Cloud:
- Store time-series in InfluxDB / Timescale / Firebase
- Use MQTT for real IoT device connectivity
- Deploy backend to Heroku / Vercel (serverless) or EC2
