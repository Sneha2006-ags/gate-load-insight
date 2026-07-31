"""Mosquitto MQTT bridge for the Smart Truck Gate system.

Subscribes: truck/scan, truck/scan/result, truck/weight
Publishes:  truck/buzzer/control, truck/weight/limit, truck/weight/led
"""

import json
import os
import threading

import paho.mqtt.client as mqtt

import db

BROKER_HOST = os.getenv("MQTT_HOST", "localhost")
BROKER_PORT = int(os.getenv("MQTT_PORT", "1883"))

TOPIC_SCAN = "truck/scan"
TOPIC_SCAN_RESULT = "truck/scan/result"
TOPIC_WEIGHT = "truck/weight"
TOPIC_BUZZER = "truck/buzzer/control"
TOPIC_LIMIT = "truck/weight/limit"
TOPIC_LED = "truck/weight/led"

state = {
    "connected": False,
    "limit": 800.0,
    "buzzer": False,
    "led": "AUTO",
}

_client = mqtt.Client()
_lock = threading.Lock()


def on_connect(client, userdata, flags, rc):
    state["connected"] = rc == 0
    for topic in (TOPIC_SCAN, TOPIC_SCAN_RESULT, TOPIC_WEIGHT):
        client.subscribe(topic)
    print(f"[mqtt] connected rc={rc}")


def on_disconnect(client, userdata, rc):
    state["connected"] = False
    print(f"[mqtt] disconnected rc={rc}")


def on_message(client, userdata, msg):
    try:
        payload = json.loads(msg.payload.decode())
    except (ValueError, UnicodeDecodeError):
        print(f"[mqtt] bad payload on {msg.topic}")
        return

    if msg.topic == TOPIC_SCAN:
        # ESP32 #1 sends a raw UID; the backend decides authorization.
        uid = payload.get("uid", "")
        authorized, vehicle = db.is_authorized(uid)
        gate = "OPEN" if authorized else "CLOSED"
        db.insert_rfid(uid, vehicle, authorized, gate, payload.get("time"))
        client.publish(
            TOPIC_SCAN_RESULT,
            json.dumps({"uid": uid, "vehicle": vehicle, "authorized": authorized, "gate": gate}),
        )

    elif msg.topic == TOPIC_SCAN_RESULT:
        # Node already resolved the decision locally.
        db.insert_rfid(
            payload.get("uid", ""),
            payload.get("vehicle", "UNKNOWN"),
            payload.get("authorized", False),
            payload.get("gate", "CLOSED"),
            payload.get("time"),
        )

    elif msg.topic == TOPIC_WEIGHT:
        with _lock:
            limit = float(payload.get("limit", state["limit"]))
            state["limit"] = limit
        weight = float(payload.get("weight", 0))
        status = payload.get("status") or ("OVERLOAD" if weight > limit else "NORMAL")
        db.insert_weight(
            weight,
            limit,
            status,
            payload.get("buzzer", False),
            payload.get("led", "GREEN"),
            payload.get("time"),
        )


def publish_limit(value):
    with _lock:
        state["limit"] = float(value)
    _client.publish(TOPIC_LIMIT, json.dumps({"limit": float(value)}), retain=True)


def publish_buzzer(value):
    with _lock:
        state["buzzer"] = bool(value)
    _client.publish(TOPIC_BUZZER, "ON" if value else "OFF", retain=True)


def publish_led(mode):
    mode = str(mode).upper()
    if mode not in ("AUTO", "GREEN", "RED"):
        raise ValueError("led mode must be AUTO, GREEN or RED")
    with _lock:
        state["led"] = mode
    _client.publish(TOPIC_LED, mode, retain=True)


def start():
    _client.on_connect = on_connect
    _client.on_disconnect = on_disconnect
    _client.on_message = on_message
    _client.connect_async(BROKER_HOST, BROKER_PORT, keepalive=30)
    _client.loop_start()
