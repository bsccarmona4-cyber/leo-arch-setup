"""
Nombre del programa: Sistema de Inscripciones
Autor: Leo
Fecha: 30 de junio de 2026
Descripcion: Aplicacion de escritorio para gestionar alumnos, cursos e inscripciones
             utilizando SQLite como motor de base de datos y tkinter como interfaz grafica.
Tablas:
    - Alumno (entidad fuerte): IDAlumno, Nombre, ApellidoPaterno, ApellidoMaterno, CURP, Celular
    - Curso (entidad fuerte): IDCurso, Nombre, Duracion, Costo
    - Inscripcion (entidad debil): Folio, IDAlumno (FK), IDCurso (FK), Costo, Duracion
Relaciones:
    - Inscripcion depende de Alumno y Curso mediante llaves foraneas.
    - Eliminacion en cascada: al borrar un alumno o curso, se eliminan sus inscripciones.
"""

import tkinter as tk          # Libreria para interfaz grafica
from tkinter import ttk, messagebox  # Widgets mejorados y cuadros de dialogo
import sqlite3                # Motor de base de datos embebido
import os                     # Manejo de rutas de archivos

# Ruta absoluta de la base de datos, se crea en el mismo directorio del script
DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "inscripciones.db")


# ==================== CAPA DE DATOS ====================

def conectar():
    """Establece conexion con la base de datos SQLite y activa llaves foraneas."""
    con = sqlite3.connect(DB_PATH)
    con.execute("PRAGMA foreign_keys = ON")  # Habilitar integridad referencial
    return con


def crear_tablas():
    """Crea las tres tablas si no existen en la base de datos."""
    con = conectar()
    cur = con.cursor()

    # Tabla Alumno: entidad fuerte con CURP unico
    cur.execute("""
        CREATE TABLE IF NOT EXISTS Alumno (
            IDAlumno         INTEGER PRIMARY KEY AUTOINCREMENT,
            Nombre           TEXT    NOT NULL,
            ApellidoPaterno  TEXT    NOT NULL,
            ApellidoMaterno  TEXT    NOT NULL,
            CURP             TEXT    NOT NULL UNIQUE,
            Celular          TEXT    NOT NULL
        )
    """)

    # Tabla Curso: entidad fuerte
    cur.execute("""
        CREATE TABLE IF NOT EXISTS Curso (
            IDCurso  INTEGER PRIMARY KEY AUTOINCREMENT,
            Nombre   TEXT    NOT NULL,
            Duracion TEXT    NOT NULL,
            Costo    REAL    NOT NULL
        )
    """)

    # Tabla Inscripcion: entidad debil, depende de Alumno y Curso
    cur.execute("""
        CREATE TABLE IF NOT EXISTS Inscripcion (
            Folio     INTEGER PRIMARY KEY AUTOINCREMENT,
            IDAlumno  INTEGER NOT NULL,
            IDCurso   INTEGER NOT NULL,
            Costo     REAL    NOT NULL,
            Duracion  TEXT    NOT NULL,
            FOREIGN KEY (IDAlumno) REFERENCES Alumno(IDAlumno)
                ON DELETE CASCADE ON UPDATE CASCADE,
            FOREIGN KEY (IDCurso)  REFERENCES Curso(IDCurso)
                ON DELETE CASCADE ON UPDATE CASCADE
        )
    """)

    con.commit()
    con.close()


# ==================== CRUD ALUMNO ====================

def insertar_alumno(nombre, ap_pat, ap_mat, curp, cel):
    """Inserta un nuevo registro en la tabla Alumno."""
    con = conectar()
    con.execute(
        "INSERT INTO Alumno (Nombre, ApellidoPaterno, ApellidoMaterno, CURP, Celular) VALUES (?,?,?,?,?)",
        (nombre, ap_pat, ap_mat, curp, cel),
    )
    con.commit()
    con.close()


def obtener_alumnos():
    """Obtiene todos los registros de la tabla Alumno."""
    con = conectar()
    filas = con.execute("SELECT * FROM Alumno").fetchall()
    con.close()
    return filas


