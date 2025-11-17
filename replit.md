GRAIN'S MART - Grocery E-commerce Platform
Overview
GRAIN'S MART is a modern, client-side grocery e-commerce web application built with vanilla JavaScript, HTML, and CSS. The application provides a complete shopping experience including product browsing, cart management, user authentication, order tracking, and promotional offers. It operates entirely in the browser using localStorage for data persistence, with product data loaded from a static JSON file.

Recent Changes (November 2025)
UI/UX Improvements
Product Images: Replaced Unsplash placeholder URLs with 36 high-quality stock images stored locally in assets/images/products/
Category Images: Updated all 9 category images with professional stock photography
Text Contrast: Enhanced homepage text visibility with text shadows (rgba(0,0,0,0.8)) for better readability over video background
Button Styling: Improved button colors, shadows, and hover effects for better user interaction
Accessibility: Increased background overlay opacity (0.6) on home section for improved text contrast
User Preferences
Preferred communication style: Simple, everyday language.

System Architecture
Frontend Architecture
Technology Stack: Vanilla JavaScript (ES6+), HTML5, CSS3

Problem: Need for a responsive, interactive shopping experience without framework overhead
Solution: Pure JavaScript implementation with modern ES6+ features and DOM manipulation
Rationale: Simplicity, no build process, fast loading, easy deployment on static hosts
State Management: Browser localStorage

Problem: Need to persist cart, user sessions, and order data across page reloads
Solution: localStorage-based persistence layer for cart items, user profiles, authentication tokens, and order history
Trade-off: Data limited to single browser/device, but suitable for prototype/demo purposes
UI/UX Design: Custom CSS with gradient themes

Inspiration: Amazon and Flipkart e-commerce patterns
Approach: Mobile-first responsive design with sticky header, search autocomplete, and category browsing
Styling: 5600+ lines of custom CSS with modern gradients and transitions
Data Architecture
Product Catalog: Static JSON file (data/products.json)

Structure: Array of 65+ products across 9 categories (Fruits, Vegetables, Dairy, Atta, Soap, Biscuit, Cold Drink, Pulses, Chocolate)
Product Schema: name, category, price, img, searchCount, rating
Image Strategy: High-quality stock images stored in assets/images/products/ for all products and categories
Cache Busting: Query parameter versioning to prevent stale data
Image Assets: 36 professional stock photos for authentic product representation
User Data Model: localStorage-based schemas

Authentication: User credentials, session tokens
Cart: Product IDs, quantities, timestamps
Orders: Order history with status tracking
Profile: Delivery addresses, payment methods, wallet balance
Core Features
Shopping Cart System

Persistence: localStorage with JSON serialization
Features: Add/remove items, quantity controls, offer code application
Promo Codes: FRUIT50, DRINK3, DAIRY20 with category-specific discounts
Cart Counter: Real-time badge updates in navigation
Authentication System

Implementation: Client-side validation with localStorage session management
Security Note: Demo-level security only - credentials stored in localStorage
Session Management: Login state persists across page refreshes
Search & Discovery

Search: Real-time filtering with autocomplete across product names and categories
Category Navigation: 9 predefined categories with visual icons
Product Display: Grid layout with responsive breakpoints
Order Management

Order Creation: Cart checkout with address and payment selection
Order Tracking: Current orders with status updates
Order History: Past orders accessible from user profile
Server Architecture
HTTP Server: Python SimpleHTTPServer

Purpose: Serve static files and enable CORS for local development
Configuration: Port 5000, no-cache headers for development
Alternative Options: Node.js http-server, Python 3 built-in server
Production Note: Any static file host (GitHub Pages, Netlify, Vercel) can serve this application
File Structure:

├── index.html          # Main entry point
├── style.css           # Complete styling (5600+ lines)
├── script.js           # Application logic (1900+ lines)
├── server.py           # Development server
├── data/
│   └── products.json   # Product catalog
└── assets/
    └── images/         # Category and product images

External Dependencies
Third-Party Services
None: Application runs completely standalone without external API calls or third-party services.

Assets & Resources
Product Images: Local image files stored in assets/images/products/

Category-specific default images used as fallbacks
Image naming convention includes content hash for uniqueness
Category Icons: SVG files in assets/images/ directory

Icons for: fruits, vegetables, dairy, atta, soap, biscuit, cold-drink, pulses, chocolate
Browser APIs
localStorage: Primary data persistence mechanism

Used for: cart data, user authentication, orders, profile information
Limitation: ~5-10MB storage limit per domain
Fetch API: Loading product catalog from JSON file

Cache control headers to prevent stale data
Error handling for file protocol limitations
Development Tools
Python 3: Development server via http.server module

No external Python packages required
Simple static file serving with CORS support
Alternative Servers: Node.js (http-server), any static file server

Application is server-agnostic for production deployment