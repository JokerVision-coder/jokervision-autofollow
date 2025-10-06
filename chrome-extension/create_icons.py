#!/usr/bin/env python3
"""
Creates placeholder icons for JokerVision Chrome Extension
"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_gradient_icon(size, save_path):
    """Create a gradient icon with JokerVision branding"""
    
    # Create a new image with transparent background
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Create gradient background (purple to pink like JokerVision theme)
    for y in range(size):
        # Calculate color for this row
        ratio = y / size
        r = int(138 + (219 - 138) * ratio)  # Purple to Pink gradient
        g = int(43 + (112 - 43) * ratio)
        b = int(226 + (147 - 226) * ratio)
        
        # Draw the row
        draw.line([(0, y), (size, y)], fill=(r, g, b, 255))
    
    # Add a star/automotive icon in the center
    center = size // 2
    star_size = size // 3
    
    # Draw a simple star
    star_points = []
    import math
    for i in range(10):  # 5 pointed star (outer and inner points)
        angle = i * math.pi / 5
        if i % 2 == 0:  # Outer points
            radius = star_size
        else:  # Inner points  
            radius = star_size // 2
        
        x = center + radius * math.cos(angle - math.pi/2)
        y = center + radius * math.sin(angle - math.pi/2)
        star_points.append((x, y))
    
    # Draw the star
    draw.polygon(star_points, fill=(255, 255, 255, 230), outline=(255, 255, 255, 255))
    
    # Add text for larger icons
    if size >= 48:
        try:
            # Try to use a system font, fall back to default if not available
            font_size = max(8, size // 8)
            font = ImageFont.load_default()
            
            # Add "JV" text at the bottom
            text = "JV"
            bbox = draw.textbbox((0, 0), text, font=font)
            text_width = bbox[2] - bbox[0]
            text_height = bbox[3] - bbox[1]
            
            text_x = (size - text_width) // 2
            text_y = size - text_height - 4
            
            # Add text with shadow effect
            draw.text((text_x + 1, text_y + 1), text, font=font, fill=(0, 0, 0, 100))
            draw.text((text_x, text_y), text, font=font, fill=(255, 255, 255, 255))
        except:
            pass  # If font loading fails, skip text
    
    # Save the image
    img.save(save_path, 'PNG')
    print(f"✅ Created {size}x{size} icon: {save_path}")

def main():
    """Create all required icons"""
    
    icons_dir = '/app/chrome-extension/icons'
    
    # Create icons directory if it doesn't exist
    os.makedirs(icons_dir, exist_ok=True)
    
    # Icon sizes required by Chrome
    sizes = [16, 32, 48, 128]
    
    for size in sizes:
        icon_path = os.path.join(icons_dir, f'icon{size}.png')
        create_gradient_icon(size, icon_path)
    
    print("\n🎉 All Chrome extension icons created successfully!")
    print("Icons created:")
    for size in sizes:
        print(f"  - icon{size}.png ({size}x{size})")
    
    print("\n📝 These icons feature:")
    print("  - JokerVision purple-to-pink gradient")
    print("  - White star symbol (representing AI-powered automation)")
    print("  - 'JV' text on larger icons")
    print("  - Transparent backgrounds for better integration")

if __name__ == "__main__":
    main()