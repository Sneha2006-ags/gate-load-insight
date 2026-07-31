## Smart Truck Gate & Load Monitoring Dashboard

A dark, industrial-themed React dashboard with a persistent left sidebar and four pages. It runs on a realistic simulated live data stream out of the box, and can be pointed at your Raspberry Pi Flask API from Settings. A reference Flask + MQTT + SQLite backend is included in the repo for you to copy to the Pi.

### Design system
Dark slate background, blue accent, green/amber/red status colors, rounded cards with soft shadows and subtle glow, condensed technical typography, Framer Motion animations, Lucide icons, loading skeletons, sonner toasts.

### Sidebar (all pages)
Dashboard Home, RFID Gate, Load Cell, History, Settings — collapsible, with a live MQTT connection pill (green/red).

### Page 1 — RFID Gate (`/rfid`)
- Six live cards: RFID UID, Vehicle Number, Authorization badge, Gate Status with animated gate icon, Green LED, Red LED (glowing pulse animations).
- Scan history table: Time, UID, Vehicle, Authorized, Gate Status — newest first, search box, pagination, CSV export.

### Page 2 — Load Cell (`/load`)
- Large animated weight readout (smooth number tweening, ~300ms updates).
- Circular gauge 0–5000 g with moving needle, green/yellow/red zones.
- Status badge (NORMAL / OVERLOAD), weight limit card, buzzer card with animated speaker, green & red LED indicators.
- Live Recharts line chart, rolling latest 100 readings.
- Weight history table: Timestamp, Weight, Status, Buzzer, LED, Limit — search, status filter, CSV export.
- Controls: limit slider + numeric input (0–5000 g), buzzer toggle, LED mode buttons AUTO/GREEN/RED. Each control POSTs to the API and shows the published MQTT topic in a toast.

### Page 3 — History (`/history`)
Split screen: RFID history left, weight history right. Date-range picker, vehicle filter, weight range filter, CSV and PDF export.

### Page 4 — Settings (`/settings`)
API base URL field (saved locally, switches between simulated and live mode), MQTT status, broker IP, WiFi status, database status, ESP32 node status, system uptime.

### Toasts
Vehicle Authorized / Unauthorized, Overload Detected, Weight Returned to Normal, MQTT Connected / Disconnected.

### Technical notes
- Data layer: one `useTelemetry` provider. If no API URL is configured, an internal simulator emits RFID scans and weight readings on realistic intervals; if configured, it polls `/api/rfid/latest`, `/api/weight/latest`, and history endpoints, and POSTs to `/api/weight/limit`, `/api/buzzer`, `/api/led`. Same component code either way.
- Routing: TanStack Router file routes (`index.tsx` redirects to the gate dashboard), each page with its own SEO head metadata.
- Charts: Recharts. Animation: Framer Motion. PDF export: jsPDF + autotable.
- Backend reference under `backend/`: `app.py` (Flask REST endpoints), `mqtt_client.py` (Mosquitto subscribe `truck/scan`, `truck/scan/result`, `truck/weight`; publish `truck/buzzer/control`, `truck/weight/limit`, `truck/weight/led`), `db.py` with SQLite `rfid_logs` and `weight_logs` schema, `requirements.txt`, and a README with Raspberry Pi setup steps. This code is reference only — it is not executed by the preview.
