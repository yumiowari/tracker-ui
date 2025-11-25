from flask import Flask, render_template, request, redirect, url_for, session
from dotenv import load_dotenv
import os

from db import init_db
from db import get_user, insert_user
from db import insert_tracker, get_tracker_coords, update_tracker_coords, update_tracker_status, delete_tracker
from db import list_trackers

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
        'title': 'ProtecTI',
        'version': '0.0.0',
        'maps_key': os.getenv('GOOGLE_MAPS_KEY'),
        'username': session['username']
    }

    return render_template('index.html', **context)

@app.route('/login', methods=['GET', 'POST'])
def login():
    if 'username' in session:
        return redirect(url_for('index'))

    context = {
        'title': 'ProtecTI',
        'version': '0.0.0'
    }

    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')

        row = get_user(username)

        if row and row[1] == password:
            session['username'] = username # valida a sessão

            return redirect(url_for('index'))
        else:
            context['error'] = 'Credenciais inválidas.'

            return render_template('login.html', **context)
        
    return render_template('login.html', **context) # GET
    
@app.route('/register', methods=['GET', 'POST'])
def register():
    if 'username' in session:
        return redirect(url_for('index'))

    context = {
        'title': 'ProtecTI',
        'version': '0.0.0'
    }

    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        confirmation = request.form.get('confirmation')

        if password != confirmation:
            context['error'] = 'As senhas são coincidem.'

            return render_template('register.html', **context)
        
        try:
            insert_user(username, password)
        except Exception:
            context['error'] = f'"{username}" não está disponível.'

            return render_template('register.html', **context)

        return redirect(url_for('login'))

    return render_template('register.html', **context) # GET

@app.post('/logout')
def logout():
    session.clear()

    return redirect(url_for('index'))

@app.get('/tracker/get-coords/<string:name>')
def route_get_tracker_coords(name):
    data = get_tracker_coords(name)

    if data is None:
        return {'error': 'Rastreador não encontrado'}, 404
    
    return data

@app.post('/tracker/create')
def route_create_tracker():
    body = request.get_json()

    name = body.get('name')
    lat = body.get('lat')
    lng = body.get('lng')

    if not name or lat is None or lng is None:
        return {'error': 'Dados incompletos.'}, 400

    insert_tracker(name, lat, lng)

    return {'status': 'ok'}

@app.post('/tracker/update-coords/<string:name>')
def route_update_tracker_coords(name):
    body = request.get_json()

    if 'lat' not in body or 'lng' not in body:
        return {'error': '"Latitude" e longitude devem ser informadas.'}, 400

    update_tracker_coords(name, body['lat'], body['lng'])

    return {'status': 'ok'}

@app.post('/tracker/update-status/<string:name>')
def route_update_tracker_status(name):
    body = request.get_json()

    if 'status' not in body:
        return {'error': '"Status" deve ser informado.'}, 400
    
    update_tracker_status(name, body['status'])

    return {'status': 'ok'}

@app.delete('/tracker/delete/<string:name>')
def route_delete_tracker(name):
    delete_tracker(name)

    return {'status': 'ok'}

@app.get('/tracker/list')
def route_list_trackers():
    return list_trackers()

if __name__ == '__main__':
    app.run(debug=True)