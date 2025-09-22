'use client';
import { useState, useEffect } from 'react';
import { motion, Reorder } from 'framer-motion';
import { Code, Play, RotateCcw, CheckCircle } from 'lucide-react';

const CodingGame = ({ gestureData, onAction, language }) => {
  const [availableBlocks, setAvailableBlocks] = useState([]);
  const [selectedBlocks, setSelectedBlocks] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState('');
  const [score, setScore] = useState(0);
  const [currentChallenge, setCurrentChallenge] = useState(null);

  const challenges = [
    {
      id: 1,
      title: {
        odia: 'ବର୍ଗ ତିଆରି କରନ୍ତୁ',
        hindi: 'वर्ग बनाएँ',
        english: 'Create a Square'
      },
      description: {
        odia: 'ଲୁପ୍ ବ୍ୟବହାର କରି ଏକ ବର୍ଗ ତିଆରି କରନ୍ତୁ',
        hindi: 'लूप का उपयोग करके एक वर्ग बनाएँ',
        english: 'Use loops to create a square pattern'
      },
      solution: ['move_forward', 'turn_right', 'move_forward', 'turn_right', 'move_forward', 'turn_right', 'move_forward'],
      blocks: ['move_forward', 'turn_right', 'turn_left', 'repeat']
    },
    {
      id: 2,
      title: {
        odia: 'ତ୍ରିଭୁଜ ତିଆରି କରନ୍ତୁ',
        hindi: 'त्रिभुज बनाएँ',
        english: 'Create a Triangle'
      },
      description: {
        odia: 'ପୁନରାବୃତ୍ତି ବ୍ଲକ୍ ବ୍ୟବହାର କରନ୍ତୁ',
        hindi: 'पुनरावृत्ति ब्लॉक का उपयोग करें',
        english: 'Use repeat blocks for efficiency'
      },
      solution: ['move_forward', 'turn_left', 'move_forward', 'turn_left', 'move_forward'],
      blocks: ['move_forward', 'turn_right', 'turn_left', 'repeat']
    }
  ];

  const blockTemplates = {
    move_forward: {
      color: '#3b82f6',
      label: {
        odia: 'ଆଗକୁ ଯାଅ',
        hindi: 'आगे बढ़ें',
        english: 'Move Forward'
      }
    },
    turn_right: {
      color: '#10b981',
      label: {
        odia: 'ଡାହାଣ ଆଡ଼କୁ ବୁଲ',
        hindi: 'दाएँ मुड़ें',
        english: 'Turn Right'
      }
    },
    turn_left: {
      color: '#f59e0b',
      label: {
        odia: 'ବାମ ଆଡ଼କୁ ବୁଲ',
        hindi: 'बाएँ मुड़ें',
        english: 'Turn Left'
      }
    },
    repeat: {
      color: '#8b5cf6',
      label: {
        odia: 'ପୁନରାବୃତ୍ତି କର',
        hindi: 'दोहराएँ',
        english: 'Repeat'
      },
      children: 4
    }
  };

  useEffect(() => {
    startNewChallenge();
  }, []);

  useEffect(() => {
    if (gestureData) {
      handleCodingGesture(gestureData);
    }
  }, [gestureData]);

  const startNewChallenge = () => {
    const challenge = challenges[Math.floor(Math.random() * challenges.length)];
    setCurrentChallenge(challenge);
    setAvailableBlocks([...challenge.blocks]);
    setSelectedBlocks([]);
    setOutput('');
  };

  const handleCodingGesture = (gesture) => {
    const dragGesture = gesture.gestures.find(g => g.type === 'drag');
    
    if (dragGesture && gesture.palm_center.length > 0) {
      const palmX = gesture.palm_center[0][0] * 800;
      const palmY = gesture.palm_center[0][1] * 600;
      
      // Check if palm is over available blocks area
      if (palmY < 200 && palmX < 400) {
        // Select block based on palm position
        const blockWidth = 400 / availableBlocks.length;
        const blockIndex = Math.floor(palmX / blockWidth);
        
        if (availableBlocks[blockIndex]) {
          // Move block to selected area
          const blockToMove = availableBlocks[blockIndex];
          setAvailableBlocks(prev => prev.filter(b => b !== blockToMove));
          setSelectedBlocks(prev => [...prev, blockToMove]);
        }
      }
      // Check if palm is over selected blocks area (to remove blocks)
      else if (palmY > 300 && palmX < 400) {
        const blockWidth = 400 / selectedBlocks.length;
        const blockIndex = Math.floor(palmX / blockWidth);
        
        if (selectedBlocks[blockIndex]) {
          const blockToRemove = selectedBlocks[blockIndex];
          setSelectedBlocks(prev => prev.filter(b => b !== blockToRemove));
          setAvailableBlocks(prev => [...prev, blockToRemove]);
        }
      }
    }
  };

  const runCode = () => {
    setIsRunning(true);
    setOutput('');
    
    // Simulate code execution
    let result = '';
    selectedBlocks.forEach((block, index) => {
      setTimeout(() => {
        result += `${getBlockLabel(block, language)}\n`;
        setOutput(result);
        
        // Check if completed
        if (index === selectedBlocks.length - 1) {
          setIsRunning(false);
          checkSolution();
        }
      }, index * 500);
    });
    
    if (selectedBlocks.length === 0) {
      setIsRunning(false);
    }
  };

  const checkSolution = () => {
    if (JSON.stringify(selectedBlocks) === JSON.stringify(currentChallenge.solution)) {
      setScore(prev => prev + 25);
      setOutput(prev => prev + '\n✅ ' + getMessage('success', language));
      onAction({ type: 'challenge_completed', challenge: currentChallenge.id });
      
      setTimeout(() => {
        startNewChallenge();
      }, 2000);
    } else {
      setOutput(prev => prev + '\n❌ ' + getMessage('try_again', language));
    }
  };

  const getBlockLabel = (block, lang) => {
    return blockTemplates[block]?.label[lang] || block;
  };

  const getMessage = (type, lang) => {
    const messages = {
      success: {
        odia: 'ଅଭିନନ୍ଦନ! ଆପଣ ଠିକ୍ କୋଡ୍ ଲେଖିଛନ୍ତି!',
        hindi: 'बधाई! आपने सही कोड लिखा है!',
        english: 'Congratulations! You wrote the correct code!'
      },
      try_again: {
        odia: 'ପୁନର୍ବାର ଚେଷ୍ଟା କରନ୍ତୁ!',
        hindi: 'फिर से कोशिश करें!',
        english: 'Try again!'
      }
    };
    return messages[type]?.[lang] || messages.try_again.english;
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Code className="w-6 h-6" />
          {language === 'odia' ? 'କୋଡିଂ ଖେଳ' : language === 'hindi' ? 'कोडिंग खेल' : 'Coding Game'}
        </h3>
        <div className="bg-pink-100 text-pink-800 px-3 py-1 rounded-full font-semibold">
          Score: {score}
        </div>
      </div>

      {/* Challenge Info */}
      {currentChallenge && (
        <div className="bg-white p-4 rounded-lg mb-4 shadow-sm">
          <h4 className="font-semibold text-lg mb-2">
            {currentChallenge.title[language]}
          </h4>
          <p className="text-gray-600">
            {currentChallenge.description[language]}
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-6 h-96">
        {/* Available Blocks */}
        <div className="bg-gray-100 rounded-lg p-4">
          <h4 className="font-semibold mb-3">
            {language === 'odia' ? 'ବ୍ଲକ୍ ଗୁଡିକ' : language === 'hindi' ? 'ब्लॉक्स' : 'Available Blocks'}
          </h4>
          <Reorder.Group values={availableBlocks} onReorder={setAvailableBlocks} className="space-y-2">
            {availableBlocks.map((block) => (
              <Reorder.Item key={block} value={block}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="p-3 rounded-lg text-white font-semibold text-center cursor-move shadow-md"
                  style={{ backgroundColor: blockTemplates[block]?.color || '#6b7280' }}
                >
                  {getBlockLabel(block, language)}
                </motion.div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </div>

        {/* Selected Blocks & Output */}
        <div className="flex flex-col">
          <div className="bg-blue-50 rounded-lg p-4 mb-4 flex-1">
            <h4 className="font-semibold mb-3">
              {language === 'odia' ? 'ଆପଣଙ୍କର କୋଡ୍' : language === 'hindi' ? 'आपका कोड' : 'Your Code'}
            </h4>
            <Reorder.Group values={selectedBlocks} onReorder={setSelectedBlocks} className="space-y-2">
              {selectedBlocks.map((block) => (
                <Reorder.Item key={block} value={block}>
                  <div
                    className="p-3 rounded-lg text-white font-semibold text-center cursor-move shadow-md"
                    style={{ backgroundColor: blockTemplates[block]?.color || '#6b7280' }}
                  >
                    {getBlockLabel(block, language)}
                  </div>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          </div>

          {/* Output */}
          <div className="bg-gray-800 text-green-400 p-3 rounded-lg font-mono text-sm h-24 overflow-auto">
            {output || (language === 'odia' ? 'ଆଉଟପୁଟ୍ ଏଠାରେ ଦେଖାଇବ' : 
                        language === 'hindi' ? 'आउटपुट यहाँ दिखेगा' : 
                        'Output will appear here')}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-4 mt-4">
        <button
          onClick={runCode}
          disabled={isRunning || selectedBlocks.length === 0}
          className="flex items-center gap-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-semibold"
        >
          <Play className="w-4 h-4" />
          {language === 'odia' ? 'ଚଲାଅ' : language === 'hindi' ? 'चलाएँ' : 'Run'}
        </button>

        <button
          onClick={startNewChallenge}
          className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold"
        >
          <RotateCcw className="w-4 h-4" />
          {language === 'odia' ? 'ନୂଆ ଖେଳ' : language === 'hindi' ? 'नया खेल' : 'New Challenge'}
        </button>
      </div>

      {/* Instructions */}
      <div className="text-center text-sm text-gray-600 mt-4">
        {language === 'odia' ? 
         'ବ୍ଲକ୍ ଟାଣିବା ପାଇଁ ହାତ ବ୍ୟବହାର କରନ୍ତୁ, ସେଗୁଡିକୁ ଠିକ୍ କ୍ରମରେ ରଖନ୍ତୁ' :
         language === 'hindi' ?
         'ब्लॉक्स खींचने के लिए हाथ का उपयोग करें, उन्हें सही क्रम में रखें' :
         'Use hand to drag blocks, arrange them in correct order'}
      </div>
    </div>
  );
};

export default CodingGame;