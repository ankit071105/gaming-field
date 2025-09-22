'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, Zap, Move } from 'lucide-react';

const PhysicsGame = ({ gestureData, onAction, language }) => {
  const [objects, setObjects] = useState([]);
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Initialize game objects
    setObjects([
      { id: 1, type: 'ball', x: 100, y: 100, mass: 1, color: '#ef4444', target: false },
      { id: 2, type: 'block', x: 400, y: 200, mass: 2, color: '#3b82f6', target: false },
      { id: 3, type: 'target', x: 600, y: 300, mass: 0, color: '#10b981', target: true }
    ]);
  }, []);

  useEffect(() => {
    if (gestureData && gestureData.hands_detected > 0) {
      handleGesture(gestureData);
    }
  }, [gestureData]);

  const handleGesture = (gesture) => {
    const dragGesture = gesture.gestures.find(g => g.type === 'drag');
    
    if (dragGesture && gesture.palm_center.length > 0) {
      const palmX = gesture.palm_center[0][0] * 800; // Scale to game area
      const palmY = gesture.palm_center[0][1] * 600;
      
      // Find closest object to palm
      const closestObject = objects.reduce((closest, obj) => {
        const distance = Math.sqrt((obj.x - palmX)**2 + (obj.y - palmY)**2);
        return distance < 50 ? obj : closest;
      }, null);
      
      if (closestObject && !closestObject.target) {
        // Move object with hand
        const updatedObjects = objects.map(obj => 
          obj.id === closestObject.id 
            ? { ...obj, x: palmX, y: palmY }
            : obj
        );
        
        setObjects(updatedObjects);
        
        // Check if object reached target
        const target = objects.find(obj => obj.target);
        if (target && Math.sqrt((palmX - target.x)**2 + (palmY - target.y)**2) < 30) {
          setScore(prev => prev + 10);
          setMessage(getMessage('success', language));
          onAction({ type: 'target_hit', object: closestObject.type });
        }
      }
    }
  };

  const getMessage = (type, lang) => {
    const messages = {
      success: {
        odia: "ବହୁତ ଭଲ! ଆପଣ ନିଉଟନ୍ର ନିୟମ ବୁଝିଛନ୍ତି!",
        hindi: "बहुत अच्छा! आपने न्यूटन के नियम समझे!",
        english: "Excellent! You understood Newton's laws!"
      }
    };
    return messages[type]?.[lang] || messages.success.english;
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Zap className="w-6 h-6" />
          {language === 'odia' ? 'ଭୌତିକ ଖେଳ' : language === 'hindi' ? 'भौतिकी खेल' : 'Physics Game'}
        </h3>
        <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-semibold">
          Score: {score}
        </div>
      </div>
      
      <div className="relative w-full h-96 bg-white rounded-lg shadow-inner border-2 border-gray-200">
        {/* Game area */}
        {objects.map((obj) => (
          <motion.div
            key={obj.id}
            className={`absolute w-16 h-16 rounded-full border-4 border-white shadow-lg flex items-center justify-center ${
              obj.target ? 'pulse-animation' : ''
            }`}
            style={{
              left: obj.x,
              top: obj.y,
              backgroundColor: obj.color,
              width: obj.type === 'block' ? '80px' : '64px',
              height: obj.type === 'block' ? '80px' : '64px',
              borderRadius: obj.type === 'block' ? '8px' : '50%'
            }}
            animate={{ 
              scale: obj.target ? [1, 1.1, 1] : 1 
            }}
            transition={{ 
              duration: 2, 
              repeat: obj.target ? Infinity : 0 
            }}
          >
            {obj.target ? <Target className="w-8 h-8 text-white" /> : <Move className="w-6 h-6 text-white" />}
          </motion.div>
        ))}
        
        {/* Force arrows */}
        <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white p-2 rounded text-sm">
          {language === 'odia' ? 'ବସ୍ତୁକୁ ଟାର୍ଗେଟ୍ ଆଡ଼କୁ ଟାଣନ୍ତୁ' : 
           language === 'hindi' ? 'वस्तु को लक्ष्य की ओर खींचें' : 
           'Drag objects toward the target'}
        </div>
      </div>
      
      {message && (
        <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-lg text-center">
          {message}
        </div>
      )}
      
      <div className="mt-4 grid grid-cols-3 gap-2 text-sm text-gray-600">
        <div className="text-center">
          <div className="w-4 h-4 bg-red-500 rounded-full mx-auto mb-1"></div>
          {language === 'odia' ? 'ବଲ୍' : language === 'hindi' ? 'गेंद' : 'Ball'}
        </div>
        <div className="text-center">
          <div className="w-4 h-4 bg-blue-500 rounded-lg mx-auto mb-1"></div>
          {language === 'odia' ? 'ବ୍ଲକ୍' : language === 'hindi' ? 'ब्लॉक' : 'Block'}
        </div>
        <div className="text-center">
          <div className="w-4 h-4 bg-green-500 rounded-full mx-auto mb-1"></div>
          {language === 'odia' ? 'ଲକ୍ଷ୍ୟ' : language === 'hindi' ? 'लक्ष्य' : 'Target'}
        </div>
      </div>
    </div>
  );
};

export default PhysicsGame;