import React, { useRef, useEffect, useState } from 'react';

const VideoPlayer = ({ stream, name }) => {
  const [videoOn, setVideoOn] = useState(true);
  const [audioOn, setAudioOn] = useState(true);

  const videoRef = useRef();

  const toggleVideo = () => {
    if (stream) {
      stream.getVideoTracks().forEach(track => {
        track.enabled = !videoOn;
      });
      setVideoOn(!videoOn);
    }
  };

  const toggleAudio = () => {
    if (stream) {
      stream.getAudioTracks().forEach(track => {
        track.enabled = !audioOn;
      });
      setAudioOn(!audioOn);
    }
  };

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="w-full rounded border-1 border-white relative">
      <video ref={videoRef} autoPlay muted className="w-full h-[275px] object-cover rounded" />

      <p className='absolute left-0 right-0 top-2 text-sm text-white text-center font-semibold'>{name}</p>

      <div className='flex justify-center items-center gap-4 absolute left-0 right-0 bottom-2'>
        <button onClick={toggleVideo} className='px-2 py-1 rounded-full text-white text-sm bg-black opacity-50'>
          {videoOn ? "Off" : "On"}
        </button>
        <button onClick={toggleAudio} className='px-2 py-1 text-sm rounded-full text-white bg-black opacity-50'>
          {audioOn ? "Mute" : "Unmute"}
        </button>
        <button className='px-2 py-1 rounded-full text-white text-sm bg-black opacity-50'>Leave</button>
      </div>
    </div>
  );
};

export default VideoPlayer;
