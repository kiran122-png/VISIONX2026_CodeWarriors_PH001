import os

EXTENSIONS = ('.py', '.js', '.jsx', '.md', '.css', '.html', '.txt')

def rectify_file(filepath):
    try:
        # Detect encoding manually by reading bytes
        with open(filepath, 'rb') as f:
            raw = f.read()
        
        if not raw:
            return
            
        # Check for UTF-16 BOM
        if raw.startswith(b'\xff\xfe') or raw.startswith(b'\xfe\xff'):
            encoding = 'utf-16'
        elif raw.startswith(b'\xef\xbb\xbf'):
            encoding = 'utf-8-sig'
        else:
            # Fallback check: can it be UTF-8?
            try:
                raw.decode('utf-8')
                encoding = 'utf-8'
            except UnicodeDecodeError:
                encoding = 'latin-1' # Default for many windows files
        
        if encoding != 'utf-8':
            print(f"Converting {filepath} from {encoding} to UTF-8")
            content = raw.decode(encoding, errors='replace')
            # Fix mojibake in content
            content = content.replace('-', '-').replace('🚨', '🚨')
            
            with open(filepath, 'w', encoding='utf-8', newline='') as f:
                f.write(content)
        else:
            # Check for the specific mojibake strings anyway
            content = raw.decode('utf-8', errors='replace')
            if '-' in content or '🚨' in content:
                print(f"Fixing mojibake in UTF-8 file: {filepath}")
                new_content = content.replace('-', '-').replace('🚨', '🚨')
                with open(filepath, 'w', encoding='utf-8', newline='') as f:
                    f.write(new_content)
                    
    except Exception as e:
        print(f"Error on {filepath}: {e}")

def main():
    for root, dirs, files in os.walk("d:/hackthon"):
        if any(x in root for x in ['.venv', 'node_modules', '.git', '.next', 'dist']):
            continue
        for file in files:
            if file.endswith(EXTENSIONS):
                rectify_file(os.path.join(root, file))

if __name__ == "__main__":
    main()
    print("Full project scan and rectification complete.")
