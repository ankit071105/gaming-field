'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, Hand, Zap, Volume2, VolumeX } from 'lucide-react';

const GestureCamera = ({ onGestureDetected, gameType, language = 'odia' }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isActive, setIsActive] = useState(false);
  const [gestureData, setGestureData] = useState(null);
  const [audioFeedback, setAudioFeedback] = useState(true);

  // Voice instructions in different languages
  const voiceInstructions = {
    odia: {
      start: "କ୍ୟାମେରା ଚାଲୁ କରନ୍ତୁ",
      stop: "କ୍ୟାମେରା ବନ୍ଦ କରନ୍ତୁ",
      gesture: "ହସ୍ତଚାଳନା ଚିହ୍ନଟ ହୋଇଛି"
    },
    hindi: {
      start: "कैमरा शुरू करें",
      stop: "कैमरा बंद करें", 
      gesture: "हावभाव पहचाना गया"
    },
    english: {
      start: "Start camera",
      stop: "Stop camera",
      gesture: "Gesture detected"
    }
  };

  const speak = (text) => {
    if (audioFeedback && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'odia' ? 'or' : language === 'hindi' ? 'hi' : 'en';
      speechSynthesis.speak(utterance);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 } 
      });
      videoRef.current.srcObject = stream;
      setIsActive(true);
      speak(voiceInstructions[language].start);
      processVideo();
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const processVideo = useCallback(async () => {
    if (!videoRef.current || !isActive) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const processFrame = async () => {
      if (videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/jpeg');
        
        try {
          const response = await fetch('http://localhost:8000/process-gesture/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image_data: imageData })
          });
          
          const data = await response.json();
          setGestureData(data);
          onGestureDetected(data);
          
          // Provide audio feedback when gesture is detected
          if (data.hands_detected > 0 && audioFeedback) {
            speak(voiceInstructions[language].gesture);
          }
        } catch (error) {
          console.error('Error processing gesture:', error);
        }
      }
      
      if (isActive) {
        requestAnimationFrame(processFrame);
      }
    };
    
    processFrame();
  }, [isActive, onGestureDetected, audioFeedback, language]);

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    setIsActive(false);
    speak(voiceInstructions[language].stop);
  };

  useEffect(() => {
    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Hand className="w-5 h-5" />
          Gesture Control ({language})
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAudioFeedback(!audioFeedback)}
            className={`p-2 rounded-lg ${
              audioFeedback ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {audioFeedback ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <button
            onClick={isActive ? stopCamera : startCamera}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
            } text-white font-medium transition-colors`}
          >
            <Camera className="w-4 h-4" />
            {isActive ? 'Stop Camera' : 'Start Camera'}
          </button>
        </div>
      </div>

      <div className="relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-64 object-cover rounded-lg bg-gray-200 gesture-camera"
          style={{ display: isActive ? 'block' : 'none' }}
        />
        
        <canvas
          ref={canvasRef}
          width="640"
          height="480"
          className="absolute top-0 left-0"
          style={{ display: 'none' }}
        />

        {!isActive && (
          <div className="w-full h-64 flex items-center justify-center bg-gray-100 rounded-lg">
            <div className="text-center text-gray-500">
              <Zap className="w-12 h-12 mx-auto mb-2" />
              <p>Camera not active</p>
              <p className="text-sm">Click start to begin gesture control</p>
            </div>
          </div>
        )}

        {gestureData && isActive && (
          <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-3 rounded-lg">
            <div className="text-sm font-medium">Gesture Detection</div>
            <div className="text-xs mt-1">
              Hands: {gestureData.hands_detected}
            </div>
            {gestureData.gestures.map((gesture, index) => (
              <div key={index} className="text-xs gesture-feedback">
                {gesture.type} ({Math.round(gesture.confidence * 100)}%)
              </div>
            ))}
            {gestureData.palm_center.length > 0 && (
              <div className="text-xs mt-1">
                Palm: {gestureData.palm_center[0][0].toFixed(2)}, {gestureData.palm_center[0][1].toFixed(2)}
              </div>
            )}
          </div>
        )}

        {/* Game-specific gesture hints */}
        {gameType && isActive && (
          <div className="absolute bottom-4 left-4 bg-blue-600 text-white p-2 rounded-lg text-sm">
            {getGameHint(gameType, language)}
          </div>
        )}
      </div>
    </div>
  );
};

const getGameHint = (gameType, language) => {
  const hints = {
    drag_drop: {
      odia: "ବସ୍ତୁକୁ ଟାଣିବା ପାଇଁ ଆଙ୍ଗୁଳି ବ୍ୟବହାର କରନ୍ତୁ",
      hindi: "वस्तुओं को खींचने के लिए उंगलियों का उपयोग करें",
      english: "Use fingers to drag objects"
    },
    shape_draw: {
      odia: "ଆକୃତି ଅଙ୍କନ କରିବା ପାଇଁ ହାତ ଘୁଞ୍ଚାନ୍ତୁ",
      hindi: "आकृतियाँ बनाने के लिए हाथ घुमाएँ",
      english: "Move hand to draw shapes"
    },
    pour_tilt: {
      odia: "ରାସାୟନିକ ମିଶାଇବା ପାଇଁ ହାତ ହଲାନ୍ତୁ",
      hindi: "रसायन मिलाने के लिए हाथ हिलाएँ",
      english: "Tilt hand to mix chemicals"
    },
    rotate_zoom: {
      odia: "ଘୁରାଇବା ଓ ଜୁମ୍ କରିବା ପାଇଁ ଦୁଇ ଆଙ୍ଗୁଳି ବ୍ୟବହାର କରନ୍ତୁ",
      hindi: "घुमाने और ज़ूम करने के लिए दो उंगलियों का उपयोग करें",
      english: "Use two fingers to rotate and zoom"
    }
  };

  return hints[gameType]?.[language] || hints.drag_drop[language];
};

export default GestureCamera;