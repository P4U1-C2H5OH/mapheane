-e ---
> **ARCHIVED** — This document is superseded. See CLAUDE.md, BUILD_STATUS.md, CONTENT_GUIDE.md, or BACKEND_INTEGRATION.md.
---


> ⚠️ **DECOMMISSIONED** — This file is from the original project and is no longer the source of truth.
> See [CLAUDE.md](./CLAUDE.md) for current architecture, [BUILD_STATUS.md](./BUILD_STATUS.md) for project status,
> [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) for design rules, [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md) for integrations,
> and [CONTENT_GUIDE.md](./CONTENT_GUIDE.md) for content updates.
> Kept for historical reference only.

---

# Authentication System Documentation

## 🔐 Overview

A beautiful, modern authentication system with **social login** (Google, Facebook, Instagram) and traditional **email/password** authentication. Features elegant UI/UX with smooth animations, form validation, and persistent login state.

---

## ✨ Features Implemented

### 1. **Login Button in Navigation**
- Appears in header next to cart icon
- Shows "Login" button for guests
- Shows user avatar/initials for logged-in users
- Smooth transitions and hover effects

### 2. **User Account Dropdown**
**When Logged In**:
- User avatar or initial circle
- User name display
- Dropdown menu with:
  - My Orders
  - Favorites
  - Settings
  - Sign Out

### 3. **Authentication Page**
**Dual Mode**: Login & Signup (toggle between)

**Social Login Options**:
- ✅ **Google** - One-click OAuth
- ✅ **Facebook** - Social authentication
- ✅ **Instagram** - Social integration
- Each with authentic brand colors and icons

**Email/Password Form**:
- Login: Email + Password
- Signup: Name + Email + Password
- Password visibility toggle
- Form validation
- Error handling
- Loading states

### 4. **Beautiful UI/UX**
- Decorative background blur elements
- Smooth page transitions
- Form animations
- Success confirmation with checkmark
- Professional error messaging
- Responsive design

---

## 🎯 User Flow

### **New User Journey**
```
Click "Login" button
  ↓
Land on Auth page (defaults to Login)
  ↓
Click "Sign up" toggle
  ↓
Choose signup method:
  ├─→ Social (Google/Facebook/Instagram) → Auto-login
  └─→ Email form → Fill details → Create account
  ↓
Success animation
  ↓
Redirect to homepage (logged in)
```

### **Returning User Journey**
```
Click "Login" button
  ↓
Choose login method:
  ├─→ Social → Auto-login
  └─→ Email → Fill credentials → Sign in
  ↓
Success animation
  ↓
Redirect to homepage (logged in)
```

### **Logged-In Experience**
```
See avatar in navigation
  ↓
Click avatar → Open dropdown
  ↓
Options:
  - My Orders (view purchase history)
  - Favorites (saved items)
  - Settings (account preferences)
  - Sign Out (logout)
```

---

## 📁 Files Created/Modified

### **New Files**:
1. `src/context/AuthContext.tsx` - Authentication state management
2. `src/pages/AuthPage.tsx` - Login/Signup page

### **Modified Files**:
1. `src/components/Navigation.tsx` - Added login button & user menu
2. `src/App.tsx` - Added AuthProvider wrapper & auth routing

---

## 🎨 Design Elements

