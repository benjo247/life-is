export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { text } = req.body
  if (!text) return res.status(400).json({ error: 'No text' })

  const categories = ['encouraging', 'self-love', 'joy', 'loss', 'love', 'humor', 'reflective', 'motivation']

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
        content: `You moderate a platform where people complete "Life is… ${text}".

Reply with ONLY valid JSON, no other text:
{"approved": true/false, "category": "one of: ${categories.join(', ')}"}

Reject if: contains full names, hate speech, spam, harmful content.
Choose the most fitting category.`
      }]
    })
  })

  const data = await response.json()
  const result = JSON.parse(data.content[0].text)
  res.status(200).json(result)
}
