import sqlite3
from pathlib import Path
import os

DB_PATH = Path(os.getenv('DB_PATH', './data/tracker.db')) 

def init_db():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)  # cria pasta se precisar
    con = sqlite3.connect(DB_PATH)
    cur = con.cursor()
    cur.execute(
        '''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        );
        '''
    )
    cur.execute(
        '''
        CREATE TABLE IF NOT EXISTS tracker (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE,
            lat REAL NOT NULL,
            lng REAL NOT NULL,
            status INTEGER DEFAULT 0
        );
        '''
    )
    cur.execute(
        '''
        CREATE TABLE IF NOT EXISTS notification (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            content TEXT NOT NULL
        )
        '''
    )
    con.commit()
    con.close()

def get_user(username):
    con = sqlite3.connect(DB_PATH)
    cur = con.cursor()
    cur.execute('SELECT username, password FROM users WHERE username = ?', (username,))
    row = cur.fetchone()
    con.close()

    return row

def insert_user(username, password):
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute('INSERT INTO users (username, password) VALUES (?, ?)', (username, password))
    conn.commit()

    conn.close()

def insert_tracker(name, lat, lng):
    con = sqlite3.connect(DB_PATH)
    cur = con.cursor()
    cur.execute(
        "INSERT INTO tracker (name, lat, lng) VALUES (?, ?, ?)",
        (name, lat, lng)
    )
    con.commit()

    con.close()

def get_tracker_coords(name):
    con = sqlite3.connect(DB_PATH)
    cur = con.cursor()
    cur.execute('SELECT lat, lng FROM tracker WHERE name = ?', (name,))
    row = cur.fetchone()

    con.close()

    if row is None:
        return None
    
    lat, lng = row
    return {'lat': lat, 'lng': lng}

def update_tracker_coords(name, lat, lng):
    con = sqlite3.connect(DB_PATH)
    cur = con.cursor()
    cur.execute(
        'UPDATE tracker SET lat = ?, lng = ? WHERE name = ?',
        (lat, lng, name)
    )
    con.commit()

    con.close()

def update_tracker_status(name, status):
    con = sqlite3.connect(DB_PATH)
    cur = con.cursor()
    cur.execute(
        'UPDATE tracker SET status = ? WHERE name = ?',
        (status, name)
    )
    con.commit()

    con.close()

def delete_tracker(name):
    con = sqlite3.connect(DB_PATH)
    cur = con.cursor()
    cur.execute("DELETE FROM tracker WHERE name = ?", (name,))
    con.commit()
    
    con.close()

def list_trackers():
    con = sqlite3.connect(DB_PATH)
    cur = con.cursor()
    cur.execute("SELECT name, lat, lng, status FROM tracker")
    rows = cur.fetchall()
    con.close()

    return [
        {"name": row[0], "lat": row[1], "lng": row[2], "status": row[3]}
        for row in rows
    ]

def create_notification(content):
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute('INSERT INTO notification (content) VALUES (?) RETURNING id', (content,))
    row = cur.fetchone()
    conn.commit()

    conn.close()

    if row is None:
        return None
    
    return row[0]

def remove_notification(id):
    con = sqlite3.connect(DB_PATH)
    cur = con.cursor()
    cur.execute("DELETE FROM notification WHERE id = ?", (id,))
    con.commit()
    
    con.close()

def list_notifications():
    con = sqlite3.connect(DB_PATH)
    cur = con.cursor()
    cur.execute("SELECT id, content FROM notification")
    rows = cur.fetchall()
    con.close()

    return [
        {"id": row[0], "content": row[1]}
        for row in rows
    ]