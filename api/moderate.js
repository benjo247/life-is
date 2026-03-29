const BLACKLIST = [
  'scheiße','scheisse','arschloch','fick','ficken','wichser','hurensohn','hure','schlampe','fotze',
  'nazi','hitler','nigger','kanake','fuck','fucking','fucker','shit','asshole','cunt','faggot',
  'selbstmord','suizid','suicide','bomb','terrorist'
]

const KEYWORDS = {
  'motivation': [
    // Sport & Fitness
    'pace','min/km','km/h','marathon','halbmarathon','alphafly','nike','adidas','laufen','läuft','gelaufen',
    'training','workout','gym','crossfit','triathlon','cycling','radfahren','schwimmen','sprint',
    'bestzeit','pb','pr','personal best','personal record','strava','garmin','watts','herzfrequenz',
    'km','meilen','miles','runde','runden','sets','reps','kg','kilo','bankdrücken','kniebeugen',
    // Allgemein
    'niemals aufgeben','aufgeben','weitermachen','stark','stärke','kämpfen','kämpf','glaub','träum',
    'schaff','möglich','vorwärts','durchhalten','nicht aufgeben','gib nicht auf','zieh durch',
    'versuchen','wachsen','entwickeln','verändern','besser werden','weitergehen','tapfer','mutig',
    'keep going','strength','strong','believe','possible','dream','fight','never give up',
    'rise','power','achieve','goal','forward','courage','try','hustle','grind','push',
    'early morning','5am','6am','alarm','aufgestanden','früh aufgestanden','morgenroutine',
    'disziplin','discipline','fokus','focus','mindset','willensstärke','durchkommen',
    'gipfel','berg','climb','challenge','herausforderung','überwunden','geschafft','stolz'
  ],
  'humor': [
    // Alltagshumor
    'montag','monday','dienstag','wochenende','feierabend','urlaub','büro','meeting','zoom',
    'kaffee','coffee','ohne kaffee','kaffeemaschine','espresso','energy drink','red bull',
    'prokrastination','prokrastinieren','deadline','überstunden','homeoffice','homeoffice',
    'netflix','serie','binge','scrolling','doomscrolling','social media','instagram','tiktok',
    'pizza','döner','burger','hangry','hunger','snack','mitternacht','kühlschrank',
    // Situationskomik
    'ponyhof','kein ponyhof','achterbahn','chaos','katastrophe','fiasko','drama','tragikomödie',
    'adulting','erwachsensein','steuererklärung','behörde','warteschlange','bahn','verspätung',
    'autocorrect','autokorrektur','autocomplete','siri','alexa','bug','crash','404',
    'funny','weird','absurd','ironic','witzig','seltsam','komisch','skurril','kurios',
    'lol','haha','hehe','xd',':-d',':d','lmao','rofl','omg','wtf','fml',
    // Moderne Redewendungen
    'cringe','sus','vibe','lowkey','highkey','literally','basically','honestly','periodt',
    'no cap','slay','based','ratio','bussin','mid','rent free','living rent free',
    'es ist wie es ist','shit happens','so ist das halt','tja','naja','whatever'
  ],
  'self-love': [
    'yourself','myself','selbstliebe','selbst lieben','dich selbst','mich selbst','sich selbst',
    'selbstwert','selbstvertrauen','selbstfürsorge','selbstakzeptanz','selbstrespekt',
    'ich bin genug','du bist genug','worthy','enough','accept','healing','innerer frieden',
    'inner peace','self-care','me time','grenzen setzen','nein sagen','boundaries',
    'therapie','therapy','selbstreflexion','wachstum','persönlichkeit','identität',
    'stolz auf mich','proud of myself','ich liebe mich','selbstbewusst','authentisch'
  ],
  'love': [
    'love','loved','loving','liebe','geliebt','lieben','zusammen','together','heart','herz',
    'beziehung','partner','partnerin','freund','freundin','verliebt','verlieben',
    'vermissen','miss','kiss','kuss','umarmen','hug','belong','gehören','füreinander',
    'sehnsucht','zuneigung','romance','romantisch','du und ich','you and me','wir','us',
    'hochzeit','wedding','anniversary','jahrestag','fernbeziehung','date','first date',
    'heimweh','zuhause','home','family','familie','mama','papa','kind','kinder','hund','katze'
  ],
  'joy': [
    'beautiful','happy','happiness','joy','smile','laugh','dance','sunshine','schön','glück',
    'glücklich','freude','spaß','lachen','fröhlich','heiter','leicht','leichtigkeit',
    'wunderbar','fantastisch','großartig','wunderschön','lebensfreude','tanzen','strahlen',
    'sommer','summer','strand','beach','meer','ocean','sonne','sun','natur','nature',
    'musik','music','konzert','festival','reisen','travel','abenteuer','adventure',
    'freunde','friends','lachen','zusammen lachen','party','feiern','celebrate',
    'grateful','dankbar','dankbarkeit','gratitude','wertschätzen','genießen','enjoy',
    'kinder','hund','haustier','pet','sonnenuntergang','sunset','morgendämmerung','regenbogen'
  ],
  'loss': [
    'pain','painful','hard','brutal','grief','sad','sadness','loss','lost','broken','hurt',
    'lonely','alone','tears','cry','dark','difficult','tough','traurig','schmerz','verlust',
    'einsam','gebrochen','verloren','dunkel','schwer','hart','leid','trauer','weinen','allein',
    'vermisse','fehlt mir','abschied','ende','vorbei','hoffnungslos','verzweiflung',
    'erschöpft','müde','burnout','überwältigt','overwhelmed','exhausted','tired',
    'vermisst','gestorben','tod','death','trauer','mourning','gedenken',
    'herzschmerz','heartbreak','trennung','breakup','scheidung','divorce','enttäuscht'
  ],
  'encouraging': [
    'better','hope','hopeful','worth it','positive','inspire','chance','opportunity',
    'hoffnung','besser','möglich','alles wird gut','es wird besser','zuversicht',
    'optimismus','du schaffst','wir schaffen','new day','neuer tag','neuanfang',
    'fresh start','second chance','zweite chance','morgen','tomorrow','sunrise',
    'glaub daran','believe in','es lohnt sich','hang in there','keep your head up'
  ],
  'reflective': [
    'wonder','mystery','perhaps','meaning','purpose','existence','universe',
    'vielleicht','sinn','bedeutung','nachdenken','philosophisch','tief','fragen',
    'warum','wieso','weshalb','wie','was wäre wenn','what if','imagine','stell dir vor',
    'zeit','time','vergänglich','fleeting','moment','augenblick','ewigkeit','infinity',
    'bewusstsein','consciousness','realität','reality','traum','dream','illusion',
    'perspektive','blickwinkel','erkenntnis','insight','weisheit','wisdom'
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
  console.log('Text:', text, '→', cats)

  return res.status(200).json({
    approved: true,
    categories: cats,
    category: cats[0]
  })
}
