import setupCheck
import subprocess
import os


def main_program():
    print("Safety checks passed. Running main program...")
    os.start("http://127.0.0.1:5000")
    flask_process = subprocess.Popen(["python", "startFlask.py"])
    videos_process = subprocess.Popen(["python", "processVideos.py"])
    flask_process.wait()
    videos_process.wait()

if __name__ == "__main__":
    setupCheck.main()
    main_program()
