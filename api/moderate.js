const BLACKLIST = [
  // Deutsch
  'scheiße','scheisse','scheiß','scheiss','arschloch','arsch','fick','ficken','fickt','gefickt',
  'wichser','wichsen','hurensohn','hure','nutte','schlampe','fotze','schwanz','penis','vagina',
  'titten','möse','votze','spast','behindert','idiot','vollidiot','bastard','trottel',
  'kacke','kacken','dreck','verdammt','verflucht','scheisskopf','scheißkopf',
  'nazi','hitler','judensau','nigger','kanake','ausländer raus',
  // English
  'fuck','fucking','fucked','fucker','shit','ass','asshole','bitch','cunt','dick','cock',
  'pussy','whore','slut','bastard','damn','hell','piss','prick','twat','wanker',
  'nigger','faggot','retard','idiot','moron','stupid','kill yourself','kys',
  // Harm
  'selbstmord','suizid','suicide','kill','murder','bomb','terrorist'
]

function containsBadWord(text) {
  const lower = text.toLowerCase().replace(/[^a-züäöß\s]/g, ' ')
  return BLACKLIST.some(word => {
    const regex = new RegExp('\\b' + word.replace(/ß/g, '(ß|ss)') + '\\b', 'i')
    return regex.test(lower) || lower.includes(word)
  })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { text } = req.body
  if (!text) return res.status(400).json({ error: 'No text' })

  // Hard blacklist check first – instant reject
  if (containsBadWord(text)) {
    return res.status(200).json({
      approved: false,
      categories: ['reflective'],
      category: 'reflective'
    })
  }

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
          content: `You are a strict content moderator for a poetic platform where people complete "Life is… ${text}".

Be STRICT. Reject anything that is negative, offensive, rude, harmful, or not suitable for a thoughtful public space.

Respond with ONLY a JSON object:
{"approved":true,"categories":["joy","love"]}

Reject (approved: false) if the text:
- Contains insults, profanity or offensive language in ANY language
- Contains real names of people
- Contains URLs or spam
- Is aggressive, mean-spirited or harmful
- Is not a genuine thoughtful completion of "Life is…"

Approve only genuine, thoughtful, poetic or honest completions.
Pick 1-3 categories from: ${categories.join(', ')}

JSON only:`
        }]
      })
    })

    const data = await response.json()

    if (!data.content || !data.content[0]) {
      return res.status(200).json({ approved: true, categories: ['reflective'], category: 'reflective' })
    }

    const raw = data.content[0].text.trim()
    const match = raw.match(/\{[\s\S]*?\}/)
    if (!match) {
      return res.status(200).json({ approved: true, categories: ['reflective'], category: 'reflective' })
    }

    const result = JSON.parse(match[0])
    const validCats = (result.categories || []).filter(c => categories.includes(c))

    return res.status(200).json({
      approved: result.approved !== false,
      categories: validCats.length > 0 ? validCats : ['reflective'],
      category: validCats[0] || 'reflective'
    })

  } catch (err) {
    console.error('Moderation error:', err)
    return res.status(200).json({ approved: true, categories: ['reflective'], category: 'reflective' })
  }
}
