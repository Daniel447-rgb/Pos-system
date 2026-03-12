# SwiftPOS – Point of Sale System v1.0

A modern, full-featured POS system built for small and medium businesses: retail shops, supermarkets, and mini stores.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Tailwind CSS |
| Backend/Auth | Firebase Authentication |
| Database | Firebase Firestore |
| Storage | Firebase Storage |
| Deployment | Vercel |

---

## Features

- **Authentication** – Secure admin login/logout via Firebase Auth
- **Dashboard** – Sales overview, charts, low stock alerts, recent transactions
- **POS Sales Screen** – Fast product search, cart management, checkout with receipt
- **Product Management** – Add/edit/delete products with images, pricing, stock
- **Inventory Tracking** – Live stock levels, low-stock alerts, inline stock adjustments
- **Sales History** – Transaction log with date filters and detailed receipts
- **Customer Management** – Store customer profiles with purchase history tracking
- **Receipt System** – Digital receipts with print support

---

## Setup Instructions

### 1. Clone / Download the Project

```bash
git clone <your-repo-url>
cd pos-system
npm install
```

### 2. Create a Firebase Project

1. Go to [https://console.firebase.google.com](https://console.firebase.google.com)
2. Click **"Add project"** → Enter a name → Create
3. From the project dashboard, click **"Add app"** → Web app icon (`</>`)
4. Register the app and **copy the `firebaseConfig` object**

### 3. Enable Firebase Services

In your Firebase Console:

**Authentication:**
- Go to **Build → Authentication → Get started**
- Enable **Email/Password** provider
- Create your first admin user under **Users tab**

**Firestore Database:**
- Go to **Build → Firestore Database → Create database**
- Start in **production mode**
- Choose a region closest to you
- After creation, go to **Rules** and paste:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**Storage (for product images):**
- Go to **Build → Storage → Get started**
- Accept default rules for now

### 4. Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in your Firebase values:

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
REACT_APP_FIREBASE_API_KEY=AIza...
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123...
```

### 5. Run Locally

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) and sign in with the admin email/password you created in Firebase Auth.

---

## Deploying to Vercel

### Option A: Via Vercel CLI

```bash
npm install -g vercel
vercel login
vercel
```

When prompted, add each `REACT_APP_*` variable from your `.env.local`.

### Option B: Via Vercel Dashboard

1. Push your code to GitHub
2. Go to [https://vercel.com](https://vercel.com) → **Import Project**
3. Select your GitHub repo
4. In **Environment Variables**, add all `REACT_APP_*` keys
5. Click **Deploy**

---

## Folder Structure

```
pos-system/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── Login.js
│   │   │   └── PrivateRoute.js
│   │   ├── layout/
│   │   │   └── Layout.js
│   │   ├── dashboard/
│   │   │   └── Dashboard.js
│   │   ├── pos/
│   │   │   └── POS.js
│   │   ├── products/
│   │   │   └── Products.js
│   │   ├── inventory/
│   │   │   └── Inventory.js
│   │   ├── sales/
│   │   │   └── SalesHistory.js
│   │   └── customers/
│   │       └── Customers.js
│   ├── context/
│   │   └── AuthContext.js
│   ├── firebase/
│   │   ├── config.js
│   │   └── services.js
│   ├── App.js
│   ├── index.js
│   └── index.css
├── .env.example
├── firestore.rules
├── vercel.json
├── tailwind.config.js
└── package.json
```

---

## Usage Guide

### First Time Setup
1. Sign in with your Firebase admin account
2. Go to **Products** → Add your products with prices and stock quantities
3. Go to **Customers** → Add regular customers (optional)
4. Go to **POS** → Start selling!

### Making a Sale
1. Click **POS Sale** in the sidebar
2. Search for products or click to add to cart
3. Adjust quantities with +/- buttons
4. Optionally search and attach a customer
5. Click **Checkout** → choose payment method
6. Complete the sale → receipt is generated

### Managing Inventory
- Stock automatically deducts when a sale is made
- Go to **Inventory** to manually adjust stock levels
- Low stock alerts appear on Dashboard and Inventory pages

---

## Customization

### Currency
The system uses Nigerian Naira (₦) by default. To change:
- Search for `₦` across all component files
- Replace with your currency symbol (e.g., `$`, `€`, `GH₵`)

### Low Stock Threshold
In `Inventory.js` and `Dashboard.js`, change `p.stock <= 5` to your preferred threshold.

### Tax
In `POS.js`, find `const tax = 0;` and update with your tax calculation logic.

---

## License

MIT – Free for personal and commercial use.
