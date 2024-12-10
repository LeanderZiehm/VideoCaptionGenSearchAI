const searchBar = document.getElementById("search-bar");
const fpsFilter = document.getElementById("fps-filter");
const ratioFilter = document.getElementById("ratio-filter");
const minDateInput = document.getElementById("minDate");
const maxDateInput = document.getElementById("maxDate");
const pageVideoCount = document.getElementById("pageVideoCount");
const pathFilter = document.getElementById("path-filter");
const uniqueFps = new Set();
const uniqueRatios = new Set();

const strictSearch = document.getElementById("strict-search");
const matchInPath = document.getElementById("match-in-path"); 

const tableHeadersSortable = document.querySelectorAll("th[data-sort]");
const tableHeaders = document.querySelectorAll("th");

let activeSortingHeader;


const editSelectedVideosKeywordsBtn = document.getElementById("edit-th");

//ocr
// const showOcrKeywordsCheckbox = document.getElementById("show-ocr-keywords");

let minDate;
let maxDate;





function dateToInputString(date) {
  return date.toISOString().split("T")[0];
}



function setup_headerInputs() {

  // minDateInput.value = "2007-01-01";
  // maxDateInput.value = dateToInputString(new Date());
  minDateInput.addEventListener("change", function () {
    // console.log(minDateInput.value);
    if(minDateInput.value == "") {
      minDateInput.value = dateToInputString(minDate);
    }
    updateVideosDisplayed();
  });

  maxDateInput.addEventListener("change", function () {
    // console.log(maxDateInput.value);
    if(maxDateInput.value == "") {
      maxDateInput.value = dateToInputString(maxDate);
    }
    updateVideosDisplayed();
  });
  const rootPaths = new Set();
  const videos = videoKeywords.videos;
  for (let i = 0; i < videos.length; i++) {
    const video = videos[i];
    const rootPath = getRootPath(video.path);
    if (rootPath.indexOf(".") == -1) {
      rootPaths.add(rootPath);
    }
  }

  pathFilter.innerHTML = `<option value="">All</option>${Array.from(rootPaths)
    .map((rootPath) => `<option value="${rootPath}">${rootPath}</option>`)
    .join("")}`;

  pathFilter.addEventListener("change", function () {
    updateVideosDisplayed();
  });

  fillFPSAndRatioAndMinMaxDateDropdownFilters();

  searchBar.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      let keyword = searchBar.value;

      if (keyword.length == 0) {
        return;
      }
      toggleKeyword(keyword);
    }
  });

  fpsFilter.addEventListener("change", function () {
    ratioFilter.value = "";
    updateVideosDisplayed();
  });

  ratioFilter.addEventListener("change", function () {
    fpsFilter.value = "";
    updateVideosDisplayed();
  });

  
  editSelectedVideosKeywordsBtn.addEventListener("click", editSelectedVideosKeywords);

 strictSearch.addEventListener("change", updateVideosDisplayed);

 //checkbox
//  showOcrKeywordsCheckbox.addEventListener("change", (e) => {
//     if (showOcrKeywordsCheckbox.checked) {
//       addOCRtoKeywords();
//     } else {
//       removeOCRfromKeywords();
//     }
//     updateVideosDisplayed();

// });



 
  //activate checkbox
  matchInPath.checked = true;
  matchInPath.addEventListener("change", updateVideosDisplayed);

  tableHeadersSortable.forEach((header) => {
    header.addEventListener("click", () => {
      const sortHeader = header.getAttribute("data-sort");

      if(sortHeader == sortSettings.sortBy) {
        sortSettings.isAscending = !sortSettings.isAscending;
      } else {
        sortSettings.isAscending = false;
      }

      sortSettings.sortBy = sortHeader;


  



      if (activeSortingHeader) {
        activeSortingHeader.id = "";
        activeSortingHeader.classList.remove("ascending");
        activeSortingHeader.classList.remove("descending");
      }
      activeSortingHeader = header;
      activeSortingHeader.id = "activeSortingHeader";

      if (sortSettings.isAscending) {
        
        activeSortingHeader.classList.add("ascending");
        activeSortingHeader.classList.remove("descending");
      } else {
        activeSortingHeader.classList.add("descending");
        activeSortingHeader.classList.remove("ascending");
      }
      


      updateVideosDisplayed();
    });
  });

  // data-sort="date"
  const dateHeader = document.querySelector('th[data-sort="date"]');
  //click 
  dateHeader.click();
  // show-ocr-keywords




  tableHeaders.forEach((th) => {
    const handle = th.querySelector(".resize-handle");
    handle.addEventListener("mousedown", (e) => {
      isResizing = true;
      lastDownX = e.clientX;
      currentTh = th;
    });
  });

  document.addEventListener("mousemove", (e) => {
    if (!isResizing) return;

    const offsetRight =
      currentTh.offsetWidth -
      (e.clientX - currentTh.getBoundingClientRect().left);
    currentTh.style.width = `${currentTh.offsetWidth - offsetRight}px`;
  });

  document.addEventListener("mouseup", () => {
    isResizing = false;
    currentTh = null;
  });
}

function editSelectedVideosKeywords() {

  const selectedRows = document.querySelectorAll(".selected-video-row");
  const selectedVideos = [];

  selectedRows.forEach((row) => {
    const path = row.id;
    const video = videoKeywords.videos.find((video) => video.path === path);
    selectedVideos.push(video);
  });

  if (selectedVideos.length == 0) {
    alert("No videos selected");
    return;
  }
  setVideosToEdit(selectedVideos);
  updateOpenEditKeywordsModal();
}

function fillFPSAndRatioAndMinMaxDateDropdownFilters() {
  const videos = videoKeywords.videos;

  maxDate = new Date(
    Math.max.apply(
      null,
      videos.map((video) =>
        video.metadata == null
          ? new Date(0)
          : new Date(video.metadata.media_time_created)
      )
    )
  );
  maxDate.setDate(maxDate.getDate() + 1);

  minDate = new Date(
    Math.min.apply(
      null,
      videos.map((video) =>
        video.metadata == null
          ? new Date()
          : new Date(video.metadata.media_time_created)
      )
    )
  );
  minDateInput.value = dateToInputString(minDate)
  maxDateInput.value = dateToInputString(maxDate)

  for (let i = 0; i < videos.length; i++) {
    const video = videos[i];
    if (video.metadata == null) {
      continue;
    } else {
    }
    uniqueFps.add(video.metadata.fps);
    uniqueRatios.add(video.metadata.ratio);
  }

  const orderedFps = Array.from(uniqueFps).sort((b, a) => a - b);

  const orderedRatios = Array.from(uniqueRatios).sort((b, a) => {
    const aSplit = a.split(":");
    const bSplit = b.split(":");
    if (aSplit.length == 2 && bSplit.length == 2) {
      return aSplit[0] + aSplit[1] - (bSplit[0] + bSplit[1]);
    } else {
      return a.localeCompare(b);
    }
  });

  fpsFilter.innerHTML = `<option value="">All</option>${orderedFps
    .map((fps) => `<option value="${fps}">${fps}</option>`)
    .join("")}<option value="unknown">unknown</option>`;
  ratioFilter.innerHTML = `<option value="">All</option>${orderedRatios
    .map((ratio) => `<option value="${ratio}">${ratio}</option>`)
    .join("")}<option value="unknown">unknown</option>`;
}
