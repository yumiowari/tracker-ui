import requests
import time
import random

BASE = "http://127.0.0.1:5000"

while True:
    print("\n--- Rastreador ---")
    print("1. Criar rastreador")
    print("2. Atualizar coordenadas")
    print("3. Atualizar status")
    print("4. Ver coordenadas")
    print("5. Deletar rastreador")
    print("6. Listar rastreadores")
    print("7. Simular furto")
    print("8. Simular notificação")
    print("\n0. Sair\n")

    op = input("Escolha: ").strip()

    if op == "1":
        name = input("Nome do rastreador: ").strip()
        lat = float(input("Latitude inicial: "))
        lng = float(input("Longitude inicial: "))

        r = requests.post(f"{BASE}/tracker/create", json={
            "name": name,
            "lat": lat,
            "lng": lng
        })
        print(f"Resposta: {r.json()}")

    elif op == "2":
        name = input("Nome do rastreador: ").strip()
        lat = float(input("Nova latitude: "))
        lng = float(input("Nova longitude: "))

        r = requests.post(f"{BASE}/tracker/update-coords/{name}", json={
            "lat": lat,
            "lng": lng
        })
        print(f"Resposta: {r.json()}")

    elif op == "3":
        name = input("Nome do rastreador: ").strip()
        status = int(input("Novo status (1 - ativo; 0 - inativo): "))

        r = requests.post(f"{BASE}/tracker/update-status/{name}", json={
            "status": status
        })
        print(f"Resposta: {r.json()}")

    elif op == "4":
        name = input("Nome do rastreador: ").strip()
        r = requests.get(f"{BASE}/tracker/get-coords/{name}")
        print(f"Resposta: {r.json()}")

    elif op == "5":
        name = input("Nome do rastreador: ").strip()
        r = requests.delete(f"{BASE}/tracker/delete/{name}")
        print(f"Resposta: {r.json()}")

    elif op == "6":
        r = requests.get(f"{BASE}/tracker/list")
        print("Rastreadores:")
        print(r.json())

    elif op == "7":
        name = input("Nome do rastreador: ").strip()
        print("Simulando… CTRL+C para parar.")

        # direção fixa sorteada
        base_lat = random.uniform(-0.0003, 0.0003)
        base_lng = random.uniform(-0.0003, 0.0003)

        print(f"Direção sorteada: Δlat={base_lat:.7f}, Δlng={base_lng:.7f}")

        try:
            while True:
                c = requests.get(f"{BASE}/tracker/get-coords/{name}").json()
                lat = c["lat"]
                lng = c["lng"]

                # pequeno ruído
                noise_lat = random.uniform(-0.00005, 0.00005)
                noise_lng = random.uniform(-0.00005, 0.00005)

                lat += base_lat + noise_lat
                lng += base_lng + noise_lng

                r = requests.post(f"{BASE}/tracker/update-coords/{name}", json={
                    "lat": lat,
                    "lng": lng
                })

                print(".")

                time.sleep(1)

        except KeyboardInterrupt:
            print("\nSimulação encerrada.")

    elif op == "8":
        content = input("Texto da notificação: ").strip()

        r = requests.post(f"{BASE}/notification/create", json={
            "content": content
        })

        print(f"Resposta: {r.json()}")

    elif op == "0":
        break

    else:
        print("Opção inválida.")
