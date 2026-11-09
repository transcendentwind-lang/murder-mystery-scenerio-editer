#!/usr/bin/env python3
"""Freeze Japanese SVG lettering with OpenType vertical shaping.

Install: python3 -m pip install fonttools==4.68.0 uharfbuzz==0.57.0
Usage: python3 scripts/outline_svg_text.py SOURCE OUTPUT --regular FONT --bold FONT

Use Noto Serif CJK JP Regular/Bold from https://github.com/notofonts/noto-cjk
(Serif/OTF/Japanese). Fonts are build inputs, not runtime dependencies.
Supported input: plain text elements, numeric x/y/font-size, optional em letter
spacing, and inherited inline styles. Reject nested text rather than lose it.
The source retains editable text; only the generated SVG contains outlines.
"""

import argparse
import html
from pathlib import Path
import re
import xml.etree.ElementTree as ET

from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.ttLib import TTFont
import uharfbuzz as hb


def number(value):
    return f"{value:.6f}".rstrip("0").rstrip(".") or "0"


def outline(source, regular, bold):
    ns = "{http://www.w3.org/2000/svg}"
    root = ET.fromstring(source)
    parents = {child: parent for parent in root.iter() for child in parent}
    fonts = []
    for path in (regular, bold):
        tt = TTFont(path)
        face = hb.Face(Path(path).read_bytes())
        font = hb.Font(face)
        font.scale = (face.upem, face.upem)
        fonts.append((tt, font, face.upem))
    definitions = {}
    replacements = []

    for element in root.iter(f"{ns}text"):
        content = re.sub(r"[ \t\r\n]+", " ", "".join(element.itertext()).strip())
        # Preserve the horizontal Latin footer and its monospace typeface.
        if not any(ord(char) > 127 for char in content):
            continue
        if len(element):
            raise ValueError("Nested text elements are not supported")
        ancestors = []
        current = element
        while current is not None:
            ancestors.append(current)
            current = parents.get(current)
        style = {}
        for ancestor in reversed(ancestors):
            style.update(ancestor.attrib)
            for entry in ancestor.get("style", "").split(";"):
                if ":" in entry:
                    key, value = entry.split(":", 1)
                    style[key.strip()] = value.strip()
        vertical = style.get("writing-mode") == "vertical-rl"
        weight = style.get("font-weight", "400")
        index = int(weight == "bold" or (weight.isdigit() and int(weight) >= 600))
        tt, font, upem = fonts[index]
        size = float(style["font-size"])
        scale = size / upem
        spacing = style.get("letter-spacing", "0")
        spacing = float(spacing[:-2]) * size if spacing.endswith("em") else float(spacing)
        buffer = hb.Buffer()
        buffer.add_str(content)
        buffer.guess_segment_properties()
        buffer.direction = "ttb" if vertical else "ltr"
        buffer.language = "ja"
        hb.shape(font, buffer, {"vert": vertical, "vrt2": vertical, "kern": False})
        x, y = float(element.get("x", "0")), float(element.get("y", "0"))
        if not vertical and style.get("text-anchor") == "middle":
            x -= (sum(p.x_advance for p in buffer.glyph_positions) * scale
                  + spacing * (len(buffer.glyph_infos) - 1)) / 2
        attrs = {k: v for k, v in element.attrib.items()
                 if k not in ("x", "y", "font-size", "font-weight", "letter-spacing", "text-anchor")}
        attrs.update({"role": "img", "aria-label": content})
        attr_text = " ".join(f'{k}="{html.escape(v, quote=True)}"' for k, v in attrs.items())
        uses = []
        for info, position in zip(buffer.glyph_infos, buffer.glyph_positions):
            if info.codepoint == 0:
                raise ValueError("Font is missing a required glyph")
            key = f"outlined-glyph-{index}-{info.codepoint}"
            if key not in definitions:
                glyphs = tt.getGlyphSet()
                pen = SVGPathPen(glyphs)
                glyphs[tt.getGlyphName(info.codepoint)].draw(pen)
                definitions[key] = pen.getCommands()
            tx = x + position.x_offset * scale
            ty = y - position.y_offset * scale
            uses.append(f'<use href="#{key}" transform="translate({number(tx)} {number(ty)}) scale({number(scale)} {number(-scale)})"/>')
            x += position.x_advance * scale + (0 if vertical else spacing)
            y -= position.y_advance * scale
            if vertical:
                y += spacing
        replacements.append(f'<g {attr_text}>\n      ' + "\n      ".join(uses) + "\n    </g>")

    replacement_iter = iter(replacements)

    def replace(match):
        text = " ".join(ET.fromstring(match.group()).itertext())
        return next(replacement_iter) if any(ord(c) > 127 for c in text) else match.group()

    result = re.sub(r"<text\b[^>]*>.*?</text>", replace, source, flags=re.DOTALL)
    paths = "\n".join(f'    <path id="{key}" d="{value}"/>'
                      for key, value in definitions.items() if value)
    # Empty glyphs (spaces) still need a target for their <use> elements.
    paths += "\n" + "\n".join(f'    <path id="{key}" d=""/>'
                              for key, value in definitions.items() if not value)
    result = result.replace("<defs>", "<defs>\n" + paths, 1)
    return result.replace("<defs>", "<!-- Generated by scripts/outline_svg_text.py; edit the scenario sources directory instead. -->\n  <defs>", 1)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--regular", type=Path, required=True)
    parser.add_argument("--bold", type=Path, required=True)
    args = parser.parse_args()
    args.output.write_text(outline(args.source.read_text(), args.regular, args.bold))
