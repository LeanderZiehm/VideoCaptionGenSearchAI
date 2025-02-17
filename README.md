# README for `processVideos.py` 🎬

## Overview 🌟

`processVideos.py` is a Python script designed to automate the process of extracting metadata and keywords from videos. It scans a directory for video files, extracts frames from the videos, and generates relevant keywords for each extracted frame using an AI model (Llama). The script then saves this information into a JSON structure, which can later be used to generate a JavaScript file for web applications.

The script also handles various error logging, processes multiple video files in parallel, and allows for skipping certain steps if necessary.

## Features 🛠️

- **Video Metadata Extraction**: Extracts essential metadata from each video file such as:
  - Media creation time 🕒
  - Video resolution (ratio) 📏
  - FPS (frames per second) 🖼️
  - Video length ⏱️
  - File size 💾
- **Frame Extraction**: Extracts equally spaced frames from the video to represent key moments, up to a specified maximum number of frames 📸.
- **AI-based Keyword Generation**: Uses an AI model to generate a list of keywords describing the frames extracted from the video 🤖💬. These keywords are saved for later use.
- **Error Handling and Logging**: Logs errors encountered during processing to an `error_log.txt` file for troubleshooting ⚠️.
- **Customizable**: Adjustable parameters for maximum video count, maximum scene frames, and the option to skip AI-based keyword generation 🛠️.
- **JavaScript Export**: Generates a `.js` file containing video metadata and associated keywords in JSON format 📜.

## Script Flow 🌀

1. **Load Video Data**: The script first loads any previously saved video data from `static/videoKeywords.js` (if available).
2. **Video Processing**:
   - It scans the specified directory (`VIDEO_FOLDER`) for video files 🎥.
   - For each video file, it extracts a set of frames (based on the `MAX_SCENE_COUNT` setting).
   - Keywords are generated for each frame using an AI model (if `skip_AI` is not enabled) 🤖.
   - The video metadata (e.g., resolution, FPS) is extracted and saved along with the frame data and keywords.
3. **Save Data**: The metadata and keywords for each video are saved back to the JSON structure and exported to a JavaScript file (`static/videoKeywords.js`) 📜.
4. **Error Handling**: If an error occurs during any step of the process, it is logged to an `error_log.txt` file ⚠️.


## Steps to run the application:

### Requirements 📋


the code assummes that you coppied the python.exe and renamed to copy to py.exe so it can work



- **Python 3.x**: The script is written in Python 3 🐍.
- **External Libraries**:
  - `ollama`: For generating keywords using an AI model (llava) 🤖.
  - `cv2` (OpenCV): For handling video frame extraction 🎥.
  - `moviepy`: For reading video file metadata and processing 🎞️.

1. **Make sure you have all the necessary packages installed!** 📦
   - You can do this by running:
     ```
     pip install -r requirements.txt
     ```

2. **Run the `processVideos.py` file** 🚀:
   - Open your terminal (or command prompt) and navigate to the folder where `processVideos.py` is located.
   - Run the following command:
     ```
     python processVideos.py
     ```
   

3. **Run the `startFlask.py` file** 🌐:
   - Open your terminal (or command prompt) and navigate to the folder where `startFlask.py` is located.
   - Run the following command:
     ```
     python startFlask.py
     ```
     - Once the Flask server starts, open your web browser and go to `http://127.0.0.1:5000/`
   

### Key Features in the Code:

1. **Video Display Table** 🎬:
   - Displays video metadata like **thumbnail**, **keywords**, **creation date**, **length**, **size**, **ratio**, and **FPS**.
   - Allows **editing** of video keywords through a **modal**.

2. **Keyword Search and Filters** 🔑:
   - **Search** functionality based on keywords (through the search bar).
   - **Filters** for FPS and aspect ratio (using dropdowns).

3. **Sorting and Pagination** 🔄:
   - **Sorting** functionality for various metadata like creation date, video length, file size, FPS, and aspect ratio.
   - **Pagination** to navigate through large sets of videos, with a limit of **400 videos per page**.

4. **Dynamic Table Resize** ↔️:
   - The ability to **resize** table columns by dragging the **resize handle**.

