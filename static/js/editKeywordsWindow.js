const HTML = `
  <div class="edit-keywords-modal">
    <h3>Edit Keywords</h3>
  
    <button id="close-keywords-btn" style="position: absolute; top: 10px; right: 10px">
      X
    </button>
    <div id="edit-keywords-list"></div>
    <div style="margin-top:5px" >  <input type="text" id="new-keyword" placeholder="Add new keyword" />
     <button id="undo-keywords-btn"> Undo</button>
     <button id="save-keywords-btn"> Save</button></div>
  
    </div>
`
let modalOverlay;
let editKeywordsList;
let newKeywordInput;
const editKeywordWindow = document.querySelector("#editKeywordsWindow");

const currentKeywordChanges = {add: [], remove: []};

function setup_editKeywordsWindow() {

  console.log("Setting up edit keywords window");

  editKeywordWindow.innerHTML = HTML;
  modalOverlay = document.querySelector(".edit-keywords-modal");
  editKeywordsList = document.getElementById("edit-keywords-list");
  newKeywordInput = document.getElementById("new-keyword");

  document.getElementById("undo-keywords-btn").addEventListener("click", () => {
  clearCurrentKeywordChanges();
  updateVideosDisplayed();

  console.log("Undoing keyword changes");
});


  
document.getElementById("save-keywords-btn").addEventListener("click", () => {
  submitKeyword();
  saveKeywordChanges();
});

document.getElementById("close-keywords-btn").addEventListener("click", () => {
  
  requestCloseEditWindow();
  // console.log("Close button clicked");

});

}

function hasChangesUnsaved() {
  return currentKeywordChanges.add.length > 0 || currentKeywordChanges.remove.length > 0;
}

function clearCurrentKeywordChanges() {
  // currentVideosToEdit = null;
  // currentKeywordChanges["paths"] = "";
  currentKeywordChanges["add"] = [];
  currentKeywordChanges["remove"] = [];

  document.getElementById("save-keywords-btn").className = "";
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

function  requestCloseEditWindow() {
  if(hasChangesUnsaved()) {
    if (confirm("You have unsaved changes. Are you sure you want to close?")) {
      closeEditWindow();
    }
  }else {
    closeEditWindow();
  }


 
}

function closeEditWindow() {
  hideEditWindow();
  clearCurrentKeywordChanges();
  console.log("Closing edit window");
}




function updateOpenEditKeywordsModal() {

  selectedVideos = getVideosToEdit();

  function getKeywordsToCapsule(keywords) {
    // console.log("Keywords", keywords);
    return keywords
      .map(
        (keyword, index) =>
          `<span class="keyword-capsule-edit"> <span> ${keyword} </span> <button class="remove-keyword-btn">x</button></span>`
      )
      .join("");
  }
  const sameKeywords = [];
  let keywordMatches = false;
  const video = selectedVideos[0];

  const allKeywords = video.keywords;

  //add and remove keywords currentKeywordChanges

  const toAdd = currentKeywordChanges.add;
  console.log("toAdd", toAdd);
  const toRemove = currentKeywordChanges.remove;


  
  for (const keyword of toRemove) {
    const index = allKeywords.indexOf(keyword);
    if (index !== -1) {
      allKeywords.splice(index, 1);
    }
  }
  //append toAdd to allKeywords
  for (const keyword of toAdd) {
    allKeywords.push(keyword);
  }

  //remove toRemove from allKeywords




  


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

  currentKeywordChanges.add.forEach((keyword) => {
    if (!sameKeywords.includes(keyword)) {
      sameKeywords.push(keyword);
    }
  });

  currentKeywordChanges.remove.forEach((keyword) => {
    const index = sameKeywords.indexOf(keyword);
    if (index !== -1) {
      sameKeywords.splice(index, 1);
    }
  });
  editKeywordsList.innerHTML = getKeywordsToCapsule(sameKeywords);


  if(hasChangesUnsaved()) {
    document.getElementById("save-keywords-btn").classList.add("save-unsaved-changes");
  }else {
    document.getElementById("save-keywords-btn").className = "";
  }
  
  showEditWindow();

  document.querySelectorAll(".remove-keyword-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const target = e.target;

      // console.log("Target", target);
      // console.log("Parent", target.parentElement);

      const keywordClicked = target.parentElement.querySelector("span").innerText.trim();

      // console.log("Keyword clicked", keywordClicked);
// 
      // console.log("video.keywords",video.keywords)

      const keywordToRemove = video.keywords.find((keyword) => keyword.trim() === keywordClicked);
      // console.log("Keyword to remove", keywordToRemove);

      currentKeywordChanges.remove.push(keywordToRemove);
      updateOpenEditKeywordsModal();
    });
  });

  newKeywordInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
     submitKeyword();
    }
  });
}


function submitKeyword() {
  const newKeyword = newKeywordInput.value.trim();
  if (newKeyword) {
    currentKeywordChanges.add.push(newKeyword);
    newKeywordInput.value = "";
    updateVideosDisplayed();
    updateOpenEditKeywordsModal();
  }
}

function saveKeywordChanges() {
  const addedOrRemovedSomething =
    currentKeywordChanges.add.length > 0 ||
    currentKeywordChanges.remove.length > 0;


  if (!addedOrRemovedSomething) {
    console.log("No changes to save");
    return;
  }

  // console.log(" applyChange(currentKeywordChanges);", currentKeywordChanges);
  // applyChange(currentKeywordChanges);
  fetch("/saveKeywordChanges", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(currentKeywordChanges),
  })
    .then((response) => response.json())
    .then((data) => {
      clearCurrentKeywordChanges();
      updateVideosDisplayed();
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}




function setVideosToEdit(videos) {
  currentVideosToEdit = videos;
  const paths = videos.map((video) => video.path);
  currentKeywordChanges["paths"] = paths;
}

function getVideosToEdit() {
  return currentVideosToEdit;
}


function applyChange(change) {

  console.log("applyChange(change) ", change);
  for (const path of change.paths) {
    const video = getAllVideos().find((video) => video.path === path);

    if (video) {

      console.log("video.keywords", video.keywords);


      const changes = change;
      console.log(" changes.add",  changes.add);
      changes.add.forEach((keyword) => {
        console.log("keyword", keyword);
        video.keywords.push(keyword);
      });

      changes.remove.forEach((keyword) => {
        const index = video.keywords.indexOf(keyword);
        if (index !== -1) {
          video.keywords.splice(index, 1);
        }
      });

      console.log("video.keywords", video.keywords);
    }
  }
}
function getKeywordChangesFromServer() {
  fetch("/getKeywordChanges")
    .then((response) => response.json())
    .then((changesToApply) => {
      console.log("Changes to apply", changesToApply);
      for (const change of changesToApply) {
        console.log("For change in changesToApply", change);
        applyChange(change);
      }
      updateVideosDisplayed();
    });
}




