const BLACKLIST = [
  'scheiße','scheisse','arschloch','fick','ficken','wichser','hurensohn','hure','schlampe','fotze',
  'nazi','hitler','nigger','kanake',
  'fuck','fucking','fucker','shit','asshole','cunt','faggot',
  'selbstmord','suizid','suicide','bomb','terrorist'
]

const KEYWORDS = {
  'self-love': ['yourself','myself','self','enough','worthy','worth','selbstliebe','selbst','selbstvertrauen','accept','healing','becoming','confidence','proud','dich selbst','mir selbst','sich selbst'],
  'love': ['love','loved','loving','liebe','geliebt','zusammen','together','heart','herz','connection','relationship','partner','miss','kiss','belong','romance','du','you and me'],
  'joy': ['beautiful','happy','happiness','joy','smile','laugh','dance','sunshine','wunderbar','schön','glück','glücklich','wonderful','amazing','magic','fun','grateful','bliss','spaß'],
  'humor': ['funny','weird','absurd','ironic','witzig','seltsam','chaos','random','literally','basically','honestly','adulting','monday','lol','haha'],
  'loss': ['pain','painful','hard','brutal','grief','sad','sadness','loss','lost','broken','hurt','lonely','alone','tears','cry','dark','difficult','tough','traurig','schmerz','verlust','einsam','gebrochen'],
  'motivation': ['keep going','strength','strong','believe','possible','dream','fight','never give up','rise','power','achieve','goal','forward','courage','try','schaff','kämpf','stark','glaub','träum'],
  'encouraging': ['better','hope','hopeful','worth it','positive','inspire','chance','opportunity','hoffnung','besser','möglich','can be','will be'],
  'reflective': ['wonder','mystery','question','think','maybe','perhaps','meaning','purpose','existence','universe','why','how','what if','frag','vielleicht','sinn','bedeutung']
}

function keywordCategories(text) {
  const lower = text.toLowerCase()
  const found = []
  for (const [cat, words] of Object.entries(KEYWORDS)) {
    if (words.some(w => lower.includes(w))) found.push(cat)
  }
  return found.length > 0 ? found.slice(0, 3) : ['reflective']
}

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

  // Keyword categorization as primary (guaranteed to work)
  const keywordCats = keywordCategories(text)

  // Try AI for approval check + better categorization
  if (process.env.ANTHROPIC_API_KEY) {
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
          max_tokens: 80,
          messages: [{
            role: 'user',
            content: `Is "Life is… ${text}" appropriate to publish? Is it hate speech, spam, or a direct insult to a named person?
Reply ONLY with JSON: {"approved":true} or {"approved":false}`
          }]
        })
      })

      const data = await response.json()
      const raw = (data.content?.[0]?.text || '').trim()
      const match = raw.match(/\{[\s\S]*?\}/)
      if (match) {
        const result = JSON.parse(match[0])
        if (result.approved === false) {
          return res.status(200).json({ approved: false, categories: keywordCats, category: keywordCats[0] })
        }
      }
    } catch (err) {
      console.error('AI check failed:', err.message)
    }
  }

  // Use keyword categories
  return res.status(200).json({
    approved: true,
    categories: keywordCats,
    category: keywordCats[0]
  })
}
