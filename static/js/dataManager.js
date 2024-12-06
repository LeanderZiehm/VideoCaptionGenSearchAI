let clicksAndVotes = {};


function getClicks(path){
    if(clicksAndVotes[path]){
        if(clicksAndVotes[path].clicks){
            return clicksAndVotes[path].clicks;
        }
    }
        return 0;
    

}
function setClicks(path, clicks){
    if(!clicksAndVotes[path]){
        clicksAndVotes[path] = {}
    }
    clicksAndVotes[path].clicks = clicks;
    saveClicksAndVotes(path,clicks,getVotes(path));
}

function getVotes(path){
    if(clicksAndVotes[path]){
       if(clicksAndVotes[path].votes){
           return clicksAndVotes[path].votes;
       }
    }

    return 0;
    
  
}
function setVotes(path, votes){
    if(!clicksAndVotes[path]){
        clicksAndVotes[path] = {};
    }
    clicksAndVotes[path].votes = votes;

    saveClicksAndVotes(path,getClicks(path),votes);
}



function getKeywordChangesFromServer() {
    fetch("/getClicksAndVotes")
      .then((response) => response.json())
      .then((data) => {
        clicksAndVotes = data;
        console.log("clicksAndVotes", clicksAndVotes);

        // updateVideosDisplayed();
       
      });
  }


function saveClicksAndVotes(path,clicks,votes){ 
    console.log("saveClicksAndVotes", path,clicks,votes);
    fetch("/saveClicksAndVotes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({"path":path,"clicks":clicks,"votes":votes}),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Success:", data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }




  getKeywordChangesFromServer();