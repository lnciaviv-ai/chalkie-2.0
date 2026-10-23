# LessonForge

AI Lesson Generator — better than Chalkie, with full **Afrikaans** support.

Create curriculum-aligned lesson slides, differentiated worksheets (Scaffold / Core / Stretch), and exit tickets in English or Afrikaans in seconds.

## Features

- Real AI generation (OpenAI GPT-4o-mini)
- Full **Afrikaans** language support
- Differentiated worksheets
- CAPS (South Africa) + major international curricula
- Clean modern UI
- Works in demo mode without an API key

## Deploy to Render.com (Free tier works)

### 1. Push this folder to a GitHub repository

```bash
cd lessonforge-render
git init
git add .
git commit -m "LessonForge - AI lesson generator with Afrikaans"
# Create a new repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/lessonforge.git
git push -u origin main
```

### 2. Create a new Web Service on Render

1. Go to [https://dashboard.render.com](https://dashboard.render.com)
2. Click **New +** → **Web Service**
3. Connect your GitHub repo
4. Settings:
   - **Name**: `lessonforge` (or whatever you like)
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

### 3. Add Environment Variable

In the Render dashboard → your service → **Environment**:

| Key              | Value                          |
|------------------|--------------------------------|
| `OPENAI_API_KEY` | Your OpenAI API key (`sk-...`) |

Optional:
| Key             | Value          |
|-----------------|----------------|
| `OPENAI_MODEL`  | `gpt-4o-mini`  |  (default, cheap & good)

### 4. Deploy

Click **Create Web Service**. Render will build and deploy.

Your site will be live at:  
`https://lessonforge-xxxx.onrender.com`

## Local development

```bash
npm install
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY
npm start
```

Open http://localhost:3000

## Without an OpenAI key

The app still works in **demo mode**. It returns high-quality sample lessons in both English and Afrikaans so you can test the full UI and flow.

## Cost

- Render Free tier is enough for light personal / classroom use.
- OpenAI GPT-4o-mini is very cheap (roughly $0.15 – $0.60 per 1M tokens). A full lesson usually costs less than $0.01.

## Afrikaans support

When the user selects **Afrikaans**, the AI is instructed to generate the entire lesson (slides, worksheets, exit ticket, etc.) in natural South African Afrikaans, appropriate for the chosen grade.
