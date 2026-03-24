import zipfile
import re

pptx_path = 'd:/hackthon/JanRakshak_AI_Hackathon_v2.pptx'
try:
    with zipfile.ZipFile(pptx_path, 'r') as z:
        slide1 = z.read('ppt/slides/slide1.xml').decode('utf-8')
        texts = re.findall(r'<a:t>(.*?)</a:t>', slide1)
        print(" | ".join(texts))
except Exception as e:
    print(f"Error: {e}")
