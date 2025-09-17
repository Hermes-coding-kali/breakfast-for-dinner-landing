// components/FoodSortGame.js
import React, { useEffect, useMemo, useReducer, useRef } from 'react';
import './FoodSortGame.css';
import Button from './Button';

// Difficulty presets (tweak as needed)
const DIFFICULTY = {
  easy:   { duration: 30, correct: 10, penalty: 0 },
  normal: { duration: 20, correct: 10, penalty: 5 },
  hard:   { duration: 15, correct: 10, penalty: 10 },
};

const BASE_ITEMS = [
  { name: 'Pancakes', type: 'breakfast', emoji: '🥞' },
  { name: 'Bacon', type: 'breakfast', emoji: '🥓' },
  { name: 'Fried Egg', type: 'breakfast', emoji: '🍳' },
  { name: 'Waffles', type: 'breakfast', emoji: '🧇' },
  { name: 'Cereal', type: 'breakfast', emoji: '🥣' },
  { name: 'Omelette', type: 'breakfast', emoji: '🥚' },
  { name: 'Bagel', type: 'breakfast', emoji: '🥯' },
  { name: 'Croissant', type: 'breakfast', emoji: '🥐' },

  { name: 'Steak', type: 'dinner', emoji: '🥩' },
  { name: 'Spaghetti', type: 'dinner', emoji: '🍝' },
  { name: 'Salad', type: 'dinner', emoji: '🥗' },
  { name: 'Roast Chicken', type: 'dinner', emoji: '🍗' },
  { name: 'Taco', type: 'dinner', emoji: '🌮' },
  { name: 'Pizza Slice', type: 'dinner', emoji: '🍕' },
  { name: 'Burger', type: 'dinner', emoji: '🍔' },
  { name: 'Sushi', type: 'dinner', emoji: '🍣' },
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const initial = {
  state: 'idle',
  score: 0,
  high: 0,
  timeLeft: 20,
  items: [],
  idx: 0,
  feedback: '',
  answered: 0,
  correctVal: 10,
  penaltyVal: 5,
  maxRounds: undefined,
};

function reducer(s, a) {
  switch (a.type) {
    case 'INIT':
      return { ...initial, high: a.high };
    case 'START': {
      const items = shuffle(BASE_ITEMS);
      return {
        ...s,
        state: 'playing',
        score: 0,
        timeLeft: a.duration,
        items,
        idx: 0,
        feedback: '',
        answered: 0,
        correctVal: a.correct,
        penaltyVal: a.penalty,
        maxRounds: a.maxRounds, // undefined or positive integer
      };
    }
    case 'TICK':
      return s.state === 'playing'
        ? { ...s, timeLeft: Math.max(0, s.timeLeft - 1) }
        : s;
    case 'ANSWER': {
      if (s.state !== 'playing') return s;
      const current = s.items[s.idx];
      const correct = current?.type === a.choice;
      const delta = correct ? s.correctVal : -s.penaltyVal;
      const nextIdx = (s.idx + 1) % s.items.length;
      const answered = s.answered + 1;

      return {
        ...s,
        score: Math.max(0, s.score + delta),
        idx: nextIdx,
        feedback: correct ? 'Correct! 🎉' : `Oops! ${current?.name} is ${current?.type}.`,
        answered,
      };
    }
    case 'CLEAR_FEEDBACK':
      return { ...s, feedback: '' };
    case 'END': {
      const high = Math.max(s.high, s.score);
      try { localStorage.setItem('foodSortHighScore', String(high)); } catch {}
      return { ...s, state: 'gameOver', high };
    }
    default:
      return s;
  }
}

export default function FoodSortGame({ data }) {
  const {
    heading,
    introText,
    instructions,
    startButtonLabel = 'Start Game!',
    difficulty = 'normal',
    maxRounds,
    style: st = {},
  } = data || {};

  // Difficulty and safe fallbacks
  const diff = DIFFICULTY[String(difficulty)] ?? DIFFICULTY.normal;
  const safeDuration = Math.max(5, Number(diff.duration) || 20);
  const safeMaxRounds =
    Number.isFinite(Number(maxRounds)) && Number(maxRounds) > 0
      ? Math.floor(Number(maxRounds))
      : undefined;

  // normalize renamed style keys coming from schema
  const normalized = {
    ...st,
    gameBorderWidth: st.gameBorderWidth ?? st.gameAreaBorderWidth,
    gameRadius: st.gameRadius ?? st.gameAreaRadius,
  };

  const [s, dispatch] = React.useReducer(reducer, initial);
  const timerRef = useRef(null);

  // Load high score on mount
  useEffect(() => {
    let saved = 0;
    try { saved = parseInt(localStorage.getItem('foodSortHighScore') || '0', 10); } catch {}
    dispatch({ type: 'INIT', high: Number.isFinite(saved) ? saved : 0 });
  }, []);

  // game timer
  useEffect(() => {
    if (s.state !== 'playing') return;
    timerRef.current = setInterval(() => dispatch({ type: 'TICK' }), 1000);
    return () => clearInterval(timerRef.current);
  }, [s.state]);

  // end on timer or maxRounds (> 0 only)
  useEffect(() => {
    if (s.state !== 'playing') return;

    if (s.timeLeft === 0) {
      clearInterval(timerRef.current);
      dispatch({ type: 'END' });
      return;
    }

    if (typeof s.maxRounds === 'number' && s.maxRounds > 0 && s.answered >= s.maxRounds) {
      clearInterval(timerRef.current);
      dispatch({ type: 'END' });
    }
  }, [s.state, s.timeLeft, s.answered, s.maxRounds]);

  // ephemeral feedback
  useEffect(() => {
    if (!s.feedback) return;
    const t = setTimeout(() => dispatch({ type: 'CLEAR_FEEDBACK' }), 900);
    return () => clearTimeout(t);
  }, [s.feedback]);

  // keyboard controls
  useEffect(() => {
    const onKey = (e) => {
      if (s.state === 'idle' && (e.key === ' ' || e.key === 'Enter')) {
        e.preventDefault();
        dispatch({
          type: 'START',
          duration: safeDuration,
          correct: diff.correct,
          penalty: diff.penalty,
          maxRounds: safeMaxRounds,
        });
        return;
      }
      if (s.state === 'playing') {
        if (e.key === 'ArrowLeft') dispatch({ type: 'ANSWER', choice: 'breakfast' });
        if (e.key === 'ArrowRight') dispatch({ type: 'ANSWER', choice: 'dinner' });
      } else if (s.state === 'gameOver' && (e.key === ' ' || e.key === 'Enter')) {
        e.preventDefault();
        dispatch({
          type: 'START',
          duration: safeDuration,
          correct: diff.correct,
          penalty: diff.penalty,
          maxRounds: safeMaxRounds,
        });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [s.state, safeDuration, diff.correct, diff.penalty, safeMaxRounds]);

  const current = s.items[s.idx];

  // CSS variables hook-up (customizable styles preserved)
  const sectionVars = {
    '--fsg-bgAngle': `${normalized.bgAngle ?? 0}deg`,
    '--fsg-bgStart': normalized.bgStart || 'var(--hill-green-light)',
    '--fsg-bgEnd': normalized.bgEnd || (normalized.bgStart || 'var(--hill-green-light)'),
    '--fsg-text': normalized.textColor || 'var(--text-dark)',
    '--fsg-dash': normalized.dashColor || 'var(--text-dark)',
    '--fsg-headingFill': normalized.headingFill || '#ffffff',
    '--fsg-headingStroke': normalized.headingStroke || '#212121',
    '--fsg-headingStrokeW': `${normalized.headingStrokeWidth ?? 2}px`,
    '--fsg-gameBg': normalized.gameBg || 'rgba(255,255,255,0.8)',
    '--fsg-gameBorderColor': normalized.gameBorderColor || 'var(--text-dark)',
    '--fsg-gameBorderW': `${normalized.gameBorderWidth ?? 3}px`,
    '--fsg-gameRadius': `${normalized.gameRadius ?? 15}px`,
    '--fsg-gameShadow': normalized.gameShadow || 'var(--hill-green-dark)',
    '--fsg-statsColor': normalized.statsColor || 'var(--pants-purple)',
    '--fsg-feedback': normalized.feedbackColor || 'var(--pants-blue)',
    '--fsg-blob': normalized.blobColor || '#ffffff',
    '--fsg-blobOpa': String(normalized.showBlobs === false ? 0 : (normalized.blobOpacity ?? 0.3)),
  };

  const sectionStyle = {
    padding: `${normalized.paddingY ?? 50}px ${normalized.paddingX ?? 20}px`,
    ...sectionVars,
  };

  // button style tokens
  const startBtnStyle = useMemo(() => {
    const base = normalized.startButtonStyle || {};
    const override = normalized.startButtonOverride || {};
    return { ...base, ...override };
  }, [normalized.startButtonStyle, normalized.startButtonOverride]);

  const breakfastBtnStyle = useMemo(() => {
    const base = normalized.breakfastButtonStyle || {};
    const override = normalized.breakfastButtonOverride || {};
    return { ...base, ...override };
  }, [normalized.breakfastButtonStyle, normalized.breakfastButtonOverride]);

  const dinnerBtnStyle = useMemo(() => {
    const base = normalized.dinnerButtonStyle || {};
    const override = normalized.dinnerButtonOverride || {};
    return { ...base, ...override };
  }, [normalized.dinnerButtonStyle, normalized.dinnerButtonOverride]);

  const btnFullWidth = !!normalized.buttonFullWidth;

  return (
    <section
      id="food-sort-game"
      className="food-sort-game-section"
      style={sectionStyle}
      aria-labelledby="fsg-heading"
    >
      {heading && <h2 id="fsg-heading">{heading}</h2>}

      {s.state === 'idle' && (
        <div className="game-intro" role="region" aria-live="polite">
          {introText && <p>{introText}</p>}
          {instructions && <p className="game-instructions">{instructions}</p>}
          <p>High Score: {s.high}</p>
          <p style={{ fontSize: '0.95em', opacity: 0.85 }}>
            Difficulty: <strong>{String(difficulty)}</strong> •
            <span> Use ← for Breakfast, → for Dinner. Press Space/Enter to start.</span>
            {typeof safeMaxRounds === 'number' ? <> • Rounds: <strong>{safeMaxRounds}</strong></> : null}
          </p>
          <Button
            onClick={() =>
              dispatch({
                type: 'START',
                duration: safeDuration,
                correct: diff.correct,
                penalty: diff.penalty,
                maxRounds: safeMaxRounds,
              })
            }
            className={btnFullWidth ? 'fsg-fw' : undefined}
            styleTokens={startBtnStyle}
          >
            {startButtonLabel}
          </Button>
        </div>
      )}

      {s.state === 'playing' && current && (
        <div className="game-area" role="group" aria-label="Food Sort Game">
          <div className="game-stats">
            <span>Score: {s.score}</span>
            <span>High Score: {s.high}</span>
            <span>Time Left: {s.timeLeft}s</span>
          </div>

          <div className="game-item" aria-live="polite" aria-atomic="true">
            <span className="item-emoji" role="img" aria-label={current.name}>{current.emoji}</span>
            <span className="item-name">{current.name}</span>
          </div>

          <div className="game-feedback" aria-live="polite" aria-atomic="true">
            {s.feedback || ' '}
          </div>

          <div className="game-choices">
            <Button
              onClick={() => dispatch({ type: 'ANSWER', choice: 'breakfast' })}
              aria-label="Choose Breakfast (←)"
              styleTokens={breakfastBtnStyle}
            >
              Breakfast
            </Button>
            <Button
              onClick={() => dispatch({ type: 'ANSWER', choice: 'dinner' })}
              aria-label="Choose Dinner (→)"
              styleTokens={dinnerBtnStyle}
            >
              Dinner
            </Button>
          </div>
        </div>
      )}

      {s.state === 'gameOver' && (
        <div className="game-over" role="region" aria-live="polite">
          <h3>Game Over!</h3>
          <p>Your final score: {s.score}</p>
          <p>High Score: {s.high}</p>
          <Button
            onClick={() =>
              dispatch({
                type: 'START',
                duration: safeDuration,
                correct: diff.correct,
                penalty: diff.penalty,
                maxRounds: safeMaxRounds,
              })
            }
            className={btnFullWidth ? 'fsg-fw' : undefined}
            styleTokens={startBtnStyle}
          >
            Play Again?
          </Button>
        </div>
      )}
    </section>
  );
}
