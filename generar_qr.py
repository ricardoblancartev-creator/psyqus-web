import qrcode

# USA LA IP QUE SALE EN TU TERMINAL
mi_ip_actual = "192.168.100.98" 

areas_prueba = {
    "Gerencia": f"http://{mi_ip_actual}:8502/?area=Gerencia",
    "Operativos": f"http://{mi_ip_actual}:8502/?area=Operativos",
    "Auxiliares": f"http://{mi_ip_actual}:8502/?area=Auxiliares",
    "Supervisores": f"http://{mi_ip_actual}:8502/?area=Supervisores"
}

for area, url in areas_prueba.items():
    qr = qrcode.make(url)
    qr.save(f"qr_{area}.png")
    
