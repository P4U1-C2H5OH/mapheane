-e ---
> **ARCHIVED** — This document is superseded. See CLAUDE.md, BUILD_STATUS.md, CONTENT_GUIDE.md, or BACKEND_INTEGRATION.md.
---


> ⚠️ **DECOMMISSIONED** — This file is from the original project and is no longer the source of truth.
> See [CLAUDE.md](./CLAUDE.md) for current architecture, [BUILD_STATUS.md](./BUILD_STATUS.md) for project status,
> [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) for design rules, [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md) for integrations,
> and [CONTENT_GUIDE.md](./CONTENT_GUIDE.md) for content updates.
> Kept for historical reference only.

---

# Events System - Complete Documentation

## 🎭 Overview

The **Events System** transforms your portfolio into a dynamic hub for exhibitions, workshops, artist talks, and art fairs. Visitors can discover upcoming events, learn detailed information, and sync events directly to their personal calendars.

---

## ✨ Features Implemented

### 1. **Enhanced Events Section (Homepage)**
**File**: `src/components/EventsSection.tsx`

**Features**:
- Shows 3 upcoming events with rich details
- Event type badges (color-coded)
- Date ranges and locations
- Direct navigation to event details
- "View All Events" link to gallery
- Smooth scroll animations

**Design**:
- Clean card layout with arrow icons
- Color-coded type badges
- Date and location icons
- Hover effects with translate animation

### 2. **Events Gallery Page**
**File**: `src/pages/EventsPage.tsx`

**Features**:
- Filter by event type (Exhibitions, Workshops, Talks, Fairs, Private)
- Separate sections for Upcoming and Past events
- Large event cards with images
- Quick info (date, location, price)
- Tags and excerpts
- Responsive grid layouts

**Event Cards Show**:
- Hero image
- Event type badge
- Title and subtitle
- Date range
- Venue and location
- Ticket information
- Description excerpt
- Tags
- "View Details" CTA

### 3. **Detailed Event Pages**
**File**: `src/pages/EventDetailPage.tsx`

**Features**:
- **Calendar Integration**:
  - Add to Google Calendar (one click)
  - Download .ics file (works with Apple Calendar, Outlook, etc.)
  - Dropdown selector for calendar options
  
- **Event Information**:
  - Hero image gallery
  - Complete description
  - Exhibition theme highlighted
  - Event highlights checklist
  - Opening hours breakdown
  - Ticket/admission info
  
- **Interactive Elements**:
  - RSVP button with confirmation
  - Share event functionality
  - Contact information (email, phone, website)
  - Featured artworks gallery
  - Related events recommendations
  
- **Visual Elements**:
  - Multiple event photos
  - Featured badge for important events
  - Type-coded color system
  - Clean, organized layout

### 4. **Comprehensive Event Data**
**File**: `src/data/events.ts`

**5 Pre-loaded Events**:

1. **Terre et Lumière** (Solo Exhibition) - Paris ⭐ Featured
   - March 15 - April 28, 2024
   - Opening reception with artist talk
   - 15 new works including ceramics and paintings
   
2. **Collective Voices** (Group Exhibition) - Brussels
   - April 10 - May 20, 2024
   - 12 contemporary European artists
   - Panel discussions and curator tours
   
3. **Creative Alchemy Workshop** - Vannes
   - May 4-5, 2024
   - 2-day hands-on mixed media workshop
   - Limited to 12 participants
   - €280 per person
   
4. **Artist Talk: The Poetry of Materials** - Paris ⭐ Featured
   - March 22, 2024
   - Intimate conversation about process
   - Q&A and reception
   - Free with RSVP
   
5. **Art Paris 2024** (Art Fair) - Grand Palais ⭐ Featured
   - April 4-7, 2024
   - International contemporary art fair
   - 150+ galleries
   - Artist present at booth

---

## 🎯 Event Types & Color Coding

Each event type has a distinct visual identity:

