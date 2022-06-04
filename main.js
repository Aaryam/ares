
const peer = new Peer();
var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

var isHost = !window.location.toString().includes('?');
var hostID = '';
var allStreams = [];
var allIDs = [];
var allConnections = {};

// html elements

var videoContainer = document.getElementsByClassName('video-box')[document.getElementsByClassName('video-box').length - 1];

setInterval(function () {
    videoContainer = document.getElementsByClassName('video-box')[document.getElementsByClassName('video-box').length - 1];
}, 10);

// html elements

// handling calling

peer.on('open', function () {
    console.log(peer.id);

    hostID = isHost ? peer.id : window.location.toString().split('?')[1];

    // host stuff

    if (isHost) {
        
        // answer calls

        alert(window.location.toString() + '?' + peer.id);

        peer.on('call', function (call) {
            getUserMedia({video: true, audio: true}, function (myStream) {
                call.answer(myStream);
                call.on('stream', function (otherStream) {
                    self.srcObject = myStream;
                    allStreams.push(otherStream);
                    allIDs.push(call.peer);
                    allConnections[call.peer] = peer.connect(call.peer);
                    createVideo(call.peer, otherStream);
                });
            });
            sendData(call.peer, 'new-caller', true, null);
        });

    }

    // caller stuff

    else {

        // start calls (add host)

        addUser(hostID);

        peer.on('call', function (call) {
            getUserMedia({video: true, audio: true}, function (myStream) {
                call.answer(myStream);
                call.on('stream', function (otherStream) {
                    self.srcObject = myStream;
                    allStreams.push(otherStream);
                    allIDs.push(call.peer);
                    allConnections[call.peer] = peer.connect(call.peer);
                    createVideo(call.peer, otherStream);
                });
            });
        });

    }

});



// handling connections


peer.on('connection', function(conn) {
    conn.on('data', function(data){
        if (data.reason == 'new-caller') {
            if (data.data != peer.id) {
                addUser(data.data);
                console.log(data);
            }
        }
    });
});



// utility functions

function getLink() {
    return isHost ? window.location + '?' + peer.id : window.location.toString();
}

function addUser(peerID) {
    getUserMedia({video: true, audio: true}, function (myStream) {
        const call = peer.call(peerID, myStream);
        call.on('stream', function (otherStream) {
            if (!allIDs.includes(call.peer)) {
                allStreams.push(otherStream);
                allIDs.push(peerID);
                allConnections[peerID] = peer.connect(peerID);
                createVideo(peerID, otherStream);
            }
        });
    });
    console.log(peerID)
}

function createVideo(id, stream) {
    if (document.getElementById(id) == null) {
        let video = document.createElement('video');

        video.id = id;
        video.autoplay = true;
        video.srcObject = stream;
        video.classList.add('video');
        videoContainer.appendChild(video);
    }
}

function sendData(data, reason, isGlobal, peer) {
    if (isGlobal) {
        for (let i = 0; i < allIDs.length; i++) {
            const id = allIDs[i];

            allConnections[id].send({
                data: data,
                reason: reason,
            });
        }
    }
    else {
        allConnections[peer].send({
            data: data,
            reason: reason,
        });
    }
}

async function getMedia(constraints) {
    let stream = null;
  
    try {
      stream = await navigator.mediaDevices.getUserMedia(constraints);
      /* use the stream */
    } catch(err) {
      /* handle the error */
    }
  }
