# Animation Pattern Reference Guide

## Quick Reference - Common Animation Patterns

### Pattern 1: Page Header
```tsx
<div className="animate-slide-down">
  <h1 className="text-2xl font-bold">Page Title</h1>
  <p className="text-gray-600">Subtitle</p>
</div>
```

### Pattern 2: Interactive Button
```tsx
<button className="hover-scale transition-smooth bg-brand-purple hover:bg-brand-purple/90">
  Action Button
</button>
```

### Pattern 3: Form Section
```tsx
<div className="animate-slide-down bg-white rounded-lg p-6">
  {/* Form content */}
</div>
```

### Pattern 4: Filter/Search Section
```tsx
<div className="bg-white rounded-lg animate-slide-up">
  {/* Search and filter controls */}
</div>
```

### Pattern 5: Staggered List Items
```tsx
<div className="space-y-3">
  {items.map((item, index) => (
    <div 
      key={item.id}
      className="animate-fade-in"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Item content */}
    </div>
  ))}
</div>
```

### Pattern 6: Status Messages
```tsx
{showSuccess && (
  <div className="p-3 bg-green-100 text-green-700 animate-slide-down">
    ✓ Success message
  </div>
)}
```

### Pattern 7: Empty State
```tsx
{items.length === 0 && (
  <div className="text-center py-8 animate-fade-in">
    <EmptyIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
    <p className="text-gray-600">No items found</p>
  </div>
)}
```

### Pattern 8: Grid Animation
```tsx
<div className="grid grid-cols-3 gap-4 animate-stagger">
  {stats.map((stat, index) => (
    <div 
      key={stat.id}
      className="bg-white p-6 animate-fade-in"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Stat content */}
    </div>
  ))}
</div>
```

## Animation Classes Explained

### Entry Animations

| Class | Duration | Effect | Use Case |
|-------|----------|--------|----------|
| `animate-slide-down` | 0.4s | Enters from top | Page headers, top content |
| `animate-slide-up` | 0.4s | Enters from bottom | Filter sections, bottom content |
| `animate-fade-in` | 0.3s | Fades in | Individual items, messages |
| `animate-stagger` | 0.5s | Base stagger animation | Grid/list base container |

### Transition Classes

| Class | Effect | Use Case |
|-------|--------|----------|
| `transition-smooth` | Smooth cubic-bezier timing | All interactive elements |
| `hover-scale` | Scales to 105% on hover | Buttons, clickable cards |

## Combining Animations

### Header with Button
```tsx
<div className="flex justify-between items-center animate-slide-down">
  <h1>Title</h1>
  <button className="hover-scale transition-smooth">Action</button>
</div>
```

### Table with Staggered Rows
```tsx
<table>
  <tbody className="divide-y">
    {items.map((item, i) => (
      <tr 
        key={item.id}
        className="hover:bg-gray-50 animate-fade-in"
        style={{ animationDelay: `${i * 30}ms` }}
      >
        {/* Row content */}
      </tr>
    ))}
  </tbody>
</table>
```

## Timing Guidelines

### Stagger Delays
- **Fast lists** (50+ items): 30ms per item
- **Medium lists** (10-50 items): 40-50ms per item
- **Slow stagger** (animated grids): 50-100ms per item

### Animation Duration Reference
- Very fast (attention): 0.2s
- Fast (entry): 0.3s
- Standard (slide): 0.4s
- Slow (complex): 0.5-0.6s

## Color Coding Animations

To remember which animation does what:
- 🔽 `slide-down` = Downward motion from top
- 🔼 `slide-up` = Upward motion from bottom
- 👁️ `fade-in` = Transparency to visible
- 🌊 `stagger` = Multiple items in sequence

## Performance Tips

✅ **Do:**
- Use stagger delays to prevent animation overlap
- Combine with hover-scale for feedback
- Use transition-smooth for consistency
- Limit stagger to 8-10 items maximum

❌ **Don't:**
- Animate too many elements simultaneously
- Use animations longer than 0.6s
- Apply animations to every element
- Forget to add delays to staggered items

## Customization

To modify animation timing globally:

```tsx
// In tailwind.config.ts
animation: {
  'slide-down': 'slideDown 0.5s ease-out',  // Changed from 0.4s
  'fade-in': 'fadeIn 0.4s ease-in',          // Changed from 0.3s
}
```

To add animation delay at application level:

```tsx
// Multiply delays for faster/slower stagger
style={{ animationDelay: `${index * 25}ms` }}  // Faster (25ms)
style={{ animationDelay: `${index * 75}ms` }}  // Slower (75ms)
```

## Accessibility Considerations

The animations respect `prefers-reduced-motion`:
```tsx
// Tailwind automatically respects this via @media (prefers-reduced-motion)
// Users with motion sensitivity won't see animations
```

To explicitly handle this:
```tsx
<div className="animate-slide-down motion-safe:animate-slide-down motion-reduce:animate-none">
  Content
</div>
```

## Testing Animations

In DevTools:
1. Open Console
2. Right-click element
3. Check computed animations
4. Verify `animation-delay` values
5. Check animation timing in Performance tab

## Common Issues & Solutions

**Problem**: Animations not showing
- Solution: Check if element is hidden with `display: none`
- Solution: Verify animation class is applied
- Solution: Check browser console for errors

**Problem**: Animations feel too fast/slow
- Solution: Adjust duration in tailwind.config.ts
- Solution: Modify stagger delay values
- Solution: Test on actual device (perceived speed differs)

**Problem**: Animations causing jank
- Solution: Use `transform` and `opacity` only
- Solution: Add `will-change: transform, opacity`
- Solution: Reduce number of animated elements

## Integration Examples

### With Forms
```tsx
{showForm && (
  <div className="animate-slide-down">
    <form className="space-y-4">
      {/* Form inputs */}
      <button className="hover-scale transition-smooth">Submit</button>
    </form>
  </div>
)}
```

### With Lists
```tsx
<div className="space-y-2 animate-stagger">
  {items.map((item, i) => (
    <div key={item.id} className="animate-fade-in hover-scale" style={{animationDelay: `${i*40}ms`}}>
      {item.name}
    </div>
  ))}
</div>
```

### With Data Tables
```tsx
<table className="w-full">
  <tbody>
    {rows.map((row, i) => (
      <tr key={row.id} className="animate-fade-in hover-scale" style={{animationDelay: `${i*30}ms`}}>
        {/* Row cells */}
      </tr>
    ))}
  </tbody>
</table>
```

---

**Tip**: Keep animations subtle and purposeful. They should enhance UX, not distract from it!