5. **Edit Keywords Modal** ✏️:
   - A **modal** to add or remove keywords for a video.

6. **Search Bar and Keyword Highlighting** 🔦:
   - Highlights matching keywords in the displayed videos, allowing users to toggle keyword filters.

7. **Mobile and Desktop Compatibility** 📱💻:
   - The page is designed to be **responsive**, with a clean and **dark theme** for better visibility.

8. **File Path Interaction** 📂:
   - Allows copying the **file path** to the clipboard and visualizes the path with specific handling for **Windows** and **Mac OS**.

9. **Thumbnail Flip-through** 🔄📸:
   - Thumbnails **flip** automatically when hovered, showing different images from a set of video thumbnails.

### Suggestions for Improvement:

1. **Performance** ⚡:
   - The page might slow down with very large datasets (e.g., 400 videos per page). Using **pagination** and possibly **lazy loading** for videos can help optimize performance.

2. **User Interface** 💡:
   - The user interface can be made more intuitive by providing **tooltips** or **modal explanations** for each filter and functionality.

3. **Accessibility** ♿:
   - Add **keyboard navigation** for accessibility, enabling users to interact with filters and the table via **keyboard shortcuts**.

4. **Error Handling** ⚠️:
   - Handling **edge cases**, such as missing thumbnails or broken metadata, could improve user experience.

5. **Mobile Experience** 📱:
   - Though the page appears responsive, further tweaks like **collapsing filters** and optimizing **touch interactions** can improve mobile usability.


















## Configuration ⚙️

- `VIDEO_FOLDER`: Directory where videos are stored for processing. Change this variable to point to your own folder 📁.
- `MAX_VIDEO_COUNT`: The maximum number of videos to process. The script will stop processing once this number is reached ⏹️.
- `MAX_SCENE_COUNT`: The number of frames to extract from each video 🖼️.
- `skip_AI`: If set to `True`, the script will skip the AI-based keyword generation and use a default keyword instead 🚫🤖.
- `VIDEO_KEYWORDS_FILE`: The path to the JavaScript file where the video metadata and keywords will be saved 📂.

## Functions 🔧

### `main()`
- The main function that coordinates the entire video processing workflow 🧠.

### `processVideo(video_path)`
- Extracts frames and generates keywords for a video file 🎞️.

### `extract_keywords(text)`
- Extracts keywords from a given text using NLTK's part-of-speech tagging 📝.

### `generate_keywords(image_path)`
- Generates keywords for an image using the Ollama AI model 🤖💬.

### `extract_equally_spaced_frames(video_path, num_frames)`
- Extracts `num_frames` equally spaced frames from the provided video file 📸.

### `saveToJsFile(jsonData)`
- Saves the processed video data as a JavaScript file (`videoKeywords.js`) 📜.

### `loadJsonData()`
- Loads existing video metadata and keywords from `videoKeywords.js` 📂.

### `getMetadata(video_path)`
- Extracts metadata from a video file, including creation time, resolution, FPS, and length ⏱️.

### `save_info_log(message)`
- Saves informational log messages to `info_log.txt` 📝.

### `time_function(func)`
- A decorator that measures the execution time of a function ⏱️.

## Example Usage 🎯

1. **Setting Up Your Environment**: Make sure your video files are stored in the specified directory (`VIDEO_FOLDER`) 📁.
2. **Running the Script**: Simply run the script with Python:
   
   ```bash
   python processVideos.py
   ```

3. **Review Output**: The processed data will be saved in `static/videoKeywords.js` and can be used for your web application 💻.

## Error Logging 🛠️

- Errors are logged in the `error_log.txt` file. You can check this file for details on any issues encountered during the processing of the videos ⚠️.

## License 📝

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Notes 💡

- Ensure that the video files are in formats supported by OpenCV (`.mp4`, `.avi`, `.mkv`, `.mov`, `.wmv`, `.flv`) 🎥.
- The AI model used for keyword generation may require internet access and an API key for `ollama` 🌐.

## Future Improvements 🔮

- Add multi-threading to handle processing of multiple videos simultaneously ⚡.
- Implement better handling for failed video metadata extraction (e.g., fallbacks if video cannot be processed) 🔧.

