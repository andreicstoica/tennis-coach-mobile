# Profile Update Spec - Court Badge Integration

## Overview

This spec defines the enhancement of the user Profile screen to display collected court badges alongside existing profile information. Users will see visual badges for NYC tennis courts they've visited, including visit counts and achievement dates. The profile maintains existing elements (username, email, member since, sign out) while adding a scrollable court badges section.

## User Flow

### 1. Profile Screen Access

- User navigates to Profile tab
- Screen loads with existing profile information
- Court badges section loads asynchronously below profile info

### 2. Court Badges Display

- Visual badge grid showing all visited courts
- Each badge displays:
  - Court badge image from `/assets/images/badges/`
  - Court name (formatted for display)
  - Visit count (e.g., "Played 3 times")
  - First unlock date (optional)
- Badges ordered by most recently visited or most frequently played

### 3. Badge Interaction

- Badges are primarily display-only (no tap actions required)
- Scrollable section if many badges collected
- Loading states for badge data retrieval

### 4. Existing Profile Elements (Maintained)

- Username
- Email address
- Member since date
- Sign out button
- All existing styling and positioning preserved

## Technical Implementation

### API Integration

**Court Badges Endpoint**: `https://courtly-xi.vercel.app/api/trpc/courtBadges.getCourtBadges`

Following the established pattern from other specs:

```typescript
// Fetch court badges
const url = `https://courtly-xi.vercel.app/api/trpc/courtBadges.getCourtBadges`;
const cookies = authClient.getCookie();
const headers: Record<string, string> = {};
if (cookies) {
  headers.Cookie = cookies;
}

const response = await fetch(url, {
  method: 'GET', // Query operation
  headers,
});

const data = await response.json();
const courtBadges = data.result?.data || data;
```

### Badge Data Structure

Based on the database schema shown:

```typescript
type CourtBadge = {
  courtName: string; // e.g., "fractal-tech", "central-park"
  timesVisited: number; // e.g., 1, 3, 7
  firstUnlockedAt: string; // ISO timestamp
};
```

### Image Mapping

Court badge images located in `/assets/images/badges/`:

- `central-park.png`
- `fort-greene.png`
- `fractal-tech.png`
- `hudson-river.png`
- `randalls-island.png`
- `riverside.png`

```typescript
const getBadgeImage = (courtName: string) => {
  const imageMap: Record<string, any> = {
    'central-park': require('../assets/images/badges/central-park.png'),
    'fort-greene': require('../assets/images/badges/fort-greene.png'),
    'fractal-tech': require('../assets/images/badges/fractal-tech.png'),
    'hudson-river': require('../assets/images/badges/hudson-river.png'),
    'randalls-island': require('../assets/images/badges/randalls-island.png'),
    riverside: require('../assets/images/badges/riverside.png'),
  };
  return imageMap[courtName];
};
```

### Display Name Formatting

```typescript
const formatCourtName = (courtName: string): string => {
  const nameMap: Record<string, string> = {
    'central-park': 'Central Park',
    'fort-greene': 'Fort Greene',
    'fractal-tech': 'Fractal Tech',
    'hudson-river': 'Hudson River',
    'randalls-island': 'Randalls Island',
    riverside: 'Riverside',
  };
  return nameMap[courtName] || courtName;
};
```

## UI/UX Implementation

### Profile Screen Layout

```
┌─────────────────────────────────────┐
│ [Existing Profile Header]          │
│ Username: john_doe                  │
│ Email: john@example.com            │
│ Member since: Jan 2024             │
├─────────────────────────────────────┤
│ Court Badges                        │
│ ┌─────┐ ┌─────┐ ┌─────┐            │
│ │Badge│ │Badge│ │Badge│            │
│ │ 3x  │ │ 1x  │ │ 5x  │            │
│ └─────┘ └─────┘ └─────┘            │
│ Central  Fort    Fractal           │
│ Park     Greene  Tech              │
│                                    │
│ [More badges if scrollable]        │
├─────────────────────────────────────┤
│ [Sign Out Button]                  │
└─────────────────────────────────────┘
```

### Badge Component Structure

```typescript
interface BadgeCardProps {
  courtName: string;
  timesVisited: number;
  firstUnlockedAt: string;
}

const BadgeCard: React.FC<BadgeCardProps> = ({ courtName, timesVisited, firstUnlockedAt }) => {
  return (
    <View style={styles.badgeCard}>
      <Image source={getBadgeImage(courtName)} style={styles.badgeImage} />
      <Text style={styles.courtName}>{formatCourtName(courtName)}</Text>
      <Text style={styles.visitCount}>Played {timesVisited} time{timesVisited !== 1 ? 's' : ''}</Text>
    </View>
  );
};
```

### State Management

```typescript
const [courtBadges, setCourtBadges] = useState<CourtBadge[]>([]);
const [badgesLoading, setBadgesLoading] = useState(true);
const [badgesError, setBadgesError] = useState<string | null>(null);

useEffect(() => {
  fetchCourtBadges();
}, []);
```

### Loading States

- **Profile Info**: Existing loading pattern maintained
- **Court Badges**: Separate loading state with skeleton placeholders
- **Badge Images**: Lazy loading with fallback handling

### Error Handling

- **Network Errors**: "Unable to load court badges. Please try again."
- **Empty State**: "No court badges yet. Start practicing to collect badges!"
- **Image Loading Errors**: Fallback placeholder or text-only badge

## Integration Points

### Profile Screen Updates

- Add court badges section below existing profile information
- Maintain existing layout and styling patterns
- Ensure ScrollView wrapper for entire profile content
- Preserve all existing functionality (sign out, etc.)

### Badge Section Integration

- **Section Header**: "Court Badges" with optional count
- **Grid Layout**: 2-3 badges per row depending on screen size
- **Responsive Design**: Adapt to different screen sizes
- **Accessibility**: Proper labels for screen readers

### Data Flow

1. **Profile Load**: Existing profile data loads first
2. **Badge Request**: Parallel API call for court badges
3. **Badge Display**: Render badges as data arrives
4. **Error Handling**: Show errors without breaking existing profile

## Performance Considerations

- **Lazy Loading**: Court badges load after profile essentials
- **Image Optimization**: Pre-load badge images or use optimized sizes
- **Caching**: Consider caching badge data for subsequent visits
- **Pagination**: If many badges, implement pagination or "load more"

## Testing Scenarios

1. **Happy Path**: Profile loads → Court badges load → Full display
2. **Empty Badges**: New user with no court visits
3. **Network Issues**: Badge API fails but profile remains functional
4. **Large Badge Count**: Many badges requiring scroll
5. **Missing Images**: Handle missing badge image files
6. **Slow Network**: Loading states and timeouts
7. **Authentication**: Ensure proper auth headers for badge API

## Accessibility

- **Screen Reader**: Proper labels for badge images and counts
- **Color Contrast**: Ensure text visibility on badge images
- **Touch Targets**: Adequate spacing between badges
- **Focus Management**: Proper tab order through badge grid

## Visual Design Notes

- **Badge Size**: Consistent sizing (e.g., 80x80 or 100x100)
- **Typography**: Clear, readable visit counts and court names
- **Spacing**: Adequate padding between badges and sections
- **Visual Hierarchy**: Clear separation between profile info and badges
- **Loading States**: Skeleton placeholders matching badge dimensions

```

This spec maintains the existing profile functionality while adding the court badge visualization you requested, following the patterns established in your other specs. The implementation handles all the technical requirements including API calls, image mapping, and proper error handling.
```
