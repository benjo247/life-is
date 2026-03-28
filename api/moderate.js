const BLACKLIST = [
  'scheiße','scheisse','arschloch','fick','ficken','wichser','hurensohn','hure','schlampe','fotze',
  'nazi','hitler','nigger','kanake','fuck','fucking','fucker','shit','asshole','cunt','faggot',
  'selbstmord','suizid','suicide','bomb','terrorist'
]

const KEYWORDS = {
  'self-love': [
    'yourself','myself','self-love','selflove','selbstliebe','selbst lieben','dich selbst','mich selbst','sich selbst',
    'selbstwert','selbstvertrauen','selbstfürsorge','ich bin genug','du bist genug','worthy','enough','accept',
    'healing','mir selbst','inner peace','innerer frieden','selbstakzeptanz','wert','selbstrespekt'
  ],
  'love': [
    'love','loved','loving','liebe','geliebt','lieben','zusammen','together','heart','herz',
    'connection','beziehung','partner','vermissen','miss','kiss','kuss','belong','gehören',
    'romance','romantisch','du und ich','you and me','füreinander','sehnsucht','zuneigung','verliebt'
  ],
  'joy': [
    'beautiful','happy','happiness','joy','smile','laugh','dance','sunshine','wunderbar','schön',
    'glück','glücklich','freude','wonderful','amazing','magic','fun','grateful','bliss','spaß',
    'lachen','tanzen','strahlen','herrlich','fantastisch','großartig','wunderschön','lebensfreude',
    'licht','leicht','leichtigkeit','fröhlich','heiter','genuss','lächeln'
  ],
  'humor': [
    'funny','weird','absurd','ironic','witzig','seltsam','chaos','random','literally','basically',
    'lustig','verrückt','ironie','kurios','skurril','komisch','lol','haha','quatsch','unsinn',
    'kein ponyhof','ponyhof','auf und ab','achterbahn','durcheinander','chaotisch'
  ],
  'loss': [
    'pain','painful','hard','brutal','grief','sad','sadness','loss','lost','broken','hurt',
    'lonely','alone','tears','cry','dark','difficult','tough','traurig','schmerz','verlust',
    'einsam','gebrochen','verloren','dunkel','schwer','hart','leid','trauer','weinen','allein',
    'vermisse','fehlt mir','abschied','ende','vorbei','hoffnungslos','verzweiflung'
  ],
  'motivation': [
    'keep going','strength','strong','believe','possible','dream','fight','never give up','rise',
    'power','achieve','goal','forward','courage','try','niemals aufgeben','aufgeben','weitermachen',
    'stark','stärke','kämpfen','kämpf','glaub','träum','schaff','möglich','vorwärts','durchhalten',
    'nicht aufgeben','gib nicht auf','weiter','durchziehen','zieh durch','versuchen','probieren',
    'ziel','wachsen','entwickeln','verändern','besser werden','weitergehen','tapfer','mutig'
  ],
  'encouraging': [
    'better','hope','hopeful','worth it','positive','inspire','chance','opportunity',
    'hoffnung','besser','möglich','can be','will be','alles wird gut','es wird besser',
    'zuversicht','optimismus','aufmunterung','ermutigung','du schaffst','wir schaffen'
  ],
  'reflective': [
    'wonder','mystery','question','think','maybe','perhaps','meaning','purpose','existence',
    'universe','frag','vielleicht','sinn','bedeutung','nachdenken','philosophisch','tief'
  ]
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

  const cats = keywordCategories(text)
  console.log('Text:', text, '→ Categories:', cats)

  return res.status(200).json({
    approved: true,
    categories: cats,
    category: cats[0]
  })
}
