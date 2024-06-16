import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginRoom = () => {
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  const handleUsernameChange = (event) => {
    setUsername(event.target.value);
  };

  const handleJoinClick = () => {
    if (username.trim() !== '') {
      navigate(`/board/${username}`); // Navigate to /board/:username
    } else {
      alert('Please enter a username');
    }
  };

  return (
    <div className="login-container">
      <h2>Enter your username</h2>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={handleUsernameChange}
      />
      <button onClick={handleJoinClick}>Join</button>
    </div>
  );
};

export default LoginRoom;
