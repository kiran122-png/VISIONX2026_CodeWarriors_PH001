import zipfile
import re

pptx_path = 'd:/hackthon/JanRakshak_AI_Hackathon_v2.pptx'
try:
    with zipfile.ZipFile(pptx_path, 'r') as z:
        # Check first 5 slides
        for i in range(1, 6):
            slide_name = f'ppt/slides/slide{i}.xml'
            if slide_name in z.namelist():
                content = z.read(slide_name).decode('utf-8')
                # Look for patterns like SIH1234, ABC001, PS-xxx
                # Simplified: any text inside <a:t>...</a:t> tags
                matches = re.findall(r'<a:t>(.*?)</a:t>', content)
                print(f"Slide {i} Text: {' | '.join(matches)}")
except Exception as e:
    print(f"Error: {e}")
