import time

initTime = time.time()
import os
import json
import cv2
from moviepy.editor import VideoFileClip
from datetime import datetime
import ollama
import re
import logging

tookLoadTime = time.time() - initTime
print(f"Load Time: {tookLoadTime}")


logging.basicConfig(
    filename="error_log.txt",
    level=logging.ERROR,
    format="%(asctime)s - %(levelname)s - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)

skip_AI = False
MAX_VIDEO_COUNT = 1000000000
MAX_SCENE_COUNT = 5


VIDEO_FOLDER = r"V:\zentrale-einrichtungen\Kommunikation u. Marketing\Marketing\Videos"

STATIC_PATH = "static/"
VIDEO_KEYWORDS_FILE = "static/videoKeywords.js"
PROCESSED_PATH = "static/processed/"


def main():
    """Main function to process videos, generate captions, and save to a JS file."""

    loadedJsonData = loadJsonData()
    processedVideoCount = 0
    skippedVideoCount = 0
    errors = []

    for subdir, _, files in os.walk(VIDEO_FOLDER):
        print(f"Folder: {subdir}")
        for file in files:
            if processedVideoCount >= MAX_VIDEO_COUNT:
                print(
                    f"[{MAX_VIDEO_COUNT} processed. Stopping because it's the MAX_VIDEO_COUNT.]"
                )
                break

            if any(file.lower().endswith(ext) for ext in video_formats):
                filepath = os.path.join(subdir, file)

                if filepath in [video["path"] for video in loadedJsonData["videos"]]:
                    skippedVideoCount += 1
                    continue

                print(f"Processing video: {filepath}")

                try:
                    processedVideoData = processVideo(filepath)
                    loadedJsonData["videos"].append(processedVideoData)
                    saveToJsFile(loadedJsonData)

                    save_info_log(
                        f"Saved js: {len(loadedJsonData['videos'])} | {filepath}"
                    )

                except Exception as e:
                    logging.error(f"An error occurred: {str(e)} | {filepath}")

                    errors.append((str(e), filepath))

                processedVideoCount += 1

        print(f"skippedVideoCount: {skippedVideoCount}")

    print(f"Processed {processedVideoCount} videos.")
    print(f"Erorrs: {errors}")
    print(f"Erorrs: {len(errors)}")
    print("#########[Finished]#########")

    print(f"Total Time: {time.time() - initTime}")


def processVideo(video_path):
    scene_frames_paths = extract_equally_spaced_frames(video_path, MAX_SCENE_COUNT)
    print(f"Scene Frames: {scene_frames_paths}")
    keywords = set()
    for frame_path in scene_frames_paths:
        print(f"###{frame_path}###")
        generatedKeywords = generate_keywords(frame_path)
        print(f"Generated Keywords: {generatedKeywords}")
        keywords.update(generatedKeywords)

    print("...")
    metadata = getMetadata(video_path)
    processedVideoData = {
        "path": video_path,
        "keywords": list(keywords),
        "thumbnails": scene_frames_paths,
        "metadata": metadata,
    }

    return processedVideoData


def saveToJsFile(jsonData):
    jsonData = json.dumps(jsonData, indent=4)
    jsData = f"var videoKeywords = {jsonData};"
    with open(VIDEO_KEYWORDS_FILE, "w") as jsFile:
        jsFile.write(jsData)


def generate_keywords(image_path):
    if skip_AI:
        print("Skipping AI")
        return ["defaultKeyword"]

    keywords = []
    prompts = [
        "Write 9 keywords describing this image. Return comma seperated keywords in the same line."
    ]

    for prompt in prompts:
        result = ""

        stream = ollama.generate(
            model="llava", prompt=prompt, images=[image_path], stream=True
        )
        for chunk in stream:
            print(chunk["response"], end="", flush=True)
            result += chunk["response"]

        keywords.extend(result.split(","))

    print(f"Keywords: {keywords}")
    return keywords


def extract_equally_spaced_frames(video_path, num_frames):
    """Extracts equally spaced frames from a video and returns a list of frame paths."""

    video_name = os.path.splitext(os.path.basename(video_path))[0]

    video_name = re.sub(r"[^\x00-\x7F]+", "", video_name)

    output_dir = PROCESSED_PATH + video_name

    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    cap = cv2.VideoCapture(video_path)

    if not cap.isOpened():
        print(f"Error opening video file {video_path}")
        return []

    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    if total_frames < num_frames:
        print(f"Video has fewer frames than the requested {num_frames} frames.")
        return []

    frame_indices = np.linspace(0, total_frames - 1, num_frames, dtype=int)
    frame_paths = []

    for i, frame_idx in enumerate(frame_indices):
        cap.set(cv2.CAP_PROP_POS_FRAMES, frame_idx)
        ret, frame = cap.read()

        if ret:
            timestamp_ms = cap.get(cv2.CAP_PROP_POS_MSEC)
            frame_filename = os.path.join(
                output_dir, f"frame_{i+1:03d}_at_{int(timestamp_ms)}ms.jpg"
            )
            cv2.imwrite(frame_filename, frame)
            frame_paths.append(frame_filename)
            print(f"Frame {i+1} extracted at {int(timestamp_ms)}ms: {frame_filename}")
        else:
            print(f"Failed to extract frame at index {frame_idx}")

    cap.release()
    return frame_paths


def time_function(func):
    def wrapper(*args, **kwargs):
        start_time = time.time()
        result = func(*args, **kwargs)
        end_time = time.time()
        print(f"{func.__name__} took {end_time - start_time:.4f} seconds to run")
        return result

    return wrapper


@time_function
def loadJsonData():

    if os.path.exists(VIDEO_KEYWORDS_FILE) == False:
        jsonData = {}
    else:
        with open(VIDEO_KEYWORDS_FILE, "r") as jsFile:
            text = jsFile.read()
            jsonText = text[text.find("{") :]
            jsonText = jsonText[: jsonText.rfind("}") + 1]
            jsonData = json.loads(jsonText)

    if "videos" not in jsonData:
        jsonData["videos"] = []

    if "uniqueMetadata" not in jsonData:
        jsonData["uniqueMetadata"] = {}

    return jsonData


def getMetadata(video_path):

    try:
        video = VideoFileClip(video_path)

        media_time_created = min(
            datetime.fromtimestamp(os.path.getctime(video_path)),
            datetime.fromtimestamp(os.path.getmtime(video_path)),
        ).isoformat()

        metadata = {
            "media_time_created": media_time_created,
            "ratio": f"{video.size[0]}:{video.size[1]}",
            "fps": video.fps,
            "video_length": video.duration,
            "file_size": os.path.getsize(video_path),
        }

        video.close()
    except:
        metadata = None

    return metadata


def save_info_log(message):

    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    log_entry = f"{timestamp} - {message}\n"

    print(log_entry)

    with open("info_log.txt", "a") as f:
        f.write(log_entry)


video_formats = [".mp4", ".avi", ".mkv", ".mov", ".wmv", ".flv"]
image_formats = [".jpg", ".jpeg", ".png", ".bmp"]


if __name__ == "__main__":
    main()
