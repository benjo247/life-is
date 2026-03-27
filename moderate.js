const BLACKLIST = [
  // Deutsch
  'scheiße','scheisse','scheiß','scheiss','arschloch','arsch','fick','ficken','fickt','gefickt',
  'wichser','wichsen','hurensohn','hure','schlampe','fotze','schwanz','penis','vagina',
  'titten','möse','votze','spast','behindert','idiot','vollidiot','bastard','trottel',
  'kacke','kacken','dreck','verdammt','verflucht','scheisskopf','scheißkopf',
  'nazi','hitler','judensau','nigger','kanake','ausländer raus',
  // English
  'fuck','fucking','fucked','fucker','shit','ass','asshole','bitch','cunt','dick','cock',
  'pussy','bastard','damn','hell','piss','prick','twat','wanker',
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

You moderate a creative, honest platform where people complete "Life is…". The tone ranges from poetic to funny to dark to sarcastic.

Respond with ONLY a JSON object:
{"approved":true,"categories":["humor","reflective"]}

APPROVE (approved: true):
- Humor, irony, sarcasm, cynicism, dark humor
- Slang, casual language, youth language
- Honest negative emotions (pain, anger, frustration)
- Edgy or provocative but harmless thoughts
- Anything that is a genuine human expression

REJECT (approved: false) ONLY if:
- Contains direct insults targeting a specific person
- Contains real full names of people
- Contains URLs or spam
- Glorifies drink driving, hard drug use, or self-harm with intent to encourage others
- Is pure hate speech targeting a group (racism, homophobia etc.)
- Makes no sense as a completion of "Life is…"

When in doubt: APPROVE. Life is... celebrates all of human experience.
Pick 1-3 categories from: ${categories.join(', ')}

IMPORTANT: Only use "reflective" if no other category fits better. Most posts belong to a more specific category.

Examples:
- "beautiful" → joy
- "short and precious" → encouraging  
- "love" / "connection" / "you" → love
- "funny" / "weird" / "absurd" → humor
- "hard" / "brutal" / "painful" / "loss" / "grief" → loss
- "keep going" / "worth it" / "strength" → motivation + encouraging
- "myself" / "enough" / "worthy" → self-love
- "laughter" / "dance" / "sunshine" → joy
- "philosophical question" / "mystery" / "wonder" → reflective

Be specific. Never default to reflective when another category fits.

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
