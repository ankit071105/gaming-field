'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flask, Beaker, Zap, AlertTriangle } from 'lucide-react';

const ChemistryGame = ({ gestureData, onAction, language }) => {
  const [beakers, setBeakers] = useState([
    { id: 1, chemical: null, volume: 0, color: '#ffffff' },
    { id: 2, chemical: null, volume: 0, color: '#ffffff' },
    { id: 3, chemical: null, volume: 0, color: '#ffffff' }
  ]);
  const [selectedBeaker, setSelectedBeaker] = useState(null);
  const [reactionResult, setReactionResult] = useState(null);
  const [score, setScore] = useState(0);

  const chemicals = [
    { id: 1, name: 'acid', color: '#ff6b6b', label: { odia: 'ଅମ୍ଳ', hindi: 'अम्ल', english: 'Acid' } },
    { id: 2, name: 'base', color: '#4ecdc4', label: { odia: 'କ୍ଷାର', hindi: 'क्षार', english: 'Base' } },
    { id: 3, name: 'water', color: '#74b9ff', label: { odia: 'ପାଣି', hindi: 'पानी', english: 'Water' } }
  ];

  useEffect(() => {
    if (gestureData) {
      handleChemistryGesture(gestureData);
    }
  }, [gestureData]);

  const handleChemistryGesture = (gesture) => {
    const pourGesture = gesture.gestures.find(g => g.type === 'pour');
    
    if (pourGesture && selectedBeaker && gesture.palm_center.length > 0) {
      const tiltDirection = pourGesture.direction;
      const palmX = gesture.palm_center[0][0] * 800;
      
      // Find target beaker based on tilt direction
      const targetBeakerId = tiltDirection === 'left' ? selectedBeaker - 1 : selectedBeaker + 1;
      const targetBeaker = beakers.find(b => b.id === targetBeakerId);
      
      if (targetBeaker && selectedBeaker) {
        pourChemical(selectedBeaker, targetBeakerId);
      }
    }
    
    // Select beaker based on hand position
    if (gesture.palm_center.length > 0) {
      const palmX = gesture.palm_center[0][0] * 800;
      const beakerWidth = 800 / 3;
      const newSelected = Math.floor(palmX / beakerWidth) + 1;
      setSelectedBeaker(newSelected);
    }
  };

  const pourChemical = (fromId, toId) => {
    setBeakers(prev => {
      const updated = [...prev];
      const fromBeaker = updated.find(b => b.id === fromId);
      const toBeaker = updated.find(b => b.id === toId);
      
      if (fromBeaker.chemical && fromBeaker.volume > 0) {
        // Transfer chemical
        toBeaker.chemical = fromBeaker.chemical;
        toBeaker.volume = Math.min(100, toBeaker.volume + 20);
        toBeaker.color = fromBeaker.color;
        
        fromBeaker.volume = Math.max(0, fromBeaker.volume - 20);
        if (fromBeaker.volume === 0) {
          fromBeaker.chemical = null;
          fromBeaker.color = '#ffffff';
        }
        
        // Check for reaction
        checkReaction(toBeaker);
      }
      
      return updated;
    });
  };

  const checkReaction = (beaker) => {
    if (beaker.chemical === 'acid') {
      setReactionResult({
        type: 'success',
        message: {
          odia: 'ଅମ୍ଳ-କ୍ଷାର ପ୍ରତିକ୍ରିୟା! ଲବଣ ଓ ପାଣି ଉତ୍ପନ୍ନ ହେଲା',
          hindi: 'अम्ल-क्षार अभिक्रिया! लवण और पानी बना',
          english: 'Acid-Base reaction! Salt and water produced'
        }
      });
      setScore(prev => prev + 15);
      onAction({ type: 'reaction', chemicals: ['acid', 'base'] });
    } else if (beaker.chemical === 'base') {
      setReactionResult({
        type: 'warning',
        message: {
          odia: 'କ୍ଷାର ମିଶ୍ରଣ - ସତର୍କ ରହନ୍ତୁ!',
          hindi: 'क्षार मिश्रण - सावधान रहें!',
          english: 'Base mixture - be cautious!'
        }
      });
    }
    
    setTimeout(() => setReactionResult(null), 3000);
  };

  const addChemical = (chemical, beakerId) => {
    setBeakers(prev => prev.map(beaker => 
      beaker.id === beakerId 
        ? { ...beaker, chemical, volume: 50, color: chemicals.find(c => c.name === chemical).color }
        : beaker
    ));
  };

  const getChemicalName = (chem, lang) => {
    return chemicals.find(c => c.name === chem)?.label[lang] || chem;
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-red-50 to-blue-50 rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Flask className="w-6 h-6" />
          {language === 'odia' ? 'ରସାୟନ ଖେଳ' : language === 'hindi' ? 'रसायन खेल' : 'Chemistry Game'}
        </h3>
        <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-semibold">
          Score: {score}
        </div>
      </div>

      {/* Chemicals Palette */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {chemicals.map(chemical => (
          <motion.button
            key={chemical.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-3 rounded-lg text-white font-semibold shadow-lg"
            style={{ backgroundColor: chemical.color }}
            onClick={() => selectedBeaker && addChemical(chemical.name, selectedBeaker)}
          >
            {chemical.label[language]}
          </motion.button>
        ))}
      </div>

      {/* Beakers */}
      <div className="flex justify-center gap-8 mb-6">
        {beakers.map(beaker => (
          <motion.div
            key={beaker.id}
            animate={{ 
              scale: selectedBeaker === beaker.id ? 1.1 : 1,
              y: selectedBeaker === beaker.id ? -10 : 0
            }}
            className="flex flex-col items-center"
          >
            <div className="relative w-20 h-32">
              {/* Beaker outline */}
              <div className="absolute bottom-0 w-full h-full border-4 border-gray-400 rounded-t-lg rounded-b-full bg-white bg-opacity-50">
                {/* Liquid */}
                <motion.div
                  className="absolute bottom-0 w-full rounded-b-full"
                  style={{ 
                    backgroundColor: beaker.color,
                    height: `${beaker.volume}%` 
                  }}
                  initial={{ height: 0 }}
                  animate={{ height: `${beaker.volume}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              
              {/* Volume indicator */}
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-1 rounded">
                {beaker.volume}%
              </div>
            </div>
            
            <div className="mt-2 text-sm font-medium">
              {beaker.chemical ? getChemicalName(beaker.chemical, language) : 'Empty'}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Reaction Result */}
      <AnimatePresence>
        {reactionResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-4 rounded-lg text-center font-semibold ${
              reactionResult.type === 'success' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {reactionResult.type === 'success' ? (
              <Zap className="w-5 h-5 inline mr-2" />
            ) : (
              <AlertTriangle className="w-5 h-5 inline mr-2" />
            )}
            {reactionResult.message[language]}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions */}
      <div className="text-center text-sm text-gray-600 mt-4">
        {language === 'odia' ? 
         'ବିକର ବଛିବା ପାଇଁ ହାତ ଘୁଞ୍ଚାନ୍ତୁ, ରାସାୟନିକ ମିଶାଇବା ପାଇଁ ହାତ ହଲାନ୍ତୁ' :
         language === 'hindi' ?
         'बीकर चुनने के लिए हाथ घुमाएँ, रसायन मिलाने के लिए हाथ हिलाएँ' :
         'Move hand to select beaker, tilt hand to mix chemicals'}
      </div>
    </div>
  );
};

export default ChemistryGame;