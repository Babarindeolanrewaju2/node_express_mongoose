import React, { useState, useEffect } from 'react';
import './App.css';

const App = () => {
  const [songs, setSongs] = useState([]);
  const [selectedSong, setSelectedSong] = useState({});
  const [audio, setAudio] = useState(new Audio());
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    // Fetch data from a JSON file or API endpoint
    fetch('https://example.com/songs.json')
      .then((response) => response.json())
      .then((data) => {
        setSongs(data);
      });
  }, []);

  useEffect(() => {
    if (audio.src !== selectedSong.url) {
      audio.src = selectedSong.url;
      setIsPlaying(false);
      setCurrentTime(0);
    }
  }, [selectedSong, audio]);

  useEffect(() => {
    audio.currentTime = currentTime;
  }, [currentTime, audio]);

  const handleClick = (song) => {
    setSelectedSong(song);
  };

  const play = () => {
    audio.play();
    setIsPlaying(true);
  };

  const pause = () => {
    audio.pause();
    setIsPlaying(false);
    setCurrentTime(audio.currentTime);
  };

  const stop = () => {
    audio.pause();
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleTimeUpdate = () => {
    setCurrentTime(audio.currentTime);
  };

  return (
    <div className="App">
      <h1>Music Streaming App</h1>
      <div className="song-list">
        {songs.map((song) => (
          <div key={song.id} className="song" onClick={() => handleClick(song)}>
            <img src={song.albumCover} alt={song.title} />
            <h2>{song.title}</h2>
            <p>{song.artist}</p>
          </div>
        ))}
      </div>
      <div className="song-details">
        {selectedSong.title ? (
          <>
            <h2>{selectedSong.title}</h2>
            <p>{selectedSong.artist}</p>
            <p>{selectedSong.lyrics}</p>
            <audio
              src={selectedSong.url}
              ref={setAudio}
              controls
              onTimeUpdate={handleTimeUpdate}
            />
            {isPlaying ? (
              <button onClick={pause}>Pause</button>
            ) : (
              <button onClick={play}>Play</button>
            )}
            <button onClick={stop}>Stop</button>
          </>
        ) : (
          <p>Select a song to view details</p>
        )}
      </div>
    </div>
  );
};
