let MAX_VIDEOS_PER_PAGE = 100;

const videoResults = document.getElementById("video-results");

let keywordsToSearchList = [];
let isResizing = false;
let lastDownX = 0;
let currentTh;
let indexVideoPage = 0;
const THUMBNAIL_INDEX = 1;
let sortSettings = { sortBy: null, isAscending: true };

videoKeywords.videos = videoKeywords.videos.filter((video) => !video.remove);

const videosrip = videoKeywords.videos.filter(
  (video) =>
    video.metadata == null ||
    video.thumbnails == null ||
    video.thumbnails.length === 0
);

videoKeywords.videos.forEach((video) => {
  video.keywords = video.keywords.map((keyword) => {
    return keyword.toLowerCase();
  });
  //add quotes to ocr
  video.ocr = video.ocr.map((keyword) => {
    return `"${keyword}"`;
  });

  video.keywords = [...new Set(video.keywords)];

  video.keywords.sort();
});

function addOCRtoKeywords() {
  videoKeywords.videos.forEach((video) => {
    video.keywords = video.keywords.concat(video.ocr);
    video.keywords = [...new Set(video.keywords)];
  });
}

function removeOCRfromKeywords() {
  videoKeywords.videos.forEach((video) => {
    video.keywords = video.keywords.filter(
      (keyword) => !video.ocr.includes(keyword)
    );
  });
}

function main() {
  setup_headerInputs();
  setup_editKeywordsWindow();
  setup();
  updateVideosDisplayed();
  getKeywordChangesFromServer();
}
function setup() {
  window.addEventListener("scroll", function (event) {
    const element = document.getElementById("loadMore");
    if (isVisible(element)) {
      loadMore();
      // console.log("Visible, load more");
      loadingMore = true;
    }
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
      pathValue === "" || getRootPath(video.path) == pathValue;

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
      const ratioA = a.metadata.ratio;
      const ratioB = b.metadata.ratio;

      const numbersOfRatioA = ratioA.split(":");
      const numbersOfRatioB = ratioB.split(":");

      const sumNumbersOfRatioA = numbersOfRatioA[0] + numbersOfRatioA[1];
      const sumNumbersOfRatioB = numbersOfRatioB[0] + numbersOfRatioB[1];

      return (sumNumbersOfRatioA - sumNumbersOfRatioB) * (isAscending ? 1 : -1);
      // clicks
    } else if (sortKey === "clicks") {
      const clicksA = getClicks(a.path);
      const clicksB = getClicks(b.path);
      return (clicksA - clicksB) * (isAscending ? 1 : -1);
    } else if (sortKey === "votes") {
      const votesA = getVotes(a.path);
      const votesB = getVotes(b.path);
      return (votesA - votesB) * (isAscending ? 1 : -1);
    }
  });

  return videosToSort;
}

function displayVideos(videos) {
  // console.log("Displaying videos", videos);
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
    // console.log("No more videos to display.");
    return;
  }

  // console.log("Next page");
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
  // keywordContainerSingle class
  div.className = "keywordContainerSingle";
  let span = document.createElement("span");
  span.innerHTML = keyword;
  div.appendChild(span);

  let button = document.createElement("button");
  button.innerHTML = "<span>x</span>";
  button.className = "circle-btn";
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

  // const startTime = performance.now();
  globalFilteredVideos = filterVideos(sortedVideos, false);
  // const endTime = performance.now();

  const filteredVideosSmall = globalFilteredVideos.slice(
    0,
    (indexVideoPage + 1) * MAX_VIDEOS_PER_PAGE
  );

  // const startTimeDisplay = performance.now();
  displayVideos(filteredVideosSmall);
  // const endTimeDisplay = performance.now();

  // document.getElementById("edit-th").classList.remove("breathingHighlight")
  checkIfBreathingHighlight();
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
