"""
Interfaz Gráfica — Sistema de Inventario
=========================================
Ventana con tkinter que permite gestionar productos
usando la clase Producto del ejercicio 1.

Ejecutar:  python inventario_gui.py
"""

import tkinter as tk
from tkinter import ttk, messagebox
from ejercicio1.producto import Producto


class InventarioApp:
    """Aplicación de escritorio para gestionar un inventario de productos."""

    # ── Paleta de colores ────────────────────────────────────────────────
    BG_DARK      = "#1a1b2e"
    BG_PANEL     = "#232440"
    BG_CARD      = "#2c2d50"
    BG_INPUT     = "#363760"
    ACCENT       = "#6c63ff"
    ACCENT_HOVER = "#8b83ff"
    SUCCESS      = "#4ade80"
    WARNING      = "#fbbf24"
    DANGER       = "#f87171"
    TEXT_PRIMARY  = "#e8e8f0"
    TEXT_SECONDARY= "#a0a0c0"
    TEXT_MUTED    = "#6b6b8d"
    BORDER       = "#3d3e66"

    def __init__(self, root: tk.Tk) -> None:
        self.root = root
        self.root.title("Sistema de Inventario — POO Python")
        self.root.configure(bg=self.BG_DARK)
        self.root.geometry("1100x700")
        self.root.minsize(900, 600)

        # Lista de productos en memoria
        self.productos: list[Producto] = []

        # Producto seleccionado en la tabla
        self._sel_index: int | None = None

        # Estilos
        self._configurar_estilos()

        # Layout
        self._crear_header()
        self._crear_cuerpo()
        self._crear_footer()

        # Datos de ejemplo
        self._cargar_datos_ejemplo()

    # ═══════════════════════════════════════════════════════════════════
    #  ESTILOS
    # ═══════════════════════════════════════════════════════════════════

    def _configurar_estilos(self) -> None:
        style = ttk.Style()
        style.theme_use("clam")

        # Treeview (tabla)
        style.configure(
            "Inv.Treeview",
            background=self.BG_CARD,
            foreground=self.TEXT_PRIMARY,
            fieldbackground=self.BG_CARD,
            rowheight=32,
            font=("Segoe UI", 10),
            borderwidth=0,
        )
        style.configure(
            "Inv.Treeview.Heading",
            background=self.BG_PANEL,
            foreground=self.ACCENT,
            font=("Segoe UI", 10, "bold"),
            borderwidth=0,
            relief="flat",
        )
        style.map(
            "Inv.Treeview",
            background=[("selected", self.ACCENT)],
            foreground=[("selected", "#ffffff")],
        )

    # ═══════════════════════════════════════════════════════════════════
    #  HEADER
    # ═══════════════════════════════════════════════════════════════════

    def _crear_header(self) -> None:
        header = tk.Frame(self.root, bg=self.BG_PANEL, height=70)
        header.pack(fill="x")
        header.pack_propagate(False)

        tk.Label(
            header, text="📦  Sistema de Inventario",
            bg=self.BG_PANEL, fg=self.TEXT_PRIMARY,
            font=("Segoe UI", 18, "bold"),
        ).pack(side="left", padx=20, pady=15)

        # Badge con total de productos
        self._lbl_total = tk.Label(
            header, text="0 productos",
            bg=self.ACCENT, fg="#ffffff",
            font=("Segoe UI", 10, "bold"),
            padx=12, pady=4,
        )
        self._lbl_total.pack(side="right", padx=20)

        # Valor total del inventario
        self._lbl_valor = tk.Label(
            header, text="Valor total: $0.00",
            bg=self.BG_PANEL, fg=self.SUCCESS,
            font=("Segoe UI", 11),
        )
        self._lbl_valor.pack(side="right", padx=10)

    # ═══════════════════════════════════════════════════════════════════
    #  CUERPO (Panel izquierdo: formulario  |  Panel derecho: tabla)
    # ═══════════════════════════════════════════════════════════════════

    def _crear_cuerpo(self) -> None:
        body = tk.Frame(self.root, bg=self.BG_DARK)
        body.pack(fill="both", expand=True, padx=15, pady=10)

        # Panel izquierdo — Formulario
        left = tk.Frame(body, bg=self.BG_PANEL, width=340)
        left.pack(side="left", fill="y", padx=(0, 10))
        left.pack_propagate(False)
        self._crear_formulario(left)

        # Panel derecho — Tabla
        right = tk.Frame(body, bg=self.BG_PANEL)
        right.pack(side="left", fill="both", expand=True)
        self._crear_tabla(right)

    # ── Formulario ───────────────────────────────────────────────────────

    def _crear_formulario(self, parent: tk.Frame) -> None:
        # Título
        tk.Label(
            parent, text="Agregar / Editar Producto",
            bg=self.BG_PANEL, fg=self.TEXT_PRIMARY,
            font=("Segoe UI", 13, "bold"),
        ).pack(padx=15, pady=(15, 5), anchor="w")

        sep = tk.Frame(parent, bg=self.ACCENT, height=2)
        sep.pack(fill="x", padx=15, pady=(0, 15))

        # Campos
        self._entries: dict[str, tk.Entry] = {}
        campos = [
            ("nombre",   "Nombre del producto"),
            ("precio",   "Precio unitario ($)"),
            ("stock",    "Cantidad en stock"),
        ]
        for key, label_text in campos:
            tk.Label(
                parent, text=label_text,
                bg=self.BG_PANEL, fg=self.TEXT_SECONDARY,
                font=("Segoe UI", 10),
            ).pack(padx=20, pady=(5, 2), anchor="w")

            entry = tk.Entry(
                parent,
                bg=self.BG_INPUT, fg=self.TEXT_PRIMARY,
                insertbackground=self.TEXT_PRIMARY,
                font=("Segoe UI", 11),
                relief="flat", bd=0,
                highlightthickness=2,
                highlightbackground=self.BORDER,
                highlightcolor=self.ACCENT,
            )
            entry.pack(padx=20, pady=(0, 8), fill="x", ipady=6)
            self._entries[key] = entry

        # ── Botones ──────────────────────────────────────────────────────
        btn_frame = tk.Frame(parent, bg=self.BG_PANEL)
        btn_frame.pack(padx=15, pady=(15, 5), fill="x")

        self._btn_agregar = self._crear_boton(
            btn_frame, "➕  Agregar", self.ACCENT, self._on_agregar
        )
        self._btn_agregar.pack(fill="x", pady=3)

        self._btn_editar = self._crear_boton(
            btn_frame, "✏️  Actualizar", self.WARNING, self._on_actualizar
        )
        self._btn_editar.pack(fill="x", pady=3)

        self._btn_eliminar = self._crear_boton(
            btn_frame, "🗑️  Eliminar", self.DANGER, self._on_eliminar
        )
        self._btn_eliminar.pack(fill="x", pady=3)

        # ── Operaciones rápidas ──────────────────────────────────────────
        tk.Label(
            parent, text="Operaciones rápidas",
            bg=self.BG_PANEL, fg=self.TEXT_PRIMARY,
            font=("Segoe UI", 11, "bold"),
        ).pack(padx=15, pady=(20, 5), anchor="w")

        sep2 = tk.Frame(parent, bg=self.ACCENT, height=2)
        sep2.pack(fill="x", padx=15, pady=(0, 10))

        ops_frame = tk.Frame(parent, bg=self.BG_PANEL)
        ops_frame.pack(padx=15, fill="x")

        # Campo de cantidad
        tk.Label(
            ops_frame, text="Cantidad:",
            bg=self.BG_PANEL, fg=self.TEXT_SECONDARY,
            font=("Segoe UI", 10),
        ).pack(anchor="w", pady=(0, 2))

        self._entry_cantidad = tk.Entry(
            ops_frame,
            bg=self.BG_INPUT, fg=self.TEXT_PRIMARY,
            insertbackground=self.TEXT_PRIMARY,
            font=("Segoe UI", 11),
            relief="flat", bd=0,
            highlightthickness=2,
            highlightbackground=self.BORDER,
            highlightcolor=self.ACCENT,
            width=10,
        )
        self._entry_cantidad.pack(fill="x", ipady=6, pady=(0, 8))

        row = tk.Frame(ops_frame, bg=self.BG_PANEL)
        row.pack(fill="x")

        self._crear_boton(
            row, "📥 +Stock", self.SUCCESS, self._on_agregar_stock
        ).pack(side="left", expand=True, fill="x", padx=(0, 3))

        self._crear_boton(
            row, "🛒 Vender", "#3b82f6", self._on_vender
        ).pack(side="left", expand=True, fill="x", padx=(3, 0))

    def _crear_boton(
        self, parent: tk.Frame, text: str, color: str, command
    ) -> tk.Button:
        btn = tk.Button(
            parent, text=text,
            bg=color, fg="#ffffff",
            activebackground=color, activeforeground="#ffffff",
            font=("Segoe UI", 10, "bold"),
            relief="flat", bd=0, cursor="hand2",
            command=command,
        )
        btn.configure(height=1, pady=4)

        # Hover effect
        def on_enter(e, b=btn, c=color):
            r = int(c[1:3], 16)
            g = int(c[3:5], 16)
            b_val = int(c[5:7], 16)
            lighter = f"#{min(r+30,255):02x}{min(g+30,255):02x}{min(b_val+30,255):02x}"
            b.configure(bg=lighter)

        def on_leave(e, b=btn, c=color):
            b.configure(bg=c)

        btn.bind("<Enter>", on_enter)
        btn.bind("<Leave>", on_leave)
        return btn

    # ── Tabla ────────────────────────────────────────────────────────────

    def _crear_tabla(self, parent: tk.Frame) -> None:
        # Título
        top = tk.Frame(parent, bg=self.BG_PANEL)
        top.pack(fill="x", padx=15, pady=(10, 5))

        tk.Label(
            top, text="Inventario de Productos",
            bg=self.BG_PANEL, fg=self.TEXT_PRIMARY,
            font=("Segoe UI", 13, "bold"),
        ).pack(side="left")

        # Barra de búsqueda
        search_frame = tk.Frame(top, bg=self.BG_INPUT, highlightthickness=1,
                                highlightbackground=self.BORDER)
        search_frame.pack(side="right")

        tk.Label(
            search_frame, text="🔍",
            bg=self.BG_INPUT, fg=self.TEXT_MUTED,
            font=("Segoe UI", 10),
        ).pack(side="left", padx=(5, 0))

        self._search_var = tk.StringVar()
        self._search_var.trace_add("write", self._on_buscar)
        search_entry = tk.Entry(
            search_frame,
            textvariable=self._search_var,
            bg=self.BG_INPUT, fg=self.TEXT_PRIMARY,
            insertbackground=self.TEXT_PRIMARY,
            font=("Segoe UI", 10),
            relief="flat", bd=0, width=20,
        )
        search_entry.pack(side="left", padx=5, ipady=4)

        sep = tk.Frame(parent, bg=self.ACCENT, height=2)
        sep.pack(fill="x", padx=15, pady=(0, 5))

        # Treeview
        cols = ("id", "nombre", "precio", "stock", "valor")
        tree_frame = tk.Frame(parent, bg=self.BG_PANEL)
        tree_frame.pack(fill="both", expand=True, padx=15, pady=(0, 10))

        self.tree = ttk.Treeview(
            tree_frame, columns=cols, show="headings",
            style="Inv.Treeview", selectmode="browse",
        )

        headings = {
            "id":      ("ID",     50),
            "nombre":  ("Nombre", 200),
            "precio":  ("Precio", 120),
            "stock":   ("Stock",  80),
            "valor":   ("Valor Inv.", 130),
        }
        for col, (text, width) in headings.items():
            self.tree.heading(col, text=text, anchor="center")
            anchor = "center" if col in ("id", "stock") else ("e" if col in ("precio", "valor") else "w")
            self.tree.column(col, width=width, anchor=anchor, minwidth=50)

        scrollbar = ttk.Scrollbar(tree_frame, orient="vertical", command=self.tree.yview)
        self.tree.configure(yscrollcommand=scrollbar.set)

        self.tree.pack(side="left", fill="both", expand=True)
        scrollbar.pack(side="right", fill="y")

        # Evento de selección
        self.tree.bind("<<TreeviewSelect>>", self._on_seleccionar)

    # ═══════════════════════════════════════════════════════════════════
    #  FOOTER
    # ═══════════════════════════════════════════════════════════════════

    def _crear_footer(self) -> None:
        footer = tk.Frame(self.root, bg=self.BG_PANEL, height=35)
        footer.pack(fill="x", side="bottom")
        footer.pack_propagate(False)

        self._lbl_status = tk.Label(
            footer, text="Listo",
            bg=self.BG_PANEL, fg=self.TEXT_MUTED,
            font=("Segoe UI", 9),
        )
        self._lbl_status.pack(side="left", padx=15)

        tk.Label(
            footer, text="POO — Python · Tkinter",
            bg=self.BG_PANEL, fg=self.TEXT_MUTED,
            font=("Segoe UI", 9),
        ).pack(side="right", padx=15)

    # ═══════════════════════════════════════════════════════════════════
    #  LÓGICA
    # ═══════════════════════════════════════════════════════════════════

    def _leer_formulario(self) -> tuple[str, float, int]:
        """Lee y valida los campos del formulario."""
        nombre = self._entries["nombre"].get().strip()
        if not nombre:
            raise ValueError("El nombre no puede estar vacío.")

        try:
            precio = float(self._entries["precio"].get())
        except ValueError:
            raise ValueError("El precio debe ser un número válido.")
        if precio < 0:
            raise ValueError("El precio no puede ser negativo.")

        try:
            stock = int(self._entries["stock"].get())
        except ValueError:
            raise ValueError("El stock debe ser un número entero.")
        if stock < 0:
            raise ValueError("El stock no puede ser negativo.")

        return nombre, precio, stock

    def _limpiar_formulario(self) -> None:
        for entry in self._entries.values():
            entry.delete(0, tk.END)
        self._entry_cantidad.delete(0, tk.END)
        self._sel_index = None

    def _actualizar_tabla(self, filtro: str = "") -> None:
        """Reconstruye la tabla con los productos actuales."""
        for item in self.tree.get_children():
            self.tree.delete(item)

        for prod in self.productos:
            nombre = prod.get_nombre()
            if filtro and filtro.lower() not in nombre.lower():
                continue
            self.tree.insert("", "end", values=(
                prod.get_id(),
                nombre,
                f"${prod.get_precio():,.2f}",
                prod.get_stock(),
                f"${prod.calcular_valor_inventario():,.2f}",
            ))

        # Actualizar header
        total = len(self.productos)
        self._lbl_total.configure(text=f"{total} producto{'s' if total != 1 else ''}")

        valor = sum(p.calcular_valor_inventario() for p in self.productos)
        self._lbl_valor.configure(text=f"Valor total: ${valor:,.2f}")

    def _status(self, msg: str, color: str | None = None) -> None:
        self._lbl_status.configure(
            text=msg,
            fg=color or self.TEXT_MUTED,
        )

    def _obtener_seleccionado(self) -> Producto | None:
        """Retorna el producto seleccionado en la tabla o None."""
        sel = self.tree.selection()
        if not sel:
            return None
        values = self.tree.item(sel[0], "values")
        prod_id = int(values[0])
        for p in self.productos:
            if p.get_id() == prod_id:
                return p
        return None

    # ── Callbacks ────────────────────────────────────────────────────────

    def _on_agregar(self) -> None:
        try:
            nombre, precio, stock = self._leer_formulario()
        except ValueError as e:
            messagebox.showwarning("Datos inválidos", str(e))
            return

        prod = Producto(nombre, precio, stock)
        self.productos.append(prod)
        self._actualizar_tabla()
        self._limpiar_formulario()
        self._status(f"✓ Producto '{nombre}' agregado (ID={prod.get_id()})", self.SUCCESS)

    def _on_actualizar(self) -> None:
        prod = self._obtener_seleccionado()
        if prod is None:
            messagebox.showinfo("Sin selección", "Selecciona un producto de la tabla para editarlo.")
            return
        try:
            nombre, precio, stock = self._leer_formulario()
        except ValueError as e:
            messagebox.showwarning("Datos inválidos", str(e))
            return

        try:
            prod.set_nombre(nombre)
            prod.set_precio(precio)
            prod.set_stock(stock)
        except ValueError as e:
            messagebox.showerror("Error de validación", str(e))
            return

        self._actualizar_tabla()
        self._limpiar_formulario()
        self._status(f"✏️ Producto ID={prod.get_id()} actualizado", self.WARNING)

    def _on_eliminar(self) -> None:
        prod = self._obtener_seleccionado()
        if prod is None:
            messagebox.showinfo("Sin selección", "Selecciona un producto de la tabla para eliminarlo.")
            return

        confirmar = messagebox.askyesno(
            "Confirmar eliminación",
            f"¿Eliminar '{prod.get_nombre()}' del inventario?",
        )
        if confirmar:
            self.productos.remove(prod)
            self._actualizar_tabla()
            self._limpiar_formulario()
            self._status(f"🗑️ Producto eliminado", self.DANGER)

    def _on_agregar_stock(self) -> None:
        prod = self._obtener_seleccionado()
        if prod is None:
            messagebox.showinfo("Sin selección", "Selecciona un producto primero.")
            return
        try:
            cantidad = int(self._entry_cantidad.get())
            prod.agregar_stock(cantidad)
        except (ValueError, Exception) as e:
            messagebox.showerror("Error", str(e))
            return
        self._actualizar_tabla()
        self._entry_cantidad.delete(0, tk.END)
        self._status(f"📥 +{cantidad} unidades a '{prod.get_nombre()}'", self.SUCCESS)

    def _on_vender(self) -> None:
        prod = self._obtener_seleccionado()
        if prod is None:
            messagebox.showinfo("Sin selección", "Selecciona un producto primero.")
            return
        try:
            cantidad = int(self._entry_cantidad.get())
            total = prod.vender(cantidad)
        except (ValueError, Exception) as e:
            messagebox.showerror("Error", str(e))
            return
        self._actualizar_tabla()
        self._entry_cantidad.delete(0, tk.END)
        self._status(f"🛒 Vendido: {cantidad}x '{prod.get_nombre()}' = ${total:,.2f}", "#3b82f6")

    def _on_seleccionar(self, event) -> None:
        prod = self._obtener_seleccionado()
        if prod is None:
            return

        # Rellenar formulario con los datos del producto seleccionado
        self._entries["nombre"].delete(0, tk.END)
        self._entries["nombre"].insert(0, prod.get_nombre())
        self._entries["precio"].delete(0, tk.END)
        self._entries["precio"].insert(0, str(prod.get_precio()))
        self._entries["stock"].delete(0, tk.END)
        self._entries["stock"].insert(0, str(prod.get_stock()))

    def _on_buscar(self, *args) -> None:
        filtro = self._search_var.get()
        self._actualizar_tabla(filtro)

    # ── Datos de ejemplo ─────────────────────────────────────────────────

    def _cargar_datos_ejemplo(self) -> None:
        datos = [
            ("Laptop Gamer", 15_999.99, 5),
            ("Monitor 4K", 7_500.00, 8),
            ("Teclado Mecánico", 899.50, 20),
            ("Mouse Inalámbrico", 349.00, 35),
            ("Webcam HD", 1_200.00, 12),
            ("SSD 1TB", 1_850.00, 25),
        ]
        for nombre, precio, stock in datos:
            self.productos.append(Producto(nombre, precio, stock))
        self._actualizar_tabla()
        self._status("✓ Datos de ejemplo cargados", self.SUCCESS)


# ═══════════════════════════════════════════════════════════════════════════════
#  PUNTO DE ENTRADA
# ═══════════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    root = tk.Tk()
    app = InventarioApp(root)
    root.mainloop()
