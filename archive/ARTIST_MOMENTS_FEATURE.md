-e ---
> **ARCHIVED** — This document is superseded. See CLAUDE.md, BUILD_STATUS.md, CONTENT_GUIDE.md, or BACKEND_INTEGRATION.md.
---


> ⚠️ **DECOMMISSIONED** — This file is from the original project and is no longer the source of truth.
> See [CLAUDE.md](./CLAUDE.md) for current architecture, [BUILD_STATUS.md](./BUILD_STATUS.md) for project status,
> [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) for design rules, [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md) for integrations,
> and [CONTENT_GUIDE.md](./CONTENT_GUIDE.md) for content updates.
> Kept for historical reference only.

---

# Artist Moments Feature Documentation

## 🎨 Overview

The Artist Moments feature transforms the portfolio into a dynamic storytelling platform. It replaces the "Workshops" section with an intimate, blog-style experience that lets visitors connect with the artist's creative journey through photos, videos, and personal narratives.

## ✨ What's New

### 1. **Artist Moments Section (Homepage)**
**File**: `src/components/ServicesSection.tsx` (renamed conceptually to ArtistMomentsSection)

**Features**:
- Eye-catching teaser section with 3-image grid
- Stats display (24 Moments, Updated Weekly)
- Beautiful hover effects
- Direct navigation to full moments page
- Warm background with decorative elements

**Design**:
- Three-image preview grid (1 large + 2 small)
- Camera, Heart, and Sparkles icons for visual interest
- Terracotta and sage accent colors
- Smooth animations on scroll

### 2. **Moments Gallery Page**
**File**: `src/pages/MomentsPage.tsx`

**Features**:
- Masonry-style card grid (3 columns on desktop)
- Filter by moment type: Studio, Exhibition, Process, Travel, Inspiration, Personal
- Like/favorite functionality with heart icon
- Featured moment badges
- Type-coded badges with distinct colors
- Mood tags (Hopeful, Meditative, etc.)
- Smooth scroll animations

**Card Information**:
- Title
- Date
- Location
- Mood
- Excerpt (3-line clamp)
- Cover image with hover zoom
- Type badge
- Featured badge (if applicable)
- Like button

### 3. **Individual Moment Detail Page**
**File**: `src/pages/MomentDetailPage.tsx`

**Features**:
- Full-screen hero image
- Complete story text with beautiful typography
- Multi-image gallery
- Image lightbox with navigation
- Related moments section
- Tag system
- Share functionality
- Like/love interaction
- Metadata display (date, location, mood)

**Interactive Elements**:
- Click any image to open lightbox
- Navigate through images with arrows
- Close lightbox with X or click outside
- Image counter (e.g., "2 / 5")
- Related moments clickable to navigate

### 4. **Data Structure**
**File**: `src/data/moments.ts`

**Moment Interface**:
```typescript
interface ArtistMoment {
  id: number;
  title: string;
  date: string;
  type: MomentType;
  location?: string;
  excerpt: string;
  content: string;
  media: MomentMedia[];
  tags: string[];
  featured?: boolean;
  mood?: string;
}
```

**Pre-loaded Content**:
8 rich, authentic artist moments including:
- First Light in the New Studio (Featured)
- Hands Deep in Earth
- Vernissage: A Night of Connections (Featured)
- Color Studies at Dawn
- Sketching Strangers at Café de Flore
- When Nothing Feels Right
- Master Class with Marie Laurent (Featured)
- Sunset from Mont Saint-Michel

## 🎯 Moment Types & Colors

Each moment type has a distinct visual identity:

