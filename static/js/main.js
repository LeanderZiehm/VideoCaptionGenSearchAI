let MAX_VIDEOS_PER_PAGE = 100;
const FLIP_THROUGH_INTERVAL = 270;
const videoResults = document.getElementById("video-results");
const tableHeaders = document.querySelectorAll("th[data-sort]");

let keywordsToSearchList = [];
let isResizing = false;
let lastDownX = 0;
let currentTh;
let indexVideoPage = 0;
const THUMBNAIL_INDEX = 1;
let sortSettings = { sortBy: null, isAscending: true };
sortSettings.sortBy = "date";
sortSettings.isAscending = false;

function main() {
  setup();
  updateVideosDisplayed();
  getKeywordChangesFromServer();

}
function setup() {
  window.addEventListener("scroll", function (event) {
    const element = document.getElementById("loadMore");
    if (isVisible(element)) {
      loadMore();
      console.log("Visible, load more");
      loadingMore = true;
    }
  });
}

function getKeywordChangesFromServer() {
  fetch("/getKeywordChanges")
    .then((response) => response.json())
    .then((changesToApply) => {
      console.log("Keyword changes", changesToApply);

      for (const change of changesToApply) {
        applyChange(change);
      }
      updateVideosDisplayed();
    });
}


function getRootPath(path) {
  const relativePath = path.replace(
    "V:\\zentrale-einrichtungen\\Kommunikation u. Marketing\\Marketing\\Videos\\",
    ""
  );
  const rootPath = relativePath.split("\\")[0];

  return rootPath;
}



function filterVideos(videos, shouldStopEarly = true) {
  const fpsValue = fpsFilter.value;
  const ratioValue = ratioFilter.value;
  const pathValue = document.getElementById("path-filter").value;
  const minDate = document.getElementById("minDate").value;
  const maxDate = document.getElementById("maxDate").value;
  const matchedVideos = [];

  let stopedEarly = -1;

  for (let i = 0; i < videos.length; i++) {
    if (shouldStopEarly) {
      if (
        globalFilteredVideos.length >=
        MAX_VIDEOS_PER_PAGE * (indexVideoPage + 1)
      ) {
        stopedEarly = i;
        break;
      }
    }

    const video = videos[i];

    let hasKeyword = videoMatchesSearch(video);

    let videoFPS;
    let videoRatio;
    let videoDate;

    if (video.metadata == null) {
      videoFPS = "unknown";
      videoRatio = "unknown";
      videoDate = "unknown";
    } else {
      videoFPS = video.metadata.fps;
      videoRatio = video.metadata.ratio;
      videoDate = new Date(video.metadata.media_time_created);
    }

    const matchesFps = fpsValue === "" || videoFPS == fpsValue;
    const matchesRatio = ratioValue === "" || videoRatio == ratioValue;
    const matchesPath =
      pathValue === "" ||
      video.path
        .replace(
          "V:\\zentrale-einrichtungen\\Kommunikation u. Marketing\\Marketing\\Videos\\",
          ""
        )
        .split("\\")[0] == pathValue;

    const searchingForUnknowns =
      fpsValue === "unknown" || ratioValue === "unknown";
    const isInDateRange =
      (videoDate >= new Date(minDate) && videoDate <= new Date(maxDate)) ||
      (searchingForUnknowns && videoDate == "unknown");

    if (
      hasKeyword &&
      matchesFps &&
      matchesRatio &&
      isInDateRange &&
      matchesPath
    ) {
      matchedVideos.push(video);
    }
  }

  return matchedVideos;
}

function sortVideos(videosToSort) {
  const sortKey = sortSettings.sortBy;

  const isAscending = sortSettings.isAscending;

  videosToSort.sort((a, b) => {
    if (a.metadata == null && b.metadata == null) {
      return 0;
    }
    if (a.metadata == null) {
      return 1;
    }
    if (b.metadata == null) {
      return -1;
    }
    if (sortKey === "date") {
      return (
        (new Date(a.metadata.media_time_created) -
          new Date(b.metadata.media_time_created)) *
        (isAscending ? 1 : -1)
      );
    } else if (sortKey === "length") {
      return (
        (a.metadata.video_length - b.metadata.video_length) *
        (isAscending ? 1 : -1)
      );
    } else if (sortKey === "size") {
      return (
        (a.metadata.file_size - b.metadata.file_size) * (isAscending ? 1 : -1)
      );
    } else if (sortKey === "fps") {
      return (a.metadata.fps - b.metadata.fps) * (isAscending ? 1 : -1);
    } else if (sortKey === "ratio") {
      return (
        a.metadata.ratio.localeCompare(b.metadata.ratio) *
        (isAscending ? 1 : -1)
      );
    }
  });

  return videosToSort;
}

