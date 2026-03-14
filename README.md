# OnlineClip / SecureShare

A simple and secure web application for sharing messages and files with a secret code.

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

---

## How to run this project (step by step)

### 1. Prerequisites

- **Node.js** (v18 or newer recommended) — [Download](https://nodejs.org/)
- **MongoDB** — Use a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (no local install needed)

### 2. Get a MongoDB connection string

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign up / log in.
2. Create a free cluster (e.g. M0).
3. Click **Connect** → **Drivers** → copy the connection string (looks like `mongodb+srv://user:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`).
4. Replace `<password>` in that string with your database user password.

### 3. Clone or open the project

Open the project folder in your terminal:

```bash
cd path/to/online
```

### 4. Create environment variables

1. Inside the **`backend`** folder, create a file named **`.env`**.
2. Add (replace with your real MongoDB URI and optional port):

```env
MONGODB_URI=mongodb+srv://YOUR_USER:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/online?retryWrites=true&w=majority
PORT=5001
```

- `MONGODB_URI` is **required** for the app to work.
- `PORT` is optional; default is `5001`.

### 5. Install dependencies

From the project root, run:

```bash
cd backend
npm install
```

### 6. Start the server

Still in the `backend` folder:

```bash
npm start
```

Or for auto-restart on file changes:

```bash
npm run dev
```

You should see something like:

```
MongoDB Connected successfully
Server running at http://localhost:5001
Serving frontend from: ...\online\frontend
```

### 7. Open the app

In your browser go to:

**http://localhost:5001**

The backend serves both the API and the frontend. Use “Send Content” to share a message or file and get a code; use “Retrieve Content” to enter the code and view or download it.

---

## Deployment (e.g. Render)

1. Click the “Deploy to Render” button above (or connect your repo to Render).
2. Set the **MONGODB_URI** environment variable in the Render dashboard.
3. Optionally set **PORT** (Render often sets this automatically).
4. Deploy; your app will be live at the URL Render gives you.
