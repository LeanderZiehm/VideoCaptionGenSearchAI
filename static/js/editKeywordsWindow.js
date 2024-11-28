const HTML = `
  <div class="edit-keywords-modal">
    <h3>Edit Keywords</h3>
    <button id="undo-keywords-btn" style="position: absolute; top: 10px; right: 50%">
      Undo
    </button>
    <button id="save-keywords-btn" style="position: absolute; top: 10px; right: 10px">
      X
    </button>
    <div id="edit-keywords-list"></div>
    <input type="text" id="new-keyword" placeholder="Add new keyword" style="width: 80%" />
    <button id="add-keyword-btn" style="padding: 20px; background-color: rgb(0, 153, 255)">
      Add
    </button>
    </div>
`

const editKeywordWindow = document.querySelector("#editKeywordsWindow");
const modalOverlay = document.querySelector(".modal-overlay");
const editKeywordsList = document.getElementById("edit-keywords-list");
const newKeywordInput = document.getElementById("new-keyword");


function setup_editKeywordsWindow() {
  editKeywordWindow.innerHTML = HTML;
  
document.getElementById("save-keywords-btn").addEventListener("click", () => {
  hideEditWindow();
  saveKeywordChanges();
});

document.getElementById("add-keyword-btn").addEventListener("click", () => {
  const newKeyword = newKeywordInput.value.trim();
  if (newKeyword) {
    currentKeywordChanges.add.push(newKeyword);
    newKeywordInput.value = "";
    updateOpenEditKeywordsModal();
    updateVideosDisplayed();
  }
});
}



function showEditWindow() {
  editKeywordWindow.style.display = "block";
  modalOverlay.style.display = "block";
}
function hideEditWindow() {
  editKeywordWindow.style.display = "none";
  modalOverlay.style.display = "none";
}
function editWindowIsOpen() {
  return editKeywordWindow.style.display === "block";
}

function updateOpenEditKeywordsModal() {
  selectedVideos = getVideosToEdit();

  function getKeywordsToCapsule(keywords) {
    return keywords
      .map(
        (keyword, index) =>
          `<span class="keyword-capsule">${keyword} <button class="remove-keyword-btn" data-index="${index}">x</button></span>`
      )
      .join("");
  }
  console.log("Selected videos", selectedVideos);
  const sameKeywords = [];
  let keywordMatches = false;
  const video = selectedVideos[0];
  for (const maybeInEveryVideo of video.keywords) {
    let keywordMatchesWithEveryVideo = true;

    for (const video of selectedVideos) {
      let keywordMatched = false;
      for (const videoKeyword of video.keywords) {
        if (checkKeywordMatch(maybeInEveryVideo, videoKeyword)) {
          keywordMatched = true;
          break;
        }
      }
      if (!keywordMatched) {
        keywordMatchesWithEveryVideo = false;
        break;
      }
    }
    if (keywordMatchesWithEveryVideo) {
      sameKeywords.push(maybeInEveryVideo);
    }
  }
  editKeywordsList.innerHTML = getKeywordsToCapsule(sameKeywords);
  showEditWindow();

  document.querySelectorAll(".remove-keyword-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const index = e.target.getAttribute("data-index");
      const removedKeyword = video.keywords.splice(index, 1)[0];
      currentKeywordChanges.remove.push(removedKeyword);
      console.log("Removed keyword", removedKeyword);
      updateVideosDisplayed();
      updateOpenEditKeywordsModal();
    });
  });

  newKeywordInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      const newKeyword = newKeywordInput.value.trim();
      if (newKeyword) {
        currentKeywordChanges.add.push(newKeyword);
        newKeywordInput.value = "";
        updateVideosDisplayed();
        updateOpenEditKeywordsModal();
      }
    }
  });
}

function addKeywordToVideosEdited(keyword) {
  const videosToEdit = getVideosToEdit();
  videosToEdit.forEach((video) => {
    video.keywords.push(keyword);
  });
}

const currentKeywordChanges = { path: "", add: [], remove: [] };
function saveKeywordChanges() {
  const addedOrRemovedSomething =
    currentKeywordChanges.add.length > 0 ||
    currentKeywordChanges.remove.length > 0;

  if (!addedOrRemovedSomething) {
    console.log("No changes to save");
    return;
  }

  console.log("Saving keyword changes", currentKeywordChanges);
  applyChange(currentKeywordChanges);
  fetch("/saveKeywordChanges", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(currentKeywordChanges),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Success:", data);
      clearVideoToEdit();
      updateVideosDisplayed();
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function applyChange(change) {
  for (const path of change.paths) {
    const video = videoKeywords.videos.find((video) => video.path === path);

    if (video) {
      const changes = change;
      changes.add.forEach((keyword) => {
        video.keywords.push(keyword);
      });

      changes.remove.forEach((keyword) => {
        const index = video.keywords.indexOf(keyword);
        if (index !== -1) {
          video.keywords.splice(index, 1);
        }
      });
    }
  }
}


function setVideosToEdit(videos) {
  currentVideosToEdit = videos;
  const paths = videos.map((video) => video.path);
  currentKeywordChanges["paths"] = paths;
}

function getVideosToEdit() {
  return currentVideosToEdit;
}
function clearVideoToEdit() {
  currentVideosToEdit = null;
  currentKeywordChanges["paths"] = "";
  currentKeywordChanges["add"] = [];
  currentKeywordChanges["remove"] = [];
}



document.addEventListener("DOMContentLoaded",setup_editKeywordsWindow);