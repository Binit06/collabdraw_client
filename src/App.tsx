import { useEffect } from 'react';
import './App.css';
import Board from './component/Board';

const CanvasDrawing = () => {

  // const [brushColor, setBrushColor] = useState('black');
  // const [brushSize, setBrushSize] = useState<number>(5);

  useEffect(() => {
    console.log("CanvasDrawing ", 5);
  }, []);

  return (
    <div className="App" >
        <Board brushColor={'black'} brushSize={5} />
    </div>
  );
};

export default CanvasDrawing;
