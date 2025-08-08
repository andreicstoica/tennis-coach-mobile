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

### Query/Mutation Patterns

Based on the existing `[id].tsx` implementation, API calls must follow specific patterns:

**For Queries (GET operations):**

```
   const inputJson = JSON.stringify({ json: { focus: focus.trim() } });
   const url = `https://courtly-xi.vercel.app/api/trpc/practiceSession.create?input=${inputJson}`;
   const response = await fetch(url, { method: 'POST', headers });
```

2. **Chat Creation**:
   ```typescript
   const chatInputJson = JSON.stringify({ json: { practiceSessionId } });
   const chatUrl = `https://courtly-xi.vercel.app/api/trpc/chat.create?input=${chatInputJson}`;
   const chatResponse = await fetch(chatUrl, { method: 'POST', headers });
   ```

This should now work reliably since it mirrors the exact pattern you've proven works in your existing chat functionality. The flow will create the practice session, create the associated chat, and navigate directly to the chat screen - all with proper error handling and user feedback.
