import React, { useRef, useEffect, useState } from 'react';
import io, { Socket } from "socket.io-client"
import Cursor from "../assets/cursor.svg"

interface MyBoard {
    brushColor: string;
    brushSize: number;
    eraserMode: boolean;
}

interface CollaboratorPosition {
    x: number;
    y: number;
    id: string;
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
    const [windowSize, setWindowSize] = useState([window.innerWidth, window.innerHeight]);
    const [socket, setSocket] = useState<Socket | null>(null)
    const [collabPositions, setCollabPositions] = useState<CollaboratorPosition[] | null>(null)

    console.log(windowSize)

    // const handleMouseMove = (e: MouseEvent) => {
    //     if (socket) {
    //         const canvas = canvasRef.current;
    //         const rect = canvas?.getBoundingClientRect();
    //         if (rect) {
    //             socket.emit('mousePosition', {x: (e.pageX), y: (e.pageY), id: socket.id})
    //         }
    //     }
    // };
    console.log("Sever URL", import.meta.env.VITE_SERVERURL)
    useEffect(() => {
        let newSocket: Socket | null = null;
    
        if (!socket) {
            newSocket = io("" + import.meta.env.VITE_SERVERURL);
            console.log(newSocket, "Connected To Socket");
            setSocket(newSocket);
        }
    
        return () => {
            if (socket) {
                socket.disconnect(); // Disconnect the socket if it was created
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
        // let lastX = 0;
        // let lastY = 0;

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
        //const startDrawing = (e: { offsetX: number; offsetY: number; }) => {
        //    isDrawing = true;
        //    console.log(`drawing started`, brushColor, brushSize);
        //    [lastX, lastY] = [e.offsetX, e.offsetY];
        //};

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
                    //ctx.globalCompositeOperation = "source-over";
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
                        socket.emit('canvasImage', dataURL)
                        console.log('Drawing Ended');
                    }

                }
                points = []
            }
        }

        // const draw = (e: {offsetX: number; offsetY: number; }) => {
        //     if(!isDrawing) return;

        //     const canvas = canvasRef.current;
        //     if (canvas) {
        //         const ctx = canvas.getContext('2d');
        //         if (ctx) {
        //             ctx.beginPath();
        //             ctx.moveTo(lastX, lastY);
        //             const points = [
        //                 {x: e.offsetX, y: e.offsetY},
        //                 {x: lastX, y: lastY}
        //             ]
        //             //const centerX = (lastX + e.offsetX) / 2;
        //             //const centerY = (lastY + e.offsetY) / 2;
        //             //ctx.quadraticCurveTo(lastX, lastY, centerX, centerY);
        //             //ctx.stroke()
        //             drawPoints(ctx, points)
        //         }

        //         [lastX, lastY] = [e.offsetX, e.offsetY];
        //     }
        // };
        

        // const endDrawing = () => {
        //     const canvas = canvasRef.current;
        //     if (canvas) {
        //         const dataURL = canvas.toDataURL();
        //         if (socket) {
        //             socket.emit('canvasImage', dataURL)
        //             console.log('Drawing Ended');
        //         }
        //     }
        //     isDrawing = false;
        // };

        const canvas: HTMLCanvasElement | null = canvasRef.current;
        const ctx = canvasRef.current?.getContext('2d');

        if (ctx) {
            //ctx.strokeStyle = brushColor;
            //ctx.lineWidth = brushSize;
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


    useEffect(() => {
        const handleWindowResize = () => {
            setWindowSize([window.innerWidth, window.innerHeight]);
        };

        window.addEventListener('resize', handleWindowResize);

        return () => {
            window.removeEventListener('resize', handleWindowResize);
        };
    }, []);

    //useEffect(() => {
    //    document.addEventListener('mousemove', handleMouseMove);
    //    document.addEventListener('scroll', handleMouseMove);

    //    return () => {
    //        document.removeEventListener('mousemove', handleMouseMove);
    //        document.removeEventListener('scroll', handleMouseMove);
    //    };
    //}, [socket]);
    
    return (
        <>
            <canvas
                ref={canvasRef}
                width={5000}
                height={5000}
                style={{ backgroundColor: 'white', borderWidth: '10px', borderColor: 'black' }}
            />
            {collabPositions?.map((value) => (
                <>
                <div
                    style={{
                        position: 'absolute',
                        left: (value.x) + 'px',
                        top: (value.y) + 7 + 'px',
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
                        left: (value.x) + 'px',
                        top: (value.y) + 'px',
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
