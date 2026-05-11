#!/usr/bin/env python3
"""Generate all Stage 3 chapter files with proper UTF-8 encoding."""

import pathlib

BASE = pathlib.Path(__file__).parent


def write_file(rel_path: str, content: str) -> None:
    """Write content to file with UTF-8 encoding."""
    path = BASE / rel_path
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding='utf-8')
    print(f"  Written: {rel_path} ({len(content)} chars)")


# We'll call this from separate scripts for each chapter
if __name__ == '__main__':
    print("Generator ready. Import write_file to use.")
