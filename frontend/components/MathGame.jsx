'use client';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Square, Triangle, Circle, Calculator } from 'lucide-react';

const MathGame = ({ gestureData, onAction, language }) => {
  const [currentShape, setCurrentShape] = useState('');
  const [userShape, setUserShape] = useState([]);
  const [score, setScore] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef(null);

  const shapes = [
    { name: 'triangle', icon: Triangle, problem: 'area', dimensions: { base: 8, height: 6 } },
    { name: 'square', icon: Square, problem: 'perimeter', dimensions: { side: 5 } },
    { name: 'circle', icon: Circle, problem: 'area', dimensions: { radius: 4 } }
  ];

  useEffect(() => {
    startNewProblem();
  }, []);

  useEffect(() => {
    if (gestureData) {
      handleMathGesture(gestureData);
    }
  }, [gestureData]);

  const startNewProblem = () => {
    const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
    setCurrentShape(randomShape);
    setUserShape([]);
    clearCanvas();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleMathGesture = (gesture) => {
    const drawGesture = gesture.gestures.find(g => g.type === 'draw');
    
    if (drawGesture && gesture.fingertip_positions.length > 0) {
      const indexFinger = gesture.fingertip_positions[0].index;
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      
      const x = (indexFinger[0] * rect.width) - rect.left;
      const y = (indexFinger[1] * rect.height) - rect.top;
      
      if (!isDrawing && indexFinger[1] < 0.8) { // Start drawing
        setIsDrawing(true);
        setUserShape([{ x, y }]);
      } else if (isDrawing) {
        setUserShape(prev => [...prev, { x, y }]);
        drawOnCanvas(x, y);
      }
    } else {
      if (isDrawing) {
        setIsDrawing(false);
        evaluateShape();
      }
    }
  };

  const drawOnCanvas = (x, y) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (userShape.length === 0) {
      ctx.beginPath();
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 3;
      ctx.stroke();
    }
  };

  const evaluateShape = () => {
    // Simple shape recognition based on point count and distribution
    const pointCount = userShape.length;
    let recognizedShape = '';
    
    if (pointCount < 10) recognizedShape = 'unknown';
    else if (pointCount < 30) recognizedShape = 'triangle';
    else if (pointCount < 50) recognizedShape = 'square';
    else recognizedShape = 'circle';
    
    if (recognizedShape === currentShape.name) {
      setScore(prev => prev + 20);
      onAction({ type: 'shape_correct', shape: recognizedShape });
      setTimeout(startNewProblem, 2000);
    }
  };

  const calculateAnswer = () => {
    if (!currentShape) return 0;
    
    switch (currentShape.problem) {
      case 'area':
        if (currentShape.name === 'triangle') {
          return 0.5 * currentShape.dimensions.base * currentShape.dimensions.height;
        } else if (currentShape.name === 'square') {
          return currentShape.dimensions.side ** 2;
        } else {
          return Math.PI * currentShape.dimensions.radius ** 2;
        }
      case 'perimeter':
        if (currentShape.name === 'square') {
          return 4 * currentShape.dimensions.side;
        }
        return 0;
      default:
        return 0;
    }
  };

  const getShapeName = (shape, lang) => {
    const names = {
      triangle: { odia: 'ତ୍ରିଭୁଜ', hindi: 'त्रिभुज', english: 'Triangle' },
      square: { odia: 'ବର୍ଗ', hindi: 'वर्ग', english: 'Square' },
      circle: { odia: 'ବୃତ୍ତ', hindi: 'वृत्त', english: 'Circle' }
    };
    return names[shape]?.[lang] || shape;
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-green-50 to-yellow-50 rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Calculator className="w-6 h-6" />
          {language === 'odia' ? 'ଗଣିତ ଖେଳ' : language === 'hindi' ? 'गणित खेल' : 'Math Game'}
        </h3>
        <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold">
          Score: {score}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 h-96">
        <div className="bg-white rounded-lg shadow-inner border-2 border-gray-200 p-4">
          <h4 className="font-semibold mb-2">
            {language === 'odia' ? 'ପ୍ରଶ୍ନ:' : language === 'hindi' ? 'प्रश्न:' : 'Problem:'}
          </h4>
          {currentShape && (
            <div className="text-center">
              <currentShape.icon className="w-16 h-16 mx-auto mb-2 text-blue-600" />
              <p className="text-lg font-semibold">
                {language === 'odia' ? 
                 `${getShapeName(currentShape.name, language)}ର ${currentShape.problem === 'area' ? 'କ୍ଷେତ୍ରଫଳ' : 'ପରିଧି'} କଣ?` :
                 language === 'hindi' ?
                 `${getShapeName(currentShape.name, language)} का ${currentShape.problem === 'area' ? 'क्षेत्रफल' : 'परिधि'} क्या है?` :
                 `Calculate the ${currentShape.problem} of this ${currentShape.name}`}
              </p>
              <p className="text-gray-600 mt-2">
                Answer: {calculateAnswer().toFixed(2)}
              </p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-inner border-2 border-gray-200 relative">
          <canvas
            ref={canvasRef}
            width={400}
            height={350}
            className="w-full h-full"
          />
          <div className="absolute bottom-2 left-2 text-sm text-gray-500">
            {language === 'odia' ? 'ଆକୃତି ଅଙ୍କନ କରନ୍ତୁ' : 
             language === 'hindi' ? 'आकृति बनाएँ' : 
             'Draw the shape in air'}
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        {shapes.map((shape) => (
          <div key={shape.name} className="bg-gray-100 p-3 rounded-lg">
            <shape.icon className="w-8 h-8 mx-auto mb-1 text-gray-600" />
            <span className="text-sm font-medium">
              {getShapeName(shape.name, language)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MathGame;