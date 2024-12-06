const FLIP_THROUGH_INTERVAL = 270;


function createVideoRow(video) {
  const row = document.createElement("tr");
  row.classList.add("video-row");
  row.id = video.path;

  const thumbnails = video.thumbnails;

  const keywordsHtml = generateKeywordsHtml(video.keywords);
  const metadataHtml = generateMetadataHtml(video.metadata);
  const clicksAndVotesHtml = generateClicksAndVotesHTML(video.path);

  const pathHTML = generatePathHTML(video);

  row.innerHTML = `
    <td><img src="${getThumbnailPathRelative(
      thumbnails[THUMBNAIL_INDEX]
    )}" class="thumbnail"></td>
    <td>${pathHTML}<div class="keywordsContainer">${keywordsHtml}</div></td>
    <td><input type="checkbox" class="edit-keywords-checkbox"></td>
    ${metadataHtml}
    ${clicksAndVotesHtml}
        
  `;

  // console.log(row.innerHTML)

  setupRowEventListeners(row, video, video.path, thumbnails);

  return row;
}



const upvote = `<svg class="upvote" rpl="" icon-name="upvote-outline" viewBox="0 0 20 20"  xmlns="http://www.w3.org/2000/svg">
 <!--?lit$819297253$--><!--?lit$819297253$--><path d="M10 19c-.072 0-.145 0-.218-.006A4.1 4.1 0 0 1 6 14.816V11H2.862a1.751 1.751 0 0 1-1.234-2.993L9.41.28a.836.836 0 0 1 1.18 0l7.782 7.727A1.751 1.751 0 0 1 17.139 11H14v3.882a4.134 4.134 0 0 1-.854 2.592A3.99 3.99 0 0 1 10 19Zm0-17.193L2.685 9.071a.251.251 0 0 0 .177.429H7.5v5.316A2.63 2.63 0 0 0 9.864 17.5a2.441 2.441 0 0 0 1.856-.682A2.478 2.478 0 0 0 12.5 15V9.5h4.639a.25.25 0 0 0 .176-.429L10 1.807Z"></path><!--?-->
 </svg>`

 const downvote = `<svg class="downvote" rpl=""  icon-name="downvote-outline" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
 <!--?lit$819297253$--><!--?lit$819297253$--><path d="M10 1c.072 0 .145 0 .218.006A4.1 4.1 0 0 1 14 5.184V9h3.138a1.751 1.751 0 0 1 1.234 2.993L10.59 19.72a.836.836 0 0 1-1.18 0l-7.782-7.727A1.751 1.751 0 0 1 2.861 9H6V5.118a4.134 4.134 0 0 1 .854-2.592A3.99 3.99 0 0 1 10 1Zm0 17.193 7.315-7.264a.251.251 0 0 0-.177-.429H12.5V5.184A2.631 2.631 0 0 0 10.136 2.5a2.441 2.441 0 0 0-1.856.682A2.478 2.478 0 0 0 7.5 5v5.5H2.861a.251.251 0 0 0-.176.429L10 18.193Z"></path><!--?-->
 </svg>`


// function getVotesAndClicks(path){
//   return  clicksAndVotes[path] || {clicks: 0, votes: 0};
// }

function generateClicksAndVotesHTML(path) {
  // const { clicks, votes } = getVotesAndClicks(path);
  const clicks = getClicks(path);
  const votes = getVotes(path);
  

  return `
    <td><span class="clicks">${clicks}</span></td>
    <td> <div class="voteContainer"> ${upvote}<span class="voteNumber">${votes}</span>${downvote} </div></td>
  `;
}


function getPathForOs(path, removeFileName = false, removeDrivePath = false) {
  if (removeFileName) {
    path = path.substring(0, path.lastIndexOf("\\"));
  }

  if (removeDrivePath) {
    path = path.replace(
      "V:\\zentrale-einrichtungen\\Kommunikation u. Marketing\\Marketing\\Videos\\",
      ""
    );
  }

  if (isAppleMac()) {
    path = path.replace("V:", "/Volumes/verteiler");
    path = path.replace(/\\/g, "/");
  }

  return path;
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

        // path = path.replace("")



        path = path.replace(regex, (match) => {
          return `<span style="color:white">${match}</span>`;
        });

        break;
      }
    }
  }
//id= ${path}
  const pathHTML = `<div class="pathDisplay ${highlighted}">${shortenPath(path)}</div>`;
  return pathHTML;
}


function shortenPath(path) {
  path = path.replace(
    "V:\\zentrale-einrichtungen\\Kommunikation u. Marketing\\Marketing\\Videos\\",
    ""
  );

  if (isAppleMac()) {
    path = path.replace("V:", "/Volumes/verteiler");
    path = path.replace(/\\/g, "/");
  }

  // console.log(path);

  return path;
}


function convertToGermanDateString(isoString) {
  // Parse the ISO string to a Date object
  const date = new Date(isoString);

  // Extract date and time components
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  // Format to German date and time style
  return `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;
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

    dateStringGerman = convertToGermanDateString(metadata.media_time_created);
    return `
      <td>${dateStringGerman}</td>
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
  // console.log(`row: ${row}, video: ${video}, filePath: ${filePath}, thumbnails: ${thumbnails}`);
  setupPathDisplayListener(row, filePath);
  setupKeywordsContainerListener(row);
  setupThumbnailHover(row, thumbnails);
  setupThumbnailClick(row, filePath);
  setupEditKeywordsButton(row, video);
  setupVoteButtons(row, video);
}

function setupVoteButtons(row, video) {
  const upvote = row.querySelector(".upvote");
  const downvote = row.querySelector(".downvote");

  upvote.addEventListener("click", () => {
    const voteNumberSpan = row.querySelector(".voteNumber");
    const votes = getVotes(video.path);
    const newVotes = votes + 1;
    setVotes(video.path, newVotes);
    voteNumberSpan.innerText = newVotes;


  });

  downvote.addEventListener("click", () => {
    const voteNumberSpan = row.querySelector(".voteNumber");
    const votes = getVotes(video.path);
    const newVotes = votes - 1;
    setVotes(video.path, newVotes);
    voteNumberSpan.innerText = newVotes;
  });
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
    copyPathToClipboard(filePath,false);
    increaseUsageNumer(row,filePath);
  });
}

function copyPathToClipboard(filePath, removeFileName=false) {
  const filePathToCopy = getPathForOs(filePath, removeFileName);
  copyToClipboard(filePathToCopy);
  showPath(filePathToCopy);
}

function increaseUsageNumer(row,filePath) {
  
  
  const clicksElement = row.querySelector(".clicks");
  // const number = parseInt(usageNumber.innerText);
  const clicks = getClicks(filePath);
  const newClicks = clicks+1;
  setClicks(filePath,newClicks);
  clicksElement.innerText = newClicks;
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
    copyPathToClipboard(filePath,true);
    increaseUsageNumer(row,filePath);
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
    document.getElementById("edit-th").classList.add("breathingHighlight")
  } else {
    row.classList.remove("selected-video-row");
    //all selected rows
    const selectedRows = document.querySelectorAll(".selected-video-row");
    if (selectedRows.length == 0) {
      document.getElementById("edit-th").classList.remove("breathingHighlight")
    }
    
  }
}
