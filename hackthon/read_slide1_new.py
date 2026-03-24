import zipfile
import re

pptx_path = 'd:/hackthon/JanRakshak_AI_Hackathon_v2.pptx'
try:
    with zipfile.ZipFile(pptx_path, 'r') as z:
        slide1 = z.read('ppt/slides/slide1.xml').decode('utf-8')
        texts = re.findall(r'<a:t>(.*?)</a:t>', slide1)
        full_text = " | ".join(texts)
        with open('d:/hackthon/slide1_utf8.txt', 'w', encoding='utf-8') as f:
            f.write(full_text)
except Exception as e:
    print(f"Error: {e}")
