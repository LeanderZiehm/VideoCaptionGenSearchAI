function createVideoRow(video) {
  const row = document.createElement("tr");
  row.classList.add("video-row");
  row.id = video.path;

  const thumbnails = video.thumbnails;

  const keywordsHtml = generateKeywordsHtml(video.keywords);
  const metadataHtml = generateMetadataHtml(video.metadata);

  const pathHTML = generatePathHTML(video);

  row.innerHTML = `
    <td><img src="${getThumbnailPathRelative(
      thumbnails[THUMBNAIL_INDEX]
    )}" class="thumbnail"></td>
    <td>${pathHTML}<div class="keywordsContainer">${keywordsHtml}</div></td>
    ${metadataHtml}
        <td><input type="checkbox" class="edit-keywords-checkbox"></td>
  `;

  setupRowEventListeners(row, video, video.path, thumbnails);

  return row;
}

function generatePathHTML(video) {
  let path = getPathForOs(video.path, false);

  const div = document.createElement("div");
  let highlighted = "";

  const matchInPath = document.getElementById("match-in-path").checked;
  if (matchInPath) {
    for (const keywordInSearch of keywordsToSearchList) {
      if (keywordIsInVideoPath(video, keywordInSearch)) {
        highlighted = "highlighted";
        const regex = new RegExp(keywordInSearch, "gi");

        path = path.replace(regex, (match) => {
          return `<span style="color:white">${match}</span>`;
        });

        break;
      }
    }
  }

  const pathHTML = `<div class="pathDisplay ${highlighted}">${path}</div>`;
  return pathHTML;
}

function generateMetadataHtml(metadata) {
  if (!metadata) {
    return `
      <td>Unknown Date</td>
      <td>Unknown Length</td>
      <td>Unknown Size</td>
      <td>Unknown Ratio</td>
      <td>Unknown FPS</td>
    `;
  } else {
    return `
      <td>${new Date(metadata.media_time_created).toLocaleString()}</td>
      <td>${metadata.video_length.toFixed(2)}</td>
      <td>${(metadata.file_size / (1024 * 1024)).toFixed(2)}</td>
      <td>${metadata.ratio}</td>
      <td>${metadata.fps.toFixed(2)}</td>
    `;
  }
}

function getThumbnailPathRelative(thumbnailPath) {
  if (!thumbnailPath) {
    return "static/no_image_placeholder.png";
  }

  const processedIndex = thumbnailPath.indexOf("static");
  if (processedIndex !== -1) {
    return thumbnailPath.substring(processedIndex);
  } else {
    console.error("Processed folder not found in the path.");
    return null;
  }
}

function setupRowEventListeners(row, video, filePath, thumbnails) {
  setupPathDisplayListener(row, filePath);
  setupKeywordsContainerListener(row);
  setupThumbnailHover(row, thumbnails);
  setupThumbnailClick(row, filePath);
  setupEditKeywordsButton(row, video);
}

function copyToClipboard(text) {
  const tempInput = document.createElement("input");
  tempInput.style.position = "absolute";
  tempInput.style.left = "-9999px";
  tempInput.value = text;
  document.body.appendChild(tempInput);
  tempInput.select();
  document.execCommand("copy");
  document.body.removeChild(tempInput);
}

function setupPathDisplayListener(row, filePath) {
  row.querySelector(".pathDisplay").addEventListener("click", () => {
    const filePathToCopy = getPathForOs(filePath, false);
    copyToClipboard(filePathToCopy);
    showPath(filePathToCopy);
  });
}

function setupKeywordsContainerListener(row) {
  row.querySelector(".keywordsContainer").addEventListener("click", (event) => {
    const keyword = event.target.innerText;
    if (
      event.target.classList.contains("keyword-capsule") ||
      event.target.parentElement.classList.contains("keyword-capsule")
    ) {
      toggleKeyword(keyword);
    }
  });
}

function setupThumbnailHover(row, thumbnails) {
  let currentThumbnailIndex = THUMBNAIL_INDEX;
  let interval;

  const thumbnail = row.querySelector(".thumbnail");
  thumbnail.addEventListener("mouseenter", function () {
    interval = setInterval(() => {
      currentThumbnailIndex = (currentThumbnailIndex + 1) % thumbnails.length;
      this.src = getThumbnailPathRelative(thumbnails[currentThumbnailIndex]);
    }, FLIP_THROUGH_INTERVAL);
  });

  thumbnail.addEventListener("mouseleave", function () {
    clearInterval(interval);
    this.src = getThumbnailPathRelative(thumbnails[THUMBNAIL_INDEX]);
    currentThumbnailIndex = 0;
  });
}

function setupThumbnailClick(row, filePath) {
  row.querySelector(".thumbnail").addEventListener("click", () => {
    const filePathToCopy = getPathForOs(filePath, true);
    copyToClipboard(filePathToCopy);
    showPath(filePathToCopy);
  });
}

function setupEditKeywordsButton(row, video) {
  const checkbox = row.querySelector(".edit-keywords-checkbox");
  checkbox.addEventListener("change", (event) => {
    toggleSelectRowCheckbox(row);
    console.log("checkbox clicked");
  });

  row.addEventListener("click", (event) => {
    if (isHoldingCtrl_keyboardShortcuts()) {
      toggleSelectRowCheckbox(row, true);
    }
  });
}

function toggleSelectRowCheckbox(row, toogle = false) {
  const checkbox = row.querySelector(".edit-keywords-checkbox");
  if (toogle) {
    checkbox.checked = !checkbox.checked;
  }

  if (checkbox.checked) {
    row.classList.add("selected-video-row");
  } else {
    row.classList.remove("selected-video-row");
  }
}
