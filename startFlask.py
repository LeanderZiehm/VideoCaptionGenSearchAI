from flask import Flask, render_template, jsonify, request
import json
import os

app = Flask(__name__)

videoKeywordChangesPath = 'static/videoKeywordChanges.json'


@app.route('/')
def list_view():
    return render_template('indexListView.html')

@app.route('/saveKeywordChanges', methods=['POST'])
def saveKeywordChanges():
    
    jsChange = request.json #      const currentKeywordChanges = { path: "", add: [], remove: [] };
    print(jsChange)
    
    
    #if 
    if os.path.exists(videoKeywordChangesPath):
        with open(videoKeywordChangesPath, 'r') as file:
            videoKeywordChanges = json.load(file)
            
    else:
        videoKeywordChanges = []
        
    paths = jsChange['paths'];
    add = jsChange['add'];
    remove = jsChange['remove'];
    
    # [{"paths":["V:\\zentrale-einrichtungen\\Kommunikation u. Marketing\\Marketing\\Videos\\DAAD Preis\\2024\\Export\\DAAD_24_final.mp4"], "add": ["gg"], "remove": [" flowers"]}]
    
    newChanges = {"paths": paths, "add": add, "remove": remove}
    videoKeywordChanges.append(newChanges)

    with open(videoKeywordChangesPath, 'w') as file:
        json.dump(videoKeywordChanges, file)
        
    return jsonify({"status": "success"})

@app.route('/getKeywordChanges', methods=['GET'])
def getKeywordChanges():
    
    if os.path.exists(videoKeywordChangesPath):
        with open(videoKeywordChangesPath, 'r') as file:
            videoKeywordChanges = json.load(file)
    else:
        videoKeywordChanges = {}
        
    return jsonify(videoKeywordChanges)


if __name__ == '__main__':
    app.run(port=5000,debug=True)
