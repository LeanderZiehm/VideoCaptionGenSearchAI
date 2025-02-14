from flask import Flask, render_template, jsonify, request
import json
import os
from datetime import datetime

# import socket

port = 5000

app = Flask(__name__)
videoKeywordChangesPath = "static/videoKeywordChanges.json"
infoLoggs = {}

loadedVideoKeywordChanges = []

loadedClicksAndVotes = {}
pathClicksAndVotes = "static/clicksAndVotes.json"


@app.route("/")
def list_view():
    return render_template("index.html")


def loadKeywordChanges():
    global loadedVideoKeywordChanges
    if loadedVideoKeywordChanges == []:
        if os.path.exists(videoKeywordChangesPath):
            with open(videoKeywordChangesPath, "r") as file:
                loadedVideoKeywordChanges = json.load(file)
    return loadedVideoKeywordChanges


@app.route("/saveKeywordChanges", methods=["POST"])
def saveKeywordChanges():
    jsChange = request.json
    print(jsChange)
    videoKeywordChanges = loadKeywordChanges()
    paths = jsChange["paths"]
    add = jsChange["add"]
    remove = jsChange["remove"]
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    ip = request.remote_addr
    newChanges = {"paths": paths, "add": add, "remove": remove, "timestamp": timestamp, "who": ip}
    videoKeywordChanges.append(newChanges)

    with open(videoKeywordChangesPath, "w") as file:
        json.dump(videoKeywordChanges, file, indent=4)

    return jsonify({"status": "success"})


@app.route("/getKeywordChanges", methods=["GET"])
def getKeywordChangesRequest():
    videoKeywordChanges = loadKeywordChanges()
    return jsonify(videoKeywordChanges)


def loadClicksAndVotes():
    global loadedClicksAndVotes
    if loadedClicksAndVotes == {}:
        if os.path.exists(pathClicksAndVotes):
            with open(pathClicksAndVotes, "r") as file:
                loadedClicksAndVotes = json.load(file)
    return loadedClicksAndVotes


@app.route("/getClicksAndVotes", methods=["GET"])
def getClicksAndVotes():
    clicksAndVotes = loadClicksAndVotes()
    return jsonify(clicksAndVotes)


@app.route("/saveClicksAndVotes", methods=["POST"])
def saveClicksAndVotes():
    jsData = request.json
    print(jsData)

    path = jsData["path"]
    clicks = jsData["clicks"]
    votes = jsData["votes"]

    clicksAndVotes = loadClicksAndVotes()
    clicksAndVotes[path] = {"clicks": clicks, "votes": votes}

    print("save", clicksAndVotes)

    with open(pathClicksAndVotes, "w") as file:
        json.dump(clicksAndVotes, file, indent=4)

    return jsonify({"status": "success"})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=port, debug=True)
