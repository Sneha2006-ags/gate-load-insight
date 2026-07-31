"""Flask REST API for the Smart Truck Gate & Load Monitoring System.

Run on the Raspberry Pi:  python app.py
"""

import time

from flask import Flask, jsonify, request
from flask_cors import CORS

import db
import mqtt_client

app = Flask(__name__)
CORS(app)

START_TIME = time.time()


@app.get("/api/rfid/latest")
def rfid_latest():
    return jsonify(db.latest_rfid() or {})


@app.get("/api/rfid/history")
def rfid_history():
    limit = min(int(request.args.get("limit", 200)), 1000)
    return jsonify(db.rfid_history(limit))


@app.get("/api/weight/latest")
def weight_latest():
    return jsonify(db.latest_weight() or {})


@app.get("/api/weight/history")
def weight_history():
    limit = min(int(request.args.get("limit", 500)), 2000)
    return jsonify(db.weight_history(limit))


@app.post("/api/weight/limit")
def set_limit():
    payload = request.get_json(silent=True) or {}
    try:
        value = float(payload.get("limit"))
    except (TypeError, ValueError):
        return jsonify({"error": "limit must be a number"}), 400
    if not 0 <= value <= 5000:
        return jsonify({"error": "limit must be between 0 and 5000"}), 400
    mqtt_client.publish_limit(value)
    return jsonify({"ok": True, "limit": value})


@app.post("/api/buzzer")
def set_buzzer():
    payload = request.get_json(silent=True) or {}
    value = bool(payload.get("buzzer"))
    mqtt_client.publish_buzzer(value)
    return jsonify({"ok": True, "buzzer": value})


@app.post("/api/led")
def set_led():
    payload = request.get_json(silent=True) or {}
    try:
        mqtt_client.publish_led(payload.get("led", ""))
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    return jsonify({"ok": True, "led": str(payload.get("led")).upper()})


@app.get("/api/status")
def status():
    return jsonify(
        {
            "mqtt": mqtt_client.state["connected"],
            "broker": f"{mqtt_client.BROKER_HOST}:{mqtt_client.BROKER_PORT}",
            "database": "ONLINE",
            "limit": mqtt_client.state["limit"],
            "buzzer": mqtt_client.state["buzzer"],
            "led": mqtt_client.state["led"],
            "uptime": int(time.time() - START_TIME),
        }
    )


if __name__ == "__main__":
    db.init_db()
    mqtt_client.start()
    app.run(host="0.0.0.0", port=5000)
