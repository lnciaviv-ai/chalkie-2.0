# LessonForge

AI Lesson Generator — better than Chalkie, with full **Afrikaans** support.

Uses **Groq** (fast & free tier) by default. Also works with OpenAI.

---

## Deploy to Render.com with your Groq key

### 1. Push this folder to GitHub

```bash
cd lessonforge-render
git init
git add .
git commit -m "LessonForge with Groq + Afrikaans"
# Create a new repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/lessonforge.git
git branch -M main
git push -u origin main
```

### 2. Create a Web Service on Render

1. Go to https://dashboard.render.com  
2. **New +** → **Web Service**  
3. Connect your GitHub repo  
4. Settings:
   - **Name**: `lessonforge`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

### 3. Add Environment Variable (this is the important part)

In Render → your service → **Environment** → **Add Environment Variable**:

| Key            | Value                          |
|----------------|--------------------------------|
| `GROQ_API_KEY` | your Groq key (starts with `gsk_...`) |

That’s it. Optional extras:

| Key          | Value                        | Notes |
|--------------|------------------------------|-------|
| `GROQ_MODEL` | `llama-3.3-70b-versatile`    | Default – excellent quality |
|              | `llama-3.1-8b-instant`       | Faster & cheaper |
|              | `mixtral-8x7b-32768`         | Alternative |

### 4. Deploy

Click **Create Web Service** (or **Manual Deploy** if updating).

Your site will be live at:  
`https://your-service-name.onrender.com`

---

## Local testing

```bash
npm install
cp .env.example .env
# Edit .env and put your GROQ_API_KEY
npm start
```

Open http://localhost:3000

---

## How to get a free Groq key

1. Go to https://console.groq.com  
2. Sign up / log in  
3. Create an API key  
4. Copy the key (starts with `gsk_`)

Groq has a generous free tier — perfect for personal and classroom use.

---

## Features

- Real AI generation via Groq (or OpenAI)
- Full **Afrikaans** language support
- Differentiated worksheets (Scaffold / Core / Stretch)
- CAPS (South Africa) + major international curricula
- Works in demo mode even without a key
- Never hard-fails — falls back to sample lessons if AI is unavailable
