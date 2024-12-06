from flask import Flask, render_template, jsonify, request
import json
import os
from datetime import datetime
# import threading

app = Flask(__name__)
videoKeywordChangesPath = 'static/videoKeywordChanges.json'
infoLoggs = {}
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
    #save the ip and the time of the request
    ip = request.remote_addr
    time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    #time how long the request took
    # startTime = datetime.now()
    # print()
    # addIPSave(ip, time)
    # requestSave()
    # endTime = datetime.now()
    # print(f"Time to log the request: {endTime - startTime}")
    
    with open('usageLoggs.txt', 'a') as file:
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
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    ip = request.remote_addr
    
    
    # [{"paths":["V:\\zentrale-einrichtungen\\Kommunikation u. Marketing\\Marketing\\Videos\\DAAD Preis\\2024\\Export\\DAAD_24_final.mp4"], "add": ["gg"], "remove": [" flowers"]}]
    
    newChanges = {"paths": paths, "add": add, "remove": remove, "timestamp": timestamp, "who": ip}
    videoKeywordChanges.append(newChanges)

    with open(videoKeywordChangesPath, 'w') as file:
        json.dump(videoKeywordChanges, file, indent=4)
        
    return jsonify({"status": "success"})

@app.route('/getKeywordChanges', methods=['GET'])
def getKeywordChanges():
    
    if os.path.exists(videoKeywordChangesPath):
        with open(videoKeywordChangesPath, 'r') as file:
            videoKeywordChanges = json.load(file)
    else:
        videoKeywordChanges = {}
        
    return jsonify(videoKeywordChanges)

# updateKeywordChanges

@app.route('/updateKeywordChanges', methods=['POST'])
def updateKeywordChanges():
    
    jsChange = request.json
    print(jsChange)
    index = 0
    newNameForFile = videoKeywordChangesPath
    while True:
    
        if os.path.exists(newNameForFile):
            index += 1
            #new name 
            split = videoKeywordChangesPath.split('.')
            newNameForFile = f"{split[0]}_{index}.{split[1]}"
        else:
            break
        
    # //create new file 
    with open(newNameForFile, 'w') as file:
        json.dump(jsChange, file, indent=4)
            


if __name__ == '__main__':
    # app.run(port=5000,debug=True)
    # app.run(host="0.0.0.0", port=5000, debug=True,ssl_context='adhoc')
    app.run(host="0.0.0.0", port=5000, debug=True)

