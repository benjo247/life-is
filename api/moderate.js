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
        max_tokens: 100,
        messages: [{
          role: 'user',
          content: `You moderate a platform where people complete the sentence "Life is… ${text}".

Respond with ONLY a JSON object and nothing else. No explanation, no markdown, no backticks.
Example: {"approved":true,"category":"joy"}

Rules:
- Set approved to false if the text contains: full names of real people, hate speech, spam, URLs, or harmful content
- Otherwise set approved to true
- Pick the single best category from: ${categories.join(', ')}

JSON response only:`
        }]
      })
    })

    const data = await response.json()

    if (!data.content || !data.content[0]) {
      return res.status(200).json({ approved: true, category: 'reflective' })
    }

    const raw = data.content[0].text.trim()
    const jsonMatch = raw.match(/\{[^}]+\}/)
    if (!jsonMatch) {
      return res.status(200).json({ approved: true, category: 'reflective' })
    }

    const result = JSON.parse(jsonMatch[0])
    return res.status(200).json({
      approved: result.approved !== false,
      category: categories.includes(result.category) ? result.category : 'reflective'
    })

  } catch (err) {
    console.error('Moderation error:', err)
    return res.status(200).json({ approved: true, category: 'reflective' })
  }
}
