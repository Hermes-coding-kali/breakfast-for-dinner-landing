// src/components/Section.jsx
import React from 'react'

// Lazy imports
const HeroSection = React.lazy(() => import('./HeroSection'))
const AboutSection = React.lazy(() => import('./AboutSection'))
const FeaturedItemSection = React.lazy(() => import('./FeaturedItemSection'))
const EmailSignupSection = React.lazy(() => import('./EmailSignup')) // NEW
const FoodSortGameSection = React.lazy(() => import('./FoodSortGame'))

const registry = {
  heroSection: HeroSection,
  aboutSection: AboutSection,
  featuredItemSection: FeaturedItemSection,
  // new key from the new schema
  emailSignupSection: EmailSignupSection,
  foodSortGameSection: FoodSortGameSection,
}

export default function Section({section}) {
  if (!section?._type) return null
  const Component = registry[section._type]
  if (!Component) {
    console.warn('[Section] Unknown section type:', section._type, section)
    return (
      <div style={{padding:'2rem', background:'#ffe3e3', color:'#8a1c1c', borderRadius:8}}>
        <p style={{margin:0}}>Unknown section type: <code>{section._type}</code></p>
      </div>
    )
  }
  return <Component data={section} />
}
