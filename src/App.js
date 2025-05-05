// src/App.js
import React from 'react';
import './App.css';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import AboutSection from './components/AboutSection';
import CallToAction from './components/CallToAction';
// --- IMPORT THE NEW COMPONENT ---
import FoodSortGame from './components/FoodSortGame';
// -------------------------------
import Footer from './components/Footer';

function App() {
  return (
    <div className="App">
      <Header />
      <main>
        <HeroSection />
        <AboutSection />
        <CallToAction />
        {/* --- ADD THE GAME COMPONENT HERE --- */}
        <FoodSortGame />
        {/* ------------------------------------ */}
      </main>
      <Footer />
    </div>
  );
}

export default App;