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

  const prompt = `Complete the sentence "Life is… ${text}"

Pick the best 1-3 categories from this list: encouraging, self-love, joy, loss, love, humor, reflective, motivation

Rules:
- love/connection/relationship → love
- funny/weird/ironic/sarcastic → humor  
- pain/hard/brutal/grief/sad → loss
- beautiful/happy/sunshine/dance → joy
- keep going/strength/worth it → motivation
- myself/enough/self-worth → self-love
- uplifting/hope/positive → encouraging
- philosophical/mystery/wonder → reflective (only if nothing else fits)

Reject ONLY if: direct insult to a person, real full name, URL, spam, hate speech targeting a group.

Reply with ONLY valid JSON, nothing else:
{"approved":true,"categories":["joy","humor"]}`

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
    const raw = (data.content && data.content[0] && data.content[0].text || '').trim()
    const match = raw.match(/\{[\s\S]*?\}/)
    if (!match) throw new Error('No JSON found')

    const result = JSON.parse(match[0])
    const valid = ['encouraging','self-love','joy','loss','love','humor','reflective','motivation']
    const cats = (result.categories || []).filter(c => valid.includes(c))

    return res.status(200).json({
      approved: result.approved !== false,
      categories: cats.length > 0 ? cats : ['reflective'],
      category: cats[0] || 'reflective'
    })

  } catch (err) {
    console.error('Moderation error:', err)
    return res.status(200).json({ approved: true, categories: ['reflective'], category: 'reflective' })
  }
}
