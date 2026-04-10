# APEX SOLES - Complete Sitemap & Data Architecture

## **Page Structure Overview**

### **Public Pages (Customer-Facing)**
```
/                           # Home Page - Main landing
/men                        # Men's Collection
/women                      # Women's Collection  
/drops                      # Upcoming Drops
/culture                    # Blog/Content
/archive                    # Brand Archive
/contact                    # Contact Form
```

### **Admin Pages (Staff Only)**
```
/admin                      # Admin Dashboard
/admin/login               # Admin Login (same page, different view)
/debug                     # Debug/Testing Page
```

---

## **Page-by-Page Analysis**

### **1. Home Page (/)**
**File:** `app/page.tsx`
**Component:** `HomeClient.tsx`

**Data Required:**
- `shoes[]` - All products for collection display
- `brands[]` - Featured brands for hero section
- `featuredPosts[]` - Latest blog posts

**Current Status:** 
- Fetches shoes from Firestore `shoes` collection
- Uses sample brands data
- No blog post integration

**Data Sources:**
```javascript
// Firestore Collections
- shoes (all products)
- blog_posts (content posts)
- brands (brand information) // TODO: Create this collection
```

---

### **2. Men's Collection (/men)**
**File:** `app/(pages)/men/page.tsx`

**Data Required:**
- `shoes[]` - Filtered men's products (category !== 'Women')

**Current Status:**
- Fetches all shoes, filters client-side
- Working product grid display
- Cart and auth state management

**Data Sources:**
```javascript
// Firestore
- shoes (filtered by category)
```

---

### **3. Women's Collection (/women)**
**File:** `app/(pages)/women/page.tsx`

**Data Required:**
- `shoes[]` - Filtered women's products (category === 'Women')

**Current Status:**
- Fetches all shoes, filters client-side
- Working product grid display
- Cart and auth state management

**Data Sources:**
```javascript
// Firestore
- shoes (filtered by category)
```

---

### **4. Drops (/drops)**
**File:** `app/(pages)/drops/page.tsx`

**Data Required:**
- `upcomingDrops[]` - Future release information
- `countdownData[]` - Release dates and times

**Current Status:**
- Static content only
- No data fetching implemented
- Placeholder content

**Data Sources:**
```javascript
// TODO: Create Firestore collections
- drops (upcoming releases)
- countdown_timers (release schedules)
```

---

### **5. Culture (/culture)**
**File:** `app/(pages)/culture/page.tsx`

**Data Required:**
- `blogPosts[]` - Blog articles and content

**Current Status:**
- Uses sample blog posts array
- No Firestore integration
- Static content display

**Data Sources:**
```javascript
// Firestore
- blog_posts (content articles)
```

---

### **6. Archive (/archive)**
**File:** `app/(pages)/archive/page.tsx`

**Data Required:**
- `brands[]` - All brand information
- `shoes[]` - All products for brand association
- `brandStats[]` - Product counts per brand

**Current Status:**
- Uses sample brands data
- Fetches shoes from Firestore
- Brand filtering implemented
- Admin brand management in admin panel

**Data Sources:**
```javascript
// Firestore
- shoes (all products)
- brands (brand information) // TODO: Create this collection
```

---

### **7. Contact (/contact)**
**File:** `app/(pages)/contact/page.tsx`

**Data Required:**
- `contactInfo[]` - Store information
- `socialLinks[]` - Social media links

**Current Status:**
- Static contact form
- No data submission
- Static information display

**Data Sources:**
```javascript
// TODO: Create Firestore collections
- contact_submissions (form submissions)
- store_info (contact information)
```

---

### **8. Admin Dashboard (/admin)**
**File:** `app/admin/page.tsx`

**Data Required:**
- `shoes[]` - All products for inventory
- `blogPosts[]` - All blog posts
- `brands[]` - All brands for management
- `analytics[]` - Site statistics

**Current Status:**
- Full CRUD for shoes
- Full CRUD for blog posts
- Brand management (add custom brands)
- No analytics integration
- No contact form submissions view

**Data Sources:**
```javascript
// Firestore
- shoes (products)
- blog_posts (content)
- brands (brand info) // TODO: Create
- contact_submissions // TODO: Create
- analytics // TODO: Create
```

---

### **9. Debug Page (/debug)**
**File:** `app/debug/page.tsx`

**Data Required:**
- System diagnostics
- Connection status

**Current Status:**
- Testing utilities
- No production use

---

## **Data Architecture Summary**

### **Current Firestore Collections**
```javascript
// Existing Collections
- shoes (products with brand field)
- blog_posts (content articles)

// TODO: Create Collections
- brands (brand information, logos, descriptions)
- drops (upcoming releases)
- contact_submissions (form submissions)
- store_info (contact information)
- analytics (site statistics)
```

### **Data Flow Diagram**
```
Admin Panel (CRUD Operations)
    |
    v
Firestore Database
    |
    v
Public Pages (Read Operations)
    |
    v
User Interface
```

---

## **Missing Data Connections**

### **High Priority**
1. **Brands Collection** - Create and integrate with archive page
2. **Blog Posts Integration** - Connect culture page to Firestore
3. **Contact Form** - Add form submission functionality
4. **Drops Data** - Create upcoming releases system

### **Medium Priority**
5. **Analytics Dashboard** - Add site statistics to admin
6. **Contact Submissions** - View form submissions in admin
7. **Store Information** - Dynamic contact info management

### **Low Priority**
8. **User Profiles** - Customer account system
9. **Wishlist** - User favorite products
10. **Order History** - Purchase tracking

---

## **Component Dependencies**

### **Shared Components**
- `Navbar` - Cart count, user auth state
- `Footer` - Navigation links
- `ProductCard` - Product display
- `Cart` - Shopping cart functionality

### **Page-Specific Components**
- `Hero` - Home page hero section
- `HorizontalGallery` - Product scrolling
- `BlogPostModal` - Article reading
- `BrandCard` - Brand display (archive)

---

## **API Endpoints Needed**

### **File Upload**
```
POST /api/upload - Image upload for products and posts
```

### **Contact Form**
```
POST /api/contact - Submit contact form
GET /api/contact - Retrieve submissions (admin)
```

### **Analytics**
```
GET /api/analytics - Site statistics
POST /api/analytics - Track page views
```

---

## **Next Implementation Steps**

1. **Create Brands Collection**
   - Set up Firestore structure
   - Migrate sample brand data
   - Update archive page integration

2. **Integrate Blog Posts**
   - Connect culture page to Firestore
   - Add blog post management to admin
   - Implement blog post display

3. **Contact Form Functionality**
   - Add form submission endpoint
   - Create admin view for submissions
   - Add email notifications

4. **Drops System**
   - Create countdown functionality
   - Add release management
   - Implement notification system

---

## **Performance Considerations**

### **Caching Strategy**
- Product data: Cache for 5 minutes
- Blog posts: Cache for 1 hour
- Brand data: Cache for 24 hours
- User data: Real-time

### **Loading States**
- Skeleton loaders for product grids
- Progress indicators for form submissions
- Error boundaries for failed requests

### **SEO Optimization**
- Dynamic meta tags for product pages
- Structured data for products
- Sitemap generation
- Image optimization
