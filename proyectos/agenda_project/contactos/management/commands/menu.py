from django.core.management.base import BaseCommand
from contactos.models import Contacto

class Command(BaseCommand):
    help = 'Menu'

    def handle(self, *args, **options):
        while True:
            print("")
            print("AGENDA")
            print("1- Agregar contacto")
            print("2- Buscar contacto")
            print("3- Eliminar contacto")
            print("4- Actualizar contacto")
            print("5- Listar todos los contactos")
            print("6- Listar favoritos")
            print("7- Salir")
            print("8- Exportar a JSON")
            print("9- Importar desde JSON")
            opcion = input("Elige una opcion ")

            if opcion == "1":
                nombre = input("Nombre: ")
                telefono = input("Telefono: ")
                email = input("Email: ")
                direccion = input("Direccion: ")
                favorito = input("Es favorito? (si/no): ")
                favorito_bool = favorito.lower() == "si"
                contacto = Contacto(
                    nombre=nombre,
                    telefono=telefono,
                    email=email,
                    direccion=direccion,
                    favorito=favorito_bool
                )
                contacto.save()
                print("Contacto agregado.")

            elif opcion == "2":
                texto = input("Texto a buscar (nombre o telefono): ")
                resultados = Contacto.objects.filter(
                    nombre__icontains=texto
                ) | Contacto.objects.filter(telefono__icontains=texto)
                for contacto in resultados:
                    fav = "Si" if contacto.favorito else "No"
                    print("Email:", contacto.email, "|", contacto.nombre, "|", contacto.telefono,
                          "|", contacto.direccion, "| Favorito:", fav)
                if not resultados:
                    print("No se encontraron contactos.")

            elif opcion == "3":
                email_a_eliminar = input("Email del contacto a eliminar: ")
                contacto = Contacto.objects.get(email=email_a_eliminar)
                contacto.delete()
                print("Contacto eliminado.")

            elif opcion == "4":
                email_a_actualizar = input("Email del contacto a actualizar: ")
                contacto = Contacto.objects.get(email=email_a_actualizar)
                print("Deja vacio el campo para mantener el valor actual.")
                nuevo_nombre = input("Nuevo nombre (" + contacto.nombre + "): ")
                nuevo_telefono = input("Nuevo telefono (" + contacto.telefono + "): ")
                nuevo_email = input("Nuevo email (" + contacto.email + "): ")
                nueva_direccion = input("Nueva direccion (" + contacto.direccion + "): ")
                favorito_actual = "si" if contacto.favorito else "no"
                nuevo_favorito = input("Es favorito? (si/no) [" + favorito_actual + "]: ")

                if nuevo_nombre != "":
                    contacto.nombre = nuevo_nombre
                if nuevo_telefono != "":
                    contacto.telefono = nuevo_telefono
                if nuevo_email != "":
                    contacto.email = nuevo_email
                if nueva_direccion != "":
                    contacto.direccion = nueva_direccion
                if nuevo_favorito.lower() == "si":
                    contacto.favorito = True
                elif nuevo_favorito.lower() == "no":
                    contacto.favorito = False
                contacto.save()
                print("Contacto actualizado.")

            elif opcion == "5":
                todos = Contacto.objects.all()
                for contacto in todos:
                    fav = "Si" if contacto.favorito else "No"
                    print("Email:", contacto.email, "|", contacto.nombre, "|", contacto.telefono,
                          "|", contacto.direccion, "| Favorito:", fav)
                if not todos:
                    print("No hay contactos guardados.")

            elif opcion == "6":
                favoritos = Contacto.objects.filter(favorito=True)
                for contacto in favoritos:
                    print("Email:", contacto.email, "|", contacto.nombre, "|", contacto.telefono,
                          "|", contacto.direccion)
                if not favoritos:
                    print("No hay contactos favoritos.")

            elif opcion == "7":
                print("Hasta luego.")
                break

            elif opcion == "8":
                import json
                contactos = Contacto.objects.all()
                lista = []
                for c in contactos:
                    lista.append({
                        "nombre": c.nombre,
                        "telefono": c.telefono,
                        "email": c.email,
                        "direccion": c.direccion,
                        "favorito": c.favorito
                    })
                with open("contactos.json", "w") as archivo:
                    json.dump(lista, archivo, indent=4)
                print("Contactos exportados a contactos.json")

            elif opcion == "9":
                import json
                import os
                if not os.path.exists("contactos.json"):
                    print("El archivo contactos.json no existe.")
                else:
                    with open("contactos.json", "r") as archivo:
                        datos = json.load(archivo)
                    for item in datos:
                        existe = Contacto.objects.filter(email=item["email"]).exists()
                        if not existe:
                            Contacto.objects.create(
                                nombre=item["nombre"],
                                telefono=item["telefono"],
                                email=item["email"],
                                direccion=item.get("direccion", ""),
                                favorito=item["favorito"]
                            )
                            print("Importado:", item["email"])
                        else:
                            print("Ya existe, omitido:", item["email"])
                    print("Importacion terminada.")

            else:
                print("Opcion no valida.")
