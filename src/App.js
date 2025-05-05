// src/App.js
// src/App.js
import React from 'react';
import './App.css';
import Header from './components/Header'; // Default import
import HeroSection from './components/HeroSection'; // Default import
import AboutSection from './components/AboutSection'; // Default import
import CallToAction from './components/CallToAction'; // Default import
import Footer from './components/Footer'; // Default import
// ... rest of the file

function App() {
  return (
    <div className="App">
      <Header />
      <main>
        <HeroSection />
        <AboutSection />
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
}

export default App;
