# Content Overlay System

This document explains how the content overlay system works, including the "CREATE DESIGN BUILD" layer and other UI elements that appear on top of the 3D visualization.

## Table of Contents

1. [Structure and Components](#structure-and-components)
2. [The "CREATE DESIGN BUILD" Layer](#the-create-design-build-layer)
3. [Z-Index Management](#z-index-management)
4. [Text Effects and Styling](#text-effects-and-styling)
5. [Responsive Design](#responsive-design)
6. [Button and UI Elements](#button-and-ui-elements)

## Structure and Components

The content overlay system consists of several key components:

### HeroContent Component

The `HeroContent.astro` component is the primary container for all text and UI elements that appear above the 3D visualization:

```
src/components/rebuild/HeroContent.astro
```

This component includes:
- The "CREATE DESIGN BUILD" title
- The "Transforming ideas into Digital Solutions" subtitle
- Service bullet points
- Call-to-action buttons

### Component Structure

```
HeroSection.astro
├── AmorphousPrism.astro (z-index: 5)
└── HeroContent.astro (z-index: 10+)
    ├── Title ("CREATE DESIGN BUILD")
    ├── Subtitle
    ├── ServiceBullets (using CrystalBulletItem components)
    └── Call-to-action buttons
```

## The "CREATE DESIGN BUILD" Layer

The "CREATE DESIGN BUILD" text is the main title element in the hero section. It's implemented in the HeroContent component:

```astro
<!-- From src/components/rebuild/HeroContent.astro -->
<div class="hero-rebuild-text-content">
  <!-- Title from SplashTitle.astro - Modified for vertical stacking -->
  <h1 class="hero-rebuild-title">
    <div class="hero-rebuild-title-word-wrapper"><span class="hero-rebuild-title-word">Create</span></div>
    <div class="hero-rebuild-title-word-wrapper"><span class="hero-rebuild-title-word">Design</span></div>
    <div class="hero-rebuild-title-word-wrapper"><span class="hero-rebuild-title-word">Build</span></div>
  </h1>

  <!-- Subtitle -->
  <div class="hero-rebuild-mid-content">
    <p class="hero-rebuild-transforming-text">Transforming ideas into</p>
    <p class="hero-rebuild-digital-solutions">Digital Solutions</p>
    
    <!-- Service Bullets -->
    <div class="hero-rebuild-bullets-container">
      {serviceItems.map(item => (
        <CrystalBulletItem
          icon={item.icon}
          text={item.text}
          delay={item.delay} 
        />
      ))}
    </div>
  </div>

  <!-- Buttons -->
  <div class="hero-rebuild-buttons">
    <a href="#placeholder" class="hero-rebuild-button">Our Services</a>
    <a href="#placeholder" class="hero-rebuild-button">Our Process</a>
  </div>
</div>
```

### Styling the Title

The title uses a vertical stack layout with each word ("Create", "Design", "Build") as a separate element for better control over spacing and effects:

```css
/* From src/components/rebuild/styles.css */
.hero-rebuild-title {
  font-size: 4rem;
  font-weight: bold;
  margin-bottom: 1rem;
  text-shadow: 0 0 10px rgba(0, 0, 0, 0.7);
  line-height: 1.0;
}

.hero-rebuild-title-word-wrapper {
  margin-bottom: 0.5rem;
}

.hero-rebuild-title-word {
  background: linear-gradient(135deg, #ff00ff 0%, #00ffff 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  display: inline-block;
  padding: 0.2rem 1rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}
```

## Z-Index Management

The overlay system uses carefully planned z-index values to ensure proper stacking order:

### Z-Index Hierarchy

1. **Background Elements**: z-index 1-4
2. **3D Visualization**: z-index 5
3. **Content Container**: z-index 10
4. **Title Elements**: z-index 15
5. **Interactive Elements**: z-index 20

```css
/* Z-index management in styles.css */
.hero-rebuild-canvas-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1; /* Low z-index */
  pointer-events: auto; /* Allow canvas interaction */
}

.hero-rebuild-content-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10; /* Higher z-index than canvas */
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: none; /* Allow clicks to pass through container to canvas */
}

.hero-rebuild-text-content {
  pointer-events: auto; /* Re-enable pointer events for the text block */
}
```

### Pointer Event Management

The system uses `pointer-events` CSS property to control click interactions:

1. **Content Container**: `pointer-events: none` - allows clicks to pass through to the 3D canvas
2. **Text Content**: `pointer-events: auto` - re-enables click interactions for text and buttons
3. **Canvas**: `pointer-events: auto` - ensures 3D object can be interacted with

## Text Effects and Styling

The text elements use various effects for enhanced visual appeal:

### Gradient Text

```css
.hero-rebuild-title-word {
  background: linear-gradient(135deg, #ff00ff 0%, #00ffff 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
```

### Text Shadows

```css
.hero-rebuild-digital-solutions {
  color: #00ffaa;
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 2rem;
  text-shadow: 
    0 0 20px rgba(0, 255, 170, 0.7),
    0 0 30px rgba(0, 255, 170, 0.4);
}
```

### Animation Effects

```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.hero-rebuild-transforming-text {
  animation: fadeIn 0.5s ease-out forwards;
  animation-delay: 0.2s;
  opacity: 0;
}

.hero-rebuild-digital-solutions {
  animation: fadeIn 0.5s ease-out forwards;
  animation-delay: 0.4s;
  opacity: 0;
}
```

## Responsive Design

The overlay system adapts to different screen sizes:

### Mobile Adjustments

```css
/* Mobile adaptations */
@media (max-width: 768px) {
  .hero-rebuild-title {
    font-size: 3rem; /* Smaller font size on mobile */
  }
  
  .hero-rebuild-digital-solutions {
    font-size: 1.8rem;
  }
  
  .hero-rebuild-buttons {
    flex-direction: column; /* Stack buttons vertically */
    gap: 1rem;
  }
}
```

### Container Positioning

```css
/* Responsive container position */
.hero-rebuild-content-container {
  padding: 2rem; /* Base padding */
  box-sizing: border-box;
}

@media (max-width: 768px) {
  .hero-rebuild-content-container {
    padding: 1.5rem; /* Reduced padding on mobile */
    align-items: center; /* Center content vertically */
  }
}
```

## Button and UI Elements

The overlay includes interactive UI elements:

### Button Styling

```css
.hero-rebuild-button {
  display: inline-block;
  padding: 0.8rem 1.5rem;
  background: linear-gradient(135deg, #ff00ff 0%, #00ffff 100%);
  color: white;
  font-weight: bold;
  text-decoration: none;
  border-radius: 4px;
  transition: all 0.3s ease;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 0 10px rgba(0, 255, 255, 0.2);
}

.hero-rebuild-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15), 0 0 12px rgba(0, 255, 255, 0.3);
}
```

### Service Bullet Points

The service bullet points use a custom component called `CrystalBulletItem.astro`:

```astro
<!-- CrystalBulletItem.astro -->
---
export interface Props {
  icon: string;
  text: string;
  delay: number;
}

const { icon, text, delay } = Astro.props;
---

<div class="crystal-bullet-item" style={`animation-delay: ${delay}ms`}>
  <div class="crystal-bullet-icon">
    <i class={icon}></i>
  </div>
  <span class="crystal-bullet-text">{text}</span>
</div>

<style>
  .crystal-bullet-item {
    display: flex;
    align-items: center;
    margin-bottom: 0.75rem;
    animation: bulletFadeIn 0.5s ease forwards;
    opacity: 0;
  }
  
  .crystal-bullet-icon {
    width: 24px;
    height: 24px;
    background: linear-gradient(135deg, #ff00ff 0%, #00ffff 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 1rem;
    box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
  }
  
  .crystal-bullet-text {
    color: white;
    font-size: 1.1rem;
  }
  
  @keyframes bulletFadeIn {
    from { opacity: 0; transform: translateX(-20px); }
    to { opacity: 1; transform: translateX(0); }
  }
</style>
```

### Service Items Configuration

The list of services is defined as an array of objects:

```javascript
// From src/components/ServiceItems.js
export const serviceItems = [
  {
    icon: "icon-web",
    text: "Web Application Development",
    delay: 300
  },
  {
    icon: "icon-mobile",
    text: "Mobile Applications",
    delay: 400
  },
  {
    icon: "icon-cloud",
    text: "Cloud Solutions",
    delay: 500
  },
  {
    icon: "icon-ux",
    text: "UX/UI Design",
    delay: 600
  }
];
```

This modular approach allows for easy modification of the services listed in the hero section. 