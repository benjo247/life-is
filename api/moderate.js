export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { text } = req.body
  if (!text) return res.status(400).json({ error: 'No text' })

  const categories = ['encouraging', 'self-love', 'joy', 'loss', 'love', 'humor', 'reflective', 'motivation']

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
        max_tokens: 150,
        messages: [{
          role: 'user',
          content: `You moderate a platform where people complete "Life is… ${text}".

Respond with ONLY a JSON object. No explanation, no markdown, no backticks.
Example: {"approved":true,"categories":["joy","love"]}

Rules:
- Set approved to false if: contains full names of real people, hate speech, insults, spam, URLs, or content that could harm others
- Otherwise set approved to true
- Pick 1-3 categories that best fit from: ${categories.join(', ')}
- A post can belong to multiple categories if appropriate

JSON only:`
        }]
      })
    })

    const data = await response.json()

    if (!data.content || !data.content[0]) {
      return res.status(200).json({ approved: true, categories: ['reflective'] })
    }

    const raw = data.content[0].text.trim()
    const match = raw.match(/\{[\s\S]*\}/)
    if (!match) {
      return res.status(200).json({ approved: true, categories: ['reflective'] })
    }

    const result = JSON.parse(match[0])
    const validCats = (result.categories || []).filter(c => categories.includes(c))

    return res.status(200).json({
      approved: result.approved !== false,
      categories: validCats.length > 0 ? validCats : ['reflective'],
      category: validCats[0] || 'reflective' // backwards compat
    })

  } catch (err) {
    console.error('Moderation error:', err)
    return res.status(200).json({ approved: true, categories: ['reflective'], category: 'reflective' })
  }
}