| Type | Color | Use Case |
|------|-------|----------|
| **Exhibition** | Terracotta (#A0522D) | Solo/group shows, gallery exhibitions |
| **Workshop** | Sage (#7C8B6F) | Hands-on classes, teaching sessions |
| **Talk** | Clay (#C4956A) | Artist talks, panel discussions, lectures |
| **Fair** | Gold (#B8A088) | Art fairs, markets, large-scale events |
| **Private** | Charcoal (#2D2A26) | Private viewings, exclusive events |

---

## 📅 Calendar Integration

### How It Works

The system generates calendar files in two formats:

**1. Google Calendar**
- Direct link to Google Calendar
- Opens in new tab
- Pre-fills all event details
- One-click add

**2. .ics File (Universal)**
- Download calendar file
- Works with:
  - Apple Calendar
  - Microsoft Outlook
  - Yahoo Calendar
  - Any calendar app supporting .ics

### What Gets Synced

- **Event Title** (with subtitle)
- **Start Date & Time**
- **End Date & Time**  
- **Location** (full address)
- **Description** (complete text)
- **Status**: Confirmed

### Technical Implementation

```typescript
// Generate .ics file
const handleDownloadICS = () => {
  const icsContent = generateICS(event);
  // Creates downloadable file
};

// Open Google Calendar
const handleGoogleCalendar = () => {
  const url = generateGoogleCalendarUrl(event);
  window.open(url, '_blank');
};
```

---

## 📊 Event Data Structure

```typescript
interface Event {
  id: number;
  title: string;
  type: EventType;
  status: EventStatus;
  subtitle?: string;
  description: string;
  theme: string;
  location: {
    venue: string;
    address: string;
    city: string;
    country: string;
    coordinates?: { lat: number; lng: number };
  };
  schedule: {
    startDate: string;
    endDate: string;
    openingReception?: string;
    hours: { [key: string]: string };
  };
  featured: boolean;
  images: string[];
  artworks?: number[];
  highlights: string[];
  ticketInfo?: {
    price: string;
    required: boolean;
    url?: string;
  };
  contact?: {
    email?: string;
    phone?: string;
    website?: string;
  };
  tags: string[];
}
```

---

## 🚀 User Journey

```
Homepage
    ↓ (See 3 upcoming events)
Click event card
    ↓
Event Detail Page
    ↓ (Read description, view images)
    ├─→ Add to Calendar (Google or .ics)
    ├─→ RSVP / Get Tickets
    ├─→ View location details
    ├─→ See featured artworks
    └─→ Explore related events
```

---

## 💡 Adding New Events

Edit `src/data/events.ts`:

```typescript
{
  id: 6,
  title: 'Your Event Title',
  subtitle: 'Optional Subtitle',
  type: 'exhibition', // or workshop, talk, fair, private
  status: 'upcoming',
  description: `Full description here.
  
  Multiple paragraphs supported.
  
  Rich formatting with linebreaks.`,
  theme: 'What the event explores or represents',
  location: {
    venue: 'Gallery Name',
    address: 'Street Address',
    city: 'City',
    country: 'Country',
    coordinates: { // Optional - for future map integration
      lat: 48.8566,
      lng: 2.3522
    }
  },
  schedule: {
    startDate: '2024-06-01',
    endDate: '2024-07-15',
    openingReception: '2024-06-01T18:00:00', // Optional
    hours: {
      'Tuesday-Friday': '11:00 AM - 6:00 PM',
      'Saturday': '12:00 PM - 8:00 PM',
      'Sunday-Monday': 'Closed'
    }
  },
  featured: false, // true for homepage feature
  images: [
    '/path-to-event-image-1.jpg',
    '/path-to-event-image-2.jpg'
  ],
  artworks: [1, 2, 5], // Optional - IDs of artworks in the event
  highlights: [
    'Artist present for opening',
    'Guided tours every weekend',
    'Limited edition catalog',
    'Wine and refreshments'
  ],
  ticketInfo: { // Optional
    price: 'Free admission',
    required: false,
    url: 'https://tickets.com' // If tickets needed
  },
  contact: { // Optional
    email: 'info@gallery.com',
    phone: '+33 1 23 45 67 89',
    website: 'https://gallery.com'
  },
  tags: ['exhibition', 'paris', 'contemporary', 'summer 2024']
}
```

---

## 🎨 Design System

### Typography
- **Event Titles**: Playfair Display, 3xl-5xl
- **Subtitles**: Italic, muted color
- **Body Text**: DM Sans, light weight
- **Metadata**: Small, uppercase, tracked

### Color Usage
- **Primary CTA**: Terracotta background
- **Secondary CTA**: Charcoal border
- **Success State**: Sage green
- **Badges**: Type-specific colors

### Spacing
- **Section Padding**: py-24 md:py-32
- **Card Gaps**: gap-8 md:gap-12
- **Content Max-Width**: max-w-6xl

---

## 📱 Responsive Behavior

### Desktop (1024px+)
- 3-column event grid
- Side-by-side event details
- Full calendar dropdown

### Tablet (768px - 1023px)
- 2-column grid for past events
- Stacked event details
- Touch-optimized buttons

### Mobile (< 768px)
- Single column everywhere
- Stacked all content
- Full-width CTAs
- Easy thumb reach

---

## 🎭 Event Highlights Feature

The highlights appear as a checklist showing what makes each event special:

```typescript
highlights: [
  'Opening reception with artist talk',
  'Guided tours every Saturday at 3 PM',
  'Limited edition catalog available',
  'Meet the artist sessions',
  'Wine and light refreshments'
]
```

Displayed with checkmark icons in a clean grid layout.

---

## 🎟️ RSVP & Ticketing

### Free Events
```typescript
ticketInfo: {
  price: 'Free admission',
  required: false
}
```
- No RSVP button shown
- Just calendar integration

### RSVP Required
```typescript
ticketInfo: {
  price: 'Free (RSVP required)',
  required: true,
  url: 'mailto:rsvp@gallery.com'
}
```
- Shows "RSVP Now" button
- Opens email or external link
- Confirmation state on click

### Paid Tickets
```typescript
ticketInfo: {
  price: '€25 general admission',
  required: true,
  url: 'https://tickets.com/event'
}
```
- Shows "Get Tickets" button
- Opens ticket purchase page
- External link indicator

---

## 🔗 Related Events

At the bottom of each event page:
- Shows 3 related events (same type)
- Excludes current event
- Only shows upcoming events
- Click to navigate to that event

---

## 📍 Location Information

### Displayed Info
- Venue name
- Full street address
- City and country
- Contact details

### Future Enhancement Ready
- Coordinates stored for map integration
- Can easily add Google Maps embed
- Ready for directions links

---

## 🎨 Featured Artworks

If event references artwork IDs:

```typescript
artworks: [1, 2, 4, 6]
```

The event page shows:
- Grid of featured artworks
- Artwork images
- Titles and years
- Links to artwork details (future)

---

## 📊 Event Status

Three status types:

1. **Upcoming** - Future events
   - Full details shown
   - Calendar integration enabled
   - RSVP/tickets active

2. **Ongoing** - Currently happening
   - Highlighted in list
   - Full interaction enabled

3. **Past** - Completed events
   - Grayed out display
   - Archive/reference only
   - Reduced interaction

---

## 🔮 Future Enhancements

Potential additions:

- [ ] Google Maps integration
- [ ] Directions to venue
- [ ] Waitlist for sold-out events
- [ ] Email reminders
- [ ] Push notifications
- [ ] Social media sharing with preview cards
- [ ] Event check-in system
- [ ] Photo gallery from past events
- [ ] Attendee count
- [ ] Reviews/testimonials
- [ ] Virtual event support (Zoom links)
- [ ] Multi-language support
- [ ] Print-friendly event flyers

---

## 🎯 Content Guidelines

### Event Titles
- Clear and specific
- 3-6 words ideal
- Evocative, not generic
- Examples:
  - ✅ "Terre et Lumière: Clay and Light"
  - ❌ "Art Exhibition"

### Descriptions
- 200-500 words
- 3-5 paragraphs
- Include:
  - What visitors will see
  - Why it's significant
  - What makes it special
  - Practical details
  
### Themes
- 1-2 sentences
- Conceptual/philosophical
- What the work explores
- Adds depth to description

### Highlights
- 4-6 bullet points
- Specific and actionable
- What attendees get
- Special features

---

## 📧 Contact Integration

Contact methods integrate seamlessly:

```typescript
contact: {
  email: 'gallery@example.com',    // mailto: link
  phone: '+33 1 23 45 67 89',       // tel: link
  website: 'https://gallery.com'    // External link
}
```

All clickable with appropriate icons.

---

## 🎨 Visual Examples

### Homepage Event Cards
```
[Type Badge]
→ Event Title
  Optional Subtitle
  
  📅 Date Range
  📍 Venue Name
      City, Country
      
  [View Details →]
```

### Event Detail Layout
```
[Hero Image]              [Event Info Card]
[Gallery Images]          📅 When
                         📍 Where
                         🕐 Hours
                         🎟️ Admission
                         
                         [Add to Calendar ▼]
                         [RSVP / Tickets]
                         [Share Event]
```

---

## ⚡ Performance Tips

- Keep event count reasonable (< 30 active)
- Optimize images before upload (WebP recommended)
- Archive past events regularly
- Use lazy loading for images
- Consider pagination for large event lists

---

**Transform your portfolio into an event hub.** The Events System makes it easy for your audience to discover, save, and attend your exhibitions, workshops, and talks—creating real-world connections with your art and practice.
