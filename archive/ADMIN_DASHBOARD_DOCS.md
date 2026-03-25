-e ---
> **ARCHIVED** — This document is superseded. See CLAUDE.md, BUILD_STATUS.md, CONTENT_GUIDE.md, or BACKEND_INTEGRATION.md.
---


> ⚠️ **DECOMMISSIONED** — This file is from the original project and is no longer the source of truth.
> See [CLAUDE.md](./CLAUDE.md) for current architecture, [BUILD_STATUS.md](./BUILD_STATUS.md) for project status,
> [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) for design rules, [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md) for integrations,
> and [CONTENT_GUIDE.md](./CONTENT_GUIDE.md) for content updates.
> Kept for historical reference only.

---

# Admin Dashboard Documentation

## 🎨 Overview

A complete Content Management System (CMS) for artists to manage their entire portfolio. The dashboard provides full control over gallery, moments, and orders with an elegant, professional interface.

---

## 🔐 Access

### Login as Artist/Admin

**Artist Account**:
- Email: `artist@email.com` or `aria@email.com`
- Password: any
- Role: `artist`

**Admin Account**:
- Email: `admin@email.com`
- Password: any
- Role: `admin`

Upon login, users with `artist` or `admin` roles are automatically redirected to the dashboard.

---

## ✨ Dashboard Features

### 1. **Overview Page**

**Stats Cards**:
- Total Artworks (with available count)
- Artist Moments (published stories)
- Total Revenue (from sold works)
- Pending Orders

**Recent Activity Feed**:
- New moments published
- Artworks sold
- New artworks added
- Moment interactions

**Quick Actions**:
- Add New Artwork
- Create Moment
- View Orders

**Top Performing Artworks**:
- Visual grid of best-selling pieces

---

### 2. **Gallery Manager** 🖼️

**Capabilities**:
- ✅ Create new artworks
- ✅ Edit existing artworks
- ✅ Delete artworks (with confirmation)
- ✅ Reorder artworks (drag & drop)
- ✅ Toggle availability (Available ↔ Sold)
- ✅ Real-time preview

**Artwork Fields**:
- Title *
- Medium (Painting/Drawing/Clay Model)
- Year
- Dimensions
- Technique
- Price (€) *
- Status (Available/Sold)
- Description
- Image Position (CSS object-position)

**Features**:
- Drag handle for reordering
- Quick status toggle
- Inline editing panel
- Thumbnail preview
- Form validation

---

### 3. **Moments Manager** ✨

**Capabilities**:
- ✅ Create new moments
- ✅ Edit existing moments
- ✅ Delete moments
- ✅ Add custom fields dynamically
- ✅ Track interactions (views, likes)
- ✅ Feature moments

**Standard Fields**:
- Title *
- Type (Studio/Exhibition/Process/Travel/Inspiration/Personal)
- Date
- Location
- Mood
- Featured toggle
- Excerpt (teaser)
- Content * (main story)
- Tags

**Custom Fields** (Dynamic):
- Text field
- Long text (textarea)
- Date field
- Can add unlimited custom fields
- Each with custom label and value

**Interaction Tracking**:
- View count
- Like count
- Displays for each moment

---

### 4. **Orders Manager** 📦

**Capabilities**:
- ✅ View all customer orders
- ✅ Order details modal
- ✅ Update order status
- ✅ Customer information
- ✅ Shipping details

**Order Information**:
- Order number
- Customer (name, email, phone)
- Shipping address
- Order items
- Total amount
- Payment method
- Order date
- Status

**Status Options**:
- Pending (yellow)
- Processing (blue)
- Shipped (purple)
- Delivered (green)
- Cancelled (red)

**Summary Stats**:
- Total orders
- Pending orders
- In progress orders
- Total revenue

---

## 🎨 Design & UX

### **Sidebar Navigation**

**Collapsible**:
- Click X to collapse to icons only
- Click Menu to expand full width
- Smooth width animation

**Menu Items**:
- Overview (BarChart3 icon)
- Gallery (Image icon)
- Moments (Sparkles icon)
- Orders (ShoppingBag icon)
- Settings (Settings icon)

**User Section**:
- User avatar/initial
- Name and email
- View Site button
- Logout button

### **Color Coding**

**Status Colors**:
- Available: Sage green
- Sold: Muted gray
- Pending: Yellow
- Processing: Blue
- Shipped: Purple
- Delivered: Green
- Cancelled: Red

**Action Colors**:
- Primary CTA: Terracotta
- Edit: Charcoal
- Delete: Red
- Save: Sage/Terracotta

### **Layout**

**Responsive**:
- Sidebar: Fixed 280px (expanded) / 80px (collapsed)
- Main content: Fluid with left margin
- Cards: Grid layouts (1-4 columns)
- Forms: 2-column grid on desktop

---

## 🔧 Technical Implementation

### **File Structure**

```
src/
├── pages/
│   └── AdminDashboard.tsx        # Main layout
├── components/admin/
│   ├── DashboardOverview.tsx     # Stats & activity
│   ├── GalleryManager.tsx        # Artwork CRUD
│   ├── MomentsManager.tsx        # Moments CRUD
│   └── OrdersManager.tsx         # Order management
```

