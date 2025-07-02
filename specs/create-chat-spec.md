# Create Practice Session Flow – Product Spec (Mobile)

## Overview

This flow allows users to create a new practice session from the Home tab. The user provides a "focus" (e.g., "improve my backhand"), which is used to create a practice session via your backend TRPC API. The focus is then sent as the first message in a chat, triggering the AI to generate a practice plan (JSON: warmup, drill, minigame).

---

## User Flow

1. **Entry Point**
   - User lands on the Home tab.
   - "New Practice Session" button is visible.

2. **Focus Input**
   - Tapping the button opens a modal or new screen.
   - Prompt: "What do you want to focus on today?"
   - Input: Free text (e.g., "Serve consistency").
   - Optionally, show recent or suggested focuses.

3. **Backend Integration**

   **a. Create Practice Session**
   - On submit, call the TRPC endpoint for creating a practice session.
   - Reference: [`practice-session.ts`](https://github.com/andreicstoica/tennis-coach/blob/main/src/server/api/routers/practice-session.ts)
   - Endpoint: `practiceSession.create`
   - Payload: `{ focus: string }`
   - Response: Practice session object (including session ID).

   **b. Create Chat with Focus**
   - Immediately after, call the TRPC endpoint to create a chat for this session.
   - Reference: [`chat.ts`](https://github.com/andreicstoica/tennis-coach/blob/main/src/server/api/routers/chat.ts)
   - Endpoint: `chat.create`
   - Payload: `{ sessionId: string, message: string }` (message = user's focus)
   - Response: Chat object, including the AI's response.

   **c. AI Tool Call**
   - The AI interprets the focus as a tool call to generate a practice plan.
   - The AI's response is a JSON object:
     ```json
     {
       "warmup": "jog around the court",
       "drill": "crosscourt backhands",
       "minigame": "first to ten backhand winners wins"
     }
     ```

4. **Display Practice Plan**
   - Parse the JSON and display the plan in a user-friendly format.
   - Each category (warmup, drill, minigame) is clearly labeled.

5. **Session Management**
   - Save the session and chat to the user's history.
   - User can revisit the session.

---

## API Integration Details

- **practiceSession.create**
  - Method: `mutation`
  - Input: `{ focus: string }`
  - Output: `{ id: string, focus: string, ... }`
  - [See implementation](https://github.com/andreicstoica/tennis-coach/blob/main/src/server/api/routers/practice-session.ts)

- **chat.create**
  - Method: `mutation`
  - Input: `{ sessionId: string, message: string }`
  - Output: `{ id: string, messages: [...], aiResponse: { warmup, drill, minigame } }`
  - [See implementation](https://github.com/andreicstoica/tennis-coach/blob/main/src/server/api/routers/chat.ts)

---

## Requirements

- **UI Components**
  - Home tab with "New Practice Session" button.
  - Modal/screen for focus input.
  - Loading state while waiting for backend.
  - Error handling for API failures.
  - Practice plan display.

- **Data Handling**
  - Store session and chat data in DB, should be handled by tRPC.
  - Support for session history.

- **Edge Cases**
  - Handle backend or AI errors gracefully.

---

## Success Criteria

- Users can create a new practice session from the Home tab.
- The focus is sent to the backend and a session is created.
- The AI reliably generates a practice plan.
- The plan is clearly presented and actionable.
- Sessions are saved and accessible in history.

---

## References

- [practice-session.ts (TRPC endpoint)](https://github.com/andreicstoica/tennis-coach/blob/main/src/server/api/routers/practice-session.ts)
- [chat.ts (TRPC endpoint)](https://github.com/andreicstoica/tennis-coach/blob/main/src/server/api/routers/chat.ts)

---

## Future Enhancements

- Add multimedia (videos, images) to drills/minigames.
- support for adding location to the practice session from the mobile device (will need a practice-session table update in the DB to include an optional location field.) this will support a future feature to collect badges for practice-sessions created at NYC public tennis courts (like central park, fort greene, etc.)
