function generateKeywordsHtml(keywords) {
  return keywords
    .map((keyword) => {
      const matchedKeyword = getMatchedKeyword(keyword);
      let highlight = "";

      if (matchedKeyword != null) {
        const regex = new RegExp(`\\b${matchedKeyword}\\b`, "gi");
        keyword = keyword.replace(
          regex,
          `<span style="color:white">${matchedKeyword.toLowerCase()}</span>`
        );
        highlight = "highlighted";
      }
      return `<span class="keyword-capsule ${highlight}">${keyword}</span>`;
    })
    .join("");
}

function keywordIsInVideoPath(video, keyword) {
  return video.path.toLowerCase().includes(keyword.toLowerCase());
}

function getMatchedKeyword(keywordInVideo) {
  const videoKeyword = keywordInVideo.toLowerCase().trim();
  for (const keywordInSearch of keywordsToSearchList) {
    const searchKeyword = keywordInSearch.toLowerCase().trim();
    if (videoKeyword === searchKeyword) {
      return keywordInSearch;
    }
    const videoKeywordSplit = videoKeyword.split(" ");
    for (const videoKeywordSplitElement of videoKeywordSplit) {
      const videoKeywordSplit = videoKeywordSplitElement.toLowerCase().trim();
      if (videoKeywordSplit === searchKeyword) {
        return keywordInSearch;
      }
    }
  }
}

function videoMatchesSearch(video) {
  let matchesSearch = false;

  const strictSearch = document.getElementById("strict-search").checked;
  const matchInPath = document.getElementById("match-in-path").checked;

  let allKeywordsMatched = true;
  for (let keywordInSearch of keywordsToSearchList) {
    let keywordMatched = false;
    for (const keywordVideo of video.keywords) {
      if (checkKeywordMatch(keywordInSearch, keywordVideo)) {
        keywordMatched = true;
        break;
      }
    }

    if (matchInPath) {
      if (keywordIsInVideoPath(video, keywordInSearch)) {
        keywordMatched = true;
      }
    }

    if (keywordInSearch.startsWith("!")) {
      const negativeSearchKeyword = keywordInSearch.replace("!", "");
      if (video.keywords.includes(negativeSearchKeyword)) {
        keywordMatched = false;
      } else {
        keywordMatched = true;
      }
    }

    if (strictSearch) {
      if (!keywordMatched) {
        allKeywordsMatched = false;
        break;
      }
    } else {
      matchesSearch = keywordMatched;
    }
  }

  if (strictSearch) {
    matchesSearch = allKeywordsMatched;
  }

  if (keywordsToSearchList.length == 0) {
    matchesSearch = true;
  }

  return matchesSearch;
}
