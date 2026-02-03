# Additional Polls Fixes

## Date: January 19, 2026

## Issues Fixed

### Issue 1: Admins Can't See Yes/No Vote Breakdown ✅

**Problem**: Admin polls page only showed total vote count, not the breakdown of Yes vs No votes.

**Solution**: Updated the admin polls API and UI to display detailed vote statistics.

#### Changes Made:

1. **API Route**: `/src/app/api/admin/community/polls/route.ts`
   - Added calculation of `yesVotes` and `noVotes` for each poll
   - Returns polls with vote breakdown to admin

2. **Admin UI**: `/src/app/admin/community/polls/page.tsx`
   - Updated `Poll` interface to include `yesVotes` and `noVotes`
   - Added visual vote results bar (green for Yes, red for No)
   - Display shows:
     - Visual percentage bar
     - "X total votes"
     - "👍 Y Yes"
     - "👎 Z No"

**Example Display**:
```
[========GREEN========][===RED===]
150 total votes • 👍 100 Yes • 👎 50 No • Created Jan 19, 2026
```

---

### Issue 2: Closed Polls Still Showing to Community Members ✅

**Problem**: Polls that were closed (either by admin setting `active: false` or by passing the `closesAt` date) were still appearing for community members.

**Solution**: Updated the community polls API to filter out closed polls properly.

#### Changes Made:

1. **API Route**: `/src/app/api/community/polls/route.ts`
   - Added date-based filtering
   - Now filters polls by:
     - `active: true` (admin hasn't closed it)
     - AND (`closesAt` is null OR `closesAt` is in the future)
   - Polls are automatically hidden once they pass their `closesAt` date

**Query Logic**:
```typescript
where: { 
  active: true,
  OR: [
    { closesAt: null },        // No expiration date
    { closesAt: { gt: now } }  // Or hasn't expired yet
  ]
}
```

---

## How It Works Now

### Admin View (`/admin/community/polls`)
- ✅ See all polls (active and inactive)
- ✅ See total votes
- ✅ See Yes/No breakdown with percentages
- ✅ Visual vote results bar
- ✅ Toggle polls active/inactive
- ✅ Delete polls

### Community View (`/community/polls`)
- ✅ Only see active polls
- ✅ Only see polls that haven't expired
- ✅ See vote percentages after voting
- ✅ Vote Yes/No on open polls
- ✅ Polls automatically disappear when:
  - Admin sets `active: false`
  - Poll passes its `closesAt` date

---

## Testing Instructions

### Test 1: Admin Vote Breakdown
1. Log in as Admin
2. Go to `/admin/community/polls`
3. Create a test poll
4. Have several users vote Yes and No
5. **Expected**: Admin sees:
   - Visual bar showing Yes (green) vs No (red) percentages
   - "X total votes • 👍 Y Yes • 👎 Z No"

### Test 2: Closed Polls Hidden from Community
1. Log in as Admin
2. Create a poll with a `closesAt` date in the past
3. Log in as Alumni
4. Go to `/community/polls`
5. **Expected**: Poll does NOT appear

### Test 3: Inactive Polls Hidden from Community
1. Log in as Admin
2. Toggle a poll to "Closed" (inactive)
3. Log in as Alumni
4. Go to `/community/polls`
5. **Expected**: Poll does NOT appear

### Test 4: Active Future Polls Show to Community
1. Log in as Admin
2. Create a poll with `closesAt` date in the future
3. Keep it active
4. Log in as Alumni
5. Go to `/community/polls`
6. **Expected**: Poll DOES appear and can be voted on

---

## Files Modified

### 1. `/src/app/api/admin/community/polls/route.ts`
```typescript
// Added vote breakdown calculation
const [yesVotes, noVotes] = await Promise.all([
  db.communityPollVote.count({
    where: { pollId: poll.id, vote: true },
  }),
  db.communityPollVote.count({
    where: { pollId: poll.id, vote: false },
  }),
]);
```

### 2. `/src/app/admin/community/polls/page.tsx`
```typescript
// Added interface fields
interface Poll {
  // ... existing fields
  yesVotes: number;
  noVotes: number;
}

// Added visual vote bar and breakdown display
```

### 3. `/src/app/api/community/polls/route.ts`
```typescript
// Added date-based filtering
const now = new Date();
const polls = await db.communityPoll.findMany({
  where: { 
    active: true,
    OR: [
      { closesAt: null },
      { closesAt: { gt: now } }
    ]
  },
  // ...
});
```

---

## Database Schema Reference

```prisma
model CommunityPoll {
  id          String   @id @default(cuid())
  title       String
  description String?  @db.Text
  active      Boolean  @default(true)      // Admin can toggle
  closesAt    DateTime?                     // Auto-close date
  createdAt   DateTime @default(now())
  votes       CommunityPollVote[]
}

model CommunityPollVote {
  id        String   @id @default(cuid())
  pollId    String
  poll      CommunityPoll @relation(...)
  userId    String
  user      User     @relation(...)
  vote      Boolean  // true = yes, false = no
  createdAt DateTime @default(now())
  
  @@unique([pollId, userId])  // One vote per user per poll
}
```

---

## Success Criteria

### Admin Features ✅
- [x] See total vote count
- [x] See Yes vote count
- [x] See No vote count
- [x] See visual percentage bar
- [x] See all polls (active and inactive)
- [x] Toggle polls active/inactive
- [x] Delete polls

### Community Features ✅
- [x] Only see active polls
- [x] Only see non-expired polls
- [x] Polls auto-hide when closed
- [x] Polls auto-hide when expired
- [x] Can vote on open polls
- [x] See results after voting

---

## Edge Cases Handled

1. **Poll with no votes**: Shows "0 total votes • 👍 0 Yes • 👎 0 No"
2. **Poll with closesAt = null**: Never expires, stays open until admin closes
3. **Poll with closesAt in past**: Automatically hidden from community
4. **Poll toggled inactive**: Hidden from community immediately
5. **Admin viewing closed polls**: Can still see them in admin panel

---

## Next Steps

1. ✅ Test admin vote breakdown display
2. ✅ Test closed polls hidden from community
3. ✅ Test expired polls hidden from community
4. Consider adding:
   - Export poll results to CSV
   - Email notifications when polls close
   - Poll analytics dashboard
   - Scheduled poll activation