| Type | Color | Description |
|------|-------|-------------|
| **Studio** | Clay (#C4956A) | Studio sessions, workspace moments |
| **Exhibition** | Terracotta (#A0522D) | Gallery openings, shows, exhibitions |
| **Process** | Sage (#7C8B6F) | Creative process, technique exploration |
| **Travel** | Gold (#B8A088) | Travel inspiration, location studies |
| **Inspiration** | Charcoal (#2D2A26) | Sources of inspiration, observations |
| **Personal** | Muted (#9E9890) | Personal reflections, struggles, victories |

## 🚀 User Journey

1. **Homepage** → See teaser with 3 preview images
2. **Click "Explore All Moments"** → Navigate to full gallery
3. **Browse & Filter** → Filter by type, see all moments
4. **Like Moments** → Click heart to favorite
5. **Click Moment** → Read full story with images
6. **View Gallery** → Click images for lightbox view
7. **Explore Related** → Discover similar moments
8. **Share** → Share favorite moments

## 📱 Responsive Design

### Desktop (1024px+)
- 3-column grid on moments page
- Side-by-side layouts
- Full lightbox with navigation

### Tablet (768px - 1023px)
- 2-column grid
- Adjusted spacing
- Responsive navigation

### Mobile (< 768px)
- Single column
- Stacked layouts
- Touch-optimized interactions
- Swipe support in lightbox

## 🎨 Design System Integration

### Typography
- **Titles**: Playfair Display (serif)
- **Body**: DM Sans (sans-serif)
- **Dates/Meta**: Uppercase, tracked

### Colors
- Maintains warm, earthy palette
- Type-specific badge colors
- Consistent hover states
- Terracotta for CTAs

### Animations
- Scroll reveal on cards
- Hover zoom on images
- Smooth page transitions
- Lightbox fade in/out

## 💡 Content Guidelines

### Writing Moments

**Title** (4-8 words):
- Evocative, specific
- Avoid generic titles
- Examples: "First Light in the New Studio", "Hands Deep in Earth"

**Excerpt** (20-40 words):
- Hook that draws reader in
- Hint at the story
- Don't reveal everything

**Content** (300-800 words):
- Write in first person
- Be honest and vulnerable
- Include sensory details
- Break into 3-5 paragraphs
- Show, don't just tell

**Media**:
- 1-5 images per moment
- High quality, authentic
- Action shots over posed
- Behind-the-scenes feel

**Tags**:
- 3-6 relevant tags
- Lowercase
- Specific and searchable

## 🔧 Adding New Moments

Edit `src/data/moments.ts`:

```typescript
{
  id: 9,
  title: 'Your Moment Title',
  date: '2024-02-15', // ISO format
  type: 'studio', // or exhibition, process, etc.
  location: 'Paris, France',
  excerpt: 'Brief teaser that captures attention...',
  content: `Full story here.
  
  Use paragraph breaks for readability.
  
  Write authentically and personally.`,
  media: [
    {
      type: 'image',
      url: '/path-to-image.jpg',
      alt: 'Descriptive alt text',
      caption: 'Optional caption'
    }
  ],
  tags: ['studio', 'process', 'clay'],
  featured: false,
  mood: 'Reflective'
}
```

## 🎭 Interactive Features

### Like System
- Heart icon on each moment card
- Toggle on/off
- Visual feedback (fill color change)
- Stored in component state (could be localStorage)

### Lightbox Gallery
- Click any image to open
- Navigate with arrows or keyboard
- Close with X, Esc, or click outside
- Shows image counter
- Displays captions

### Filtering
- Click type buttons to filter
- "All Moments" shows everything
- Instant filter application
- Maintains scroll position

## 📊 Performance

### Optimizations
- Lazy load images below fold
- Scroll-triggered animations (useScrollReveal)
- Efficient filtering (client-side)
- Optimized image sizes

### Best Practices
- Keep moment count reasonable (< 50)
- Compress images before upload
- Use appropriate image formats
- Implement pagination if needed

## 🎬 Animation Details

### Page Transitions
- Fade in: 0.8s duration
- Staggered card reveals
- Smooth scroll to top

### Hover Effects
- Image zoom: 1.05 scale
- Color transitions: 300-500ms
- Transform: translate and scale

### Scroll Reveals
- Opacity: 0 → 1
- Y-translate: 20px → 0
- Stagger: 100ms per item

## 🔮 Future Enhancements

Potential additions:
- Video support (already structured)
- Comment system
- Search functionality
- Archive by date
- RSS feed
- Social sharing with preview
- Newsletter signup
- Print-friendly version
- Audio captions
- Multiple language support

## 🎨 Styling Tips

### Customizing Colors
Update `tailwind.config.js` for global changes, or modify inline classes in component files for specific adjustments.

### Mood System
Add new moods by simply including them in moment data. The UI will display them automatically.

### Badge Styles
Modify the `getTypeColor()` function in `MomentsPage.tsx` and `MomentDetailPage.tsx` to customize badge appearances.

## 📝 Content Strategy

### Posting Frequency
- Weekly: 1 new moment
- Monthly: 4-5 moments
- Mix types for variety
- Feature 1-2 per month

### Content Mix
- 30% Studio/Process
- 20% Exhibition
- 20% Personal
- 15% Travel
- 15% Inspiration

### Engagement
- Tell complete stories
- Use high-quality images
- Be vulnerable and honest
- Show process, not just results
- Respond to engagement (future feature)

---

**Transform your portfolio into a living diary.** Artist Moments turns your portfolio into a dynamic, engaging platform that builds deeper connections with your audience through authentic storytelling.
