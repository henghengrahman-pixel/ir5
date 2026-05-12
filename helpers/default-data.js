export const defaultSlides = [
  { id:'slide-1', title:'Big Match Malam Ini', image:'', link:'/prediksi-parlay', order:1, active:true },
  { id:'slide-2', title:'Berita Bola Terbaru', image:'', link:'/berita', order:2, active:true }
];

export const defaultQuickActions = [
  { id:'qa-1', title:'Berita', icon:'', link:'/berita', order:1, active:true },
  { id:'qa-2', title:'Prediksi', icon:'', link:'/prediksi-parlay', order:2, active:true },
  { id:'qa-3', title:'Live Score', icon:'', link:'/live', order:3, active:true },
  { id:'qa-4', title:'Kontak', icon:'', link:'#footer', order:4, active:true }
];

export const defaultSettings = {
  siteName:'Portal Bola Premium',
  logoUrl:'',
  faviconUrl:'',
  backgroundDesktop:'',
  backgroundMobile:'',
  primaryColor:'#f5c542',
  accentColor:'#ffb300',
  loginUrl:'#',
  registerUrl:'#',
  telegramUrl:'',
  whatsappUrl:'',
  livechatUrl:'',
  footerText:'Portal berita bola, live score, dan prediksi bola harian.',
  runningText:'Update berita bola terbaru, prediksi pertandingan pilihan, big match, dan live score liga besar.',
  metaTitle:'Portal Berita Bola + Prediksi Bola Premium',
  metaDescription:'Portal berita bola premium dengan update terbaru, prediksi bola hari ini, big match, live score, dan artikel pilihan liga besar.',
  metaKeywords:'berita bola,prediksi bola,live score,big match,liga indonesia,premier league,champions league',
  ogImage:'',
  footerHtml:''
};

export const defaultAds = [];

export const defaultPosts = [
  {
    id:'post-news-1',
    type:'article',
    title:'Liga Besar Pekan Ini: Jadwal Padat dan Big Match yang Paling Dinanti',
    slug:'liga-besar-pekan-ini-jadwal-padat-dan-big-match-yang-paling-dinanti',
    category:'Berita Bola',
    tags:['Berita Bola','Big Match','Liga Besar'],
    author:'Redaksi Bola',
    thumbnail:'',
    cover:'',
    excerpt:'Rangkuman agenda liga besar pekan ini, mulai dari persaingan papan atas hingga laga yang berpotensi menjadi sorotan utama.',
    content:'<p>Pekan ini menghadirkan rangkaian pertandingan menarik dari liga besar Eropa dan Indonesia. Fokus utama ada pada konsistensi tim papan atas, rotasi pemain, serta duel penting yang bisa memengaruhi posisi klasemen.</p><h2>Fokus pertandingan</h2><p>Big match selalu memberi warna berbeda karena tekanan, kualitas pemain, dan momentum tim menjadi faktor penting. Pembaca bisa mengikuti update berita, prediksi, serta live score langsung dari halaman utama.</p>',
    published:true,
    featured:true,
    trending:true,
    createdAt:new Date().toISOString(),
    updatedAt:new Date().toISOString(),
    predictions:[]
  },
  {
    id:'post-pred-1',
    type:'prediction',
    title:'Prediksi Bola Hari Ini: Pilihan Liga Besar dan Liga Indonesia',
    slug:'prediksi-bola-hari-ini-pilihan-liga-besar-dan-liga-indonesia',
    category:'Prediksi Bola',
    tags:['Prediksi Bola','Liga Indonesia','Premier League'],
    author:'Analis Bola',
    thumbnail:'',
    cover:'',
    excerpt:'Prediksi bola hari ini disusun dengan tampilan ringkas: skor, 1X2, over/under, confidence, dan ringkasan statistik.',
    content:'<p>Prediksi bola hari ini fokus pada pertandingan pilihan dari liga besar, Liga Indonesia, serta kompetisi terkenal lain yang memiliki data jelas.</p>',
    published:true,
    featured:true,
    trending:false,
    createdAt:new Date().toISOString(),
    updatedAt:new Date().toISOString(),
    predictions:[
      { league:'Liga Indonesia', matches:[{ match:'Persija vs Persib', homeName:'Persija', awayName:'Persib', pick:'1X', ou:'Under 2.5', score:'1 - 1', confidence:72 }] },
      { league:'Premier League', matches:[{ match:'Arsenal vs Chelsea', homeName:'Arsenal', awayName:'Chelsea', pick:'1', ou:'Over 2.5', score:'2 - 1', confidence:76 }] }
    ]
  }
];
