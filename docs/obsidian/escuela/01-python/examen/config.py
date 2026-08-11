"""
Configuración central del sistema POS — Carga variables de entorno.
Soporta SQLite (default portable) y PostgreSQL (producción).
"""
import os
from dataclasses import dataclass, field
from dotenv import load_dotenv

# Cargo .env desde la raíz del proyecto
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, ".env"))


@dataclass
class Config:
    """Singleton de configuración accesible desde cualquier módulo."""

    db_type: str = "auto"
    sqlite_path: str = field(default_factory=lambda: os.path.join(BASE_DIR, "cafeteria.db"))

    # PostgreSQL
    pg_host: str = "127.0.0.1"
    pg_port: int = 5432
    pg_user: str = "leo"
    pg_password: str = ""
    pg_db: str = "cafeteria_pos"

    # Supabase
    supabase_url: str = ""
    supabase_service_key: str = ""
    supabase_anon_key: str = ""

    # Redis
    redis_host: str = "127.0.0.1"
    redis_port: int = 6379
    redis_user: str = ""
    redis_password: str = ""

    # DeepSeek
    deepseek_api_key: str = ""

    # GitHub
    github_token: str = ""

    @property
    def pg_dsn(self) -> str:
        """Cadena de conexión para psycopg."""
        auth = f"{self.pg_user}" if not self.pg_password else f"{self.pg_user}:{self.pg_password}"
        return f"postgresql://{auth}@{self.pg_host}:{self.pg_port}/{self.pg_db}"

    @property
    def use_postgres(self) -> bool:
        """Determina si se usa PostgreSQL según DB_TYPE + archivos disponibles."""
        if self.db_type == "postgres":
            return True
        if self.db_type == "sqlite":
            return False
        # "auto": usa PostgreSQL si SQLite no existe
        return not os.path.exists(self.sqlite_path)

    @property
    def redis_available(self) -> bool:
        """Redis solo se intenta si hay host configurado."""
        return bool(self.redis_host)


def get_config() -> Config:
    """Factory que crea el objeto Config desde variables de entorno."""
    return Config(
        db_type=os.getenv("DB_TYPE", "auto"),
        pg_host=os.getenv("POSTGRES_HOST", "127.0.0.1"),
        pg_port=int(os.getenv("POSTGRES_PORT", "5432")),
        pg_user=os.getenv("POSTGRES_USER", "leo"),
        pg_password=os.getenv("POSTGRES_PASSWORD", ""),
        pg_db=os.getenv("POSTGRES_DB", "cafeteria_pos"),
        supabase_url=os.getenv("SUPABASE_URL", ""),
        supabase_service_key=os.getenv("SUPABASE_SERVICE_ROLE_KEY", ""),
        supabase_anon_key=os.getenv("SUPABASE_ANON_KEY", ""),
        redis_host=os.getenv("REDIS_HOST", ""),
        redis_port=int(os.getenv("REDIS_PORT", "6379")),
        redis_user=os.getenv("REDIS_USER", ""),
        redis_password=os.getenv("REDIS_PASSWORD", ""),
        deepseek_api_key=os.getenv("DEEPSEEK_API_KEY", ""),
        github_token=os.getenv("GITHUB_TOKEN", ""),
    )
