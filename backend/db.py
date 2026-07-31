"""SQLite persistence for the Smart Truck Gate system.

Reference code — deploy on the Raspberry Pi alongside Mosquitto.
"""

import sqlite3
from contextlib import contextmanager

DB_PATH = "truck_gate.db"

SCHEMA = """
CREATE TABLE IF NOT EXISTS rfid_logs (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    uid            TEXT    NOT NULL,
    vehicle_number TEXT    NOT NULL,
    authorized     INTEGER NOT NULL,
    gate_status    TEXT    NOT NULL,
    timestamp      TEXT    NOT NULL DEFAULT (datetime('now','localtime'))
);

CREATE TABLE IF NOT EXISTS weight_logs (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    weight       REAL    NOT NULL,
    weight_limit REAL    NOT NULL,
    status       TEXT    NOT NULL,
    buzzer       INTEGER NOT NULL,
    led          TEXT    NOT NULL,
    timestamp    TEXT    NOT NULL DEFAULT (datetime('now','localtime'))
);

CREATE TABLE IF NOT EXISTS authorized_vehicles (
    uid            TEXT PRIMARY KEY,
    vehicle_number TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_rfid_time   ON rfid_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_weight_time ON weight_logs(timestamp DESC);
"""


@contextmanager
def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def init_db():
    with get_db() as conn:
        conn.executescript(SCHEMA)


def insert_rfid(uid, vehicle_number, authorized, gate_status, timestamp=None):
    with get_db() as conn:
        conn.execute(
            "INSERT INTO rfid_logs (uid, vehicle_number, authorized, gate_status, timestamp)"
            " VALUES (?, ?, ?, ?, COALESCE(?, datetime('now','localtime')))",
            (uid, vehicle_number, int(bool(authorized)), gate_status, timestamp),
        )


def insert_weight(weight, weight_limit, status, buzzer, led, timestamp=None):
    with get_db() as conn:
        conn.execute(
            "INSERT INTO weight_logs (weight, weight_limit, status, buzzer, led, timestamp)"
            " VALUES (?, ?, ?, ?, ?, COALESCE(?, datetime('now','localtime')))",
            (weight, weight_limit, status, int(bool(buzzer)), led, timestamp),
        )


def latest_rfid():
    with get_db() as conn:
        row = conn.execute(
            "SELECT * FROM rfid_logs ORDER BY id DESC LIMIT 1"
        ).fetchone()
        return dict(row) if row else None


def rfid_history(limit=200):
    with get_db() as conn:
        rows = conn.execute(
            "SELECT * FROM rfid_logs ORDER BY id DESC LIMIT ?", (limit,)
        ).fetchall()
        return [dict(r) for r in rows]


def latest_weight():
    with get_db() as conn:
        row = conn.execute(
            "SELECT * FROM weight_logs ORDER BY id DESC LIMIT 1"
        ).fetchone()
        return dict(row) if row else None


def weight_history(limit=500):
    with get_db() as conn:
        rows = conn.execute(
            "SELECT * FROM weight_logs ORDER BY id DESC LIMIT ?", (limit,)
        ).fetchall()
        return [dict(r) for r in rows]


def is_authorized(uid):
    with get_db() as conn:
        row = conn.execute(
            "SELECT vehicle_number FROM authorized_vehicles WHERE uid = ?", (uid,)
        ).fetchone()
        return (True, row["vehicle_number"]) if row else (False, "UNKNOWN")
