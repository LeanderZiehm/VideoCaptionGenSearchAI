import setupCheck
import subprocess
import os
import time


# the other path to the network drive is in processVideos.py
VIDEO_FOLDER = r"V:\zentrale-einrichtungen\Kommunikation u. Marketing\Marketing\Videos"


def run_flask():
    """Runs the Flask application in a separate command prompt."""
    os.system("start cmd /k py startFlask.py")


def run_videos_every_2_hours():
    """Runs the processVideos.py script every 2 hours in the same process."""
    while True:
        subprocess.run(["py", "processVideos.py"])
        print("processVideos.py executed. Waiting for 2 hours...")
        # time.sleep(48 * 60 * 60)  # Sleep for 2 hours (2 * 60 * 60 seconds)


def main_program():
    print("Safety checks passed. Running main program...")

    # Run the Flask application in a new CMD
    run_flask()

    # Start the processVideos loop in the same process
    run_videos_every_2_hours()


if __name__ == "__main__":
    setupCheck.main(VIDEO_FOLDER)
    main_program()