def actualizar_alumno(id_alumno, nombre, ap_pat, ap_mat, curp, cel):
    """Actualiza los datos de un alumno existente por su IDAlumno."""
    con = conectar()
    con.execute(
        "UPDATE Alumno SET Nombre=?, ApellidoPaterno=?, ApellidoMaterno=?, CURP=?, Celular=? WHERE IDAlumno=?",
        (nombre, ap_pat, ap_mat, curp, cel, id_alumno),
    )
    con.commit()
    con.close()


def eliminar_alumno(id_alumno):
    """Elimina un alumno por su IDAlumno. Las inscripciones asociadas se eliminan en cascada."""
    con = conectar()
    con.execute("DELETE FROM Alumno WHERE IDAlumno=?", (id_alumno,))
    con.commit()
    con.close()


# ==================== CRUD CURSO ====================

def insertar_curso(nombre, duracion, costo):
    """Inserta un nuevo registro en la tabla Curso."""
    con = conectar()
    con.execute(
        "INSERT INTO Curso (Nombre, Duracion, Costo) VALUES (?,?,?)",
        (nombre, duracion, costo),
    )
    con.commit()
    con.close()


def obtener_cursos():
    """Obtiene todos los registros de la tabla Curso."""
    con = conectar()
    filas = con.execute("SELECT * FROM Curso").fetchall()
    con.close()
    return filas


def actualizar_curso(id_curso, nombre, duracion, costo):
    """Actualiza los datos de un curso existente por su IDCurso."""
    con = conectar()
    con.execute(
        "UPDATE Curso SET Nombre=?, Duracion=?, Costo=? WHERE IDCurso=?",
        (nombre, duracion, costo, id_curso),
    )
    con.commit()
    con.close()


def eliminar_curso(id_curso):
    """Elimina un curso por su IDCurso. Las inscripciones asociadas se eliminan en cascada."""
    con = conectar()
    con.execute("DELETE FROM Curso WHERE IDCurso=?", (id_curso,))
    con.commit()
    con.close()


# ==================== CRUD INSCRIPCION ====================

def insertar_inscripcion(id_alumno, id_curso, costo, duracion):
    """Inserta un nuevo registro en la tabla Inscripcion."""
    con = conectar()
    con.execute(
        "INSERT INTO Inscripcion (IDAlumno, IDCurso, Costo, Duracion) VALUES (?,?,?,?)",
        (id_alumno, id_curso, costo, duracion),
    )
    con.commit()
    con.close()


def obtener_inscripciones():
    """Obtiene todas las inscripciones con los nombres del alumno y curso mediante JOIN."""
    con = conectar()
    filas = con.execute("""
        SELECT i.Folio,
               a.IDAlumno || ' - ' || a.Nombre || ' ' || a.ApellidoPaterno || ' ' || a.ApellidoMaterno AS Alumno,
               c.IDCurso  || ' - ' || c.Nombre AS Curso,
               i.Costo,
               i.Duracion
        FROM Inscripcion i
        JOIN Alumno a ON i.IDAlumno = a.IDAlumno
        JOIN Curso  c ON i.IDCurso  = c.IDCurso
    """).fetchall()
    con.close()
    return filas


def actualizar_inscripcion(folio, id_alumno, id_curso, costo, duracion):
    """Actualiza los datos de una inscripcion existente por su Folio."""
    con = conectar()
    con.execute(
        "UPDATE Inscripcion SET IDAlumno=?, IDCurso=?, Costo=?, Duracion=? WHERE Folio=?",
        (id_alumno, id_curso, costo, duracion, folio),
    )
    con.commit()
    con.close()


def eliminar_inscripcion(folio):
    """Elimina una inscripcion por su Folio."""
    con = conectar()
    con.execute("DELETE FROM Inscripcion WHERE Folio=?", (folio,))
    con.commit()
    con.close()


# ==================== INTERFAZ GRAFICA ====================

