import React, { useRef, useEffect, useState } from 'react';
import io, { Socket } from "socket.io-client"
import Cursor from "../assets/cursor.svg"
interface MyBoard {
    brushColor: string;
    brushSize: number;
}

interface CollaboratorPosition {
    x: number;
    y: number;
    id: string;
}

const Board: React.FC<MyBoard> = ({ brushColor, brushSize }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [windowSize, setWindowSize] = useState([window.innerWidth, window.innerHeight]);
    const [socket, setSocket] = useState<Socket | null>(null)
    const [collabPositions, setCollabPositions] = useState<CollaboratorPosition[] | null>(null)

    const handleMouseMove = (e: MouseEvent) => {
        if (socket) {
            socket.emit('mousePosition', {x: e.pageX / window.innerWidth, y: e.pageY / window.innerHeight, id: socket.id})
        }
    };

    useEffect(() => {
        let newSocket: Socket | null = null;
    
        if (!socket) {
            newSocket = io("https://collabdraw1-vwqces7l.b4a.run/");
            console.log(newSocket, "Connected To Socket");
            setSocket(newSocket);
        }
    
        return () => {
            if (newSocket) {
                newSocket.disconnect(); // Disconnect the socket if it was created
            }
            setSocket(null); // Reset socket state
        };
    }, []);

    useEffect(() => {
        if(socket) {
            socket.on('canvasImage', (data: string) => {
                const image = new Image();
                image.src = data;

                const canvas = canvasRef.current;
                const ctx = canvas?.getContext('2d');
                if (ctx) {
                    image.onload = () => {
                        ctx.drawImage(image, 0, 0);
                    }
                }
            });
            socket.on('mousePositions', (positions: CollaboratorPosition[]) => {
                setCollabPositions(positions);
                console.log(positions)
            })
        }

        return () => {
            if (socket) {
                socket.off('canvasImage');
                socket.off('mousePosition');
            }
        };
    }, [socket]);

    useEffect(() => {

        let isDrawing = false;
        let lastX = 0;
        let lastY = 0;
        const startDrawing = (e: { offsetX: number; offsetY: number; }) => {
            isDrawing = true;
            console.log(`drawing started`, brushColor, brushSize);
            [lastX, lastY] = [e.offsetX, e.offsetY];
        };

        const draw = (e: {offsetX: number; offsetY: number; }) => {
            if(!isDrawing) return;

            const canvas = canvasRef.current;
            if (canvas) {
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.beginPath();
                    ctx.moveTo(lastX, lastY);
                    ctx.lineTo(e.offsetX, e.offsetY);
                    ctx.stroke();
                }

                [lastX, lastY] = [e.offsetX, e.offsetY];
            }
        };

        const endDrawing = () => {
            const canvas = canvasRef.current;
            if (canvas) {
                const dataURL = canvas.toDataURL();
                if (socket) {
                    socket.emit('canvasImage', dataURL)
                    console.log('Drawing Ended');
                }
            }
            isDrawing = false;
        };

        const canvas: HTMLCanvasElement | null = canvasRef.current;
        const ctx = canvasRef.current?.getContext('2d');

        if (ctx) {
            ctx.strokeStyle = brushColor;
            ctx.lineWidth = brushSize;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
        }

        if (canvas) {
            canvas.addEventListener('mousedown', startDrawing);
            canvas.addEventListener('mousemove', draw);
            canvas.addEventListener('mouseup', endDrawing);
            canvas.addEventListener('mouseout', endDrawing);
        }

        return () => {
            if (canvas) {
                canvas.removeEventListener('mousedown', startDrawing);
                canvas.removeEventListener('mousemove', draw);
                canvas.removeEventListener('mouseup', endDrawing);
                canvas.removeEventListener('mouseout', endDrawing);
            }
        }
    }, [brushColor, brushSize, socket]);


    useEffect(() => {
        const handleWindowResize = () => {
            setWindowSize([window.innerWidth, window.innerHeight]);
        };

        window.addEventListener('resize', handleWindowResize);

        return () => {
            window.removeEventListener('resize', handleWindowResize);
        };
    }, []);

    useEffect(() => {
        document.addEventListener('mousemove', handleMouseMove);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
        };
    }, [socket]);
    
    return (
        <>
            <canvas
                ref={canvasRef}
                width={windowSize[0] * 2}
                height={windowSize[1]}
                style={{ backgroundColor: 'white', borderWidth: '10px', borderColor: 'black' }}
            />
            {collabPositions?.map((value) => (
                <>
                <div
                    style={{
                        position: 'absolute',
                        left: (value.x * 100) + '%',
                        top: (value.y * 100) + 7 + '%',
                        opacity: value.id === socket?.id ? 0 : 1,
                        zIndex: value.id === socket?.id ? -10 : 9999,
                    }}
                    key={value.id}
                >
                    {value.id}
                </div>
                <img
                    src={Cursor}
                    alt='Custom Pointer'
                    style={{
                        position: 'absolute',
                        left: (value.x * 100) + '%',
                        top: (value.y * 100) + '%',
                        width: '32px',
                        height: '32px',
                        borderRadius: '0%',
                        zIndex: value.id === socket?.id ? -10 : 9999,
                        opacity: value.id === socket?.id ? 0 : 1,
                    }}
                    key={value.id}
                />
                </>
            ))}
        </>
    );
};

export default Board;
