import sqlite3
from pathlib import Path
import os

DB_PATH = Path(os.getenv("DB_PATH", "./data/tracker.db")) 

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
    con.commit()
    con.close()

def get_user(username):
    con = sqlite3.connect(DB_PATH)
    cur = con.cursor()
    cur.execute("SELECT username, password FROM users WHERE username = ?", (username,))
    row = cur.fetchone()
    con.close()

    return row

def insert_user(username, password):
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("INSERT INTO users (username, password) VALUES (?, ?)", (username, password))
    conn.commit()
    conn.close()