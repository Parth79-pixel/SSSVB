from fastapi import APIRouter, HTTPException, status

from app.core.dependencies import SessionDep, CurrentUserDep
from app.models.shop_settings import ShopSettings
from app.schemas.shop_settings import ShopSettingsRead, ShopSettingsUpdate

router = APIRouter(prefix="/settings", tags=["settings"])


@router.get("", response_model=ShopSettingsRead)
def get_settings(session: SessionDep, current_user: CurrentUserDep):
    settings_row = session.get(ShopSettings, 1)
    if not settings_row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shop settings not configured. Please create the initial settings row.",
        )
    return settings_row


@router.put("", response_model=ShopSettingsRead)
def update_settings(payload: ShopSettingsUpdate, session: SessionDep, current_user: CurrentUserDep):
    settings_row = session.get(ShopSettings, 1)
    if not settings_row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shop settings not configured. Please create the initial settings row.",
        )

    settings_row.shop_name = payload.shop_name
    settings_row.address = payload.address
    settings_row.phone = payload.phone
    settings_row.invoice_prefix = payload.invoice_prefix
    settings_row.tax_percent = payload.tax_percent

    session.add(settings_row)
    session.commit()
    session.refresh(settings_row)
    return settings_row