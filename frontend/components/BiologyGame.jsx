'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, ZoomIn, ZoomOut, RotateCcw, Heart, Brain, Bone } from 'lucide-react';

const BiologyGame = ({ gestureData, onAction, language }) => {
  const [currentOrganism, setCurrentOrganism] = useState('human');
  const [currentSystem, setCurrentSystem] = useState('skeletal');
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [selectedPart, setSelectedPart] = useState('');
  const [score, setScore] = useState(0);

  const organisms = {
    human: {
      skeletal: ['skull', 'spine', 'ribs', 'arms', 'legs'],
      digestive: ['mouth', 'stomach', 'intestines', 'liver'],
      nervous: ['brain', 'nerves', 'spinal-cord']
    },
    frog: {
      skeletal: ['skull', 'backbone', 'limbs'],
      digestive: ['mouth', 'stomach', 'intestines'],
      nervous: ['brain', 'nerves']
    }
  };

  const partIcons = {
    skull: Bone,
    spine: Bone,
    ribs: Bone,
    arms: Bone,
    legs: Bone,
    brain: Brain,
    nerves: Brain,
    'spinal-cord': Brain,
    heart: Heart,
    stomach: Heart,
    intestines: Heart,
    liver: Heart,
    mouth: Eye
  };

  useEffect(() => {
    if (gestureData) {
      handleBiologyGesture(gestureData);
    }
  }, [gestureData]);

  const handleBiologyGesture = (gesture) => {
    // Handle rotation
    const rotateGesture = gesture.gestures.find(g => g.type === 'rotate');
    if (rotateGesture && gesture.palm_center.length > 0) {
      const palmX = gesture.palm_center[0][0];
      const palmY = gesture.palm_center[0][1];
      
      setRotation({
        x: (palmY - 0.5) * 180, // Convert to rotation degrees
        y: (palmX - 0.5) * 180
      });
    }

    // Handle zoom
    const zoomGesture = gesture.gestures.find(g => g.type === 'zoom');
    if (zoomGesture) {
      setZoom(prev => Math.max(0.5, Math.min(3, prev + (zoomGesture.scale - 0.5) * 0.1)));
    }

    // Handle part selection
    if (gesture.fingertip_positions.length > 0) {
      const indexTip = gesture.fingertip_positions[0].index;
      // Simple part selection based on finger position
      if (indexTip[1] < 0.3) setSelectedPart('head');
      else if (indexTip[1] < 0.6) setSelectedPart('torso');
      else setSelectedPart('limbs');
    }
  };

  const handlePartClick = (part) => {
    setSelectedPart(part);
    setScore(prev => prev + 5);
    onAction({ type: 'part_identified', part, system: currentSystem });
  };

  const getPartName = (part, lang) => {
    const names = {
      skull: { odia: 'ମୁଣ୍ଡର ହାଡ଼', hindi: 'खोपड़ी', english: 'Skull' },
      spine: { odia: 'ମେରୁଦଣ୍ଡ', hindi: 'रीढ़', english: 'Spine' },
      ribs: { odia: 'ପଜରା', hindi: 'पसली', english: 'Ribs' },
      brain: { odia: 'ମସ୍ତିଷ୍କ', hindi: 'मस्तिष्क', english: 'Brain' },
      heart: { odia: 'ହୃଦୟ', hindi: 'दिल', english: 'Heart' },
      stomach: { odia: 'ପାକସ୍ଥଳୀ', hindi: 'पेट', english: 'Stomach' }
    };
    return names[part]?.[lang] || part;
  };

  const getSystemName = (system, lang) => {
    const names = {
      skeletal: { odia: 'ଅସ୍ଥି ପଞ୍ଜର', hindi: 'कंकाल प्रणाली', english: 'Skeletal System' },
      digestive: { odia: 'ପାଚନ ପ୍ରଣାଳୀ', hindi: 'पाचन तंत्र', english: 'Digestive System' },
      nervous: { odia: 'ସ୍ନାୟୁ ପ୍ରଣାଳୀ', hindi: 'तंत्रिका तंत्र', english: 'Nervous System' }
    };
    return names[system]?.[lang] || system;
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-green-50 to-teal-50 rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Eye className="w-6 h-6" />
          {language === 'odia' ? 'ଜୀବବିଜ୍ଞାନ ଖେଳ' : language === 'hindi' ? 'जीवविज्ञान खेल' : 'Biology Game'}
        </h3>
        <div className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full font-semibold">
          Score: {score}
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-4 mb-4">
        <select 
          value={currentOrganism}
          onChange={(e) => setCurrentOrganism(e.target.value)}
          className="p-2 border rounded-lg"
        >
          <option value="human">
            {language === 'odia' ? 'ମନୁଷ୍ୟ' : language === 'hindi' ? 'मानव' : 'Human'}
          </option>
          <option value="frog">
            {language === 'odia' ? 'ବେଙ୍ଗ' : language === 'hindi' ? 'मेंढक' : 'Frog'}
          </option>
        </select>

        <select 
          value={currentSystem}
          onChange={(e) => setCurrentSystem(e.target.value)}
          className="p-2 border rounded-lg"
        >
          {Object.keys(organisms[currentOrganism]).map(system => (
            <option key={system} value={system}>
              {getSystemName(system, language)}
            </option>
          ))}
        </select>

        <button
          onClick={() => setZoom(1)}
          className="p-2 bg-gray-200 rounded-lg"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* 3D Model Area */}
      <div className="relative bg-white rounded-lg shadow-inner border-2 border-gray-200 h-64 mb-4 overflow-hidden">
        <motion.div
          className="w-full h-full flex items-center justify-center"
          animate={{
            rotateX: rotation.x,
            rotateY: rotation.y,
            scale: zoom
          }}
          transition={{ type: "spring", stiffness: 100 }}
        >
          {/* Simple organism representation */}
          <div className="text-center">
            <div className="text-6xl mb-2">
              {currentOrganism === 'human' ? '👤' : '🐸'}
            </div>
            <div className="text-lg font-semibold">
              {getSystemName(currentSystem, language)}
            </div>
            <div className="text-sm text-gray-600">
              {selectedPart && getPartName(selectedPart, language)}
            </div>
          </div>
        </motion.div>

        {/* Zoom indicators */}
        <div className="absolute bottom-2 right-2 flex gap-2">
          <ZoomIn className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">{Math.round(zoom * 100)}%</span>
          <ZoomOut className="w-4 h-4 text-gray-500" />
        </div>
      </div>

      {/* Body Parts */}
      <div className="grid grid-cols-3 gap-2">
        {organisms[currentOrganism][currentSystem].map(part => {
          const IconComponent = partIcons[part] || Eye;
          return (
            <motion.button
              key={part}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handlePartClick(part)}
              className={`p-3 rounded-lg text-center ${
                selectedPart === part 
                  ? 'bg-blue-100 border-2 border-blue-500' 
                  : 'bg-gray-100 border-2 border-transparent'
              }`}
            >
              <IconComponent className="w-6 h-6 mx-auto mb-1 text-gray-700" />
              <span className="text-xs font-medium">
                {getPartName(part, language)}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Instructions */}
      <div className="text-center text-sm text-gray-600 mt-4">
        {language === 'odia' ? 
         'ଘୁରାଇବା ପାଇଁ ହାତ ଘୁଞ୍ଚାନ୍ତୁ, ଜୁମ୍ କରିବା ପାଇଁ ଆଙ୍ଗୁଳି ବ୍ୟବହାର କରନ୍ତୁ' :
         language === 'hindi' ?
         'घुमाने के लिए हाथ घुमाएँ, ज़ूम करने के लिए उंगलियों का उपयोग करें' :
         'Move hand to rotate, use fingers to zoom'}
      </div>
    </div>
  );
};

export default BiologyGame;