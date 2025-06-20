import React, { useContext } from "react";
import AppContext from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import { socket } from "../utils/socket";
import Googlmeet from '../assets/GoogleMeet.jpg';

const HomePage = () => {

  const navigate = useNavigate();
  const { roomId, name, setName, setRoomId, setIsHost } = useContext(AppContext);

  const createRoom = () => {
    setIsHost(true);
    socket.emit("create-room", { roomId, name });
    navigate(`/meeting/${roomId}`);
  };

  const joinRoom = () => {
    socket.emit("join-room", { roomId, name });
    navigate(`/meeting/${roomId}`);
  };

  return (
    <div
      className="w-full min-h-screen flex justify-center items-center bg-cover bg-center brightness-60"
      style={{ backgroundImage: `url(${Googlmeet})` }}
    >
      {/* 👇 Your content here */}
      <div className="bg-white bg-opacity-80 p-8 rounded-lg shadow-xl flex flex-col gap-4 w-[400px] ">
        <input
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="p-3 border rounded"
        />
        <input
          type="text"
          placeholder="Enter Room ID"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          className="p-3 border rounded"
        />
        <button onClick={createRoom} className="bg-blue-600 text-white p-3 rounded hover:bg-blue-700">
          Create Room
        </button>
        <button onClick={joinRoom} className="bg-green-600 text-white p-3 rounded hover:bg-green-700">
          Join Room
        </button>
      </div>
    </div>
  );
};

export default HomePage;
