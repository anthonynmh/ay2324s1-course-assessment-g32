import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import Chat from '../../components/Collaboration/Chat/Chat';
import CodeEditor from '../../components/Collaboration/CodeEditor/CodeEditor';
import QuestionContent from '../../components/Question/QuestionContent/QuestionContent';
import './Collaboration.css';
import env from '../../loadEnvironment';

const Collaboration = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const roomId = location.state?.roomId;
  const hostId = location.state?.hostId;
  const matchedHostId = location.state?.matchedHostId;
  const question = location.state?.question;

  // Check if the user is authenticated before connecting to the socket server
  const socket = io(env.COLLAB_URL);

  useEffect(() => {
    // Join the Socket.io roozgm when the component mounts
    socket.emit('joinRoom', { room: roomId, host: hostId });
  }, []);

  const handleLeaveRoom = () => {
    socket.emit('leaveRoom', { room: roomId, host: hostId });
    navigate('/landing');
  };

  return (
    <div className='collaboration-container'>
      <div className='collaboration-header'>
        <div className='d-flex justify-content-between'>
          <button type='button' className='btn btn-primary me-2'>Change Question</button>
          <button type='button' className='btn btn-danger' onClick={handleLeaveRoom}>Leave Room</button>
        </div>
      </div>
      <div className='content'>
        <div className='left'>
          <QuestionContent question={question} />
        </div>
        <div className='right'>
          <CodeEditor socket={socket} roomId={roomId} />
          <Chat socket={socket} roomId={roomId} host={hostId} />
        </div>
      </div>
    </div>
  );
};

export default Collaboration;
