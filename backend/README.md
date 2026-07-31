# Backend reference — Raspberry Pi

Flask + Mosquitto + SQLite service for the Smart Truck Gate & Load Monitoring System.
This folder is **reference code only** — it is not executed by the web preview.

## Setup on the Pi

```bash
sudo apt update && sudo apt install -y mosquitto mosquitto-clients python3-venv
sudo systemctl enable --now mosquitto

cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python app.py            # serves on http://<pi-ip>:5000
```

Optionally override the broker: `MQTT_HOST=localhost MQTT_PORT=1883 python app.py`.

## Connecting the dashboard

Open the deployed dashboard → **Settings** → set *Flask API base URL* to
`http://<pi-ip>:5000` and save. With the field empty the dashboard runs on
simulated telemetry.

## REST endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/rfid/latest` | Most recent gate scan |
| GET | `/api/rfid/history?limit=200` | Scan log, newest first |
| GET | `/api/weight/latest` | Most recent load reading |
| GET | `/api/weight/history?limit=500` | Weight log |
| POST | `/api/weight/limit` | `{"limit": 800}` → publishes `truck/weight/limit` |
| POST | `/api/buzzer` | `{"buzzer": true}` → publishes `truck/buzzer/control` |
| POST | `/api/led` | `{"led": "AUTO"}` → publishes `truck/weight/led` |
| GET | `/api/status` | MQTT / broker / DB / uptime |

## MQTT topics

Subscribe: `truck/scan`, `truck/scan/result`, `truck/weight`
Publish: `truck/buzzer/control`, `truck/weight/limit`, `truck/weight/led`

Payload examples:

```json
{"uid":"04A8C392","vehicle":"KA01AB1234","authorized":true,"gate":"OPEN","time":"2026-07-31 14:25:12"}
{"weight":725.4,"limit":800,"status":"NORMAL","buzzer":false,"led":"GREEN","time":"2026-07-31 14:26:45"}
```

## Database

SQLite `truck_gate.db` with `rfid_logs`, `weight_logs` and an `authorized_vehicles`
whitelist used to decide gate access. Seed it with:

```sql
INSERT INTO authorized_vehicles (uid, vehicle_number) VALUES ('04A8C392', 'KA01AB1234');
```
