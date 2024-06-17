import { useEffect, useState } from 'react';
import { Analytics } from "@vercel/analytics/react"
import {
    BrowserRouter as Router,
    Route, Routes
} from 'react-router-dom'
import './App.css';
import Board from './component/Board';
import LoginRoom from './component/LoginRoom';
import CanvasOffline from './component/BoardComponent/CanvasOffline';

const CanvasDrawing = () => {
  useEffect(() => {
    console.log("CanvasDrawing ", 5);
  }, []);

  const [brushSize, setBrushSize] = useState(5);
  const [brushColor, setBrushColor] = useState('black');
  const [eraserMode, setEraserMode] = useState(false);
  const [showBrushSize, setShowBrushSize] = useState(false);

  const handleColorChange = (event: any) => {
    setBrushColor(event.target.value);
    setEraserMode(false);
  }

  const handleSizeChange = (event: any) => {
    setBrushSize(event.target.value);
  }

  const handleEraserChange = () => {
    setEraserMode(!eraserMode);
  }

  const handleSliderMouseEnter = () => {
    setShowBrushSize(true);
  }

  const handleSliderMouseLeave = () => {
    setShowBrushSize(false);
  }

  return (
    <Router>
      <div className="App">
        <Routes>
            <Route path="/board/:username" element={<Board brushColor={brushColor} brushSize={brushSize} eraserMode={eraserMode} />} />
            <Route path="/board/offline" element={<CanvasOffline brushColor={brushColor} brushSize={brushSize} eraserMode={eraserMode} />} />
            <Route path="/" element={<LoginRoom />} />
        </Routes>
      </div>
      <Analytics />
      <div className="tools">
        <button className="colorSelector" style={{ backgroundColor: brushColor }} onClick={() => {setEraserMode(false)}}>
          <input type="color" id="selector" className="color" value={brushColor} onChange={handleColorChange} />
        </button>
        <div className="brushSizeSelector">
          <input
            type="range"
            min="0"
            max="100"
            value={brushSize}
            className="slider"
            onChange={handleSizeChange}
            onMouseEnter={handleSliderMouseEnter}
            onMouseLeave={handleSliderMouseLeave}
          />
          {showBrushSize && (
            <div className="sliderValue">
              {brushSize}
            </div>
          )}
        </div>
        <div>
          <input type='button' value="Eraser" className='eraser' style={{ backgroundColor: eraserMode ? 'blue' : '#f44336' }} onClick={handleEraserChange} />
        </div>
      </div>
    </Router>
  );
};

export default CanvasDrawing;
