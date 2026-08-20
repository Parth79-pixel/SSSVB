import os
import cloudinary
import cloudinary.uploader
from fastapi import UploadFile

# Configure Cloudinary using Environment Variables (or paste credentials directly)
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME", "YOUR_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY", "YOUR_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET", "YOUR_API_SECRET"),
    secure=True
)

def save_product_image(image: UploadFile) -> str:
    """
    Uploads file directly to Cloudinary and returns the secure HTTPS URL.
    """
    try:
        # Read image contents directly from memory
        result = cloudinary.uploader.upload(image.file, folder="products")
        return result.get("secure_url")
    except Exception as e:
        print(f"Error uploading image to Cloudinary: {e}")
        return None

def delete_product_image(image_url: str):
    """
    Deletes the file from Cloudinary given its full URL.
    """
    if not image_url:
        return
    try:
        # Extract public_id from Cloudinary URL (e.g. products/sample_name)
        public_id = "products/" + image_url.split("/")[-1].split(".")[0]
        cloudinary.uploader.destroy(public_id)
    except Exception as e:
        print(f"Error deleting image from Cloudinary: {e}")