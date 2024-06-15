from PIL import Image
import os
# import piexif

def optimize_image(input_path, output_path, max_width=800, max_height=600, quality=85):
    """
    Optimizes an image for the web by resizing and reducing its file size,
    preserving EXIF metadata.
    
    :param input_path: Path to the input image.
    :param output_path: Path to save the optimized image.
    :param max_width: Maximum width of the optimized image.
    :param max_height: Maximum height of the optimized image.
    :param quality: Quality of the saved image (1-100).
    """
    # Open the image
    with Image.open(input_path) as img:
        # Extract EXIF data
        exif_data = img.info['exif']
        
        # Resize the image while maintaining aspect ratio
        img.thumbnail((max_width, max_height), Image.ANTIALIAS)
        
        # Save the image with reduced quality, preserving EXIF data
        img.save(output_path, "JPEG", quality=quality, exif=exif_data)

def optimize_images_in_folder(input_folder, output_folder, max_width=800, max_height=600, quality=85):
    """
    Optimizes all images in a folder for the web, preserving EXIF metadata.
    
    :param input_folder: Path to the folder containing the input images.
    :param output_folder: Path to save the optimized images.
    :param max_width: Maximum width of the optimized images.
    :param max_height: Maximum height of the optimized images.
    :param quality: Quality of the saved images (1-100).
    """
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)
    
    for filename in os.listdir(input_folder):
        if filename.lower().endswith(('.png', '.jpg', '.jpeg')):
            input_path = os.path.join(input_folder, filename)
            output_path = os.path.join(output_folder, filename)
            try:
                optimize_image(input_path, output_path, max_width, max_height, quality)
                print(f"Optimized {filename} and saved to {output_path}")
            except Exception as e:
                print(f"Could not optimize {filename}: {e}")

# Example usage
input_folder = 'data\img\jpg_big'
output_folder = 'data\img\optimized'
optimize_images_in_folder(input_folder, output_folder)
