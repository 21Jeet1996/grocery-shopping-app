# GRAIN'S MART - Grocery Shopping Web Application

## Overview
A modern, feature-rich grocery shopping web application built with vanilla JavaScript, HTML, and CSS. The application provides a seamless shopping experience with product browsing, cart management, user authentication, and order tracking.

## Project Status
**Last Updated:** November 19, 2025  
**Status:** Modular Architecture Implementation  
**Current State:** Fully functional with modular HTML, CSS, and JavaScript.

### Recent Major Changes
*   **HTML Modularization:** Split the monolithic `index.html` into small, manageable components (`components/` and `sections/`).
*   **CSS Modularization:** Split the 6000+ line `style.css` into 11 focused CSS modules (`css/`).
*   **Dynamic Loading:** Implemented `js/loader.js` to dynamically fetch and assemble HTML components at runtime.

## Project Architecture

### Directory Structure
```
/
├── index.html              # Main shell HTML (loads components)
├── server.py               # Python HTTP server
├── data/
│   └── products.json       # Product database
├── js/                     # JavaScript modules
│   ├── loader.js           # Component loader (NEW)
│   ├── main.js             # Application initialization
│   ├── utils.js            # Utility functions
│   ├── cart.js             # Cart management
│   ├── products.js         # Product logic
│   ├── categories.js       # Category logic
│   ├── search.js           # Search functionality
│   ├── auth.js             # Authentication
│   ├── profile.js          # Profile management
│   ├── offers.js           # Offers logic
│   ├── payment.js          # Payment processing
│   └── chatbot.js          # Chatbot logic
├── css/                    # CSS Modules (NEW)
│   ├── style.css           # Main entry point (imports all others)
│   ├── base.css            # Reset & variables
│   ├── header.css          # Header styles
│   ├── footer.css          # Footer styles
│   ├── home.css            # Home section styles
│   ├── products.css        # Product card styles
│   ├── cart.css            # Cart styles
│   ├── profile.css         # Profile styles
│   ├── categories.css      # Category styles
│   ├── modals.css          # Modal styles
│   ├── chatbot.css         # Chatbot styles
│   └── utils.css           # Utility classes
├── components/             # Reusable HTML Components (NEW)
│   ├── header.html
│   ├── footer.html
│   ├── modals.html
│   └── chatbot.html
└── sections/               # Page Sections (NEW)
    ├── home.html
    ├── categories.html
    ├── products.html
    ├── cart.html
    ├── profile.html
    ├── track-order.html
    └── address.html
```

## Project Flow & Initialization

1.  **Entry Point:** The browser loads `index.html`.
2.  **CSS Loading:** `index.html` loads `css/style.css`, which imports all other CSS modules.
3.  **JS Loading:** `index.html` loads the JavaScript modules, ending with `js/loader.js` and `js/main.js`.
4.  **Component Fetching:** `js/loader.js` runs immediately. It uses the `fetch()` API to retrieve HTML content from the `components/` and `sections/` directories and injects them into the placeholder `<div>` elements in `index.html`.
5.  **App Initialization:** Once all HTML is loaded, `loader.js` dispatches a custom `html-loaded` event. `js/main.js` listens for this event and then initializes the app logic (loads products, sets up listeners, checks user session, etc.).

## How to Start

Since the application uses `fetch()` to load local HTML files, browser security policies (CORS) prevent it from working if you just double-click `index.html`. **You must run it on a local server.**

### Prerequisites
*   Python 3.x installed on your system.

### Steps
1.  Open a terminal in the project root directory.
2.  Run the Python server:
    ```bash
    python server.py
    ```
    *(Or `python3 server.py` on Mac/Linux)*
3.  Open your browser and navigate to:
    ```
    http://localhost:5000
    ```

## Features

### User Features
*   🛒 **Shopping Cart:** Add/remove items, update quantities, real-time total calculation.
*   🔍 **Smart Search:** Real-time search with autocomplete.
*   👤 **User Accounts:** Login/signup, profile management, order history.
*   💳 **Checkout:** Multiple payment simulations (UPI, Card, COD).
*   📦 **Order Tracking:** Visual timeline of order status.
*   📍 **Address Management:** Save and manage multiple delivery addresses.
*   💬 **Chatbot:** Simple customer support interface.

### Technical Features
*   ✅ **Modular Codebase:** Easy to maintain and scale.
*   ✅ **No Frameworks:** Built with pure Vanilla JS, HTML, and CSS.
*   ✅ **SPA-like Experience:** Smooth transitions between sections without page reloads.
*   ✅ **Local Storage:** Data persistence for cart and user sessions.

## Data Management
*   **Products:** Stored in `data/products.json` (or loaded via `js/products.js`).
*   **Persistence:** Uses `localStorage` for:
    *   `gm_cart`: Cart items
    *   `gm_users`: User accounts
    *   `currentUser`: Active session
    *   `orders`: Order history

## Future Enhancements
*   [ ] Integrate a real backend (Node.js/Express or Python/Django).
*   [ ] Replace `localStorage` with a real database (MongoDB/PostgreSQL).
*   [ ] Add admin dashboard for product management.
