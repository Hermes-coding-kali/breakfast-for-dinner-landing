// src/components/AboutSection.js
import React from "react";
import "./AboutSection.css";
import AboutIllustration from '../assets/AboutSectionIllustration.jpg'; // <-- IMPORT YOUR IMAGE

function AboutSection() {
  return (
    <section id="about" className="about-section">
      <div className="bordered-box">
        {" "}
        {/* Use the outlined box style */}
        <h2>What's the Book About?</h2>
        <p>
          Breakfast for dinner, or breakfast for lunch?
          <br />
          Six rhyming stories in this breakfast bunch!
          <br /> From birthday's to yesterday's, and things that aren't, as
          well.
          <br /> Dinosaurs are wearing pants?! And a family becomes unwell.{" "}
          <br />
          So bundle up and get cozy with some stories before bed.
          <br /> Or in the morning, afternoon, or whilst standing on your head.
        </p>
        
        {/* The illustration placeholder is now replaced with the actual image */}
        <div className="illustration-placeholder about-illustration">
          <img src={AboutIllustration} alt="A hand-drawn book cover with a smiling plate and a fried egg." className="illustration-image" />
        </div>
      </div>
    </section>
  );
}

export default AboutSection;