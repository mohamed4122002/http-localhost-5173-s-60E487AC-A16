# Setup Instructions

## 1. Environment Setup

### Backend (Python)
1. Install Python 3.10+.
2. Navigate to `backend/`.
3. Create a virtual environment:
   ```bash
   python -m venv venv
   ```
4. Activate the virtual environment:
   - Windows: `.\venv\Scripts\activate`
   - Linux/Mac: `source venv/bin/activate`
5. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
6. Create a `.env` file based on `.env.example`.
7. Start the server:
   ```bash
   uvicorn main:app --reload
   ```

### Frontend (React)
1. Install Node.js 16+.
2. Navigate to `frontend/`.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the dev server:
   ```bash
   npm run dev
   ```

### MongoDB
1. Ensure MongoDB is running locally on port 27017, or update `MONGO_URI` in `.env`.

## 2. Google Form Integration

1. Create a Google Form.
2. Add a **Short Answer** question titled `Token`.
3. Open the Script Editor (3 dots -> Script Editor).
4. Copy the code from `google-apps-script.js`.
5. Update `WEBHOOK_URL` in the script to your backend URL.
   - For local development, use ngrok or similar to expose your local server.
   - Example: `https://your-ngrok-url.ngrok-free.app/webhook/google-form`
6. Save and run the `setupTrigger` function once to authorize the script.

## 3. Running the Application

1. Open `http://localhost:5173` in your browser.
2. Log in with the default credentials (`admin`/`admin123`).
3. Create a template and a survey.
4. Configure Layer 1 rules (e.g., Age 18-35).
5. Generate tokens.
6. Share the survey link with participants: `http://localhost:5173/s/<TOKEN>`.
