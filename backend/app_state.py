import os
import shutil
from typing import Final

from dotenv import dotenv_values


BACKEND_DIR: Final[str] = os.path.dirname(os.path.abspath(__file__))
LEGACY_ENV_FILE: Final[str] = os.path.join(BACKEND_DIR, ".env")
LEGACY_DB_PATH: Final[str] = os.path.join(BACKEND_DIR, "app.db")
DEFAULT_APP_DATA_DIR: Final[str] = os.path.join(BACKEND_DIR, "data")
SETTINGS_FILE_NAME: Final[str] = "settings.env"
DATABASE_FILE_NAME: Final[str] = "app.db"


def _normalize_path(path: str) -> str:
    if os.path.isabs(path):
        return path
    return os.path.abspath(os.path.join(BACKEND_DIR, path))


def _legacy_env_values() -> dict[str, str]:
    if not os.path.exists(LEGACY_ENV_FILE):
        return {}
    return {
        key: value
        for key, value in dotenv_values(LEGACY_ENV_FILE).items()
        if value is not None
    }


def resolve_app_data_dir() -> str:
    configured = os.getenv("APP_DATA_DIR")
    if configured:
        return _normalize_path(configured)

    legacy_values = _legacy_env_values()
    legacy_path = legacy_values.get("APP_DATA_DIR")
    if legacy_path:
        return _normalize_path(legacy_path)

    return DEFAULT_APP_DATA_DIR


APP_DATA_DIR: Final[str] = resolve_app_data_dir()
SETTINGS_FILE_PATH: Final[str] = os.path.join(APP_DATA_DIR, SETTINGS_FILE_NAME)
DATABASE_PATH: Final[str] = os.path.join(APP_DATA_DIR, DATABASE_FILE_NAME)


def ensure_app_data_dir() -> str:
    os.makedirs(APP_DATA_DIR, exist_ok=True)
    return APP_DATA_DIR


def load_app_environment() -> str:
    app_data_dir = ensure_app_data_dir()
    os.environ.setdefault("APP_DATA_DIR", app_data_dir)

    # Prefer the persisted settings file in APP_DATA_DIR, then fall back to the legacy backend/.env.
    for env_file in (SETTINGS_FILE_PATH, LEGACY_ENV_FILE):
        if not os.path.exists(env_file):
            continue
        for key, value in dotenv_values(env_file).items():
            if value is not None:
                os.environ.setdefault(key, value)

    return app_data_dir


def migrate_legacy_database() -> None:
    ensure_app_data_dir()
    if os.path.exists(DATABASE_PATH) or not os.path.exists(LEGACY_DB_PATH):
        return
    shutil.copy2(LEGACY_DB_PATH, DATABASE_PATH)