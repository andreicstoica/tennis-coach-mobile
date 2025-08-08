# Courtly Onboarding Flow

This document describes the implementation of the Courtly onboarding flow following the spec in `specs/signup-flow.md`.

## Overview

The onboarding flow consists of 5 main screens that guide users through the app's value proposition before asking them to sign up or sign in. This approach is designed to increase conversions by building interest and understanding before the authentication step.

## Flow Structure

### 1. Welcome Screen

- **Purpose**: Warm introduction with app value proposition
- **Key Elements**:
  - Courtly logo (tennis ball emoji)
  - Friendly greeting
  - Brief tagline about AI-powered coaching
- **Navigation**: "Let's Get Started" button

### 2. What Courtly Does Screen

- **Purpose**: Explain AI coach and example practice focuses
- **Key Elements**:
  - Examples of practice focus areas (Backhand technique, Serve accuracy, Match mentality)
  - Visual icons for each example
  - AI coach mention
- **Navigation**: "Next" button with back navigation

### 3. Badge Teaser Screen

- **Purpose**: Showcase collectible badges to spark curiosity
- **Key Elements**:
  - Visuals of badges for NYC tennis courts
  - Brief explanation of badge collection
  - Skip option available
- **Navigation**: "Show Me How" button with back navigation

### 4. Account Setup Screen

- **Purpose**: Sign up or sign in prompt
- **Key Elements**:
  - Clear CTA buttons for Sign Up and Sign In
  - Motivational copy about saving progress
- **Navigation**: Back navigation to previous screen

### 5. Final Welcome Screen

- **Purpose**: Confirmation and encouragement to start practicing
- **Key Elements**:
  - Motivational copy
  - Celebration icon
  - Start button
- **Navigation**: "Start Practicing" button

## Technical Implementation

### Components Structure

```
components/
├── OnboardingFlow.tsx          # Main flow controller
├── OnboardingScreen.tsx        # Base screen component
└── onboarding/
    ├── index.ts                # Export barrel
    ├── WelcomeScreen.tsx       # Screen 1
    ├── WhatCourtlyDoesScreen.tsx # Screen 2
    ├── BadgeTeaserScreen.tsx   # Screen 3
    ├── AccountSetupScreen.tsx  # Screen 4
    ├── FinalWelcomeScreen.tsx  # Screen 5
    └── ProgressIndicator.tsx   # Progress dots
```

### Key Features

1. **Progress Indicators**: Visual dots showing current step in the flow
2. **Navigation**: Back buttons on all screens except the first
3. **Skip Option**: Available on the badge teaser screen
4. **Responsive Design**: Adapts to light/dark themes
5. **Smooth Transitions**: State-based navigation between screens

### State Management

The flow uses React state to manage:

- Current step in the onboarding process
- Navigation between screens
- Form data for sign up/sign in

### Integration

The onboarding flow is integrated into the existing auth system:

- Replaces the previous simple auth screen
- Uses existing SignInForm and SignUpForm components
- Integrates with the auth context for user management

## Usage

The onboarding flow is automatically shown to unauthenticated users through the `AuthGate` component in `app/_layout.tsx`. The flow handles:

1. User education about the app
2. Account creation or sign in
3. Transition to the main app experience

## Customization

To modify the onboarding flow:

1. **Content**: Update copy in individual screen components
2. **Styling**: Modify styles in `OnboardingScreen.tsx` or individual screen components
3. **Flow**: Adjust navigation logic in `OnboardingFlow.tsx`
4. **Screens**: Add/remove screens by updating the step types and render logic

## Design Principles

- **Progressive Disclosure**: Information is revealed step by step
- **Value-First**: Users understand the app's value before authentication
- **Minimal Friction**: Clear navigation with skip options where appropriate
- **Visual Hierarchy**: Important elements are prominently displayed
- **Accessibility**: Proper contrast and touch targets for mobile use
