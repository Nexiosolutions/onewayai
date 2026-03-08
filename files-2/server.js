const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/ask', async (req, res) => {
  try {
    const { message } = req.body;
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + process.env.GROQ_API_KEY
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 1000,
        messages: [
          {
            role: 'system',
            content: 'You are a warm Christian scripture guide for One Way US ministry. When someone shares what they are feeling, choose the most relevant Bible verse. ALWAYS respond in this exact JSON format with no extra text or markdown: {"verse": "Full verse text here", "reference": "Book Chapter:Verse", "explanation": "Your warm 2-3 sentence explanation here"}'
          },
          { role: 'user', content: message }
        ]
      })
    });
    const data = await response.json();
    const text = data.choices[0].message.content;
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    res.json(parsed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('One Way AI running on port ' + PORT));
