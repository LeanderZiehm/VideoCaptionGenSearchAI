import os
import json
import requests
from datetime import datetime
from tkinter import Tk, messagebox, Toplevel, Button, Label
import base64

network_drive_path = r"V:\zentrale-einrichtungen\Kommunikation u. Marketing\Marketing\Videos\00-Video-Search-Tool_Leander"
timestamp_file = "last_execution_time.txt"
api_url = "http://localhost:11434/api/generate"
placeholder_image_path = "static/no_image_placeholder.png"

def check_network_drive():
    return os.path.exists(network_drive_path)

def analyze_image():
    try:
        with open(placeholder_image_path, "rb") as image_file:
            image_base64 = base64.b64encode(image_file.read()).decode("utf-8")
        prompt = "Write 9 keywords describing this image. Return comma separated keywords in the same line."
        payload = {
            "model": "llava",
            "prompt": prompt,
            "stream": False,
            "images": [image_base64],
        }
        headers = {"Content-Type": "application/json"}
        response = requests.post(api_url, data=json.dumps(payload), headers=headers)
        if response.status_code == 200:
            return response.json()
        else:
            print(f"API returned error: {response.status_code}")
            return None
    except requests.exceptions.ConnectionError:
        return None

def retry_popup(message, retry_function):
    def on_retry():
        popup.destroy()
        retry_function()

    root = Tk()
    root.withdraw()
    popup = Toplevel()
    popup.title("Error")
    popup.geometry("300x150")
    popup.resizable(False, False)
    Label(popup, text=message, wraplength=280, pady=10).pack()
    Button(popup, text="Retry", command=on_retry).pack(pady=10)
    popup.mainloop()

def check_network_drive_until_connected():
    if not check_network_drive():
        retry_popup("Network drive not connected. Please check your connection.", check_network_drive_until_connected)

def check_api_until_running():
    if analyze_image() is None:
        retry_popup("API is not running. Please start the API and retry.", check_api_until_running)

def main():
    check_network_drive_until_connected()
    print("Network drive accessible.")
    check_api_until_running()
    print("API running.")
