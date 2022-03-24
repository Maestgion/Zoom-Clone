const socket = io("/");
const videoGrid = document.getElementById("video-grid");
console.log(videoGrid);
const myVideo = document.createElement("video");
myVideo.muted = true;

var peer = new Peer(undefined, {
  path: "/peerjs",
  host: "/",
  port: "1025",
});

let myVideoStream;

const peers = {};

navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    peer.on("call", (call) => {
      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });

    // socket.on("user-connected", (userId) => {
    //   connectToNewUser(userId, stream);
    // });

    socket.on("user-connected", (userId) => {
      // user is joining`
      setTimeout(() => {
        // user joined
        connectToNewUser(userId, stream);
      }, 1000);
    });
  });

peer.on("open", (id) => {
  //   console.log(id);
  socket.emit("joinRoom", ROOM_ID, id);
});

socket.on("user-disconnected", (userId) => {
  if (peers[userId]) peers[userId].close();
});

const connectToNewUser = (userId, stream) => {
  console.log(userId);
  const call = peer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
  call.on("close", () => {
    video.remove();
  });

  peers[userId] = call;
};

const addVideoStream = (video, stream) => {
  video.srcObject = stream;
  video.addEventListener("loadMetaData", () => {
    video.play();
  });
  videoGrid.append(video);
};

let text = $("input");

$("html").keydown(function (e) {
  if (e.which == 13 && text.val().length != 0) {
    console.log(text.val());
    socket.emit("message", text.val());
    text.val("");
  }
});

socket.on("createMessage", (message) => {
  // console.log("server msg", message);
  $("ul").append(`<li class="msgs"><b>user</b><br/>${message}</li>`);
  scrollToBottom();
});

const scrollToBottom = () => {
  var d = $(".right_chat_window");
  d.scrollTop(d.prop("scrollHeight"));
};

const muteControl = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    myVideoStream.getAudioTracks()[0].enabled = true;
    setMuteButton();
  }
};

const setMuteButton = () => {
  const html = `
    <i class="fas fa-microphone"></i><span>Mute</span>
    `;

  document.querySelector(".mute_button").innerHTML = html;
};
const setUnmuteButton = () => {
  const html = `
    <i class="unmute fas fa-microphone-slash"></i><span>Unmute</span>
    `;

  document.querySelector(".mute_button").innerHTML = html;
};

const playControl = () => {
  const enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setStopButton();
  } else {
    myVideoStream.getVideoTracks()[0].enabled = true;
    setPlayButton();
  }
};

const setPlayButton = () => {
  const html = `
    <i class="fas fa-video"></i><span>Stop Video</span>
    `;

  document.querySelector(".play_button").innerHTML = html;
};
const setStopButton = () => {
  const html = `
    <i class="stop fas fa-video-slash"></i><span>Play Video</span>
    `;

  document.querySelector(".play_button").innerHTML = html;
};