function displayVideos(videos) {
  currentlyDisplayingVideos = videos;
  const displayingText = `Displaying ${currentlyDisplayingVideos.length} out of ${globalFilteredVideos.length} videos`;
  pageVideoCount.innerHTML = displayingText;
  document.getElementById(
    "loadMore"
  ).innerHTML = `<span>${displayingText}</span>`;

  const clearVideos = true;
  if (clearVideos) {
    videoResults.innerHTML = "";
  }

  if (videos.length > 0) {
    videos.forEach((video) => {
      const row = createVideoRow(video);
      videoResults.appendChild(row);
    });
  } else {
    displayNoResultsMessage();
  }
}

function loadMore() {
  if (indexVideoPage * MAX_VIDEOS_PER_PAGE >= globalFilteredVideos.length) {
    console.log("No more videos to display.");
    return;
  }

  console.log("Next page");
  indexVideoPage++;

  updateVideosDisplayed();
}

function getAllVideos() {
  return videoKeywords.videos;
}

function displayNoResultsMessage() {
  const noResultsMessage = document.createElement("tr");
  noResultsMessage.classList.add("no-results");
  noResultsMessage.innerHTML = `<td colspan="8">No videos found for the search query.</td>`;
  videoResults.appendChild(noResultsMessage);
}

function showPath(path) {
  alert(path);
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

function isAppleMac() {
  if (navigator.userAgent.toLowerCase().includes("mac")) {
    return true;
  } else {
    return false;
  }
}

function isWindows() {
  return navigator.userAgent.toLowerCase().includes("windows");
}

function addToKeywordsToSearch(keyword) {
  keywordsToSearchList.push(keyword);

  let div = document.createElement("div");
  let span = document.createElement("span");
  span.innerHTML = keyword;
  div.appendChild(span);

  let button = document.createElement("button");
  button.innerHTML = "x";
  button.onclick = function () {
    this.parentElement.remove();
    removeFromKeywordsToSearch(keyword);
    updateVideosDisplayed();
  };
  div.appendChild(button);

  document.getElementById("keywordsToSearch").appendChild(div);

  searchBar.value = "";

  updateVideosDisplayed();
}

function removeFromKeywordsToSearch(keyword) {
  keywordsToSearchList = keywordsToSearchList.filter(
    (item) => item !== keyword
  );

  let elements = document.getElementById("keywordsToSearch").children;

  for (let i = 0; i < elements.length; i++) {
    const textContainer = elements[i].querySelector("span");
    if (textContainer.innerText === keyword) {
      elements[i].remove();
    }
  }

  updateVideosDisplayed();
}

function toggleKeyword(keyword) {
  if (keywordsToSearchList.includes(keyword)) {
    removeFromKeywordsToSearch(keyword);
  } else {
    addToKeywordsToSearch(keyword);
  }
}
function checkKeywordMatch(keywordInSearch, keywordInVideo) {
  const searchKeyword = keywordInSearch.toLowerCase().trim();
  const videoKeyword = keywordInVideo.toLowerCase().trim();

  if (videoKeyword === searchKeyword) {
    return true;
  }

  const videoKeywordSplit = keywordInVideo.split(" ");
  for (const videoKeywordSplitElement of videoKeywordSplit) {
    const videoKeywordSplit = videoKeywordSplitElement.toLowerCase().trim();
    if (videoKeywordSplit === searchKeyword) {
      return true;
    }
  }

  return false;
}

let globalFilteredVideos = [];
let currentlyDisplayingVideos = [];

function updateVideosDisplayed() {
  let allVideos = getAllVideos();
  sortedVideos = sortVideos(allVideos);

  const startTime = performance.now();
  globalFilteredVideos = filterVideos(sortedVideos, false);
  const endTime = performance.now();

  const filteredVideosSmall = globalFilteredVideos.slice(
    0,
    (indexVideoPage + 1) * MAX_VIDEOS_PER_PAGE
  );

  const startTimeDisplay = performance.now();
  displayVideos(filteredVideosSmall);
  const endTimeDisplay = performance.now();
}

let loadingMore = false;



function requestToLoadMore() {
  if (!loadingMore) {
    loadingMore = true;
  }
}

function isVisible(ele) {
  const { top, bottom } = ele.getBoundingClientRect();
  const vHeight = window.innerHeight || document.documentElement.clientHeight;

  return (top > 0 || bottom > 0) && top < vHeight;
}

main();
 