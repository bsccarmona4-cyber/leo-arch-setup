# Sistema de Inventario 

Mini sistema de inventario que demuestra los conceptos de la materia:
**POO · SQLite · Excepciones · Pruebas Unitarias · Git Multiusuario**

## Equipo
| Rol | Persona | Rama |
|---|---|---|
| Líder / Arquitecto + Backend DAO | Leo | `feature/modelo-dao-Leo` |
| Lógica de Negocio + QA/Pruebas | Compañero | `feature/servicio-tests-Compañero` |

---

##  Cómo ejecutar

```bash
cd inventario/

# 1. Instalar dependencias (primera vez)
python -m venv .venv
source .venv/bin/activate        # Linux/Mac
# .venv\Scripts\activate         # Windows

pip install -r requirements.txt

# 2. Demo completa (3 casos del profesor)
python main.py

# 3. Pruebas unitarias (deben aparecer 41 OK)
python -m unittest discover -v tests/
```

---

##  Estructura del Proyecto

```
inventario/
├── src/
│   ├── excepciones.py   ← Jerarquía custom: StockInsuficienteError, PrecioInvalidoError
│   ├── modelo.py        ← ItemInventario(ABC) + Producto con @property
│   ├── db.py            ← get_connection() con context manager
│   ├── dao.py           ← ProductoDAO: CRUD con consultas parametrizadas
│   └── servicio.py      ← InventarioService: lógica de negocio
├── tests/
│   ├── test_producto.py ← 14 tests del modelo
│   ├── test_dao.py      ← 9 tests CRUD (BD temporal aislada)
│   └── test_servicio.py ← 18 tests (incluye 3 casos del profesor)
├── main.py              ← Demo interactiva completa
├── .env                 ← DB_PATH (ignorado por .gitignore)
└── requirements.txt     ← python-dotenv
```

---

##  Conceptos Aplicados

### 1. OOP (25 pts)
| Principio | Dónde | Cómo |
|---|---|---|
| **Abstracción** | `ItemInventario(ABC)` | Clase abstracta con `describir()` obligatorio |
| **Herencia** | `Producto(ItemInventario)` | Hereda atributos y obliga a implementar `describir()` |
| **Encapsulación** | `Producto` | `@property` con `@setter` validados; atributos `__privados` |
| **Polimorfismo** | `describir()` | Cada subclase lo implementa diferente |

### 2. Base de Datos (20 pts)
- ✅ `with get_connection() as conn:` → cierre automático (no hay fuga)
- ✅ Consultas con `?` parametrizadas → no f-strings → sin SQL Injection
- ✅ `.env` para la ruta de BD → no hardcodeada en el código
- ✅ SQLite local → funciona sin internet

### 3. Excepciones (20 pts)
```
Exception
    ├── StockInsuficienteError   ← negocio: stock insuficiente
    └── ProductoNoEncontradoError ← negocio: ID no existe
ValueError
    └── PrecioInvalidoError      ← validación: precio <= 0
```
- `vender()` tiene **3 raises distintos** (captura de específico a general)
- **Error vs Excepción**: Error = sistema (SyntaxError); Excepción = lógica controlable

### 4. Pruebas Unitarias (15 pts)
| Archivo | Qué prueba | Tests |
|---|---|---|
| `test_producto.py` | Modelo, @property, validaciones | 14 |
| `test_dao.py` | CRUD en BD temporal | 9 |
| `test_servicio.py` | Lógica de negocio + 3 casos del profesor | 18 |
| **Total** | | **41 ✅** |

### 5. Git (10 pts)
- 2 ramas: `feature/modelo-dao-Leo` y `feature/servicio-tests-Compañero`
- 6 commits con mensajes en formato `feat:` / `test:`
- `.gitignore` cubre `.env`, `*.db`, `__pycache__/`
- Merges a `master` simulando Pull Requests


##  Los 3 Casos 

```python
# Caso 1: Precio negativo → PrecioInvalidoError
Producto("Mouse", -50, 5)   # ← Lanza PrecioInvalidoError

# Caso 2: Vender más del stock → StockInsuficienteError
servicio.vender(id_mouse, 10)   # hay 3, pide 10

# Caso 3: Sin internet → No truena (SQLite es LOCAL)
python main.py   # Funciona aunque desconectes el internet
```
