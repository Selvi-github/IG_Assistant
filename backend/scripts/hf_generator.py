#!/usr/bin/env python3
"""
Hugging Face Zero-GPU Text-to-Image & Carousel Generator
IG Assistant / SocialCraft AI Media Production Pipeline

Features:
- Free Hugging Face Serverless Inference API (via HF_TOKEN)
- Free Public Hugging Face Space (FLUX.1-schnell via gradio_client, no token required)
- Pillow 1080x1350 vertical composition, brand kit overlay & slide indicator
- Zero 402 Rate Limits: Images are downloaded and served locally from the backend.
"""

import sys
import os
import json
import time
import argparse
import urllib.request
import urllib.parse
from PIL import Image, ImageDraw, ImageFont

def parse_args():
    parser = argparse.ArgumentParser(description="Generate AI Images via Hugging Face")
    parser.add_argument("--prompt", required=True, help="AI Image prompt description")
    parser.add_argument("--output", required=True, help="Path to save output image")
    parser.add_argument("--slide-number", type=int, default=1, help="Slide index (1-based)")
    parser.add_argument("--total-slides", type=int, default=1, help="Total slide count")
    parser.add_argument("--title", default="", help="Slide title")
    parser.add_argument("--subtitle", default="", help="Slide subtitle")
    parser.add_argument("--brand-name", default="Aura Studio", help="Brand name")
    parser.add_argument("--instagram-handle", default="@creator", help="Instagram handle")
    parser.add_argument("--hf-token", default=None, help="Hugging Face User Access Token")
    parser.add_argument("--model", default="black-forest-labs/FLUX.1-schnell", help="HF model ID")
    return parser.parse_args()

def try_hf_serverless_api(prompt, hf_token, model, out_path):
    """Attempt direct generation via official Hugging Face Serverless API."""
    if not hf_token:
        return False
    try:
        print(f"[HF] Querying Serverless API for model {model}...")
        api_url = f"https://router.huggingface.co/hf-inference/models/{model}"
        headers = {
            "Authorization": f"Bearer {hf_token}",
            "Content-Type": "application/json"
        }
        data = json.dumps({"inputs": prompt}).encode("utf-8")
        req = urllib.request.Request(api_url, data=data, headers=headers, method="POST")
        with urllib.request.urlopen(req, timeout=30) as resp:
            content_type = resp.headers.get("content-type", "")
            if "image" in content_type:
                with open(out_path, "wb") as f:
                    f.write(resp.read())
                print(f"[HF] Serverless API success: saved to {out_path}")
                return True
    except Exception as e:
        print(f"[HF] Serverless API notice: {e}")
    return False

def try_hf_gradio_space(prompt, out_path):
    """Attempt generation via Hugging Face public space (FLUX.1-schnell)."""
    try:
        print("[HF] Connecting to public FLUX.1-schnell space...")
        from gradio_client import Client
        import shutil
        client = Client("black-forest-labs/FLUX.1-schnell")
        res = client.predict(
            prompt=prompt,
            seed=int(time.time() * 1000) % 900000 + 100000,
            randomize_seed=True,
            width=512,
            height=512,
            num_inference_steps=4,
            api_name="/infer"
        )
        if res and len(res) > 0 and os.path.exists(res[0]):
            temp_path = res[0]
            # Convert or copy to destination
            with Image.open(temp_path) as im:
                im.convert("RGB").save(out_path, "JPEG", quality=92)
            print(f"[HF] Gradio Space success: saved to {out_path}")
            return True
    except Exception as e:
        print(f"[HF] Gradio Space notice: {e}")
    return False

