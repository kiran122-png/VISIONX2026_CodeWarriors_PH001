import zipfile
import re

pptx_path = 'd:/hackthon/JanRakshak_AI_Hackathon_v2.pptx'
try:
    with zipfile.ZipFile(pptx_path, 'r') as z:
        total_text = ""
        for i in range(1, 15): # Scan all slides
            slide_name = f'ppt/slides/slide{i}.xml'
            if slide_name in z.namelist():
                content = z.read(slide_name).decode('utf-8')
                texts = re.findall(r'<a:t>(.*?)</a:t>', content)
                total_text += f"SLIDE {i}: {' | '.join(texts)}\n\n"
        with open('d:/hackthon/slides_full_text.txt', 'w', encoding='utf-8') as f:
            f.write(total_text)
except Exception as e:
    print(f"Error: {e}")