### **State Management**

**Local State**:
- Each manager uses `useState` for data
- Forms use controlled components
- Real-time updates on save/delete

**Data Sources**:
- Artworks: `src/data/artworks.ts`
- Moments: `src/data/moments.ts`
- Orders: Mock data (ready for API)

### **Libraries Used**

- **framer-motion**: Animations, Reorder
- **lucide-react**: Icons
- **React hooks**: useState, useEffect

---

## 📝 Workflows

### **Creating an Artwork**

1. Click "Add New Artwork"
2. Fill in required fields (Title, Price)
3. Select medium and status
4. Add description
5. Click "Create Artwork"
6. Artwork appears in list
7. Changes persist (ready for backend)

### **Creating a Moment**

1. Click "Create New Moment"
2. Fill in title, type, content
3. Add location, mood, tags
4. *Optional*: Add custom fields
   - Click "Add Custom Field"
   - Choose field type
   - Enter label and value
5. Toggle "Featured" if desired
6. Click "Publish Moment"
7. Moment appears with interaction stats

### **Managing Orders**

1. View order list with status
2. Click order to see details
3. View customer info & shipping
4. Update order status
5. Click "Mark as Shipped"
6. Customer receives update (with backend)

---

## 🎯 User Roles

### **Artist Role**

**Access**:
- Full gallery management
- Full moments management
- View orders
- Dashboard overview

**Restrictions**:
- Cannot manage other users
- Cannot change system settings

### **Admin Role**

**Access**:
- Everything artist can do
- Plus: User management (future)
- Plus: System settings (future)

**Current**: Both roles have same access

---

## 🚀 Production Deployment

### **Backend Integration Needed**

**API Endpoints Required**:

```typescript
// Artworks
POST   /api/artworks        // Create
GET    /api/artworks        // List
GET    /api/artworks/:id    // Read
PUT    /api/artworks/:id    // Update
DELETE /api/artworks/:id    // Delete
PATCH  /api/artworks/reorder // Reorder

// Moments
POST   /api/moments         // Create
GET    /api/moments         // List
GET    /api/moments/:id     // Read
PUT    /api/moments/:id     // Update
DELETE /api/moments/:id     // Delete
GET    /api/moments/:id/stats // Interactions

// Orders
GET    /api/orders          // List
GET    /api/orders/:id      // Read
PATCH  /api/orders/:id/status // Update status
```

### **Image Upload**

Currently uses placeholder. Integrate:
- AWS S3
- Cloudinary
- Firebase Storage
- Custom server

**Flow**:
1. User selects image
2. Upload to storage
3. Get URL
4. Save URL in artwork/moment data

### **Real-time Updates**

For multi-user scenarios:
- WebSockets for live updates
- Optimistic UI updates
- Conflict resolution

---

## 🎨 Customization

### **Add New Field to Artwork**

1. Update `Artwork` interface in `artworks.ts`
2. Add field to form in `GalleryManager.tsx`
3. Include in save handler

### **Add New Moment Type**

1. Update `MomentType` in `moments.ts`
2. Add to select options in `MomentsManager.tsx`
3. Update type labels if needed

### **Customize Dashboard Stats**

Edit `DashboardOverview.tsx`:
- Add new stat cards
- Change calculations
- Add charts/graphs

---

## 💡 Best Practices

### **Content Management**

1. **Artworks**:
   - Use high-quality images
   - Write compelling descriptions
   - Keep prices current
   - Mark sold items promptly

2. **Moments**:
   - Be authentic and personal
   - Use engaging titles
   - Add relevant tags
   - Feature your best stories

3. **Orders**:
   - Update status promptly
   - Communicate with customers
   - Track shipping numbers
   - Process refunds quickly

### **Dashboard Usage**

- Check dashboard daily
- Respond to orders within 24h
- Publish new moments weekly
- Keep artwork list current
- Monitor interaction stats

---

## 🔮 Future Enhancements

Planned features:

- [ ] **Image Upload** - Drag & drop with preview
- [ ] **Rich Text Editor** - For descriptions/moments
- [ ] **Analytics** - Charts & graphs
- [ ] **Bulk Actions** - Select multiple items
- [ ] **Export Data** - CSV/Excel export
- [ ] **Email Notifications** - New orders, low stock
- [ ] **Inventory Management** - Track editions
- [ ] **Customer Management** - Customer database
- [ ] **Invoices** - Generate & send invoices
- [ ] **Reports** - Sales reports, insights
- [ ] **Scheduling** - Schedule moment publishing
- [ ] **SEO Tools** - Meta tags, descriptions
- [ ] **Multi-language** - Translate content

---

## 🎯 Success Metrics

Track these KPIs:

**Gallery**:
- Total artworks
- Available vs Sold
- Average price
- Conversion rate

**Moments**:
- Total published
- Average views
- Engagement rate
- Popular topics

**Orders**:
- Order volume
- Revenue
- Average order value
- Fulfillment time

---

**Your professional CMS is ready!** Manage your entire art portfolio with ease and elegance.

---

*Built for artists, by artists.*
