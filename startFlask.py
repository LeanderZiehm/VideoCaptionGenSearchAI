from flask import Flask, render_template, jsonify, request
import json
import os
from datetime import datetime
# import threading

app = Flask(__name__)
videoKeywordChangesPath = 'static/videoKeywordChanges.json'
infoLoggs = {}


loadedVideoKeywordChanges = []


# lock = threading.Lock()


# def loadInfoLoggs():
#     global infoLoggs
#     if os.path.exists('static/infoLoggs.json'):
#         with open('static/infoLoggs.json', 'r') as file:
#             infoLoggs = json.load(file)
            
# def saveInfoLoggs():
#     global infoLoggs
#     with open('static/infoLoggs.json', 'w') as file:
#         json.dump(infoLoggs, file, indent=4)
        
# def addIPSave(ip, time):
#     global infoLoggs
#     if (ip in infoLoggs) == False:
#         infoLoggs[ip] = []
#     infoLoggs[ip].append({time})
    
# def async_save_info_loggs():
#     with lock:
#         saveInfoLoggs()

# def requestSave():
    # threading.Thread(target=async_save_info_loggs).start()


# loadInfoLoggs()

@app.route('/')
def list_view():
    ip = request.remote_addr
    time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    with open('clicksLoggs.txt', 'a') as file:
        file.write(f"{time} - {ip}\n")
    
    return render_template('index.html')

@app.route('/edit')
def edit_view():
    return render_template('editKeywords.html')

@app.route("/getIP", methods=["GET"])
def getIP():
    return jsonify({'ip': request.remote_addr}), 200

#save search info
@app.route('/saveSearchInfo', methods=['POST'])
def saveSearchInfo():
    
    jsSearch = request.json
    print(jsSearch)
    pass


def loadKeywordChanges():
    global loadedVideoKeywordChanges
    if loadedVideoKeywordChanges == []:    
        if os.path.exists(videoKeywordChangesPath):
            with open(videoKeywordChangesPath, 'r') as file:
                loadedVideoKeywordChanges = json.load(file)
    return loadedVideoKeywordChanges


@app.route('/saveKeywordChanges', methods=['POST'])
def saveKeywordChanges():
    jsChange = request.json #      const currentKeywordChanges = { path: "", add: [], remove: [] };
    print(jsChange)
    videoKeywordChanges = loadKeywordChanges()
    paths = jsChange['paths'];
    add = jsChange['add'];
    remove = jsChange['remove'];
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    ip = request.remote_addr
    newChanges = {"paths": paths, "add": add, "remove": remove, "timestamp": timestamp, "who": ip}
    videoKeywordChanges.append(newChanges)

    with open(videoKeywordChangesPath, 'w') as file:
        json.dump(videoKeywordChanges, file, indent=4)
        
    return jsonify({"status": "success"})




@app.route('/getKeywordChanges', methods=['GET'])
def getKeywordChangesRequest():
    videoKeywordChanges = loadKeywordChanges()
    return jsonify(videoKeywordChanges)



loadedClicksAndVotes = {}

# function generateClicksAndVotesHTML(path) {
#   const videoClicks = data["videoClicks"];
#   const videoVotes = data["videoVotes"];
  
#   const clicks = videoClicks[path];
#   const Votes = videoVotes[path];

#   return `
#     <td>${clicks}</td>
#     <td>${Votes}</td>
#   `;
# }

pathClicksAndVotes = 'static/clicksAndVotes.json'

def loadClicksAndVotes():
    global loadedClicksAndVotes
    if loadedClicksAndVotes == {}:
        if os.path.exists(pathClicksAndVotes):
            with open(pathClicksAndVotes, 'r') as file:
                loadedClicksAndVotes = json.load(file)
    return loadedClicksAndVotes
    


@app.route('/getClicksAndVotes', methods=['GET'])
def getClicksAndVotes():
    clicksAndVotes = loadClicksAndVotes()
    return jsonify(clicksAndVotes)

@app.route('/saveClicksAndVotes', methods=['POST'])
def saveClicksAndVotes():
    jsData = request.json
    print(jsData)
        
    path = jsData['path']
    clicks = jsData['clicks']
    votes = jsData['votes']
    
    clicksAndVotes = loadClicksAndVotes()
    clicksAndVotes[path] = {"clicks": clicks, "votes": votes}
    
    print("save",clicksAndVotes)
    
    with open(pathClicksAndVotes, 'w') as file:
        json.dump(clicksAndVotes, file, indent=4)
        
    return jsonify({"status": "success"})






if __name__ == '__main__':
    # app.run(port=5000,debug=True)
    # app.run(host="0.0.0.0", port=5000, debug=True,ssl_context='adhoc')
    app.run(host="0.0.0.0", port=5000, debug=True)