class App(tk.Tk):
    """Ventana principal con pestanas para gestionar Alumnos, Cursos e Inscripciones."""

    # Paleta de colores para el tema oscuro
    BG      = "#1e1e2e"    # Fondo principal
    FG      = "#cdd6f4"    # Color de texto
    ACCENT  = "#89b4fa"    # Color de acento (botones, encabezados)
    ACCENT2 = "#a6e3a1"    # Color de acento secundario (hover)
    SURFACE = "#313244"    # Fondo de campos y tablas
    RED     = "#f38ba8"    # Color para boton eliminar

    def __init__(self):
        """Inicializa la ventana principal, configura estilo y crea las tres pestanas."""
        super().__init__()
        self.title("Sistema de Inscripciones - SQLite")
        self.geometry("960x640")
        self.configure(bg=self.BG)
        self.resizable(True, True)

        self.style = ttk.Style(self)
        self._configurar_estilo()

        # Contenedor de pestanas
        self.notebook = ttk.Notebook(self)
        self.notebook.pack(fill="both", expand=True, padx=10, pady=10)

        # Crear cada pestana
        self._crear_tab_alumno()
        self._crear_tab_curso()
        self._crear_tab_inscripcion()

        # Barra de estado inferior
        self.estado = tk.Label(
            self, text=f"BD: {DB_PATH}", bg=self.SURFACE, fg=self.FG,
            anchor="w", padx=8, pady=4
        )
        self.estado.pack(fill="x", side="bottom")

        # Cargar datos iniciales en las tres tablas
        self.refrescar_alumnos()
        self.refrescar_cursos()
        self.refrescar_inscripciones()

    def _configurar_estilo(self):
        """Configura el tema visual de todos los widgets ttk."""
        self.style.theme_use("clam")

        # Pestanas
        self.style.configure("TNotebook", background=self.BG, borderwidth=0)
        self.style.configure("TNotebook.Tab", background=self.SURFACE,
                             foreground=self.FG, padding=[14, 6],
                             font=("Segoe UI", 10, "bold"))
        self.style.map("TNotebook.Tab",
                       background=[("selected", self.ACCENT)],
                       foreground=[("selected", "#1e1e2e")])

        # Frames y etiquetas
        self.style.configure("TFrame", background=self.BG)
        self.style.configure("TLabel", background=self.BG, foreground=self.FG,
                             font=("Segoe UI", 10))

        # Campos de entrada
        self.style.configure("TEntry", fieldbackground=self.SURFACE,
                             foreground=self.FG, insertcolor=self.FG)

        # Botones normales
        self.style.configure("TButton", background=self.ACCENT,
                             foreground="#1e1e2e", font=("Segoe UI", 9, "bold"),
                             padding=[10, 4])
        self.style.map("TButton", background=[("active", self.ACCENT2)])

        # Boton de eliminar (rojo)
        self.style.configure("Danger.TButton", background=self.RED,
                             foreground="#1e1e2e")
        self.style.map("Danger.TButton", background=[("active", "#eba0ac")])

        # Tabla de datos (Treeview)
        self.style.configure("Treeview", background=self.SURFACE,
                             foreground=self.FG, fieldbackground=self.SURFACE,
                             font=("Segoe UI", 9), rowheight=26)
        self.style.configure("Treeview.Heading", background=self.ACCENT,
                             foreground="#1e1e2e", font=("Segoe UI", 9, "bold"))
        self.style.map("Treeview", background=[("selected", self.ACCENT)],
                       foreground=[("selected", "#1e1e2e")])

        # LabelFrame
        self.style.configure("TLabelframe", background=self.BG,
                             foreground=self.ACCENT, font=("Segoe UI", 10, "bold"))
        self.style.configure("TLabelframe.Label", background=self.BG,
                             foreground=self.ACCENT)

        # Combobox
        self.style.configure("TCombobox", fieldbackground=self.SURFACE,
                             foreground=self.FG)

    # ==================== PESTANA ALUMNO ====================

    def _crear_tab_alumno(self):
        """Crea la pestana de Alumnos con formulario, botones CRUD y tabla de datos."""
        tab = ttk.Frame(self.notebook)
        self.notebook.add(tab, text="  Alumnos  ")

        # Formulario de captura
        form = ttk.LabelFrame(tab, text="Datos del Alumno", padding=12)
        form.pack(fill="x", padx=10, pady=(10, 5))

        # Campos del formulario
        labels = ["ID Alumno:", "Nombre:", "Apellido Paterno:", "Apellido Materno:", "CURP:", "Celular:"]
        self.alu_entries = {}
        for i, lbl in enumerate(labels):
            ttk.Label(form, text=lbl).grid(row=i, column=0, sticky="w", pady=3, padx=(0, 8))
            e = ttk.Entry(form, width=35)
            e.grid(row=i, column=1, pady=3)
            self.alu_entries[lbl] = e

        # ID es solo lectura, se genera automaticamente
        self.alu_entries["ID Alumno:"].configure(state="readonly")

        # Botones de operaciones CRUD
        btn_frame = ttk.Frame(form)
        btn_frame.grid(row=len(labels), column=0, columnspan=2, pady=10)

        ttk.Button(btn_frame, text="Agregar",    command=self.agregar_alumno).pack(side="left", padx=4)
        ttk.Button(btn_frame, text="Actualizar", command=self.actualizar_alumno_gui).pack(side="left", padx=4)
        ttk.Button(btn_frame, text="Eliminar",   command=self.eliminar_alumno_gui, style="Danger.TButton").pack(side="left", padx=4)
        ttk.Button(btn_frame, text="Limpiar",    command=self.limpiar_alumno).pack(side="left", padx=4)

        # Tabla para mostrar los registros de alumnos
        cols = ("IDAlumno", "Nombre", "ApellidoPaterno", "ApellidoMaterno", "CURP", "Celular")
        self.tree_alu = ttk.Treeview(tab, columns=cols, show="headings", height=10)
        for c in cols:
            self.tree_alu.heading(c, text=c)
            self.tree_alu.column(c, width=120, anchor="center")
        self.tree_alu.pack(fill="both", expand=True, padx=10, pady=(5, 10))

        # Al seleccionar una fila, se cargan los datos en el formulario
        self.tree_alu.bind("<<TreeviewSelect>>", self._seleccionar_alumno)

    def refrescar_alumnos(self):
        """Recarga todos los registros de alumnos en la tabla."""
        for item in self.tree_alu.get_children():
            self.tree_alu.delete(item)
        for fila in obtener_alumnos():
            self.tree_alu.insert("", "end", values=fila)

    def _seleccionar_alumno(self, _event=None):
        """Carga los datos del alumno seleccionado en el formulario."""
        sel = self.tree_alu.selection()
        if not sel:
            return
        vals = self.tree_alu.item(sel[0], "values")
        keys = list(self.alu_entries.keys())
        for i, v in enumerate(vals):
            entry = self.alu_entries[keys[i]]
            entry.configure(state="normal")
            entry.delete(0, "end")
            entry.insert(0, v)
        self.alu_entries["ID Alumno:"].configure(state="readonly")

    def agregar_alumno(self):
        """Valida los campos y agrega un nuevo alumno a la base de datos."""
        vals = [self.alu_entries[k].get().strip() for k in list(self.alu_entries.keys())[1:]]
        if not all(vals):
            messagebox.showwarning("Campos vacios", "Complete todos los campos.")
            return
        try:
            insertar_alumno(*vals)
            self.refrescar_alumnos()
            self.refrescar_inscripciones()
            self.limpiar_alumno()
            messagebox.showinfo("Exito", "Alumno agregado.")
        except sqlite3.IntegrityError as e:
            messagebox.showerror("Error", str(e))

    def actualizar_alumno_gui(self):
        """Valida los campos y actualiza el alumno seleccionado."""
        id_val = self.alu_entries["ID Alumno:"].get().strip()
        if not id_val:
            messagebox.showwarning("Aviso", "Seleccione un alumno de la tabla.")
            return
        vals = [self.alu_entries[k].get().strip() for k in list(self.alu_entries.keys())[1:]]
        if not all(vals):
            messagebox.showwarning("Campos vacios", "Complete todos los campos.")
            return
        try:
            actualizar_alumno(int(id_val), *vals)
            self.refrescar_alumnos()
            self.refrescar_inscripciones()
            self.limpiar_alumno()
            messagebox.showinfo("Exito", "Alumno actualizado.")
        except sqlite3.IntegrityError as e:
            messagebox.showerror("Error", str(e))

    def eliminar_alumno_gui(self):
        """Confirma y elimina el alumno seleccionado junto con sus inscripciones."""
        id_val = self.alu_entries["ID Alumno:"].get().strip()
        if not id_val:
            messagebox.showwarning("Aviso", "Seleccione un alumno de la tabla.")
            return
        if not messagebox.askyesno("Confirmar", "Eliminar este alumno y sus inscripciones?"):
            return
        eliminar_alumno(int(id_val))
        self.refrescar_alumnos()
        self.refrescar_inscripciones()
        self.limpiar_alumno()

    def limpiar_alumno(self):
        """Limpia todos los campos del formulario de alumno."""
        for k, e in self.alu_entries.items():
            e.configure(state="normal")
            e.delete(0, "end")
        self.alu_entries["ID Alumno:"].configure(state="readonly")

    # ==================== PESTANA CURSO ====================

    def _crear_tab_curso(self):
        """Crea la pestana de Cursos con formulario, botones CRUD y tabla de datos."""
        tab = ttk.Frame(self.notebook)
        self.notebook.add(tab, text="  Cursos  ")

        form = ttk.LabelFrame(tab, text="Datos del Curso", padding=12)
        form.pack(fill="x", padx=10, pady=(10, 5))

        labels = ["ID Curso:", "Nombre:", "Duracion:", "Costo:"]
        self.cur_entries = {}
        for i, lbl in enumerate(labels):
            ttk.Label(form, text=lbl).grid(row=i, column=0, sticky="w", pady=3, padx=(0, 8))
            e = ttk.Entry(form, width=35)
            e.grid(row=i, column=1, pady=3)
            self.cur_entries[lbl] = e

        self.cur_entries["ID Curso:"].configure(state="readonly")

        btn_frame = ttk.Frame(form)
        btn_frame.grid(row=len(labels), column=0, columnspan=2, pady=10)

        ttk.Button(btn_frame, text="Agregar",    command=self.agregar_curso).pack(side="left", padx=4)
        ttk.Button(btn_frame, text="Actualizar", command=self.actualizar_curso_gui).pack(side="left", padx=4)
        ttk.Button(btn_frame, text="Eliminar",   command=self.eliminar_curso_gui, style="Danger.TButton").pack(side="left", padx=4)
        ttk.Button(btn_frame, text="Limpiar",    command=self.limpiar_curso).pack(side="left", padx=4)

        cols = ("IDCurso", "Nombre", "Duracion", "Costo")
        self.tree_cur = ttk.Treeview(tab, columns=cols, show="headings", height=10)
        for c in cols:
            self.tree_cur.heading(c, text=c)
            self.tree_cur.column(c, width=160, anchor="center")
        self.tree_cur.pack(fill="both", expand=True, padx=10, pady=(5, 10))
        self.tree_cur.bind("<<TreeviewSelect>>", self._seleccionar_curso)

    def refrescar_cursos(self):
        """Recarga todos los registros de cursos en la tabla."""
        for item in self.tree_cur.get_children():
            self.tree_cur.delete(item)
        for fila in obtener_cursos():
            self.tree_cur.insert("", "end", values=fila)

    def _seleccionar_curso(self, _event=None):
        """Carga los datos del curso seleccionado en el formulario."""
        sel = self.tree_cur.selection()
        if not sel:
            return
        vals = self.tree_cur.item(sel[0], "values")
        keys = list(self.cur_entries.keys())
        for i, v in enumerate(vals):
            entry = self.cur_entries[keys[i]]
            entry.configure(state="normal")
            entry.delete(0, "end")
            entry.insert(0, v)
        self.cur_entries["ID Curso:"].configure(state="readonly")

    def agregar_curso(self):
        """Valida los campos y agrega un nuevo curso a la base de datos."""
        vals = [self.cur_entries[k].get().strip() for k in list(self.cur_entries.keys())[1:]]
        if not all(vals):
            messagebox.showwarning("Campos vacios", "Complete todos los campos.")
            return
        try:
            insertar_curso(vals[0], vals[1], float(vals[2]))
            self.refrescar_cursos()
            self.refrescar_inscripciones()
            self.limpiar_curso()
            messagebox.showinfo("Exito", "Curso agregado.")
        except (sqlite3.IntegrityError, ValueError) as e:
            messagebox.showerror("Error", str(e))

    def actualizar_curso_gui(self):
        """Valida los campos y actualiza el curso seleccionado."""
        id_val = self.cur_entries["ID Curso:"].get().strip()
        if not id_val:
            messagebox.showwarning("Aviso", "Seleccione un curso de la tabla.")
            return
        vals = [self.cur_entries[k].get().strip() for k in list(self.cur_entries.keys())[1:]]
        if not all(vals):
            messagebox.showwarning("Campos vacios", "Complete todos los campos.")
            return
        try:
            actualizar_curso(int(id_val), vals[0], vals[1], float(vals[2]))
            self.refrescar_cursos()
            self.refrescar_inscripciones()
            self.limpiar_curso()
            messagebox.showinfo("Exito", "Curso actualizado.")
        except (sqlite3.IntegrityError, ValueError) as e:
            messagebox.showerror("Error", str(e))

    def eliminar_curso_gui(self):
        """Confirma y elimina el curso seleccionado junto con sus inscripciones."""
        id_val = self.cur_entries["ID Curso:"].get().strip()
        if not id_val:
            messagebox.showwarning("Aviso", "Seleccione un curso de la tabla.")
            return
        if not messagebox.askyesno("Confirmar", "Eliminar este curso y sus inscripciones?"):
            return
        eliminar_curso(int(id_val))
        self.refrescar_cursos()
        self.refrescar_inscripciones()
        self.limpiar_curso()

    def limpiar_curso(self):
        """Limpia todos los campos del formulario de curso."""
        for k, e in self.cur_entries.items():
            e.configure(state="normal")
            e.delete(0, "end")
        self.cur_entries["ID Curso:"].configure(state="readonly")

    # ==================== PESTANA INSCRIPCION ====================

    def _crear_tab_inscripcion(self):
        """Crea la pestana de Inscripciones con formulario, combos, botones CRUD y tabla."""
        tab = ttk.Frame(self.notebook)
        self.notebook.add(tab, text="  Inscripciones  ")

        form = ttk.LabelFrame(tab, text="Datos de Inscripcion", padding=12)
        form.pack(fill="x", padx=10, pady=(10, 5))

        # Folio (solo lectura, autoincremental)
        ttk.Label(form, text="Folio:").grid(row=0, column=0, sticky="w", pady=3, padx=(0, 8))
        self.insc_folio = ttk.Entry(form, width=35, state="readonly")
        self.insc_folio.grid(row=0, column=1, pady=3)

        # Combobox para seleccionar alumno existente
        ttk.Label(form, text="Alumno:").grid(row=1, column=0, sticky="w", pady=3, padx=(0, 8))
        self.insc_alumno_cb = ttk.Combobox(form, width=33, state="readonly")
        self.insc_alumno_cb.grid(row=1, column=1, pady=3)

        # Combobox para seleccionar curso existente
        ttk.Label(form, text="Curso:").grid(row=2, column=0, sticky="w", pady=3, padx=(0, 8))
        self.insc_curso_cb = ttk.Combobox(form, width=33, state="readonly")
        self.insc_curso_cb.grid(row=2, column=1, pady=3)
        # Al seleccionar un curso, se autocompletan costo y duracion
        self.insc_curso_cb.bind("<<ComboboxSelected>>", self._autorellenar_inscripcion)

        # Costo de la inscripcion
        ttk.Label(form, text="Costo:").grid(row=3, column=0, sticky="w", pady=3, padx=(0, 8))
        self.insc_costo = ttk.Entry(form, width=35)
        self.insc_costo.grid(row=3, column=1, pady=3)

        # Duracion de la inscripcion
        ttk.Label(form, text="Duracion:").grid(row=4, column=0, sticky="w", pady=3, padx=(0, 8))
        self.insc_duracion = ttk.Entry(form, width=35)
        self.insc_duracion.grid(row=4, column=1, pady=3)

        # Botones CRUD
        btn_frame = ttk.Frame(form)
        btn_frame.grid(row=5, column=0, columnspan=2, pady=10)

        ttk.Button(btn_frame, text="Agregar",    command=self.agregar_inscripcion).pack(side="left", padx=4)
        ttk.Button(btn_frame, text="Actualizar", command=self.actualizar_inscripcion_gui).pack(side="left", padx=4)
        ttk.Button(btn_frame, text="Eliminar",   command=self.eliminar_inscripcion_gui, style="Danger.TButton").pack(side="left", padx=4)
        ttk.Button(btn_frame, text="Limpiar",    command=self.limpiar_inscripcion).pack(side="left", padx=4)

        # Tabla de inscripciones con datos de alumno y curso concatenados
        cols = ("Folio", "Alumno", "Curso", "Costo", "Duracion")
        self.tree_insc = ttk.Treeview(tab, columns=cols, show="headings", height=10)
        for c in cols:
            self.tree_insc.heading(c, text=c)
            self.tree_insc.column(c, width=150, anchor="center")
        self.tree_insc.pack(fill="both", expand=True, padx=10, pady=(5, 10))
        self.tree_insc.bind("<<TreeviewSelect>>", self._seleccionar_inscripcion)

    def _cargar_combos(self):
        """Actualiza las listas desplegables de alumnos y cursos."""
        alumnos = obtener_alumnos()
        self.insc_alumno_cb["values"] = [
            f"{a[0]} - {a[1]} {a[2]} {a[3]}" for a in alumnos
        ]
        # Mapeo de texto del combo -> IDAlumno
        self._alumnos_map = {f"{a[0]} - {a[1]} {a[2]} {a[3]}": a[0] for a in alumnos}

        cursos = obtener_cursos()
        self.insc_curso_cb["values"] = [
            f"{c[0]} - {c[1]}" for c in cursos
        ]
        # Mapeo de texto del combo -> tupla completa del curso
        self._cursos_map = {f"{c[0]} - {c[1]}": c for c in cursos}

    def _autorellenar_inscripcion(self, _event=None):
        """Al seleccionar un curso, copia su costo y duracion al formulario."""
        sel = self.insc_curso_cb.get()
        if sel in self._cursos_map:
            curso = self._cursos_map[sel]
            self.insc_costo.delete(0, "end")
            self.insc_costo.insert(0, str(curso[3]))    # Costo del curso
            self.insc_duracion.delete(0, "end")
            self.insc_duracion.insert(0, str(curso[2]))  # Duracion del curso

    def refrescar_inscripciones(self):
        """Recarga todos los registros de inscripciones y actualiza los combos."""
        for item in self.tree_insc.get_children():
            self.tree_insc.delete(item)
        for fila in obtener_inscripciones():
            self.tree_insc.insert("", "end", values=fila)
        self._cargar_combos()

    def _seleccionar_inscripcion(self, _event=None):
        """Carga los datos de la inscripcion seleccionada en el formulario."""
        sel = self.tree_insc.selection()
        if not sel:
            return
        vals = self.tree_insc.item(sel[0], "values")
        self.insc_folio.configure(state="normal")
        self.insc_folio.delete(0, "end")
        self.insc_folio.insert(0, vals[0])
        self.insc_folio.configure(state="readonly")
        self.insc_alumno_cb.set(vals[1])
        self.insc_curso_cb.set(vals[2])
        self.insc_costo.delete(0, "end")
        self.insc_costo.insert(0, vals[3])
        self.insc_duracion.delete(0, "end")
        self.insc_duracion.insert(0, vals[4])

    def agregar_inscripcion(self):
        """Valida los campos y registra una nueva inscripcion."""
        alumno_sel = self.insc_alumno_cb.get()
        curso_sel = self.insc_curso_cb.get()
        costo = self.insc_costo.get().strip()
        duracion = self.insc_duracion.get().strip()

        if not alumno_sel or not curso_sel or not costo or not duracion:
            messagebox.showwarning("Campos vacios", "Complete todos los campos.")
            return

        id_alumno = self._alumnos_map.get(alumno_sel)
        curso_data = self._cursos_map.get(curso_sel)
        if id_alumno is None or curso_data is None:
            messagebox.showerror("Error", "Seleccione un alumno y un curso validos.")
            return

        try:
            insertar_inscripcion(id_alumno, curso_data[0], float(costo), duracion)
            self.refrescar_inscripciones()
            self.limpiar_inscripcion()
            messagebox.showinfo("Exito", "Inscripcion registrada.")
        except (sqlite3.IntegrityError, ValueError) as e:
            messagebox.showerror("Error", str(e))

    def actualizar_inscripcion_gui(self):
        """Valida los campos y actualiza la inscripcion seleccionada."""
        folio = self.insc_folio.get().strip()
        if not folio:
            messagebox.showwarning("Aviso", "Seleccione una inscripcion de la tabla.")
            return

        alumno_sel = self.insc_alumno_cb.get()
        curso_sel = self.insc_curso_cb.get()
        costo = self.insc_costo.get().strip()
        duracion = self.insc_duracion.get().strip()

        if not alumno_sel or not curso_sel or not costo or not duracion:
            messagebox.showwarning("Campos vacios", "Complete todos los campos.")
            return

        id_alumno = self._alumnos_map.get(alumno_sel)
        curso_data = self._cursos_map.get(curso_sel)
        if id_alumno is None or curso_data is None:
            messagebox.showerror("Error", "Seleccione un alumno y un curso validos.")
            return

        try:
            actualizar_inscripcion(int(folio), id_alumno, curso_data[0], float(costo), duracion)
            self.refrescar_inscripciones()
            self.limpiar_inscripcion()
            messagebox.showinfo("Exito", "Inscripcion actualizada.")
        except (sqlite3.IntegrityError, ValueError) as e:
            messagebox.showerror("Error", str(e))

    def eliminar_inscripcion_gui(self):
        """Confirma y elimina la inscripcion seleccionada."""
        folio = self.insc_folio.get().strip()
        if not folio:
            messagebox.showwarning("Aviso", "Seleccione una inscripcion de la tabla.")
            return
        if not messagebox.askyesno("Confirmar", "Eliminar esta inscripcion?"):
            return
        eliminar_inscripcion(int(folio))
        self.refrescar_inscripciones()
        self.limpiar_inscripcion()

    def limpiar_inscripcion(self):
        """Limpia todos los campos del formulario de inscripcion."""
        self.insc_folio.configure(state="normal")
        self.insc_folio.delete(0, "end")
        self.insc_folio.configure(state="readonly")
        self.insc_alumno_cb.set("")
        self.insc_curso_cb.set("")
        self.insc_costo.delete(0, "end")
        self.insc_duracion.delete(0, "end")


# ==================== PUNTO DE ENTRADA ====================

if __name__ == "__main__":
    crear_tablas()   # Crea las tablas si no existen
    app = App()      # Inicializa la interfaz grafica
    app.mainloop()   # Inicia el bucle de eventos
