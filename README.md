GRAIN'S MART - Grocery Shopping Web Application
Overview
A modern, feature-rich grocery shopping web application built with vanilla JavaScript, HTML, and CSS. The application provides a seamless shopping experience with product browsing, cart management, user authentication, and order tracking.

Project Status
Last Updated: November 17, 2025
Status: Refactored into modular architecture
Current State: Fully functional with improved code organization

Recent Changes (Nov 17, 2025)
Major Refactoring: Monolithic to Modular Architecture
JavaScript Modularization: Split 2089 lines of JavaScript into 11 feature-based modules
CSS Organization: Created modular CSS entry point for future component-based styling
Improved Maintainability: Code is now organized by feature, making it easier to find and update functionality
Project Architecture
Directory Structure
/
├── index.html              # Main HTML file
├── style.css              # Main CSS file (to be split into modules)
├── server.py              # Python HTTP server
├── data/
│   └── products.json      # Product database
├── assets/
│   └── images/           # Product category images
├── js/                    # JavaScript modules (NEW)
│   ├── main.js           # Application initialization
│   ├── utils.js          # Utility functions (DOM helpers, toast, etc.)
│   ├── cart.js           # Cart management
│   ├── products.js       # Product loading and display
│   ├── categories.js     # Category management
│   ├── search.js         # Search and autocomplete
│   ├── auth.js           # Authentication (login/signup)
│   ├── profile.js        # User profile management
│   ├── offers.js         # Offers and promotions
│   ├── payment.js        # Payment processing
│   └── chatbot.js        # Chatbot functionality
└── css/                   # CSS modules (NEW)
    └── main.css          # CSS entry point (imports style.css)

Code Organization
JavaScript Modules
1. main.js - Application Bootstrap
Initializes the application on page load
Sets up event listeners
Coordinates all other modules
2. utils.js - Shared Utilities
DOM helper functions ($ and $$)
Toast notification system
Image error handling
Navigation helpers
Mobile menu toggle
3. cart.js - Shopping Cart
Add/remove items from cart
Quantity management
Cart total calculation
Discount application
Mini cart bar updates
Local storage persistence
4. products.js - Product Management
Load products from JSON
Product display and rendering
Product detail modal
Product badges (Best Seller, Premium, Offer)
Star ratings generation
Category-specific product filtering
5. categories.js - Category Management
Load and display categories
Category product filtering
Category navigation
Product count per category
6. search.js - Search Functionality
Real-time product search
Autocomplete dropdown
Keyboard navigation (arrow keys, enter, escape)
Search suggestions
7. auth.js - User Authentication
Login/signup modals
User credential management
Password reset
Session management
Guest mode support
8. profile.js - User Profile
Profile information management
Order history
Current orders tracking
Wallet management
Address management
Delivery preferences
9. offers.js - Promotions
Apply promotional codes
Discount calculation
Special offers display
Offer validation
10. payment.js - Payment Processing
Multiple payment methods (UPI, Card, Net Banking, Wallet, COD)
Payment form validation
Order completion
Payment flow management
11. chatbot.js - Customer Support
Chat interface
Automated responses
Common queries handling
Support system integration
Features
User Features
🛒 Shopping Cart: Add/remove items, update quantities
🔍 Smart Search: Real-time search with autocomplete
👤 User Accounts: Login/signup with profile management
💳 Multiple Payment Options: UPI, Cards, Net Banking, Wallets, COD
📦 Order Tracking: Track current and past orders
💰 Wallet: Digital wallet for faster checkout
🎁 Offers: Promotional codes and discounts
📍 Address Management: Save multiple delivery addresses
💬 Chatbot: Customer support assistant
Technical Features
✅ Modular Architecture: Organized into feature-based modules
✅ No Framework Dependencies: Pure vanilla JavaScript
✅ Local Storage: Persistent cart and user data
✅ Responsive Design: Mobile-friendly interface
✅ Cache Control: No-cache headers for development
Data Management
Products (data/products.json)
65 products across 9 categories
Categories: Fruits, Vegetables, Dairy, Atta, Soap, Biscuit, Cold Drink, Pulses, Chocolate
Each product includes: name, price, category, rating, searchCount
Local Storage Keys
gm_cart - Shopping cart items
gm_users - User credentials
currentUser - Active user session
profile_{username} - User profile data
addresses_{username} - Saved addresses
currentOrders_{username} - Active orders
orderHistory_{username} - Completed orders
walletBalance_{username} - Wallet balance
walletTransactions_{username} - Transaction history
activeOffer - Applied promotional code
delivery_slot - Selected delivery time slot
currentAddress - Current delivery address
Development
Running the Server
python3 server.py

Server runs on: http://0.0.0.0:5000/

File Loading Order (index.html)
style.css
js/utils.js (must load first - provides $ and $$)
js/cart.js
js/products.js
js/categories.js
js/search.js
js/auth.js
js/profile.js
js/offers.js
js/payment.js
js/chatbot.js
js/main.js (loads last - initializes app)
Adding New Features
Create a new .js file in the js/ directory
Add the script tag to index.html in the appropriate order
Follow existing module patterns
Update this documentation
Future Enhancements
Planned CSS Refactoring
The CSS file (6332 lines) should be split into:

css/base.css - Reset and general styles
css/header.css - Header and navigation
css/home.css - Home section
css/categories.css - Category styles
css/products.css - Product cards
css/cart.css - Cart section
css/profile.css - Profile page
css/modals.css - Modal dialogs
css/toast.css - Notifications
css/chatbot.css - Chatbot widget
css/footer.css - Footer styles
css/responsive.css - Media queries
Other Improvements
 Split CSS into component files
 Add product reviews functionality
 Implement wishlist feature
 Add order cancellation
 Enhance chatbot with AI integration
 Add admin panel for product management
 Implement real payment gateway integration
 Add email notifications
 Create mobile app version
Notes
The application uses vanilla JavaScript - no frameworks required
All data is stored in browser local storage (not production-ready)
Server is configured with no-cache headers for development
Product images are SVG placeholders from assets/images/
The refactoring maintains 100% backward compatibility