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
- Call practice session creation API with precise HTTP format
- Handle success/error states

### 4. Create Associated Chat

- On successful practice session creation, extract the new `practiceSessionId`
- Immediately call chat creation API with precise HTTP format
- This returns a new `chatId`

### 5. Navigate to Chat

- Close modal
- Navigate to chat screen with the new `chatId`
- Chat should show the focus area as the initial context/first message

## Technical Implementation

### Critical API Call Format

Based on the working implementation in `[id].tsx`, the API calls must follow this exact pattern:

```typescript
// Practice Session Creation
const inputJson = JSON.stringify({ json: { focus: userInput } });
const url = `https://courtly-xi.vercel.app/api/trpc/practiceSession.create?input=${inputJson}`;

const cookies = authClient.getCookie();
const headers: Record<string, string> = {};
if (cookies) {
  headers.Cookie = cookies;
}

const response = await fetch(url, {
  method: 'POST',
  headers,
});

// Chat Creation
const chatInputJson = JSON.stringify({ json: { practiceSessionId } });
const chatUrl = `https://courtly-xi.vercel.app/api/trpc/chat.create?input=${chatInputJson}`;

const chatResponse = await fetch(chatUrl, {
  method: 'POST',
  headers,
});
```

### API Calls Sequence

```typescript
// Step 1: Create practice session
const inputJson = JSON.stringify({ json: { focus: userInput.trim() } });
const url = `https://courtly-xi.vercel.app/api/trpc/practiceSession.create?input=${inputJson}`;
const cookies = authClient.getCookie();
const headers: Record<string, string> = {};
if (cookies) {
  headers.Cookie = cookies;
}

const response = await fetch(url, { method: 'POST', headers });
const data = await response.json();
const newPracticeSession = data.result?.data || data;

// Step 2: Create chat for the practice session
const chatInputJson = JSON.stringify({ json: { practiceSessionId: newPracticeSession[0].id } });
const chatUrl = `https://courtly-xi.vercel.app/api/trpc/chat.create?input=${chatInputJson}`;

const chatResponse = await fetch(chatUrl, { method: 'POST', headers });
const chatData = await chatResponse.json();
const chatId = chatData.result?.data || chatData;

// Step 3: Navigate to chat
router.push(`/practice/${chatId}`);
```

### Key Implementation Details

- **Input Wrapping**: All inputs must be wrapped in `{ json: { ...actualInput } }`
- **URL Format**: Use query parameters `?input=${JSON.stringify(wrappedInput)}`
- **HTTP Method**: Use POST for mutations
- **Authentication**: Must include cookies via `authClient.getCookie()`
- **Response Parsing**: Handle both `data.result?.data` and `data` formats
- **Error Handling**: Check `response.ok` and parse error text

### State Management

- `loading`: boolean - tracks creation process
- `error`: string - displays any error messages
- `focus`: string - user input for focus area

### Error Handling

- Network errors: "Unable to connect. Please try again."
- Validation errors: "Please enter a focus area (minimum 3 characters)"
- Server errors: Display specific error message from API response
- HTTP errors: Check response status and parse error text
- Allow retry without closing modal

### UI States

1. **Default**: Input field active, Create button enabled
2. **Loading**: Input disabled, Create button shows spinner, Cancel button disabled
3. **Error**: Error message displayed, inputs re-enabled for retry
4. **Success**: Brief success state before navigation (optional)

## Integration Points

### NewPracticeSessionModal Updates

- Replace TRPC client calls with manual fetch following exact pattern
- Add proper error handling for the two-step API process
- Implement sequential API calls with proper error boundaries
- Add navigation logic after successful creation

### Navigation

- Use router/navigation to push to `/practice/[chatId]` or equivalent
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
7. Authentication/cookie issues
8. Invalid API response formats
