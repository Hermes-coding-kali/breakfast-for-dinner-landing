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
// --------------------------

function FoodSortGame() {
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
    const [currentItem, setCurrentItem] = useState(null);
    const [gameState, setGameState] = useState('idle'); // 'idle', 'playing', 'gameOver'
    const [feedback, setFeedback] = useState(''); // For correct/incorrect messages

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

    // Timer effect
    useEffect(() => {
        if (gameState !== 'playing') {
            return; // Do nothing if not playing
        }

        if (timeLeft <= 0) {
            setGameState('gameOver');
            setFeedback(''); // Clear feedback on game over
            return;
        }

        const timerId = setInterval(() => {
            setTimeLeft((prevTime) => prevTime - 1);
        }, 1000);

        // Cleanup function
        return () => clearInterval(timerId);
    }, [gameState, timeLeft]);


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
            // Optional: Add a penalty? For now, just incorrect feedback
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
                    <button onClick={startGame} className="cta-button button-green">
                        Start Game!
                    </button>
                </div>
            )}

            {gameState === 'playing' && currentItem && (
                <div className="game-area">
                    <div className="game-stats">
                        <span>Score: {score}</span>
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
                    <button onClick={startGame} className="cta-button button-green">
                        Play Again?
                    </button>
                </div>
            )}
        </section>
    );
}

export default FoodSortGame;