try { require('dotenv').config(); } catch (e) {}
const express = require('express');
const cors = require('cors');
const path = require('path');
const OpenAI = require('openai');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Initialize OpenAI (user must set OPENAI_API_KEY)
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    aiEnabled: !!openai,
    version: '1.0.0'
  });
});

// Generate lesson endpoint
app.post('/api/generate', async (req, res) => {
  try {
    const {
      topic,
      year,
      curriculum,
      subject,
      language = 'English',
      includeSlides = true,
      includeWorksheets = true,
      includeExitTicket = true,
      includeHomework = false
    } = req.body;

    if (!topic || !topic.trim()) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    if (!openai) {
      // Fallback mock response when no API key
      return res.json({
        mock: true,
        message: 'No OPENAI_API_KEY set. Returning demo content. Add your key in Render environment variables for real AI generation.',
        lesson: generateMockLesson(topic, year, subject, language)
      });
    }

    const languageInstruction = language === 'Afrikaans'
      ? 'IMPORTANT: Generate ALL content entirely in Afrikaans (South African Afrikaans). Use natural, classroom-appropriate Afrikaans vocabulary suitable for the given year group. Do not mix English unless necessary for technical terms that are commonly kept in English.'
      : language !== 'English'
        ? `IMPORTANT: Generate ALL content entirely in ${language}.`
        : 'Generate all content in clear, professional English.';

    const systemPrompt = `You are LessonForge, an expert AI curriculum designer and teacher resource creator. You produce high-quality, classroom-ready lesson materials that are better structured and more differentiated than typical AI lesson tools.

${languageInstruction}

Always respond with valid JSON only. No markdown, no extra text.`;

    const userPrompt = `Create a complete lesson package for the following:

Topic: ${topic}
Year / Grade: ${year}
Subject: ${subject}
Curriculum: ${curriculum}
Language: ${language}

Requirements:
- Include: ${[
  includeSlides && 'lesson slides',
  includeWorksheets && 'differentiated worksheets (Scaffold / Core / Stretch)',
  includeExitTicket && 'exit ticket',
  includeHomework && 'homework task'
].filter(Boolean).join(', ')}

Return a JSON object with this exact structure:
{
  "title": "Clear lesson title",
  "year": "${year}",
  "subject": "${subject}",
  "curriculum": "${curriculum}",
  "language": "${language}",
  "learningObjectives": ["objective 1", "objective 2", "objective 3"],
  "slides": [
    {
      "type": "title|objectives|starter|content|activity|plenary|other",
      "title": "Slide title",
      "content": "Main content or explanation",
      "items": ["optional bullet points"]
    }
  ],
  "worksheets": {
    "scaffold": {
      "title": "Supported worksheet title",
      "description": "What support is provided",
      "questions": ["q1", "q2", "q3"]
    },
    "core": {
      "title": "Core worksheet title",
      "description": "Standard level",
      "questions": ["q1", "q2", "q3", "q4"]
    },
    "stretch": {
      "title": "Challenge worksheet title",
      "description": "Higher-order thinking",
      "questions": ["q1", "q2", "q3"]
    }
  },
  "exitTicket": {
    "title": "Exit Ticket",
    "questions": ["q1", "q2", "q3"],
    "teacherNote": "How to use the responses"
  },
  "homework": {
    "title": "Homework task",
    "description": "Clear instructions",
    "estimatedTime": "15-20 minutes"
  }
}

Make the content accurate, age-appropriate, engaging, and tightly aligned to the stated curriculum. Include a good mix of explanation, activity and assessment.`;

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 4000,
      response_format: { type: 'json_object' }
    });

    const content = completion.choices[0].message.content;
    let lesson;

    try {
      lesson = JSON.parse(content);
    } catch (parseErr) {
      console.error('JSON parse error:', parseErr);
      return res.status(500).json({ error: 'Failed to parse AI response', raw: content });
    }

    res.json({ mock: false, lesson });
  } catch (err) {
    console.error('Generation error:', err);
    res.status(500).json({
      error: 'Failed to generate lesson',
      details: err.message
    });
  }
});

