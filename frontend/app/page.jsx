'use client';
import { useState, useEffect } from 'react';
import GameCard from '../components/GameCard';
import GestureCamera from '../components/GestureCamera';
import PhysicsGame from '../components/PhysicsGame';
import MathGame from '../components/MathGame';
import ChemistryGame from '../components/ChemistryGame';
import BiologyGame from '../components/BiologyGame';
import CodingGame from '../components/CodingGame';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Users, Trophy, TrendingUp, Home, Gamepad2, BarChart3, Settings } from 'lucide-react';

export default function Home() {
  const [games, setGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [gestureData, setGestureData] = useState(null);
  const [activeTab, setActiveTab] = useState('games');
  const [language, setLanguage] = useState('odia');
  const [userProgress, setUserProgress] = useState({});

  useEffect(() => {
    fetchGames();
    fetchUserProgress();
  }, []);

  const fetchGames = async () => {
    try {
      const response = await fetch('http://localhost:8000/games/');
      const data = await response.json();
      setGames(data);
    } catch (error) {
      console.error('Error fetching games:', error);
    }
  };

  const fetchUserProgress = async () => {
    // Mock user progress - in real app, fetch from backend
    setUserProgress({
      physics: { score: 85, timeSpent: 120 },
      mathematics: { score: 92, timeSpent: 95 },
      chemistry: { score: 78, timeSpent: 85 },
      biology: { score: 88, timeSpent: 110 },
      computer_science: { score: 75, timeSpent: 70 }
    });
  };

  const handleGestureDetected = (data) => {
    setGestureData(data);
  };

  const handlePlayGame = (game) => {
    setSelectedGame(game);
    setActiveTab('play');
  };

  const handleGameAction = async (action) => {
    // Save progress to backend
    try {
      await fetch('http://localhost:8000/progress/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 1, // Mock user ID
          game_id: selectedGame.id,
          score: action.score || 0,
          time_spent: 1,
          completed: action.type === 'challenge_completed',
          gestures_used: gestureData,
          game_specific_data: action
        })
      });
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const renderGameComponent = () => {
    if (!selectedGame) return null;

    const gameProps = {
      gestureData,
      onAction: handleGameAction,
      language
    };

    switch (selectedGame.subject) {
      case 'physics':
        return <PhysicsGame {...gameProps} />;
      case 'mathematics':
        return <MathGame {...gameProps} />;
      case 'chemistry':
        return <ChemistryGame {...gameProps} />;
      case 'biology':
        return <BiologyGame {...gameProps} />;
      case 'computer_science':
        return <CodingGame {...gameProps} />;
      default:
        return <div>Game not found</div>;
    }
  };

  const stats = [
    { icon: BookOpen, label: 'STEM Subjects', value: '5' },
    { icon: Users, label: 'Games Available', value: games.length.toString() },
    { icon: Trophy, label: 'Total Score', value: Object.values(userProgress).reduce((sum, p) => sum + (p.score || 0), 0) },
    { icon: TrendingUp, label: 'Avg. Engagement', value: '92%' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-blue-500 text-white p-2 rounded-lg">
                <Gamepad2 className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {language === 'odia' ? 'ଗ୍ରାମୀଣ STEM ଖେଳ' : 
                   language === 'hindi' ? 'ग्रामीण STEM खेल' : 
                   'Rural STEM Quest'}
                </h1>
                <p className="text-gray-600 text-sm">
                  {language === 'odia' ? 'ଗ୍ରାମୀଣ ଶିକ୍ଷା ପାଇଁ ଖେଳ-ଆଧାରିତ ଶିକ୍ଷଣ ପ୍ଲାଟଫର୍ମ' :
                   language === 'hindi' ? 'ग्रामीण शिक्षा के लिए खेल-आधारित शिक्षण मंच' :
                   'Gamified Learning Platform for Rural Education'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="border rounded-lg px-3 py-2"
              >
                <option value="odia">Odia (ଓଡ଼ିଆ)</option>
                <option value="hindi">Hindi (हिन्दी)</option>
                <option value="english">English</option>
              </select>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => setActiveTab('games')}
                  className={`p-2 rounded-lg ${activeTab === 'games' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
                >
                  <Home className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setActiveTab('analytics')}
                  className={`p-2 rounded-lg ${activeTab === 'analytics' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
                >
                  <BarChart3 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'games' && (
            <motion.div
              key="games"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Stats Section */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white p-6 rounded-xl shadow-lg text-center"
                  >
                    <stat.icon className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                    <div className="text-gray-600">{stat.label}</div>
                  </motion.div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Games List */}
                <div className="lg:col-span-2">
                  <h2 className="text-2xl font-bold mb-6">
                    {language === 'odia' ? 'STEM ଶିକ୍ଷଣ ଖେଳଗୁଡିକ' :
                     language === 'hindi' ? 'STEM सीखने के खेल' :
                     'STEM Learning Games'}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {games.map((game, index) => (
                      <GameCard
                        key={game.id}
                        game={game}
                        onPlay={handlePlayGame}
                        progress={userProgress[game.subject]}
                        language={language}
                      />
                    ))}
                  </div>
                </div>

                {/* Gesture Camera */}
                <div>
                  <GestureCamera 
                    onGestureDetected={handleGestureDetected}
                    gameType={selectedGame?.gesture_type}
                    language={language}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'play' && selectedGame && (
            <motion.div
              key="play"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => setActiveTab('games')}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                >
                  ← {language === 'odia' ? 'ଖେଳଗୁଡିକକୁ ଫେରିବେ' :
                     language === 'hindi' ? 'खेलों पर वापस' :
                     'Back to Games'}
                </button>
                <h2 className="text-2xl font-bold text-center">
                  {selectedGame.title} - {language === 'odia' ? 'ଖେଳିବେ' :
                                         language === 'hindi' ? 'खेल रहे हैं' :
                                         'Playing'}
                </h2>
                <div></div> {/* Spacer for flex alignment */}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Game Area */}
                <div className="lg:col-span-3">
                  <div className="bg-white rounded-2xl shadow-xl p-6">
                    {renderGameComponent()}
                  </div>
                </div>

                {/* Gesture Camera & Instructions */}
                <div className="space-y-6">
                  <GestureCamera 
                    onGestureDetected={handleGestureDetected}
                    gameType={selectedGame.gesture_type}
                    language={language}
                  />
                  
                  <div className="bg-white rounded-2xl p-6 shadow-xl">
                    <h3 className="text-lg font-semibold mb-3">
                      {language === 'odia' ? 'ନିର୍ଦେଶାବଳୀ' :
                       language === 'hindi' ? 'निर्देश' :
                       'Instructions'}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      {selectedGame.description}
                    </p>
                    
                    {gestureData && (
                      <div className="bg-blue-50 rounded-lg p-3">
                        <h4 className="font-medium mb-2 text-sm">
                          {language === 'odia' ? 'ହସ୍ତଚାଳନା ସନ୍ଦେଶ' :
                           language === 'hindi' ? 'हावभाव संदेश' :
                           'Gesture Feedback'}
                        </h4>
                        <div className="text-xs space-y-1">
                          <div>
                            {language === 'odia' ? 'ହାତ' : language === 'hindi' ? 'हाथ' : 'Hands'}: {gestureData.hands_detected}
                          </div>
                          {gestureData.gestures.map((gesture, idx) => (
                            <div key={idx} className="flex justify-between">
                              <span>
                                {language === 'odia' ? 'ଚାଳନା' : language === 'hindi' ? 'भाव' : 'Gesture'} {idx + 1}:
                              </span>
                              <span className="font-medium">{gesture.type}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h2 className="text-2xl font-bold mb-6">
                {language === 'odia' ? 'ପ୍ରଗତି ବିଶ୍ଲେଷଣ' :
                 language === 'hindi' ? 'प्रगति विश्लेषण' :
                 'Progress Analytics'}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(userProgress).map(([subject, data]) => (
                  <div key={subject} className="bg-white p-6 rounded-xl shadow-lg">
                    <h3 className="text-lg font-semibold capitalize mb-4">{subject}</h3>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Score</span>
                          <span>{data.score}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${data.score}%` }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>
                            {language === 'odia' ? 'ସମୟ ବିତାଇଛନ୍ତି' :
                             language === 'hindi' ? 'बिताया गया समय' :
                             'Time Spent'}
                          </span>
                          <span>{data.timeSpent} min</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${Math.min(100, data.timeSpent)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}