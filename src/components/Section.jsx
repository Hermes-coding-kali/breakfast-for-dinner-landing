// src/components/Section.jsx
import React from 'react'

// Lazy imports (unchanged)
const HeroSection = React.lazy(() => import('./HeroSection'))
const AboutSection = React.lazy(() => import('./AboutSection'))
const FeaturedItemSection = React.lazy(() => import('./FeaturedItemSection'))
const EmailSignupSection = React.lazy(() => import('./EmailSignup'))
const FoodSortGameSection = React.lazy(() => import('./FoodSortGame'))

const registry = {
  heroSection: HeroSection,
  aboutSection: AboutSection,
  featuredItemSection: FeaturedItemSection,
  emailSignupSection: EmailSignupSection,
  foodSortGameSection: FoodSortGameSection,
}

// 👇 ACCEPT THE OFFSET PROP HERE
export default function Section({section, offset}) {
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
  // 👇 PASS IT TO THE ACTUAL SECTION COMPONENT AS `headerHeight`
  return <Component data={section} headerHeight={offset} />
}