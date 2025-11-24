from flask import Flask, render_template, request, redirect, url_for, session
from dotenv import load_dotenv
import os

from db import init_db, get_user, insert_user

app = Flask(__name__)

load_dotenv()

app.secret_key = os.getenv('SECRET_KEY')

init_db() # inicializa o banco de dados

@app.route('/')
def index():
    # verifica a sessão
    if 'username' not in session:
        return redirect(url_for('login'))
    
    context = {
        'title': 'Servidor Flask',
        'version': '0.0.0'
    }

    return render_template('index.html', **context)

@app.route('/login', methods=['GET', 'POST'])
def login():
    if 'username' in session:
        return redirect(url_for('index'))

    if 'user' in session:
        return redirect(url_for('index'))

    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')

        row = get_user(username)

        if row and row[1] == password:
            session['username'] = username # valida a sessão

            return redirect(url_for('index'))
        else:
            return render_template('login.html', error='Credenciais inválidas.')
        
    return render_template('login.html') # GET
    
@app.route('/register', methods=['GET', 'POST'])
def register():
    if 'username' in session:
        return redirect(url_for('index'))

    if 'user' in session:
        return redirect(url_for('index'))

    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        confirmation = request.form.get('confirmation')

        if password != confirmation:
            return render_template('register.html', error='As senhas são coincidem.')
        
        try:
            insert_user(username, password)
        except Exception:
            return render_template('register.html', error=f'"{username}" não está disponível.')

        return redirect(url_for('login'))

    return render_template('register.html') # GET

@app.route('/logout', methods=['POST'])
def logout():
    session.clear()

    return redirect(url_for('index'))

if __name__ == '__main__':
    app.run(debug=True)