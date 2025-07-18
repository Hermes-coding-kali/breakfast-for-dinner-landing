// src/components/FoodSortGame.js
import React, { useState, useEffect, useCallback } from 'react';
import './FoodSortGame.css';

// Define potential food items
const allFoodItems = [
    { name: 'Pancakes', type: 'breakfast', emoji: '🥞' },
    { name: 'Bacon', type: 'breakfast', emoji: '🥓' },
    { name: 'Fried Egg', type: 'breakfast', emoji: '🍳' },
    { name: 'Waffles', type: 'breakfast', emoji: '🧇' },
    { name: 'Cereal', type: 'breakfast', emoji: '🥣' },
    { name: 'Omelette', type: 'breakfast', emoji: '🥚' },
    { name: 'Steak', type: 'dinner', emoji: '🥩' },
    { name: 'Spaghetti', type: 'dinner', emoji: '🍝' },
    { name: 'Salad', type: 'dinner', emoji: '🥗' },
    { name: 'Roast Chicken', type: 'dinner', emoji: '🍗' },
    { name: 'Taco', type: 'dinner', emoji: '🌮' },
    { name: 'Pizza Slice', type: 'dinner', emoji: '🍕' },
    { name: 'Burger', type: 'dinner', emoji: '🍔' }, // Controversial? Let's add it!
];

// --- Game Configuration ---
const GAME_DURATION = 20; // seconds
const CORRECT_SCORE = 10;
const INCORRECT_PENALTY = 5; // Penalty for a wrong answer
// --------------------------

function FoodSortGame() {
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
    const [currentItem, setCurrentItem] = useState(null);
    const [gameState, setGameState] = useState('idle'); // 'idle', 'playing', 'gameOver'
    const [feedback, setFeedback] = useState(''); // For correct/incorrect messages

    // Load high score from session storage on component mount
    useEffect(() => {
        const cachedHighScore = sessionStorage.getItem('highScore') || 0;
        setHighScore(parseInt(cachedHighScore, 10));
    }, []);

    // Function to pick a random item
    const pickRandomItem = useCallback(() => {
        // Avoid picking the same item twice in a row if possible
        let newItem;
        do {
            const randomIndex = Math.floor(Math.random() * allFoodItems.length);
            newItem = allFoodItems[randomIndex];
        } while (currentItem && newItem.name === currentItem.name && allFoodItems.length > 1);
        setCurrentItem(newItem);
    }, [currentItem]); // Dependency ensures stability if currentItem changes

    // Timer countdown effect
    useEffect(() => {
        if (gameState !== 'playing') {
            return;
        }

        const timerId = setInterval(() => {
            setTimeLeft(prevTime => (prevTime > 0 ? prevTime - 1 : 0));
        }, 1000);

        return () => clearInterval(timerId);
    }, [gameState]);

    // Game over and high score logic effect
    useEffect(() => {
        if (timeLeft === 0 && gameState === 'playing') {
            setGameState('gameOver');
            if (score > highScore) {
                setHighScore(score);
                sessionStorage.setItem('highScore', score.toString());
            }
        }
    }, [timeLeft, gameState, score, highScore]);


    // Effect to pick the first item when the game starts
     useEffect(() => {
        if (gameState === 'playing' && !currentItem) {
             pickRandomItem();
        }
     }, [gameState, currentItem, pickRandomItem]);


    // Function to start the game
    const startGame = () => {
        setScore(0);
        setTimeLeft(GAME_DURATION);
        setGameState('playing');
        setFeedback('');
        // Pick the first item via the effect above
        setCurrentItem(null); // Reset item so effect picks a new one
    };

    // Function to handle player choice
    const handleChoice = (chosenType) => {
        if (gameState !== 'playing' || !currentItem) return;

        if (currentItem.type === chosenType) {
            setScore((prevScore) => prevScore + CORRECT_SCORE);
            setFeedback('Correct! 🎉');
        } else {
            setScore((prevScore) => prevScore - INCORRECT_PENALTY);
            setFeedback(`Oops! ${currentItem.name} is ${currentItem.type}.`);
        }

        // Clear feedback after a short delay
        setTimeout(() => setFeedback(''), 800);

        // Pick the next item
        pickRandomItem();
    };

    return (
        <section id="food-sort-game" className="food-sort-game-section">
            <h2>Mini-Game: Breakfast or Dinner?</h2>

            {gameState === 'idle' && (
                <div className="game-intro">
                    <p>Categorize the food before time runs out!</p>
                    <p>High Score: {highScore}</p>
                    <button onClick={startGame} className="cta-button button-green">
                        Start Game!
                    </button>
                </div>
            )}

            {gameState === 'playing' && currentItem && (
                <div className="game-area">
                    <div className="game-stats">
                        <span>Score: {score}</span>
                        <span>High Score: {highScore}</span>
                        <span>Time Left: {timeLeft}s</span>
                    </div>
                    <div className="game-item">
                         <span className="item-emoji">{currentItem.emoji}</span>
                        <span className="item-name">{currentItem.name}</span>
                    </div>
                     <div className="game-feedback">
                         {feedback || '​'} {/* Use zero-width space to maintain height */}
                     </div>
                    <div className="game-choices">
                        <button
                            onClick={() => handleChoice('breakfast')}
                            className="cta-button button-yellow" // Using existing styles
                            aria-label="Choose Breakfast"
                        >
                            🍳 Breakfast
                        </button>
                        <button
                            onClick={() => handleChoice('dinner')}
                            className="cta-button button-purple" // Using existing styles
                             aria-label="Choose Dinner"
                       >
                            🍝 Dinner
                        </button>
                    </div>
                </div>
            )}

            {gameState === 'gameOver' && (
                <div className="game-over">
                    <h3>Game Over!</h3>
                    <p>Your final score: {score}</p>
                    <p>High Score: {highScore}</p>
                    <button onClick={startGame} className="cta-button button-green">
                        Play Again?
                    </button>
                </div>
            )}
        </section>
    );
}

export default FoodSortGame;