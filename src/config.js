const currentProtocol = typeof window !== 'undefined' ? window.location.protocol : 'http:'
const currentHostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost'

const config = {
  meta: {
    author: 'Libé Labo',
    title: 'Huit semaines de confinement à l’épreuve des chiffres',
    url: 'https://www.liberation.fr/apps/2020/05/bilan-confinement',
    description: 'En à peine deux mois, le confinement a changé la France, entre urgence sanitaire liée au coronavirus et société chamboulée de toutes parts. Bilan à l’appui de chiffres et d’infographies de cette période exceptionnelle.',
    image: 'https://www.liberation.fr/apps/2020/05/bilan-confinement/social.jpg',
    xiti_id: 'bilan-confinement',
    tweet: 'En à peine deux mois, le confinement a changé la France. Bilan à l’appui de chiffres et d’infographies de cette période exceptionnelle.',
  },
  tracking: {
    active: false,
    format: 'bilan-confinement',
    article: 'bilan-confinement'
  },
  show_header: true,
  statics_url: process.env.NODE_ENV === 'production'
    ? 'https://www.liberation.fr/apps/static'
    : `${currentProtocol}//${currentHostname}:3003`,
  api_url: process.env.NODE_ENV === 'production'
    ? 'https://libe-labo-2.site/api'
    : `${currentProtocol}//${currentHostname}:3004/api`,
  stylesheet: '',
  // spreadsheet: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRjonBP75KzKDxp_77Fo7ejqUq7vcj1a92v0xtXmEHiJZwbsRxmSh-klwLMXJdfY1_51dO6CiH4inFE/pub?gid=0&single=true&output=tsv'
  spreadsheet: './data.tsv'
}

module.exports = config
