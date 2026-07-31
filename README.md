# Gate & Load Watch

Project Title

Smart Truck Gate & Intelligent Load Monitoring System

Project Description

Create a modern industrial IoT web dashboard for a Smart Truck Gate and Load Monitoring System.

The system consists of:

 ESP32 #1 (RFID Gate Node)

 ESP32 #2 (Load Cell Node)

 Raspberry Pi MQTT Broker (Mosquitto)

 Flask Backend API

 SQLite Database

 MQTT communication

 Deployment on Vercel (Frontend) and Raspberry Pi (Backend)

The dashboard must update in real time.

Use a modern industrial UI with animations and responsive design.

Theme:

 Dark background

 Blue accent colors

 Green for success

 Red for alerts

 Yellow for warnings

Use rounded cards, shadows, modern typography and animated icons.

SIDEBAR

Create a left navigation sidebar.

Menu:

🏠 Dashboard Home

🚛 RFID Gate

⚖ Load Cell

📊 History

⚙ Settings

PAGE 1

RFID GATE DASHBOARD

Title

Smart Truck Gate Monitoring

Live Status Cards

Create six cards.

Card 1

RFID UID

Example

04 A8 C3 92

Live update.

Card 2

Vehicle Number

Example

KA 01 AB 1234

Card 3

Authorization

Show

Authorized

Green badge

or

Unauthorized

Red badge

Card 4

Gate Status

Show

OPEN

Green

or

CLOSED

Red

Animated gate icon.

Card 5

Gate Green LED

Animated glowing LED.

Card 6

Gate Red LED

Animated glowing LED.

RFID Scan History

Create a table.

Columns

Time

RFID UID

Vehicle Number

Authorized

Gate Status

Newest entry always on top.

Include search box.

Include pagination.

Include export CSV button.

MQTT Connection Status

Small indicator.

Green

Connected

Red

Disconnected

PAGE 2

LOAD CELL DASHBOARD

Title

Truck Load Monitoring

Main Weight Card

Very large card.

Display

Current Weight

725.4 g

Update every few hundred milliseconds.

Animate changing values smoothly.

Circular Gauge

Gauge

0–5000 g

Needle moves with weight.

Green

Normal

Yellow

Near limit

Red

Overload

Weight Status

Large badge.

NORMAL

Green

or

OVERLOAD

Red

Weight Limit Card

Display

Current Limit

800 g

Buzzer Status

Show

ON

or

OFF

Animated speaker icon.

Weight Green LED

Animated LED.

Weight Red LED

Animated LED.

Live Weight Chart

Create a line chart.

X-axis

Time

Y-axis

Weight

Automatically update.

Keep latest 100 readings.

Weight History Table

Columns

Timestamp

Weight

Status

Buzzer

LED State

Limit

Include

Search

Filter

CSV Export

CONTROLS

Weight Limit

Slider

Minimum

0 g

Maximum

5000 g

Also include numeric input.

Changing this publishes

truck/weight/limit

MQTT.

Buzzer Control

Toggle Switch

ON

OFF

Publishes

truck/buzzer/control

LED Mode

Three buttons

AUTO

GREEN

RED

Publishes

truck/weight/led

AUTO

GREEN

RED

Manual LED Indicators

Display current LED state.

Green LED

ON/OFF

Red LED

ON/OFF

PAGE 3

HISTORY

Split screen.

Left

RFID History

Right

Weight History

Date picker

Vehicle filter

Weight filter

Export CSV

Export PDF

PAGE 4

SETTINGS

Display

MQTT Status

Broker IP

WiFi Status

Database Status

ESP32 Status

System Uptime

BACKEND API

Assume Flask backend.

Endpoints

GET /api/rfid/latest

GET /api/rfid/history

GET /api/weight/latest

GET /api/weight/history

POST /api/weight/limit

POST /api/buzzer

POST /api/led

MQTT Topics

Subscribe

truck/scan

truck/scan/result

truck/weight

Publish

truck/buzzer/control

truck/weight/limit

truck/weight/led

Example JSON

RFID

{
  "uid":"04A8C392",
  "vehicle":"KA01AB1234",
  "authorized":true,
  "gate":"OPEN",
  "time":"2026-07-31 14:25:12"
}

Weight

{
  "weight":725.4,
  "limit":800,
  "status":"NORMAL",
  "buzzer":false,
  "led":"GREEN",
  "time":"2026-07-31 14:26:45"
}

Database

SQLite

Table

rfid_logs

Fields

id

uid

vehicle_number

authorized

gate_status

timestamp

Table

weight_logs

Fields

id

weight

weight_limit

status

buzzer

led

timestamp

Technologies

Frontend

 React

 TypeScript

 Tailwind CSS

 shadcn/ui

 React Router

 Recharts

 Lucide Icons

 Framer Motion

Backend

 Flask

 SQLite

 MQTT (Mosquitto)

Deployment

Frontend

Vercel

Backend

Raspberry Pi

UI Requirements

Use an industrial smart factory theme.

Include:

 Smooth animations

 Live MQTT updates without page refresh

 Responsive desktop and mobile layout

 Rounded cards

 Professional icons

 Dark mode by default

 Loading skeletons while waiting for data

 Toast notifications for:

 Vehicle Authorized

 Vehicle Unauthorized

 Overload Detected

 Weight Returned to Normal

 MQTT Disconnected

 MQTT Connected

Use modern card layouts and ensure the interface feels like a professional industrial monitoring dashboard rather than a basic admin panel.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/8a8d5ee7-e535-46f5-8970-66c6ef0ffeb0).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
