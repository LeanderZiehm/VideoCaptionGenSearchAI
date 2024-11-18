from flask import Flask, render_template, jsonify, request
import os

app = Flask(__name__)

@app.route('/')
def list_view():
    return render_template('indexListView.html')

if __name__ == '__main__':
    app.run(port=5000,debug=True)
