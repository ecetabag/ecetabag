const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'openai/gpt-oss-120b';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error('Missing GROQ_API_KEY');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    const messages = Array.isArray(req.body?.messages) ? req.body.messages : [];

    if (!messages.length) {
      return res.status(400).json({ error: 'messages is required' });
    }

    // Keep request size bounded and only accept normal chat roles.
    const safeMessages = messages.slice(-12).map((message) => ({
      role: ['system', 'user', 'assistant'].includes(message?.role)
        ? message.role
        : 'user',
      content: String(message?.content ?? '').slice(0, 30000),
    }));

    const totalChars = safeMessages.reduce(
      (total, message) => total + message.content.length,
      0
    );

    if (totalChars > 50000) {
      return res.status(413).json({ error: 'Request too large' });
    }

    const groqResponse = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: safeMessages,
        temperature: 0.4,
        max_completion_tokens: 450,
      }),
    });

    const data = await groqResponse.json();

    if (!groqResponse.ok) {
      console.error('Groq API error:', groqResponse.status, data);
      return res.status(502).json({ error: 'AI provider request failed' });
    }

    const content = data?.choices?.[0]?.message?.content?.trim();

    if (!content) {
      return res.status(502).json({ error: 'Empty AI response' });
    }

    // Avoid caching private chat responses.
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ content });
  } catch (error) {
    console.error('Chat endpoint error:', error);
    return res.status(500).json({ error: 'Unexpected server error' });
  }
}
