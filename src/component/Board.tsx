import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { MyBoard } from './types';
import Canvas from './BoardComponent/Canvas';
import Users from './BoardComponent/Users';

const Board: React.FC<MyBoard> = ({ brushColor, brushSize, eraserMode }) => {

    //Getting the username to connect Online with the sockets
    const { username } = useParams<{ username: string }>();

    if (!username) {
        // If username is not provided, return null or any other component/content
        return null;
    }
        console.log("Entered to connect to socket")
        //Defing sockets to connect and repeat until it is connected only if username is available
        const { sendJsonMessage, readyState } = useWebSocket(import.meta.env.VITE_SERVERURL, {
            onOpen: () => {
                console.log('Web Socket Connection Established');
            },
            share: true,
            filter: () => false,
            retryOnError: true,
            shouldReconnect: () => true
        });

        //Writing a use Effect to update the username with the username event in the websocket
        useEffect(() => {
            console.log(username)
            if (username && readyState === ReadyState.OPEN) {
                sendJsonMessage({
                    username,
                    type: 'userevent'
                })
            }
        }, [sendJsonMessage, readyState])
    
    return (
        <>  
            {username ? (
                <>
                <div style={{position: 'absolute', padding: '10px', top: '10px', right: '10px', display: 'flex', gap: '10px' }}>
                    <Users />
                </div>
                </>
            ) :  (
                null
            )}
            <Canvas brushColor={brushColor} brushSize={brushSize} eraserMode={eraserMode} />
        </>
    );
};

export default Board;