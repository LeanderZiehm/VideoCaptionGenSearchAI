import json
import re

with open('static/videoKeywordsOLD.js', 'r', encoding='utf-8') as f:
    
    file_content = f.read()
    json_content = re.sub(r'^var videoKeywords\s*=\s*', '', file_content).strip()[:-1]  

data = json.loads(json_content)

for video in data.get("videos", []):
    # video["keywords"] = [keyword.strip().lower() for keyword in video.get("keywords", [])]
    video["keywords"] = list(set(keyword.strip().lower() for keyword in video.get("keywords", [])))


with open('static/videoKeywordsOLD_Processed.js', 'w', encoding='utf-8') as f:
    
    f.write('var videoKeywords = ')
    json.dump(data, f, indent=4)
    f.write(';')  
