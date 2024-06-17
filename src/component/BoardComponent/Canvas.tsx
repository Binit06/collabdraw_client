import { MyBoard } from "../types";
import { useParams } from 'react-router-dom';
import { useRef, useEffect } from "react";
import useWebSocket from "react-use-websocket"
import { isCanvasEvent } from "../checks/checks";
import drawPoints from "../libs/drawPoint";
import getMouse from '../libs/getMouse';
import { WebSocketMessage } from "../types";

const Canvas: React.FC<MyBoard> = ({ brushColor, brushSize, eraserMode }) => {
    const { username } = useParams<{ username: string }>();
    const decodedUsername = username && decodeURIComponent(username)
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const { lastJsonMessage, sendJsonMessage } = useWebSocket(import.meta.env.VITE_SERVERURL, {
        share: true,
        filter: isCanvasEvent
    });

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
                    if (decodedUsername) {
                        sendJsonMessage({
                            type: 'canvasChange',
                            content: dataURL
                        })
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
    }, [brushColor, brushSize, eraserMode, sendJsonMessage]);

    useEffect(() => {
        const image = new Image();
        image.src = (lastJsonMessage as WebSocketMessage)?.data.canvasContent || null;

        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (ctx && image) {
            image.onload = () => {
                ctx.drawImage(image, 0, 0);
            }
        }
    }, [lastJsonMessage])

    return (
        <canvas
            ref={canvasRef}
            width={5000}
            height={5000}
            style={{ backgroundColor: 'white', borderWidth: '10px', borderColor: 'black' }}
        />
    )
}

export default Canvas