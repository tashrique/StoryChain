# StoryChain - Collaborative Storytelling Web App

A minimal web app where users contribute to a shared story, one line at a time. No login required — just a textbox, a submit button, and the emerging story.

## Features

- Display the current full story (read-only)
- Textbox to write and submit a single new line
- One-line-at-a-time constraint enforced on backend
- Basic rate-limiting (IP-based cooldown of 5 minutes)
- Auto-scroll to latest line after submit

## Tech Stack

- **Frontend**: Next.js
- **Backend**: Node.js + Express
- **Database**: MongoDB

## Setup Instructions

### Prerequisites

- Node.js (v18+ recommended)
- MongoDB (local installation or MongoDB Atlas account)

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the backend directory with the following variables:
   ```
   PORT=3001
   MONGODB_URI=mongodb://localhost:27017/storychain
   FRONTEND_URL=http://localhost:3000
   ```

4. Start the backend server:
   ```
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env.local` file in the frontend directory:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:3001/api
   ```

4. Start the frontend development server:
   ```
   npm run dev
   ```

5. Open your browser and go to http://localhost:3000

## How It Works

### Frontend Flow
- On load: fetch story (GET /api/story)
- Display story as list of lines
- Input at bottom > submit new line (POST /api/line)
- After submit: input clears, scroll to bottom, fetch updated story

### Backend Flow
- On POST /api/line:
  - Check if user has submitted in last 5 minutes (by hashed IP)
  - Sanitize + store line
  - Respond with success or cooldown error 