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
            name TEXT NOT NULL,
            lat REAL NOT NULL,
            lng REAL NOT NULL
        );
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

def insert_coords(name, lat, lng):
    con = sqlite3.connect(DB_PATH)
    cur = con.cursor()
    cur.execute(
        "INSERT INTO tracker (name, lat, lng) VALUES (?, ?, ?)",
        (name, lat, lng)
    )
    con.commit()

    con.close()

def get_coords(name):
    con = sqlite3.connect(DB_PATH)
    cur = con.cursor()
    cur.execute('SELECT lat, lng FROM tracker WHERE name = ?', (name,))
    row = cur.fetchone()

    con.close()

    if row is None:
        return None
    
    lat, lng = row
    return {'lat': lat, 'lng': lng}

def update_coords(name, lat, lng):
    con = sqlite3.connect(DB_PATH)
    cur = con.cursor()
    cur.execute(
        'UPDATE tracker SET lat = ?, lng = ? WHERE name = ?',
        (lat, lng, name)
    )
    con.commit()

    con.close()

def delete_coords(name):
    con = sqlite3.connect(DB_PATH)
    cur = con.cursor()
    cur.execute("DELETE FROM tracker WHERE name = ?", (name,))
    con.commit()
    
    con.close()

def load_trackers():
    con = sqlite3.connect(DB_PATH)
    cur = con.cursor()
    cur.execute("SELECT name, lat, lng FROM tracker")
    rows = cur.fetchall()
    con.close()

    return [
        {"name": r[0], "lat": r[1], "lng": r[2]}
        for r in rows
    ]