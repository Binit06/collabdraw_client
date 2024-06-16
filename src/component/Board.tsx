import React, { useRef, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

interface MyBoard {
    brushColor: string;
    brushSize: number;
    eraserMode: boolean;
}

function drawPoints(ctx: any, points: any) {
    // draw a basic circle instead
    if (points.length < 6) {
        const b = points[0];
        ctx.beginPath() 
        ctx.arc(b.x, b.y, ctx.lineWidth / 2, 0, Math.PI * 2, !0)
        ctx.closePath()
        ctx.fill();
        return
    }
    ctx.beginPath() 
    ctx.moveTo(points[0].x, points[0].y);
    let i;
    // draw a bunch of quadratics, using the average of two points as the control point
    for (i = 1; i < points.length - 2; i++) {
        const c = (points[i].x + points[i + 1].x) / 2
        const d = (points[i].y + points[i + 1].y) / 2;
        ctx.quadraticCurveTo(points[i].x, points[i].y, c, d)
    }
    ctx.quadraticCurveTo(points[i].x, points[i].y, points[i + 1].x, points[i + 1].y)
    ctx.stroke();
}

function getMouse(e: any, canvas: any) {
    let element = canvas
    let offsetX = 0
    let offsetY = 0
    let mx;
    let my;

    if (element.offsetParent !== undefined) {
        do {
            offsetX += element.offsetLeft;
            offsetY += element.offsetTop;
        } while (( element = element.offsetParent));
    }

    mx = e.pageX - offsetX;
    my = e.pageY - offsetY;

    return {x: mx, y: my}
}

const Board: React.FC<MyBoard> = ({ brushColor, brushSize, eraserMode }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [socket, setSocket] = useState<WebSocket | null>(null)
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

    const { username } = useParams<{ username: string }>();

    useEffect(() => {
        if (!socket && username) {
            const newSocket = new WebSocket(`ws://localhost:5000?username=${encodeURIComponent(username)}`);
            newSocket.onopen = () => {
                console.log('WebSocket Connected');
                setSocket(newSocket);
            };
            newSocket.onclose = () => {
                console.log('WebSocket Disconnected');
                setSocket(null);
            };
            newSocket.onerror = (error) => {
                console.error('WebSocket Error:', error);
                setSocket(null);
            };
        }
    
        return () => {
            if (socket) {
                socket.close();
                setSocket(null);
            };
        };
    }, [socket]);

    useEffect(() => {
        if(socket) {
            console.log(socket)
            socket.onmessage = (event: any) => {
                console.log(event.data)
                const message = JSON.parse(event.data)
                console.log(message)

                if (message.type === 'canvasImage') {
                    const image = new Image();
                    image.src = message.packet;

                    const canvas = canvasRef.current;
                    const ctx = canvas?.getContext('2d');;
                    if (ctx) {
                        image.onload = () => {
                            ctx.drawImage(image, 0, 0);
                        }
                    }
                } else if (message.type === 'onlineUsers') {
                    console.log(message.users)
                    setOnlineUsers(message.users)
                }
            }
        } else {
            console.log("No Socket Connection FOund")
        }

        return () => {
        };
    }, [socket]);

    useEffect(() => {

        let isDrawing = false;

        let memCanvas = document.createElement('canvas');
        memCanvas.width = 300;
        memCanvas.height = 300;

        let memctx = memCanvas.getContext('2d');
        let points: any = []

        function mouseDown(e: any) {
            let m = getMouse(e, canvas);
            points.push({
                x: m.x,
                y: m.y
            });
            isDrawing = true;
        }

        function mouseMove(e: any) {
            if (!isDrawing) return;
            const canvas = canvasRef.current;
            const ctx = canvas?.getContext("2d");
            if (ctx) {            
                ctx.clearRect(0, 0, 300, 300)
                ctx.drawImage(memCanvas, 0, 0);
                ctx.lineWidth = brushSize
                if (eraserMode) {
                    ctx.strokeStyle= 'white'
                } else {
                    ctx.strokeStyle = brushColor;
                }
            }

            const m = getMouse(e, canvas);
            points.push({
                x: m.x,
                y: m.y
            });
            drawPoints(ctx, points);
        }

        function mouseUp(e: any) {
            console.log(e);
            if (isDrawing) {
                isDrawing = false;
                const canvas = canvasRef.current;
                if(memctx && canvas) {
                    memctx.clearRect(0, 0, 300, 300);
                    memctx.drawImage(canvas, 0, 0);
                    const dataURL = canvas.toDataURL();
                    if (socket) {
                        socket.send(JSON.stringify({type: 'canvasImage', packet: dataURL}))
                        console.log('Drawing Ended');
                    }

                }
                points = []
            }
        }
        

        const canvas: HTMLCanvasElement | null = canvasRef.current;
        const ctx = canvasRef.current?.getContext('2d');

        if (ctx) {

            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
        }

        if (canvas) {
            canvas.addEventListener('mousedown', mouseDown, false);
            canvas.addEventListener('mousemove', mouseMove, false);
            canvas.addEventListener('mouseup', mouseUp, false);
            canvas.addEventListener('mouseout', mouseUp, false);
        }


        return () => {
            if (canvas) {
                canvas.removeEventListener('mousedown', mouseDown, false);
                canvas.removeEventListener('mousemove', mouseMove, false);
                canvas.removeEventListener('mouseup', mouseUp, false);
                canvas.removeEventListener('mouseout', mouseUp, false);
            }
        }
    }, [brushColor, brushSize, eraserMode, socket]);
    
    return (
        <>  
            {socket ? (
                <>
                <div style={{position: 'absolute', backgroundColor: 'lightgray', padding: '10px', borderBottom: '1px solid black', top: '10px', right: '10px' }}>
                    <h2>Online Users</h2>
                    <ul>
                        {onlineUsers.map((user) => (
                            <li key={user}>{user}</li>
                        ))}
                    </ul>
                </div>
                <canvas
                    ref={canvasRef}
                    width={5000}
                    height={5000}
                    style={{ backgroundColor: 'white', borderWidth: '10px', borderColor: 'black' }}
                />
                </>
            ) :  (
                null
            )}
        </>
    );
};

export default Board;
