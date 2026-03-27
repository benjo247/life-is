const BLACKLIST = [
  'scheiße','scheisse','arschloch','fick','ficken','wichser','hurensohn','hure','schlampe','fotze',
  'nazi','hitler','nigger','kanake',
  'fuck','fucking','fucker','shit','asshole','cunt','faggot',
  'selbstmord','suizid','suicide','bomb','terrorist'
]

function containsBadWord(text) {
  const lower = text.toLowerCase()
  return BLACKLIST.some(word => lower.includes(word))
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { text } = req.body
  if (!text) return res.status(400).json({ error: 'No text' })

  if (containsBadWord(text)) {
    return res.status(200).json({ approved: false, categories: ['reflective'], category: 'reflective' })
  }

  // Check API key exists
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('ANTHROPIC_API_KEY is not set!')
    return res.status(200).json({ approved: true, categories: ['reflective'], category: 'reflective' })
  }

  const prompt = `You are categorizing a "Life is… ${text}" post.

Pick 1-3 categories from: encouraging, self-love, joy, loss, love, humor, reflective, motivation

- "to love yourself" / "myself" / "enough" → self-love
- "love" / "connection" / "together" → love  
- "funny" / "weird" / "absurd" / "lol" → humor
- "pain" / "hard" / "brutal" / "grief" → loss
- "beautiful" / "happy" / "sunshine" → joy
- "keep going" / "strength" / "believe" → motivation
- "hope" / "better" / "possible" → encouraging
- philosophical only → reflective

Reply ONLY with JSON like this: {"approved":true,"categories":["self-love","love"]}`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 60,
        messages: [{ role: 'user', content: prompt }]
      })
    })

    const data = await response.json()
    
    // Log full response for debugging
    console.log('API response status:', response.status)
    console.log('API response data:', JSON.stringify(data))

    if (data.error) {
      console.error('API error:', data.error)
      return res.status(200).json({ approved: true, categories: ['reflective'], category: 'reflective' })
    }

    const raw = (data.content && data.content[0] && data.content[0].text || '').trim()
    console.log('Raw response:', raw)
    
    const match = raw.match(/\{[\s\S]*?\}/)
    if (!match) throw new Error('No JSON in: ' + raw)

    const result = JSON.parse(match[0])
    const valid = ['encouraging','self-love','joy','loss','love','humor','reflective','motivation']
    const cats = (result.categories || []).filter(c => valid.includes(c))

    return res.status(200).json({
      approved: result.approved !== false,
      categories: cats.length > 0 ? cats : ['reflective'],
      category: cats[0] || 'reflective'
    })

  } catch (err) {
    console.error('Moderation catch error:', err.message)
    return res.status(200).json({ approved: true, categories: ['reflective'], category: 'reflective' })
  }
}
