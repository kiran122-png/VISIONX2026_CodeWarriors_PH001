import zipfile
import re

pptx_path = 'd:/hackthon/JanRakshak_AI_Hackathon_v2.pptx'
CODE_PATTERN = re.compile(r'\b[A-Z0-9-]{3,12}\b')

try:
    with zipfile.ZipFile(pptx_path, 'r') as z:
        for i in range(1, 10):
            slide_name = f'ppt/slides/slide{i}.xml'
            if slide_name in z.namelist():
                content = z.read(slide_name).decode('utf-8')
                matches = re.findall(r'<a:t>(.*?)</a:t>', content)
                for m in matches:
                    # Filter for things that LOOK like codes (e.g. SIH1234, PS-005)
                    if CODE_PATTERN.match(m) and len(m) > 4:
                        print(f"Potential Code on Slide {i}: {m}")
                    elif "Problem" in m or "Code" in m or "ID" in m:
                        print(f"Context found on Slide {i}: {m}")
except Exception as e:
    print(f"Error: {e}")
