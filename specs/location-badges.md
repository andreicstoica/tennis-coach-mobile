    # Location-Enhanced Practice Session Creation Spec

    ## Overview

    This spec defines a simple enhancement to the existing practice session creation flow by adding device location data. When users create a new practice session through the `NewPracticeSessionModal`, the app will capture their current location (latitude/longitude) and include it in the practice session creation via the new `createWithLocation` TRPC procedure. The backend will handle all court detection and badge updates automatically.

    ## User Flow

    ### 1. Location Permission Request

    - When `NewPracticeSessionModal` opens, automatically request location permissions
    - Use `expo-location` to request foreground permissions
    - Handle permission granted/denied states gracefully
    - Continue with existing flow regardless of permission status

    ### 2. Location Data Capture

    - If permissions granted, capture current position using `Location.getCurrentPositionAsync()`
    - Store location data in component state
    - Show subtle loading indicator if location capture is in progress
    - Provide fallback behavior if location capture fails

    ### 3. Enhanced Practice Session Creation

    - When user submits focus area, include location data in API call
    - Use new `createWithLocation` endpoint if location available
    - Fall back to existing `create` endpoint if location unavailable
    - Backend automatically handles court detection and badge updates
    - Maintain existing user experience and error handling

    ### 4. Seamless Integration

    - Location capture happens transparently in background
    - No additional UI elements or user interaction required
    - Existing focus input and creation flow remains unchanged
    - All court detection and badge logic handled server-side

### Endpoint URLs

- **Existing Endpoint**: `https://courtly-xi.vercel.app/api/trpc/practiceSession.create`
- **Court Badge Endpoint**: `https://courtly-xi.vercel.app/api/trpc/court-badges.updateCourtBadges`
- **Method**: POST (all endpoints)
- **Headers**: Same authentication/content-type requirements

### Court Badge System Integration

The location data enables the court badge system, where users collect badges for playing at different tennis courts around NYC:

#### Database Schema

```typescript
export type CourtBadge = {
  courtName: string;
  firstUnlockedAt: string;
  timesVisited: number;
};

export const courtBadges = pgTable('court-badges', {
  id: serial('id').primaryKey(),
  userId: text('user_id')
    .references(() => user.id, { onDelete: 'cascade' })
    .notNull()
    .unique(),
  courtBadges: jsonb('court_badges').$type<CourtBadge[]>().default([]),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
```

#### Court Badge Router

```typescript
export const courtBadgesRouter = createTRPCRouter({
  getCourtBadges: protectedProcedure.query(async ({ ctx }) => {
    const courtBadgesArr = await ctx.db.query.courtBadges.findFirst({
      where: eq(courtBadges.userId, ctx.user.id),
    });
    return courtBadgesArr?.courtBadges || [];
  }),

  updateCourtBadges: protectedProcedure
    .input(z.object({ courtName: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Get current badges, then either:
      // - Increment timesVisited if court already exists
      // - Create new badge with timesVisited = 1 if new court
      // - Upsert the updated courtBadges array
    }),
});
```

**Endpoint**: `court-badges.updateCourtBadges`  
**Input**: `{ courtName: string }` (e.g., `"central-park"`, `"fort-greene"`)  
**Behavior**: Automatically handles new badge creation or visit count increment

### Location-to-Badge Flow

When a practice session is created with location data, the backend automatically handles all court detection and badge updates:

1. **Client**: Send location data with practice session creation
2. **Server**: Receive `practiceSession.createWithLocation({ focus, latitude, longitude })`
3. **Server**: Automatically call `checkLocation(latitude, longitude)` from `court-helper.ts`
4. **Server**: If court detected (within 200m), automatically call `court-badges.updateCourtBadges({ courtName })`
5. **Server**: Badge either unlocked for new courts or visit count incremented for existing courts

**Client-Side Implementation:**

```typescript
// React Native app just sends location data
const inputData = {
  json: {
    focus: focus.trim(),
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
  },
};

// Backend handles everything else automatically
const response = await fetch(`${API_URL}/practiceSession.createWithLocation`, {
  method: 'POST',
  headers,
  body: JSON.stringify(inputData),
});
```

**No client-side court detection or badge logic needed** - the backend handles everything automatically when location data is provided.

### Court Detection Logic (Backend-Only)

The backend automatically handles court detection using the `checkLocation()` function from `court-helper.ts`:

```typescript
// Backend code - not implemented in React Native app
const courtLocations = [
  { name: 'fort-greene', latitude: 40.691086, longitude: -73.975854 },
  { name: 'central-park', latitude: 40.789949, longitude: -73.961942 },
  { name: 'riverside', latitude: 40.79733, longitude: -73.97675 },
  { name: 'randalls-island', latitude: 40.79296, longitude: -73.91943 },
  { name: 'hudson-river', latitude: 40.72724, longitude: -74.013901 },
  { name: 'fractal-tech', latitude: 40.715226, longitude: -73.949295 },
];

export function checkLocation(latitude: number, longitude: number): string | null {
  // Uses Haversine formula to calculate distance to each court
  // Returns court name if within 200m, otherwise null
}
```

**Overall Process:**

- Uses Haversine formula for accurate distance calculation
- 200-meter detection radius for each court
- Returns court name string if within radius, `null` if not at a recognized court
- Call `court-badges.updateCourtBadges` if court detected

  ## User Experience Considerations

  ### Performance
  - Location capture happens on modal open, not on submit
  - No blocking UI during location capture
  - Reasonable timeout prevents hanging indefinitely
  - Background location capture doesn't affect form interaction

  ### Privacy
  - Location permissions requested only when needed
  - Clear handling of permission denied scenarios
  - No location data stored in component state longer than necessary
  - Graceful degradation when location unavailable

  ### Reliability
  - Dual-endpoint strategy ensures high success rate
  - Existing error handling covers both paths
  - Location failure doesn't break core functionality
  - Consistent user experience regardless of location availability

  ### Badge Gamification
  - Location enables automatic court badge collection system for 6 NYC courts
  - **Supported Courts**: Central Park, Fort Greene, Riverside, Randalls Island, Hudson River, Fractal Tech
  - **Auto-Detection**: `checkLocation()` automatically detects courts within 200-meter radius using GPS coordinates
  - **Visit Tracking**: Backend automatically increments visit counts for return visits
  - **Zero Client Logic**: React Native app just sends court - backend handles all badge logic

  ## Testing Scenarios (keep this in mind, don't overindex on these)

  ### Client-Side (React Native)
  1. **Happy Path**: Location granted → captured → included in API call
  2. **Permission Denied**: User denies location → falls back to non-location flow
  3. **Location Timeout**: Slow GPS → timeout → falls back to non-location flow
  4. **Network Issues**: Test both endpoints handle network failures
  5. **Rapid Modal Actions**: Open/close modal quickly during location capture
  6. **Background/Foreground**: App backgrounded during location capture
  7. **Invalid Location Data**: Handle edge cases with malformed location data
  8. **Battery Optimization**: Verify location accuracy setting balances battery usage

  ## Migration Strategy
  - **Backwards Compatible**: Existing `create` endpoint remains functional, just hitting another endpoint now at the same time

  ## Implementation Summary

  ### React Native App (Simple Changes)
  - Capture device location when modal opens
  - Follow existing flow with `create` endpoint if location unavailable.
  - If location is available:
    -- see if there are any nearby courts using `checkLocation()`
    -- if there are, also hit the `court-badges` `updateCourtBadges` procedure endpoint with the court as an input.
  - The backend handles the rest
