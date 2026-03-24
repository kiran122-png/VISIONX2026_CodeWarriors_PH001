import os
import re

EXTENSIONS = ('.py', '.js', '.jsx', '.md', '.css', '.html')
NON_ASCII_RE = re.compile(r'[^\x00-\x7f]+')

# Known good emojis (simplified list of common ones in project)
GOOD_EMOJIS = set("🚨💊❤️🩸🏥🥗💡📋🚑🩸🏥💰⚠️🍒💧🌿☕🍌🧄🥥🧅🍯🍪🟫🍎☀️🍄🌾")

def is_mojibake(text):
    # If it contains common mojibake sequences
    mojis = ["Ã", "Â", "€", ",", "°", "Å", "¸", "¥"]
    # Check if a combination of characters looks like UTF-8 as Latin-1
    for m in mojis:
        if m in text:
            return True
    return False

def clean_text(text):
    # Rule based replacement for known patterns
    patterns = {
        r'-': '-',
        r'\s+-\s+--\s*': ' - ',
        r'🚨': '🚨',
        r'-': '-',
        r'-': '-',
        r',': ',',
    }
    for p, r in patterns.items():
        text = re.sub(p, r, text)
    
    # Generic mojibake cleaner: if it's not a known emoji and is non-ascii, replace with space or hyphen
    def replace_bad(match):
        m = match.group(0)
        # If all chars in match are good emojis, keep them
        if all(c in GOOD_EMOJIS or ord(c) > 0x1F300 for c in m):
            return m
        # Otherwise, it might be mojibake
        return '-'

    # text = NON_ASCII_RE.sub(replace_bad, text)
    return text

def walk_and_fix(root_dir):
    for root, dirs, files in os.walk(root_dir):
        if '.venv' in root or 'node_modules' in root or '.git' in root:
            continue
        for file in files:
            if file.endswith(EXTENSIONS):
                filepath = os.path.join(root, file)
                try:
                    with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
                        content = f.read()
                    
                    if is_mojibake(content):
                        print(f"Fixing mojibake in: {filepath}")
                        new_content = clean_text(content)
                        if new_content != content:
                            with open(filepath, 'w', encoding='utf-8', newline='') as f:
                                f.write(new_content)
                except Exception as e:
                    print(f"Error processing {filepath}: {e}")

if __name__ == "__main__":
    walk_and_fix("d:/hackthon")
    print("Full project scan and rectification complete.")
