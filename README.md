# ScoreWin — Play. Win. Make an Impact. ⚡

A full-stack SaaS platform combining score tracking, gamified monthly prize draws, subscription-based access, and integrated charity contributions.

## Live Links

- **Frontend (Vercel):** [https://yash-limbachiya-scorewin.vercel.app/](https://yash-limbachiya-scorewin.vercel.app/)
- **Backend API (Render):** [https://scorewin.onrender.com](https://scorewin.onrender.com)
- **API Documentation:** [https://scorewin.onrender.com/docs](https://scorewin.onrender.com/docs)

---

## Access & Credentials

The Login and Sign-in page is exactly the same for both Regular Users and Admins. Admin accounts cannot be created through the normal registration page; they are provisioned directly in the database. 

### Admin Access
- **Email:** `adminofscorewin@gmail.com`
- **Password:** `Admin@123`

### User Access
- **There are no pre-seeded user accounts.** 
- Anyone testing the platform must go to the **Get Started / Register** page to create a new user account.

---

## How The Project Works (The Core Loop)

The platform operates on a fair, automated, and philanthropic cycle:

1. **Subscription & Charity (Mandatory):** 
   A user registers and purchases a subscription (1, 3, 6, or 12 months). A minimum of 10% of their subscription value is automatically assigned to a charity. The rest goes into the Prize Pool.
2. **Entering Scores:** 
   The user enters up to 5 unique "scores" (numbers between 1 and 45) on their dashboard. The system only keeps their 5 most recent scores (FIFO logic).
3. **Running the Draw:** 
   The Admin logs into the Admin Panel and clicks "Run Draw". The system generates 5 winning numbers (either purely random or algorithmically weighted based on user inputs) and compares them against all active subscribers' scores.
4. **Declaring Winners:** 
   If a user matches 3, 4, or 5 numbers, they win a tier-based percentage of the prize pool. The results are published by the Admin.
5. **Winner Verification:** 
   The User logs into their dashboard and sees they won. They must click "Upload Proof" and submit an image (which is securely uploaded to Cloudinary).
6. **Payout:** 
   The Admin reviews the uploaded proof in the Admin Dashboard, clicks "Approve", and once paid, clicks "Mark Paid". 

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vite + React 18, React Router, Axios, Recharts, React Icons |
| Backend | Python FastAPI, SQLAlchemy ORM |
| Database | MySQL (TiDB Cloud Serverless) |
| Image Hosting| Cloudinary SDK |
| Auth | JWT (python-jose + passlib bcrypt) |

---

## API Routes Explained

### Authentication (`/api/auth`)
- `POST /register`: Creates a standard user.
- `POST /login`: Authenticates user/admin and returns a JWT token.
- `GET /me`: Returns the currently logged-in user's data.

### Subscriptions (`/api/subscriptions`)
- `POST /`: Creates a new subscription and auto-assigns a default charity if none exists.
- `POST /extend`: Adds purchased time (30, 90, 180, 365 days) to an existing active subscription's expiration date.
- `GET /my`: Retrieves the user's active subscription.

### Charities (`/api/charities`)
- `GET /my`, `POST /my`, `PUT /my`: Allows users to fetch, set, and update their charity choice and contribution percentage (strictly >= 10%).
- `GET /`, `POST /`, `PUT /`, `DELETE /`: Admin endpoints to manage the master list of available charities.

### Scores (`/api/scores`)
- `POST /`: User enters a score. Auto-deletes the oldest score if the 5-score cap is exceeded.
- `GET /my`: Retrieves the user's active 5 scores.
- `DELETE /{id}`: Deletes a specific score.

### Draws (`/api/draws`)
- `POST /simulate`: Admin previews a draw and potential winners without saving to the DB.
- `POST /run`: Admin officially runs the draw. Deducts charity money, calculates prize pool, generates numbers, and creates "Pending" winners.
- `POST /{id}/publish`: Admin makes the draw results public.

### Winners (`/api/winners`)
- `POST /{id}/upload-proof`: User uploads an image via Cloudinary to prove their identity/score.
- `PUT /{id}/verify`: Admin approves, rejects, or marks the payment as complete.
- `GET /my`: User views their specific winnings.

### Admin (`/api/admin`)
- `GET /analytics`: Retrieves total users, active subs, total revenue, total paid, and total charity contributions.
- `GET /users`, `PUT /users/{id}/role`: Manage users and promote to admin.

---

## Local Setup Commands

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Configure your environment
# Create a .env file with your TiDB, Secret Key, and Cloudinary credentials

# Start the server
uvicorn app.main:app --reload --port 8000
```
*API docs available locally at: `http://localhost:8000/docs`*

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```
*Frontend available locally at: `http://localhost:5173`*
