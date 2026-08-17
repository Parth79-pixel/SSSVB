"""One-off script to create the first admin login user.
Run once, then delete or keep for future admin creation."""

from getpass import getpass
from sqlmodel import Session, select

from app.database import engine
from app.models.user import User
from app.core.security import hash_password

def main():
    email = input("Enter admin email: ").strip()
    password = getpass("Enter admin password: ").strip()

    hashed = hash_password(password)

    with Session(engine) as session:
        existing = session.exec(select(User).where(User.email == email)).first()
        if existing:
            print(f"A user with email {email} already exists.")
            return

        user = User(email=email, password=hashed)
        session.add(user)
        session.commit()
        print(f"✅ User created: {email}")

if __name__ == "__main__":
    main()