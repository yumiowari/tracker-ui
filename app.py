from flask import Flask, render_template, request, redirect, url_for, session
from dotenv import load_dotenv
import os

app = Flask(__name__)

load_dotenv()

app.secret_key = os.getenv('SECRET_KEY')

username = None
password = None

@app.route('/')
def index():
    global username

    context = {
        'title': 'Servidor Flask',
        'version': '0.0.0'
    }

    # verifica a sessão
    if 'user' not in session:
        return redirect(url_for('login'))

    return render_template('index.html', **context)

@app.route('/login', methods=['GET', 'POST'])
def login():
    global username, password

    if request.method == 'POST':
        user = request.form.get('username')
        pswd = request.form.get('password')

        if user == username and pswd == password:
            session['user'] = user # valida a sessão

            return redirect(url_for('index'))
        else:
            return render_template('login.html', error='Credenciais inválidas.')
        
    return render_template('login.html') # GET
    
@app.route('/register', methods=['GET', 'POST'])
def register():
    global username, password

    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        confirmation = request.form.get('confirmation')

        if password != confirmation:
            return render_template('register.html', error='As senhas são coincidem.')

        return redirect(url_for('login'))

    return render_template('register.html') # GET

if __name__ == '__main__':
    app.run(debug=True)