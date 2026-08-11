import tkinter as tk
from tkinter import ttk, messagebox
import mysql.connector


class AppDB:
    def __init__(self, root):
        self.root = root
        self.root.title("Gestor de Conexión BD")
        self.conexion = None
        self._crear_widgets()

    def _crear_widgets(self):
        # --- Frame de conexión ---
        frame_con = ttk.LabelFrame(self.root, text="Datos de Conexión", padding=10)
        frame_con.grid(row=0, column=0, padx=10, pady=10, sticky="ew")

        ttk.Label(frame_con, text="Host:").grid(row=0, column=0, sticky="w")
        self.host_entry = ttk.Entry(frame_con)
        self.host_entry.insert(0, "localhost")
        self.host_entry.grid(row=0, column=1, padx=5, pady=2)

        ttk.Label(frame_con, text="Puerto:").grid(row=1, column=0, sticky="w")
        self.puerto_entry = ttk.Entry(frame_con)
        self.puerto_entry.insert(0, "3306")
        self.puerto_entry.grid(row=1, column=1, padx=5, pady=2)

        ttk.Label(frame_con, text="Usuario:").grid(row=2, column=0, sticky="w")
        self.usuario_entry = ttk.Entry(frame_con)
        self.usuario_entry.grid(row=2, column=1, padx=5, pady=2)

        ttk.Label(frame_con, text="Contraseña:").grid(row=3, column=0, sticky="w")
        self.contra_entry = ttk.Entry(frame_con, show="*")
        self.contra_entry.grid(row=3, column=1, padx=5, pady=2)

        ttk.Label(frame_con, text="Base de datos:").grid(row=4, column=0, sticky="w")
        self.bd_entry = ttk.Entry(frame_con)
        self.bd_entry.grid(row=4, column=1, padx=5, pady=2)

        ttk.Button(frame_con, text="Conectar", command=self.conectar).grid(row=5, column=0, pady=10)
        ttk.Button(frame_con, text="Desconectar", command=self.desconectar).grid(row=5, column=1, pady=10)

        # --- Frame de consulta ---
        frame_query = ttk.LabelFrame(self.root, text="Consulta SQL", padding=10)
        frame_query.grid(row=1, column=0, padx=10, pady=5, sticky="ew")

        self.query_text = tk.Text(frame_query, height=4, width=60)
        self.query_text.grid(row=0, column=0, columnspan=2, pady=5)
        ttk.Button(frame_query, text="Ejecutar", command=self.ejecutar).grid(row=1, column=0, pady=5)
        ttk.Button(frame_query, text="Limpiar", command=self.limpiar).grid(row=1, column=1, pady=5)

        # --- Frame de resultados ---
        frame_res = ttk.LabelFrame(self.root, text="Resultados", padding=10)
        frame_res.grid(row=2, column=0, padx=10, pady=5, sticky="nsew")

        self.tree = ttk.Treeview(frame_res, columns=(), show="headings", height=10)
        self.tree.pack(fill="both", expand=True)

        scrollbar = ttk.Scrollbar(frame_res, orient="vertical", command=self.tree.yview)
        scrollbar.pack(side="right", fill="y")
        self.tree.configure(yscrollcommand=scrollbar.set)

        # --- Barra de estado ---
        self.estado = ttk.Label(self.root, text="Estado: Desconectado", relief="sunken", anchor="w")
        self.estado.grid(row=3, column=0, padx=10, pady=5, sticky="ew")

        self.root.columnconfigure(0, weight=1)

    def conectar(self):
        host = self.host_entry.get()
        puerto = self.puerto_entry.get()
        usuario = self.usuario_entry.get()
        contrasena = self.contra_entry.get()
        bd = self.bd_entry.get()

        try:
            self.conexion = mysql.connector.connect(
                host=host,
                port=puerto,
                user=usuario,
                password=contrasena,
                database=bd
            )
            messagebox.showinfo("Éxito", "Conexión establecida correctamente.")
            self.estado.config(text=f"Estado: Conectado a {bd}@{host}:{puerto}")
        except mysql.connector.Error as err:
            messagebox.showerror("Error de conexión", str(err))

    def desconectar(self):
        if self.conexion and self.conexion.is_connected():
            self.conexion.close()
            self.conexion = None
            messagebox.showinfo("Desconectado", "Conexión cerrada.")
            self.estado.config(text="Estado: Desconectado")
        else:
            messagebox.showwarning("Aviso", "No hay conexión activa.")

    def ejecutar(self):
        if not self.conexion or not self.conexion.is_connected():
            messagebox.showwarning("Aviso", "Debe conectarse primero.")
            return

        consulta = self.query_text.get("1.0", tk.END).strip()
        if not consulta:
            messagebox.showwarning("Aviso", "Ingrese una consulta SQL.")
            return

        try:
            cursor = self.conexion.cursor()
            cursor.execute(consulta)

            if consulta.upper().startswith("SELECT"):
                filas = cursor.fetchall()
                columnas = [desc[0] for desc in cursor.description]

                # Configurar columnas del Treeview
                self.tree.delete(*self.tree.get_children())
                self.tree["columns"] = columnas
                for col in columnas:
                    self.tree.heading(col, text=col)
                    self.tree.column(col, width=100)

                for fila in filas:
                    self.tree.insert("", "end", values=fila)

                messagebox.showinfo("Consulta", f"Se obtuvieron {len(filas)} filas.")
            else:
                self.conexion.commit()
                messagebox.showinfo("Ejecución", f"Filas afectadas: {cursor.rowcount}")

            cursor.close()
        except mysql.connector.Error as err:
            messagebox.showerror("Error en consulta", str(err))

    def limpiar(self):
        self.query_text.delete("1.0", tk.END)
        self.tree.delete(*self.tree.get_children())


if __name__ == "__main__":
    root = tk.Tk()
    app = AppDB(root)
    root.mainloop()
