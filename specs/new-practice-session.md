# New Practice Session Flow Spec

## Overview

This spec defines the flow for creating a new practice session with a chat focus area, automatically creating an associated chat, and navigating the user to that chat.

## User Flow

### 1. Trigger Modal

- User taps "New Practice Session" button (typically on main screen)
- `NewPracticeSessionModal` opens with slide animation

### 2. Input Focus Area

- Modal displays input field: "What do you want to focus on today?"
- User enters focus area (e.g., "Improve my backhand", "Work on serve placement")
- Input validation: minimum 3 characters required
- Real-time character count or validation feedback

### 3. Submit & Create Practice Session

- User taps "Create" button
- Show loading state (spinner on button, disable inputs)
- Call `trpc.practiceSession.create.mutate({ focus: userInput })`
- Handle success/error states

### 4. Create Associated Chat

- On successful practice session creation, extract the new `practiceSessionId`
- Immediately call `trpc.chat.create.mutate({ practiceSessionId })`
- This returns a new `chatId`

### 5. Navigate to Chat

- Close modal
- Navigate to chat screen with the new `chatId`
- Chat should show the focus area as the initial context/first message

## Technical Implementation

### API Calls Sequence

```typescript
// Step 1: Create practice session
const newPracticeSession = await trpc.practiceSession.create.mutate({
  focus: userInput,
});

// Step 2: Create chat for the practice session
const chatId = await trpc.chat.create.mutate({
  practiceSessionId: newPracticeSession[0].id,
});

// Step 3: Navigate to chat
router.push(`/chat/${chatId}`);
```

### State Management

- `loading`: boolean - tracks creation process
- `error`: string - displays any error messages
- `focus`: string - user input for focus area

### Error Handling

- Network errors: "Unable to connect. Please try again."
- Validation errors: "Please enter a focus area (minimum 3 characters)"
- Server errors: Display specific error message from API
- Allow retry without closing modal

### UI States

1. **Default**: Input field active, Create button enabled
2. **Loading**: Input disabled, Create button shows spinner, Cancel button disabled
3. **Error**: Error message displayed, inputs re-enabled for retry
4. **Success**: Brief success state before navigation (optional)

## Integration Points

### NewPracticeSessionModal Updates

- Add proper error handling for the two-step API process
- Implement sequential API calls with proper error boundaries
- Add navigation logic after successful creation

### Navigation

- Use router/navigation to push to `/chat/[chatId]` or equivalent
- Ensure proper cleanup of modal state
- Handle navigation stack appropriately

### Chat Screen

- Should load with the practice session context
- Display focus area as initial message or context
- Connect to existing chat functionality

## User Experience Considerations

- Keep modal open during API calls to show progress
- Provide clear feedback at each step
- Ensure smooth transition from modal to chat
- Handle edge cases (network issues, slow responses)
- Consider optimistic updates for better perceived performance

## Testing Scenarios

1. Happy path: Create session → Create chat → Navigate successfully
2. Network failure during practice session creation
3. Network failure during chat creation (after session created)
4. Invalid input handling
5. Modal dismissal during loading states
6. Rapid successive taps on Create button
