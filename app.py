from flask import Flask, render_template, request, redirect, url_for, session
from dotenv import load_dotenv
import os

from db import init_db
from db import get_user, insert_user
from db import insert_coords, get_coords, update_coords, delete_coords
from db import load_trackers

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
        'version': '0.0.0',
        'maps_key': os.getenv('GOOGLE_MAPS_KEY')
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

@app.post('/logout')
def logout():
    session.clear()

    return redirect(url_for('index'))

@app.get('/coords/<string:name>')
def coords(name):
    data = get_coords(name)

    if data is None:
        return {'error': 'Rastreador não encontrado'}, 404
    
    return data


@app.post('/create')
def create():
    body = request.get_json()

    name = body.get('name')
    lat = body.get('lat')
    lng = body.get('lng')

    if not name or lat is None or lng is None:
        return {'error': 'Dados incompletos.'}, 400

    insert_coords(name, lat, lng)

    return {'status': 'criado'}


@app.post('/update/<string:name>')
def update(name):
    body = request.get_json()

    if 'lat' not in body or 'lng' not in body:
        return {'error': 'Latitude e longitude são obrigatórias.'}, 400

    update_coords(name, body['lat'], body['lng'])

    return {'status': 'ok'}


@app.delete('/delete/<string:name>')
def delete(name):
    delete_coords(name)

    return {'status': 'removido'}

@app.get('/trackers')
def trackers():
    data = load_trackers()

    print(data)

    return data

if __name__ == '__main__':
    app.run(debug=True)