// Mock generator for when no API key is present
function generateMockLesson(topic, year, subject, language) {
  const isAfrikaans = language === 'Afrikaans';

  if (isAfrikaans) {
    return {
      title: topic.length > 80 ? topic.slice(0, 77) + '...' : topic,
      year,
      subject,
      curriculum: 'Suid-Afrikaanse Kurrikulum / CAPS',
      language: 'Afrikaans',
      learningObjectives: [
        'Beskryf die belangrikste konsepte van die onderwerp',
        'Pas die kennis toe in praktiese situasies',
        'Evalueer en bespreek die onderwerp krities'
      ],
      slides: [
        {
          type: 'title',
          title: topic.split(' vir ')[0] || topic,
          content: `${year} · ${subject}`,
          items: []
        },
        {
          type: 'objectives',
          title: 'Leerdoelwitte',
          content: '',
          items: [
            'Beskryf die belangrikste konsepte van die onderwerp',
            'Pas die kennis toe in praktiese situasies',
            'Evalueer en bespreek die onderwerp krities'
          ]
        },
        {
          type: 'starter',
          title: 'Begintoets / Do Now (5 min)',
          content: 'Skryf drie dinge neer wat jy reeds van hierdie onderwerp weet. Deel een met jou vennoot.',
          items: []
        },
        {
          type: 'content',
          title: 'Kerninhoud',
          content: 'Hier is die belangrikste inligting oor die onderwerp. Die inhoud is ouderdomsgepas en gerig op die kurrikulumvereistes.',
          items: []
        },
        {
          type: 'activity',
          title: 'Aktiwiteit: Groepwerk',
          content: 'Werk in pare. Bespreek die vrae en skryf julle antwoorde neer. Wees gereed om terug te voer na die klas.',
          items: []
        },
        {
          type: 'plenary',
          title: 'Afsluiting',
          content: 'Skryf een sin neer wat die belangrikste ding opsom wat jy vandag geleer het.',
          items: []
        }
      ],
      worksheets: {
        scaffold: {
          title: 'Ondersteunde Werkblad',
          description: 'Met woordelys, sinsbeginne en visuele steun',
          questions: [
            'Voltooi die sinne met die korrekte woorde uit die woordelys.',
            'Koppel die begrippe aan die regte definisies.',
            'Beantwoord die vrae met behulp van die steunstrukture.'
          ]
        },
        core: {
          title: 'Standaard Werkblad',
          description: 'Volle vraestel op kernvlak',
          questions: [
            'Verduidelik die hoofkonsep in jou eie woorde.',
            'Gee twee voorbeelde uit die werklike lewe.',
            'Vergelyk en kontrasteer die twee belangrike idees.',
            'Hoe sou jy hierdie kennis in die praktyk toepas?'
          ]
        },
        stretch: {
          title: 'Uitdagingswerkblad',
          description: 'Hoër-orde denke en evaluering',
          questions: [
            'Evalueer die sterkpunte en swakpunte van die benadering.',
            'Ontwerp jou eie voorbeeld of scenario.',
            'Bespreek die impak op die samelewing of omgewing.'
          ]
        }
      },
      exitTicket: {
        title: 'Uittreekaartjie',
        questions: [
          'Wat is die belangrikste ding wat jy vandag geleer het?',
          'Noem een vraag wat jy nog het.',
          'Hoe seker voel jy oor hierdie onderwerp? (1–5)'
        ],
        teacherNote: 'Versamel by die deur. Gebruik die antwoorde om die volgende les se begin te beplan.'
      },
      homework: {
        title: 'Huiswerk',
        description: 'Voltooi die oefeninge in jou oefenboek en wees gereed om môre te bespreek.',
        estimatedTime: '15–20 minute'
      }
    };
  }

  // English mock
  return {
    title: topic.length > 80 ? topic.slice(0, 77) + '...' : topic,
    year,
    subject,
    curriculum: 'UK National Curriculum',
    language: 'English',
    learningObjectives: [
      'Describe the key concepts related to the topic',
      'Apply knowledge to practical or real-world situations',
      'Evaluate and discuss the topic critically'
    ],
    slides: [
      {
        type: 'title',
        title: topic.split(' for ')[0] || topic,
        content: `${year} · ${subject}`,
        items: []
      },
      {
        type: 'objectives',
        title: 'Learning Objectives',
        content: '',
        items: [
          'Describe the key concepts related to the topic',
          'Apply knowledge to practical or real-world situations',
          'Evaluate and discuss the topic critically'
        ]
      },
      {
        type: 'starter',
        title: 'Do Now / Starter (5 min)',
        content: 'Write down three things you already know about this topic. Share one with your partner.',
        items: []
      },
      {
        type: 'content',
        title: 'Core Content',
        content: 'Here is the essential information on the topic. Content is age-appropriate and aligned to curriculum requirements.',
        items: []
      },
      {
        type: 'activity',
        title: 'Activity: Collaborative Task',
        content: 'Work in pairs. Discuss the questions and record your answers. Be ready to feedback to the class.',
        items: []
      },
      {
        type: 'plenary',
        title: 'Plenary',
        content: 'Write one sentence that summarises the most important thing you learned today.',
        items: []
      }
    ],
    worksheets: {
      scaffold: {
        title: 'Supported Worksheet',
        description: 'With word bank, sentence starters and visual supports',
        questions: [
          'Complete the sentences using the words from the bank.',
          'Match the terms to the correct definitions.',
          'Answer the questions using the support structures provided.'
        ]
      },
      core: {
        title: 'Core Worksheet',
        description: 'Full range of questions at standard level',
        questions: [
          'Explain the main concept in your own words.',
          'Give two real-world examples.',
          'Compare and contrast the two key ideas.',
          'How would you apply this knowledge in practice?'
        ]
      },
      stretch: {
        title: 'Challenge Worksheet',
        description: 'Higher-order thinking and evaluation',
        questions: [
          'Evaluate the strengths and weaknesses of the approach.',
          'Design your own example or scenario.',
          'Discuss the wider impact on society or the environment.'
        ]
      }
    },
    exitTicket: {
      title: 'Exit Ticket',
      questions: [
        'What is the most important thing you learned today?',
        'Write one question you still have.',
        'How confident do you feel about this topic? (1–5)'
      ],
      teacherNote: 'Collect on the way out. Use responses to inform the starter of the next lesson.'
    },
    homework: {
      title: 'Homework',
      description: 'Complete the practice exercises in your workbook and be ready to discuss tomorrow.',
      estimatedTime: '15–20 minutes'
    }
  };
}

// Serve frontend for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`LessonForge running on port ${PORT}`);
  console.log(`AI enabled: ${!!openai}`);
});
