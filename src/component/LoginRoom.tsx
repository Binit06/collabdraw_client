import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginRoom = () => {
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  const handleUsernameChange = (event: any) => {
    setUsername(event.target.value);
  };

  const handleJoinClick = () => {
    if (username.trim() !== '' && username.split(' ').length === 1) {
      navigate(`/board/${encodeURIComponent(username)}`); // Navigate to /board/:username
    } else if (username.split(' ').length > 1) {
      alert('The username must be of one word');
    } else {
      alert('Please Enter a username')
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
