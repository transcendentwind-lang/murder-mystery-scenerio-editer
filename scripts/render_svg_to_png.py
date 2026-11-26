#!/usr/bin/env python3
"""Render an SVG file to a high-resolution PNG using headless Google Chrome."""

from __future__ import annotations

import argparse
import math
import pathlib
import re
import subprocess
import sys
import tempfile
import xml.etree.ElementTree as ET

DEFAULT_CHROME_PATHS = [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
]


def find_chrome(explicit: str | None) -> str:
    if explicit:
        return explicit
    for candidate in DEFAULT_CHROME_PATHS:
        if pathlib.Path(candidate).is_file():
            return candidate
    raise FileNotFoundError("Google Chrome binary not found. Pass --chrome explicitly.")


def parse_svg_dimensions(svg_path: pathlib.Path) -> tuple[int, int]:
    root = ET.parse(svg_path).getroot()
    view_box = root.attrib.get("viewBox")
    if view_box:
        parts = [float(p) for p in re.split(r"[\s,]+", view_box.strip()) if p]
        if len(parts) == 4:
            return int(round(parts[2])), int(round(parts[3]))
    width = root.attrib.get("width", "")
    height = root.attrib.get("height", "")
    w_match = re.match(r"([0-9.]+)", width)
    h_match = re.match(r"([0-9.]+)", height)
    if w_match and h_match:
        return int(round(float(w_match.group(1)))), int(round(float(h_match.group(1))))
    raise ValueError(f"Could not determine SVG dimensions from {svg_path}")


def render_svg(
    svg_path: pathlib.Path,
    png_path: pathlib.Path,
    chrome_bin: str,
    scale: int | None,
    min_long_edge: int,
    max_height: int,
) -> tuple[int, int, int]:
    width, height = parse_svg_dimensions(svg_path)
    if scale is not None:
        factor = scale
    else:
        factor = max(1, math.ceil(min_long_edge / max(width, height)))
        while factor > 1 and height * factor > max_height:
            factor -= 1
    png_path.parent.mkdir(parents=True, exist_ok=True)

    with tempfile.TemporaryDirectory(prefix="svg-to-png-chrome-") as profile_dir:
        cmd = [
            chrome_bin,
            "--headless=new",
            "--disable-gpu",
            "--no-sandbox",
            "--disable-crash-reporter",
            f"--user-data-dir={profile_dir}",
            "--hide-scrollbars",
            f"--force-device-scale-factor={factor}",
            f"--window-size={width},{height}",
            f"--screenshot={png_path.resolve()}",
            svg_path.resolve().as_uri(),
        ]
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode != 0 or not png_path.is_file():
            sys.stderr.write(result.stderr)
            raise RuntimeError(f"Failed to render {svg_path} (exit {result.returncode})")

    return width * factor, height * factor, factor


def main() -> int:
    parser = argparse.ArgumentParser(description="Render an SVG file to a high-resolution PNG.")
    parser.add_argument("input_svg", type=pathlib.Path, help="Input SVG file path")
    parser.add_argument("output_png", type=pathlib.Path, help="Output PNG file path")
    parser.add_argument("--scale", type=int, default=None, help="Explicit integer scale factor")
    parser.add_argument(
        "--min-long-edge",
        type=int,
        default=4000,
        help="Minimum target pixels for the longer edge when --scale is omitted (default: 4000)",
    )
    parser.add_argument(
        "--max-height",
        type=int,
        default=4096,
        help="Maximum output height in pixels to avoid headless tile wrapping (default: 4096)",
    )
    parser.add_argument("--chrome", type=str, default=None, help="Path to Chrome/Chromium binary")
    args = parser.parse_args()

    chrome_bin = find_chrome(args.chrome)
    out_w, out_h, factor = render_svg(
        args.input_svg,
        args.output_png,
        chrome_bin=chrome_bin,
        scale=args.scale,
        min_long_edge=args.min_long_edge,
        max_height=args.max_height,
    )
    size_kb = args.output_png.stat().st_size / 1024
    print(f"{args.output_png}: {out_w}x{out_h} (scale={factor}x, {size_kb:.1f} KiB)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
