import React, { useContext, useEffect, useRef, useState } from "react";
import { socket } from "../utils/socket";
import AppContext from "../context/AppContext";
import VideoPlayer from "./VideoPlayer";
import { useNavigate } from "react-router-dom";

const servers = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

const MeetingRoom = () => {
  const { setParticipants, remoteStreams, setRemoteStreams, name } = useContext(AppContext);
  const [peerNames, setPeerNames] = useState({});
  const [hostId, setHostId] = useState(null);

  const localStreamRef = useRef(null);
  const peerConnections = useRef({});
  const navigate = useNavigate();

  const getMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      return stream;
    } catch (err) {
      console.log(err);
      const canvas = document.createElement("canvas");
      canvas.width = 640;
      canvas.height = 480;
      const videoStream = canvas.captureStream();
      const dummyVideoTrack = videoStream.getVideoTracks()[0];
      dummyVideoTrack.enabled = false;
      return new MediaStream([dummyVideoTrack]);
    }
  };

  useEffect(() => {
    const init = async () => {
      const stream = await getMedia();
      localStreamRef.current = stream;

      // Emit after stream is ready
      socket.emit("join-room", {
        roomId: window.location.pathname.split("/")[2],
        name,
      });

      // Handle all socket events inside init
      socket.on("participants-update", (users) => {
        // ✅ Remove duplicates based on id
        const uniqueUsers = users.filter(
          (user, index, self) =>
            index === self.findIndex((u) => u.id === user.id)
        );
        setParticipants(uniqueUsers);

        const names = {};
        uniqueUsers.forEach((user) => {
          names[user.id] = user.name;
        });
        setPeerNames(names);
      });

      socket.on("user-joined", async ({ userId }) => {
        const pc = new RTCPeerConnection(servers);
        peerConnections.current[userId] = pc;

        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        pc.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit("ice-candidate", {
              to: userId,
              candidate: event.candidate,
            });
          }
        };

        pc.ontrack = (event) => {
          setRemoteStreams((prev) => [
            ...prev.filter((s) => s.id !== userId),
            { id: userId, stream: event.streams[0] },
          ]);
        };

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("offer", { to: userId, offer });
      });

      socket.on("offer", async ({ from, offer }) => {
        const pc = new RTCPeerConnection(servers);
        peerConnections.current[from] = pc;

        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        pc.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit("ice-candidate", {
              to: from,
              candidate: event.candidate,
            });
          }
        };

        pc.ontrack = (event) => {
          setRemoteStreams((prev) => [
            ...prev.filter((s) => s.id !== from),
            { id: from, stream: event.streams[0] },
          ]);
        };

        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("answer", { to: from, answer });
      });

      socket.on("answer", async ({ from, answer }) => {
        const pc = peerConnections.current[from];
        if (pc)
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
      });

      socket.on("ice-candidate", async ({ from, candidate }) => {
        const pc = peerConnections.current[from];
        if (pc) await pc.addIceCandidate(new RTCIceCandidate(candidate));
      });

      socket.on("user-disconnected", (userId) => {
        setRemoteStreams((prev) => prev.filter((s) => s.id !== userId));
        if (peerConnections.current[userId]) {
          peerConnections.current[userId].close();
          delete peerConnections.current[userId];
        }
      });
    };

    init(); // Run async logic

    return () => socket.removeAllListeners();
  }, []);

  console.log(hostId);

  return (
    <div className="w-full min-h-screen p-2 bg-gray-800">

         <h1 className='absolute top-2 right-8 text-gray-300 text-lg border-b-1 border-gray-300'
             onClick={() => navigate('/participants')}>Participants List</h1>

      <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xs:gap-2 lg:gap-4 px-4 py-2 gap-3">
        <VideoPlayer stream={localStreamRef.current} name={name} />
        {remoteStreams.map(({ id, stream }) => (
          <VideoPlayer stream={stream} key={id} name={peerNames[id]} />
        ))}
      </div>
    </div>
  );
};

export default MeetingRoom;
