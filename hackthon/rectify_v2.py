import os
import chardet

EXTENSIONS = ('.py', '.js', '.jsx', '.md', '.css', '.html', '.txt')

def rectify_file(filepath):
    try:
        # Detect encoding
        with open(filepath, 'rb') as f:
            raw = f.read()
        
        if not raw:
            return
            
        result = chardet.detect(raw)
        encoding = result['encoding']
        
        if encoding and encoding.lower() != 'utf-8':
            print(f"Converting {filepath} from {encoding} to UTF-8")
            content = raw.decode(encoding, errors='replace')
            # Fix mojibake in content
            content = content.replace('-', '-').replace('🚨', '🚨')
            
            with open(filepath, 'w', encoding='utf-8', newline='') as f:
                f.write(content)
        else:
            # Even if UTF-8, check for the specific mojibake strings
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
    print("Project-wide encoding rectification complete.")
