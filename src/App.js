// src/App.js
import React from 'react';
import './App.css';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import AboutSection from './components/AboutSection';
import CallToAction from './components/CallToAction';
import FoodSortGame from './components/FoodSortGame';
import Footer from './components/Footer';
import ScrollToTopButton from './components/ScrollToTopButton'; // Import the new component

function App() {
  return (
    <div className="App">
      <Header />
      <main>
        <HeroSection />
        <AboutSection />
        <CallToAction />
        <FoodSortGame />
      </main>
      {/* Add the ScrollToTopButton here, outside main but before Footer */}
      <ScrollToTopButton />
      <Footer />
    </div>
  );
}

export default App;