### **Color Scheme**
- Google: Brand blue (#4285F4, #34A853, #FBBC05, #EA4335)
- Facebook: Brand blue (#1877F2)
- Instagram: Gradient (Pink to Purple to Blue)
- Primary CTA: Terracotta (#A0522D)
- Success: Sage green

### **Typography**
- **Headings**: Playfair Display, 5xl-6xl
- **Labels**: Uppercase, tracked, small
- **Body**: DM Sans, regular weight
- **Buttons**: Uppercase, tracked, medium weight

### **Animations**
- **Page Entry**: Fade + slide up (0.8s)
- **Form Toggle**: Slide left/right (0.3s)
- **Success**: Scale spring animation
- **Dropdown**: Fade + slide down (0.2s)

### **Layout**
- Centered authentication card
- Max-width: 28rem (448px)
- Decorative blur circles background
- Ample whitespace
- Clear visual hierarchy

---

## 🔧 Technical Implementation

### **AuthContext**
Manages global authentication state:

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  provider: 'google' | 'facebook' | 'instagram' | 'email';
}

const { 
  user,                    // Current user object
  isAuthenticated,         // Boolean login status
  login,                   // Email/password login
  loginWithGoogle,         // Google OAuth
  loginWithFacebook,       // Facebook OAuth
  loginWithInstagram,      // Instagram OAuth
  signup,                  // Create new account
  logout                   // Sign out
} = useAuth();
```

### **Persistent State**
- User data stored in `localStorage`
- Key: `'aria-user'`
- Auto-restore on page refresh
- Cleared on logout

### **Mock Authentication** 
Currently implements mock authentication:
```typescript
// Simulates 1-second API call
await new Promise(resolve => setTimeout(resolve, 1000));

// Returns mock user object
const mockUser: User = {
  id: '1',
  name: 'User Name',
  email: 'user@example.com',
  provider: 'email'
};
```

---

## 🚀 Production Integration

### **Social OAuth Setup**

**Google**:
1. Create project in [Google Cloud Console](https://console.cloud.google.com)
2. Enable Google+ API
3. Create OAuth 2.0 credentials
4. Add authorized redirect URIs
5. Implement actual OAuth flow

**Facebook**:
1. Create app in [Facebook Developers](https://developers.facebook.com)
2. Add Facebook Login product
3. Configure OAuth redirect URIs
4. Implement Facebook SDK

**Instagram**:
1. Create app in [Meta for Developers](https://developers.facebook.com)
2. Add Instagram Basic Display
3. Configure OAuth settings
4. Implement Instagram API

### **Backend Integration**

Replace mock functions with actual API calls:

```typescript
const login = async (email: string, password: string) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  if (!response.ok) throw new Error('Login failed');
  
  const data = await response.json();
  setUser(data.user);
  localStorage.setItem('token', data.token);
};
```

### **Recommended Stack**
- **Frontend**: Current React setup
- **Backend**: Node.js + Express / Next.js API routes
- **Database**: PostgreSQL / MongoDB
- **Auth Service**: Auth0 / Firebase Auth / Supabase
- **Session**: JWT tokens / HTTP-only cookies

---

## 🎯 Features Breakdown

### **Social Login Buttons**
Each button includes:
- Authentic brand logo (SVG)
- Brand colors
- Hover effects
- Loading states
- Disabled states during processing

### **Email/Password Form**
- **Icons**: Mail, Lock, User, Eye (visibility toggle)
- **Validation**: HTML5 required + email type
- **Placeholders**: Helpful examples
- **Focus States**: Terracotta border on focus
- **Error Display**: Red border + error message

### **User Dropdown Menu**
**Menu Items**:
1. **My Orders** - View purchase history
2. **Favorites** - Saved artworks/moments
3. **Settings** - Account preferences
4. **Sign Out** - Logout with confirmation

**Styling**:
- White background with shadow
- Border on hover
- Icons for each item
- Logout in red for emphasis

---

## 📱 Responsive Behavior

### **Desktop** (1024px+)
- Full-width social buttons
- Side-by-side form fields (where appropriate)
- Login button with text label
- Full user dropdown

### **Tablet** (768px - 1023px)
- Stacked form layout
- Maintained spacing
- Login button visible

### **Mobile** (< 768px)
- Single column layout
- Full-width buttons
- Icon-only login button
- Compact user menu

---

## 🔐 Security Best Practices

### **Current Implementation** (Development):
- Client-side state only
- localStorage for persistence
- No password hashing
- Mock authentication

### **Production Requirements**:
✅ HTTPS only
✅ Secure HTTP-only cookies
✅ CSRF protection
✅ Password hashing (bcrypt)
✅ Rate limiting
✅ Email verification
✅ Password reset flow
✅ 2FA option
✅ Session timeout
✅ Secure OAuth redirects

---

## 🎨 UI States

### **1. Default State**
- Login form visible
- Social buttons enabled
- No errors shown

### **2. Loading State**
- Spinner icon
- "Processing..." text
- All buttons disabled
- Form inputs disabled

### **3. Error State**
- Red border on inputs
- Error message displayed
- Red background alert box
- Form remains editable

### **4. Success State**
- Green checkmark animation
- "Welcome!" message
- Auto-redirect after 1.5s
- Smooth transition

---

## 💡 Usage Examples

### **Check Authentication Status**
```typescript
const { isAuthenticated, user } = useAuth();

if (isAuthenticated) {
  console.log(`Welcome, ${user.name}!`);
}
```

### **Protected Routes** (Future)
```typescript
const ProtectedPage = () => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/auth" />;
  }
  
  return <div>Protected Content</div>;
};
```

### **Conditional Rendering**
```typescript
{isAuthenticated ? (
  <UserDashboard />
) : (
  <LoginPrompt />
)}
```

---

## 🎭 Animation Details

### **Page Entrance**
```typescript
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
transition={{ duration: 0.8 }}
```

### **Form Toggle**
```typescript
initial={{ opacity: 0, x: -20 }}
animate={{ opacity: 1, x: 0 }}
exit={{ opacity: 0, x: 20 }}
transition={{ duration: 0.3 }}
```

### **Success Checkmark**
```typescript
initial={{ scale: 0 }}
animate={{ scale: 1 }}
transition={{ type: 'spring', duration: 0.5 }}
```

### **Dropdown Menu**
```typescript
initial={{ opacity: 0, y: -10 }}
animate={{ opacity: 1, y: 0 }}
exit={{ opacity: 0, y: -10 }}
```

---

## 🔮 Future Enhancements

Potential additions:

- [ ] Email verification flow
- [ ] Password reset functionality
- [ ] Remember me checkbox
- [ ] Two-factor authentication (2FA)
- [ ] Social account linking
- [ ] Profile picture upload
- [ ] Account deletion
- [ ] Privacy settings
- [ ] Notification preferences
- [ ] Activity log
- [ ] Login history
- [ ] Device management
- [ ] Export account data

---

## 📊 User Metrics to Track

**Authentication**:
- Total signups
- Login method distribution
- Failed login attempts
- Session duration
- Logout events

**Engagement**:
- Logged-in purchase rate
- Favorite items saved
- Account settings changes
- Social login preferences

---

## 🎯 Testing Checklist

- [ ] Login with email works
- [ ] Signup with email works
- [ ] Google login works
- [ ] Facebook login works
- [ ] Instagram login works
- [ ] Password toggle shows/hides
- [ ] Form validation catches errors
- [ ] Error messages display
- [ ] Success animation plays
- [ ] Redirect works after login
- [ ] User menu opens/closes
- [ ] Logout clears state
- [ ] State persists on refresh
- [ ] Responsive on all devices
- [ ] Keyboard navigation works
- [ ] Screen reader compatible

---

## 🎨 Customization

### **Change OAuth Providers**
Replace social login buttons in `AuthPage.tsx`:
- Update SVG logos
- Modify colors
- Change button text
- Update OAuth functions

### **Modify Form Fields**
Add/remove fields in signup form:
- Update `formData` state
- Add input components
- Update validation
- Modify submit handler

### **Style Adjustments**
- Colors: Update Tailwind classes
- Spacing: Modify padding/margins
- Animations: Adjust framer-motion props
- Icons: Replace lucide-react icons

---

**Complete authentication system ready for integration!** 

The UI/UX provides a premium feel with smooth animations, clear visual feedback, and intuitive interactions. Just connect to your backend OAuth providers and user database to make it fully functional in production.

🔐 **Secure, beautiful, and ready to scale!**
