import requests

BASE = "http://127.0.0.1:5000"

while True:
    print("\n--- Rastreador ---")
    print("1. Criar rastreador")
    print("2. Atualizar coordenadas")
    print("3. Ver coordenadas")
    print("4. Deletar rastreador")
    print("5. Sair")

    op = input("Escolha: ").strip()

    if op == "1":
        name = input("Nome do rastreador: ").strip()
        lat = float(input("Latitude inicial: "))
        lng = float(input("Longitude inicial: "))

        r = requests.post(f"{BASE}/create", json={
            "name": name,
            "lat": lat,
            "lng": lng
        })
        print(r.json())

    elif op == "2":
        name = input("Nome do rastreador: ").strip()
        lat = float(input("Nova latitude: "))
        lng = float(input("Nova longitude: "))

        r = requests.post(f"{BASE}/update/{name}", json={
            "lat": lat,
            "lng": lng
        })
        print(r.json())

    elif op == "3":
        name = input("Nome do rastreador: ").strip()
        r = requests.get(f"{BASE}/coords/{name}")
        print(r.json())

    elif op == "4":
        name = input("Nome do rastreador: ").strip()
        r = requests.delete(f"{BASE}/delete/{name}")
        print(r.json())

    elif op == "5":
        break

    else:
        print("Opção inválida.")