def compose_editorial_slide(title, subtitle, slide_number, total_slides, brand_name, instagram_handle, raw_img_path, out_path):
    """
    Apply Instagram 4:5 (1080x1350) composition, brand tokens, and typography
    as specified in PPTX Slide 11 & Slide 12.
    """
    w, h = 1080, 1350
    final_img = Image.new("RGB", (w, h), color="#0c0c0e")
    draw = ImageDraw.Draw(final_img)

    has_raw = raw_img_path and os.path.exists(raw_img_path)

    if has_raw:
        try:
            with Image.open(raw_img_path) as raw:
                raw_rgb = raw.convert("RGB")
                # Crop and resize to cover the 1080x1350 frame
                raw_w, raw_h = raw_rgb.size
                scale = max(w / raw_w, h / raw_h)
                new_w = int(raw_w * scale)
                new_h = int(raw_h * scale)
                resized = raw_rgb.resize((new_w, new_h), Image.Resampling.LANCZOS)
                left = (new_w - w) // 2
                top = (new_h - h) // 2
                cropped = resized.crop((left, top, left + w, top + h))
                final_img.paste(cropped, (0, 0))

                # Apply subtle vignette / dark gradient at top and bottom for text legibility
                overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
                odraw = ImageDraw.Draw(overlay)
                for y in range(220):
                    alpha = int((1 - (y / 220)) * 180)
                    odraw.line([(0, y), (w, y)], fill=(0, 0, 0, alpha))
                for y in range(h - 320, h):
                    alpha = int(((y - (h - 320)) / 320) * 220)
                    odraw.line([(0, y), (w, y)], fill=(0, 0, 0, alpha))
                final_img = Image.alpha_composite(final_img.convert("RGBA"), overlay).convert("RGB")
                draw = ImageDraw.Draw(final_img)
        except Exception as e:
            print(f"[Composition] Raw image blend note: {e}")

    if not has_raw:
        # High-aesthetic gradient artwork when raw diffusion is unavailable
        palette = [
            ("#833ab4", "#fd1d1d", "#fcb045"),
            ("#1e3c72", "#2a5298", "#6dd5ed"),
            ("#11998e", "#38ef7d", "#0575e6"),
            ("#ff0844", "#ffb199", "#f857a6"),
        ]
        chosen = palette[(slide_number - 1) % len(palette)]
        for y in range(h):
            ratio = y / h
            r = int(int(chosen[0][1:3], 16) * (1 - ratio) + int(chosen[1][1:3], 16) * ratio)
            g = int(int(chosen[0][3:5], 16) * (1 - ratio) + int(chosen[1][3:5], 16) * ratio)
            b = int(int(chosen[0][5:7], 16) * (1 - ratio) + int(chosen[1][5:7], 16) * ratio)
            draw.line([(0, y), (w, y)], fill=(r // 3, g // 3, b // 3))

        # Ambient glow orb
        glow = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        gdraw = ImageDraw.Draw(glow)
        gdraw.ellipse([w // 2 - 380, h // 2 - 380, w // 2 + 380, h // 2 + 380], fill=chosen[1] + "44")
        final_img = Image.alpha_composite(final_img.convert("RGBA"), glow).convert("RGB")
        draw = ImageDraw.Draw(final_img)

    # 1. Top Bar: Brand & Slide Indicator
    for y in range(8):
        draw.line([(0, y), (w, y)], fill="#e1306c")

    draw.text((70, 60), f"{brand_name.upper()}", fill="#ffffff")
    draw.text((w - 200, 60), f"{slide_number:02d} / {total_slides:02d}", fill="#e1306c")

    # 2. Slide Content Typography
    display_title = title if title else f"Slide {slide_number}"
    display_sub = subtitle if subtitle else "Actionable insights tailored for your daily workflow."

    # Title lines (word wrap)
    words = display_title.split()
    lines = []
    current_line = []
    for word in words:
        current_line.append(word)
        if len(" ".join(current_line)) > 26:
            lines.append(" ".join(current_line))
            current_line = []
    if current_line:
        lines.append(" ".join(current_line))

    start_y = h - 260 if has_raw else 500
    for i, line in enumerate(lines[:3]):
        draw.text((70, start_y + i * 45), line, fill="#ffffff")

    sub_y = start_y + len(lines[:3]) * 45 + 15
    draw.text((70, sub_y), display_sub[:75], fill="#d4d4d8")

    # 3. Bottom Footer Call-to-Action
    draw.rectangle([70, h - 90, w - 70, h - 88], fill="#3f3f46")
    footer_text = f"Follow {instagram_handle} · Swipe for next slide ->" if slide_number < total_slides else f"Follow {instagram_handle} · Save post for reference"
    draw.text((70, h - 65), footer_text, fill="#a1a1aa")

    final_img.save(out_path, "JPEG", quality=92)
    print(f"[Composition] Finished 1080x1350 slide: {out_path}")

def main():
    args = parse_args()
    os.makedirs(os.path.dirname(os.path.abspath(args.output)), exist_ok=True)

    raw_temp = args.output + ".raw.jpg"
    success = False

    # 1. Try Hugging Face Serverless API if token present
    hf_token = args.hf_token or os.environ.get("HF_TOKEN") or os.environ.get("HUGGINGFACE_API_KEY")
    if hf_token:
        success = try_hf_serverless_api(args.prompt, hf_token, args.model, raw_temp)

    # 2. Try Hugging Face Gradio Space (FLUX.1-schnell) without key
    if not success:
        success = try_hf_gradio_space(args.prompt, raw_temp)

    # 3. Compose final 1080x1350 slide with brand tokens and text
    raw_path_to_use = raw_temp if success and os.path.exists(raw_temp) else None
    compose_editorial_slide(
        title=args.title,
        subtitle=args.subtitle,
        slide_number=args.slide_number,
        total_slides=args.total_slides,
        brand_name=args.brand_name,
        instagram_handle=args.instagram_handle,
        raw_img_path=raw_path_to_use,
        out_path=args.output
    )

    if os.path.exists(raw_temp):
        try:
            os.remove(raw_temp)
        except:
            pass

    print(json.dumps({
        "success": True,
        "outputPath": args.output,
        "hadAiVisual": success
    }))

if __name__ == "__main__":
    main()

