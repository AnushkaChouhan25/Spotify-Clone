  console.log(`Lets write javascript`);
  let currsong = new Audio();
  let songs;
  let currfolder;

  // function to convert seconds to minutes seconds
  function secondToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
      return "00:00 ";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, "0");
    const formattedSeconds = String(remainingSeconds).padStart(2, "0");

    return `${formattedMinutes}:${formattedSeconds}`;
  }
  // Function for playing audio file
  async function getSongs(folder) {
    currfolder = folder;
   // console.log(`Fetching data from: /${folder}/`);
    let a = await fetch(`/${folder}/`);
    if (!a.ok) {
      console.error(`Failed to fetch data. Status: ${a.status}`);
      return; // Handle the error as needed
    }
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];
    for (let index = 0; index < as.length; index++) {
      const element = as[index];
      if (element.href.endsWith(".mp3")) {
        songs.push(element.href.split(`/${folder}/`)[1]);
      }
    }
    // show all the songs in the playlist
    let songul = document
      .querySelector(".songlist")
      .getElementsByTagName("ul")[0];
    songul.innerHTML = "";
    for (const song of songs) {
      songul.innerHTML =
        songul.innerHTML +
        `<li>
                                <img class="invert" width="34" src="img/music.svg" alt="Not found">
                                <div class ="info">
                                <div> ${song.replaceAll("%20", " ")} </div>
                                <div>Anu</div>
                                </div>
                                <div class="playnow">
                                  <span>Play Now</span>
                                  <img class="invert" src="img/play.svg" alt="">
                                </div> </li>`;
    }
    // attach an event listener to each song

    Array.from(
      document.querySelector(".songlist").getElementsByTagName("li")
    ).forEach((e) => {
      e.addEventListener("click", (element) => {
        console.log(e.querySelector(".info").firstElementChild.innerHTML);
        playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
      });
    });

    return songs;
  }

  const playMusic = (track, pause = false) => {
    // let audio = new Audio("/songs/" + track);
    currsong.src = `/${currfolder}/` + track;
    if (!pause) {
      currsong.play();
      play.src = "img/pause.svg";
    }

    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
  };
  async function displayAlbums() {
    let a = await fetch(`/songs/`);
    if (!a.ok) {
      console.error(`Failed to fetch data. Status: ${a.status}`);
      return; // Handle the error as needed
    }
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer");
    let array =  Array.from(anchors)
    Array.from(anchors).forEach(async (e) => {
      if (e.href.includes("/songs/") && !e.href.includes(".htaccess")) {
        let folder = e.href.split("/").slice(-1)[0];

        //get the meta data of the folder
        let a = await fetch(`/songs/${folder}/info.json`);
        if (!a.ok) {
          console.error(`Failed to fetch data. Status: ${a.status}`);
          return; // Handle the error as needed
        }
        let response = await a.json();

        cardContainer.innerHTML += `<div data-folder="${folder}" class="card">
                    <div class="play">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="black" stroke="#141B34"
                            stroke-width="1.5" stroke-linejoin="round" style="width: 60%; height: 60%;">
                            <path d="M5 19V5L19 12L5 19Z" />
                        </svg>
                    </div>
                    <img src="/songs/${folder}/cover.jpg" alt="">
                    <h2>${response.title}</h2>
                    <p>${response.description}</p>
                </div>`;
      }
    });

    // console.log(anchors)
    //load playlist when card clicked
    // console.log(document.getElementsByClassName("card"));
    // Array.from(document.getElementsByClassName("card")).forEach(e=>{
    //     console.log("Adding click listener to card:", e)
    //     e.addEventListener("click", item =>{
    //         console.log("dsdsds",item.currentTarget.dataset);
    //         songs =  getSongs(`songs/${item.currentTarget.dataset.folder}`);
    //         playMusic(songs[0])
    //     })
    // })

    document.body.addEventListener("click", async (event) => {
      const clickedCard = event.target.closest(".card");
      if (clickedCard) {
        console.log("Card clicked:", clickedCard.dataset.folder);

        if (!clickedCard.dataset.folder) {
          console.error(
            "Dataset folder is undefined. Check your HTML and dataset."
          );
          return;
        }

        // Debug statement to check the result of getSongs
        console.log("Fetching songs for folder:", clickedCard.dataset.folder);

        songs = await getSongs(`songs/${clickedCard.dataset.folder}`);
        if (songs.length > 0) {
          console.log("Songs fetched successfully:", songs);
          playMusic(songs[0]);
        } else {
          console.error("No songs found for folder:", clickedCard.dataset.folder);
        }
      }
    });
  }

  async function main() {
    //get the list of all the songs
    await getSongs("songs/ncs");
    playMusic(songs[0], true);

    // display all the albums on page
    await displayAlbums();

    // attach an event to play buttons
    play.addEventListener("click", () => {
      if (currsong.paused) {
        currsong.play();
        play.src = "img/pause.svg";
      } else {
        currsong.pause();
        play.src = "img/play.svg";
      }
    });
    //Listen for timeupdate event
    currsong.addEventListener("timeupdate", () => {
      document.querySelector(".songtime").innerHTML = `${secondToMinutesSeconds(
        currsong.currentTime
      )}/${secondToMinutesSeconds(currsong.duration)}`;
      document.querySelector(".circle").style.left =
        (currsong.currentTime / currsong.duration) * 100 + "%";
    });

    // add event to seekbar
    document.querySelector(".seekbar").addEventListener("click", (e) => {
      let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
      document.querySelector(".circle").style.left = percent + "%";
      currsong.currentTime = (currsong.duration * percent) / 100;
    });

    //add event for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
      document.querySelector(".left").style.left = "0";
    });
    //add event for close
    document.querySelector(".close").addEventListener("click", () => {
      document.querySelector(".left").style.left = "-110%";
    });

    // add event to prev buttons
    prev.addEventListener("click", () => {
      console.log("previous clicked");

      let index = songs.indexOf(currsong.src.split("/").slice(-1)[0]);
      if (index - 1 >= 0) {
        playMusic(songs[index + 1]);
      }
    });

    // add event to next buttons
    next.addEventListener("click", () => {
      console.log("next clicked");

      let index = songs.indexOf(currsong.src.split("/").slice(-1)[0]);
      if (index + 1 < songs.length) {
        playMusic(songs[index + 1]);
      }
    });

    // add event to volume
    document
      .querySelector(".range")
      .getElementsByTagName("input")[0]
      .addEventListener("change", (e) => {
        console.log("Setting volume to", e.target.value, "/100");
        currsong.volume = parseInt(e.target.value) / 100;
        if(currsong.volume >0 ){
          document.querySelector(".volume>img").src =  document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg");
        }
      });

    //add event to mute track
    document.querySelector(".volume>img").addEventListener("click", (e) => {
      if (e.target.src.includes("volume.svg")) {
        e.target.src = e.target.src.replace("volume.svg", "mute.svg");
        currsong.volume = 0;
        document
          .querySelector(".range")
          .getElementsByTagName("input")[0].value = 0;
      } else {
        e.target.src = e.target.src.replace("mute.svg", "volume.svg");
        currsong.volume = 0.1;
        document
          .querySelector(".range")
          .getElementsByTagName("input")[0].value = 10;
      }
    });
  }
  main();
