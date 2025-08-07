# TestFlight Improvements

## Overview

This document tracks improvements and fixes needed after testing the app via TestFlight.

## Issues & Improvements

### UI/UX Issues

- [x] **Swipe Navigation**: Can swipe left even when at the very start (no previous step available)
- [x] **Haptics Missing**: No haptic feedback for interactions
- [x] **Swipe Sensitivity**: Too bouncy and easy to accidentally swipe left/right with fingers
- [x] **Keyboard Dismissal**: Keyboard can't be dismissed by tapping outside text inputs
- [x] **Keyboard UI**: UI doesn't scroll up to accommodate keyboard on auth screens
- [x] **Keyboard UI Practice**: UI doesn't move up for keyboard when creating new practice session
- [x] **Profile Layout**: Too much bottom space under sign out button
- [x] **Loading UI**: Duplicate loading indicators (spinner + "loading sessions" text) when refreshing previous sessions

### Performance Issues

- [x] **App State Management**: App defaults back to home page instead of maintaining previous location when leaving app
- [ ] **Practice Session Generation**: Takes too long, phone goes to sleep during generation

### Bug Fixes

- [ ] **Duplicate Practice Sessions**: Creates two practice session requests when app goes to background during generation
- [ ] **Google Sign In**: Redirects to web version instead of back to app

### Feature Enhancements

- [ ] **App State Persistence**: Maintain user's location when leaving/returning to app
- [ ] **Background Task Handling**: Better handling of long-running tasks when app goes to background

## Testing Notes

- TestFlight Build: 41
- Version 1.0.0
- Test Date: Aug 7 25
- Testers: Me (Andrei)a

## Status

- [ ] Not Started
- [ ] In Progress
- [ ] Completed
- [ ] Blocked

---

_Add your specific improvements and feedback below:_

- still missing 3d badges (was causing build issues) - maybe we can try again once we fix the bugs.
