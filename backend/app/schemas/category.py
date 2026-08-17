from pydantic import BaseModel


class CategoryRead(BaseModel):
    id: int
    category_name: str

    class Config:
        from_attributes = True


class CategoryCreate(BaseModel):
    category_name: str