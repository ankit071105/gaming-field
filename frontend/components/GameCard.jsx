'use client';
import { motion } from 'framer-motion';
import { 
  Atom, 
  Calculator, 
  FlaskConical, 
  Brain, 
  Code2,
  Star,
  Clock,
  TrendingUp
} from 'lucide-react';

const subjectIcons = {
  physics: Atom,
  mathematics: Calculator,
  chemistry: FlaskConical,
  biology: Brain,
  computer_science: Code2
};

const difficultyColors = {
  beginner: 'bg-green-100 text-green-800 border-green-200',
  intermediate: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  advanced: 'bg-red-100 text-red-800 border-red-200'
};

const subjectColors = {
  physics: 'bg-red-50 border-red-200',
  mathematics: 'bg-blue-50 border-blue-200',
  chemistry: 'bg-green-50 border-green-200', 
  biology: 'bg-purple-50 border-purple-200',
  computer_science: 'bg-yellow-50 border-yellow-200'
};

const GameCard = ({ game, onPlay, progress, language }) => {
  const IconComponent = subjectIcons[game.subject] || Atom;
  const difficulty = game.difficulty || 'beginner';
  const subject = game.subject || 'physics';

  const getProgressText = () => {
    if (!progress) return null;
    
    const texts = {
      odia: `ସ୍କୋର: ${progress.score}% | ସମୟ: ${progress.timeSpent} ମିନିଟ୍`,
      hindi: `स्कोर: ${progress.score}% | समय: ${progress.timeSpent} मिनट`,
      english: `Score: ${progress.score}% | Time: ${progress.timeSpent}min`
    };
    
    return texts[language] || texts.english;
  };

  const getGameTitle = () => {
    const titles = {
      physics: {
        odia: 'ଭୌତିକ ଖେଳ',
        hindi: 'भौतिकी खेल',
        english: 'Physics Game'
      },
      mathematics: {
        odia: 'ଗଣିତ ଖେଳ',
        hindi: 'गणित खेल',
        english: 'Math Game'
      },
      chemistry: {
        odia: 'ରସାୟନ ଖେଳ',
        hindi: 'रसायन खेल',
        english: 'Chemistry Game'
      },
      biology: {
        odia: 'ଜୀବବିଜ୍ଞାନ ଖେଳ',
        hindi: 'जीवविज्ञान खेल',
        english: 'Biology Game'
      },
      computer_science: {
        odia: 'କମ୍ପ୍ୟୁଟର ଖେଳ',
        hindi: 'कंप्यूटर खेल',
        english: 'Coding Game'
      }
    };
    
    return titles[subject]?.[language] || game.title;
  };

  const getGestureTypeText = () => {
    const gestures = {
      drag_drop: {
        odia: 'ଟାଣି ଛାଡିବା',
        hindi: 'खींचें और छोड़ें',
        english: 'Drag & Drop'
      },
      shape_draw: {
        odia: 'ଆକୃତି ଅଙ୍କନ',
        hindi: 'आकृति बनाएँ',
        english: 'Shape Draw'
      },
      pour_tilt: {
        odia: 'ଢାଳିବା ଓ ହଲାଇବା',
        hindi: 'ढालें और घुमाएँ',
        english: 'Pour & Tilt'
      },
      rotate_zoom: {
        odia: 'ଘୁରାଇବା ଓ ଜୁମ୍ କରିବା',
        hindi: 'घुमाएँ और ज़ूम करें',
        english: 'Rotate & Zoom'
      }
    };
    
    return gestures[game.gesture_type]?.[language] || game.gesture_type;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`game-card border-2 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 ${subjectColors[subject]}`}
      onClick={() => onPlay(game)}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg ${subjectColors[subject].replace('50', '100').replace('border-', '')}`}>
              <IconComponent className="w-6 h-6" style={{ color: getComputedStyle(document.documentElement).getPropertyValue(`--color-${subject}`) }} />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-800">{getGameTitle()}</h3>
              <p className="text-sm text-gray-600 capitalize">{game.subject}</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${difficultyColors[difficulty]}`}>
            {difficulty}
          </span>
        </div>

        <p className="text-gray-600 mb-4 text-sm leading-relaxed">{game.description}</p>

        {/* Progress Bar */}
        {progress && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>{language === 'odia' ? 'ପ୍ରଗତି' : language === 'hindi' ? 'प्रगति' : 'Progress'}</span>
              <span>{progress.score}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full progress-bar-${subject}`}
                style={{ width: `${progress.score}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-1 flex justify-between">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {progress.timeSpent}{language === 'odia' ? 'ମି' : language === 'hindi' ? 'मि' : 'min'}
              </span>
              {progress.score >= 80 && (
                <span className="flex items-center gap-1 text-green-600">
                  <Star className="w-3 h-3 fill-current" />
                  {language === 'odia' ? 'ଉତ୍କୃଷ୍ଟ' : language === 'hindi' ? 'उत्कृष्ट' : 'Excellent'}
                </span>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-gray-500">
            <TrendingUp className="w-4 h-4" />
            <span>{getGestureTypeText()}</span>
          </div>
          <button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
            {language === 'odia' ? 'ଖେଳନ୍ତୁ' : language === 'hindi' ? 'खेलें' : 'Play Now'}
          </button>
        </div>
      </div>

      {/* Subject accent border */}
      <div className={`h-1 w-full ${
        subject === 'physics' ? 'bg-red-500' :
        subject === 'mathematics' ? 'bg-blue-500' :
        subject === 'chemistry' ? 'bg-green-500' :
        subject === 'biology' ? 'bg-purple-500' : 'bg-yellow-500'
      }`}></div>
    </motion.div>
  );
};

export default GameCard;