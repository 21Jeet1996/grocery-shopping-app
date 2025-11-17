GRAIN'S MART - Modern Grocery E-commerce Platform 🛒
A beautiful, responsive grocery shopping web application with a modern UI inspired by Amazon and Flipkart.

✨ Features
Modern Product Catalog: Browse 65+ products across 9 categories
Smart Shopping Cart: Persistent cart with quantity controls and offer codes
User Authentication: Login/Signup system with localStorage
Promo Codes: FRUIT50, DRINK3, DAIRY20 discounts
Search & Filter: Product search with autocomplete
Order Tracking: Track current and past orders
User Profile: Manage addresses, payment methods, and wallet
Mobile Responsive: Optimized for all screen sizes
🚀 Quick Start
Running Locally
Clone the repository

git clone https://github.com/21Jeet1996/grocery-shoppin.git
cd grocery-shoppin

Start the server

Option A: Using Python 3

python3 server.py

Option B: Using Python's built-in server

python3 -m http.server 5000

Option C: Using Node.js

npx http-server -p 5000

Open in browser

http://localhost:5000

Running on Replit
The project is pre-configured to run on Replit:

Simply click the Run button
The server starts automatically on port 5000
Access your app through the Replit webview
📁 Project Structure
grocery-shoppin/
├── index.html              # Main HTML file
├── style.css               # Complete styling (5600+ lines)
├── script.js               # JavaScript logic (1900+ lines)
├── server.py               # Python HTTP server
├── data/
│   └── products.json       # Product catalog (65 products)
└── assets/
    └── images/             # Category SVG icons
        ├── fruits.svg
        ├── vegetables.svg
        ├── dairy.svg
        ├── atta.svg
        ├── soap.svg
        ├── biscuit.svg
        ├── cold-drink.svg
        ├── pulses.svg
        └── chocolate.svg

🎨 Modern UI Features
Category View
✅ Vertical grid layout (responsive)
✅ Product counts per category
✅ "Hot" badges for featured items
✅ Smooth hover effects
✅ 3-column (desktop) → 2-column (tablet) → 1-column (mobile)
Product Cards
✅ Modern card design with elevation
✅ Star ratings with review counts
✅ Promotional badges (Best Seller, Premium, Offer)
✅ Price with discount percentage
✅ Delivery information
✅ Quick-add cart buttons
✅ Wishlist heart icon
✅ Image zoom on hover
Product Detail Page
✅ Full-page modern layout
✅ Image gallery with thumbnails
✅ Product highlights (Fresh, Farm to Table, Quality Assured)
✅ Quantity selector with +/- buttons
✅ Dual CTA buttons (Add to Cart & Buy Now)
✅ Trust badges (Free Delivery, Easy Returns, Secure Payment)
✅ Enhanced reviews section
Design System
Spacing: 8px base system
Colors: Brand gradient (#667eea to #764ba2)
Typography: Professional hierarchy (32px/24px/18px/16px/14px)
Animations: Smooth transitions and micro-interactions
Breakpoints: 1024px, 768px, 480px
🛍️ Available Promo Codes
Code	Discount	Description
FRUIT50	50% OFF	All fruits
DRINK3	Buy 2 Get 1	Cold drinks
DAIRY20	20% OFF	Dairy products
Free Delivery: Automatically applied on orders above ₹500

🔧 Tech Stack
Frontend: Vanilla JavaScript (ES6+)
Styling: Custom CSS with modern design patterns
Data: JSON-based product catalog
Storage: localStorage for cart and user data
Server: Python SimpleHTTPServer (development)
📱 Browser Support
✅ Chrome (recommended)
✅ Firefox
✅ Safari
✅ Edge
✅ Mobile browsers (iOS Safari, Chrome Mobile)
🔄 Pushing Changes to GitHub
After making changes to the code:

# Check status
git status
# Add all changes
git add .
# Commit with a message
git commit -m "Updated UI with modern design"
# Push to GitHub
git push origin main

📦 Categories & Products
Fruits (9 items): Apple, Banana, Orange, Mango, Grapes, etc.
Vegetables (12 items): Potato, Tomato, Onion, Carrot, etc.
Dairy (6 items): Milk, Paneer, Butter, Cheese, etc.
Atta (6 items): Wheat Flour, Rice Flour, Maida, etc.
Soap (5 items): Lifebuoy, Dettol, Dove, Lux, Pears
Biscuits (6 items): Good Day, Parle-G, Oreo, Bourbon, etc.
Cold Drinks (10 items): Thums Up, Pepsi, Coca-Cola, etc.
Pulses (6 items): Toor Dal, Moong Dal, Chana Dal, etc.
Chocolates (5 items): Dairy Milk, KitKat, 5 Star, etc.
🎯 Key Functionality
Cart Management: Add/remove items, update quantities
User Authentication: Signup/login with email validation
Order Tracking: Real-time order status updates
Profile Management: Addresses, payment methods, wallet
Search: Autocomplete product search
Responsive Design: Works on all devices
📄 License
MIT License - feel free to use this project for your own purposes!

👨‍💻 Author
Built with ❤️ for modern e-commerce experiences

Last Updated: November 17, 2025 Version: 2.0 (Modern UI Update)