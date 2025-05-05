// src/components/AboutSection.js
import React from "react";
import "./AboutSection.css";

function AboutSection() {
  return (
    <section id="about" className="about-section">
      <div className="bordered-box">
        {" "}
        {/* Use the outlined box style */}
        <h2>What's the Book About?</h2>
        {/* Replace placeholder paragraph with Lorem Ipsum */}
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
        {/* Placeholder for another illustration */}
        <div className="illustration-placeholder about-illustration">
          {/* Update placeholder text */}
          Illustration Placeholder
        </div>
      </div>
    </section>
  );
}

export default AboutSection;
