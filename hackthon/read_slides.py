import zipfile
import re

pptx_path = 'd:/hackthon/JanRakshak_AI_Hackathon_v2.pptx'
try:
    with zipfile.ZipFile(pptx_path, 'r') as z:
        for i in range(2, 4):
            slide_name = f'ppt/slides/slide{i}.xml'
            content = z.read(slide_name).decode('utf-8')
            texts = re.findall(r'<a:t>(.*?)</a:t>', content)
            print(f"Slide {i}: {' | '.join(texts)}")
except Exception as e:
    print(f"Error: {e}")
