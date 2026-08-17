import time
import os
from pathlib import Path
from typing import Optional

from fastapi import UploadFile

from app.config import settings


def save_product_image(file: UploadFile) -> str:
    upload_dir = Path(settings.UPLOAD_DIR)
    upload_dir.mkdir(parents=True, exist_ok=True)

    safe_original_name = os.path.basename(file.filename)  
    stored_filename = f"{int(time.time())}_{safe_original_name}"
    destination = upload_dir / stored_filename

    with open(destination, "wb") as buffer:
        buffer.write(file.file.read())

    return stored_filename


def delete_product_image(filename: Optional[str]) -> None:
    if not filename:
        return
    path = Path(settings.UPLOAD_DIR) / filename
    if path.exists():
        path.unlink()