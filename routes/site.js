import express from 'express';
import { findPostBySlug, getAds, getPosts } from '../helpers/store.js';

const router = express.Router();
const siteStyles = ['/assets/css/styles.css'];
const parlayStyles = ['/assets/css/styles.css','/assets/css/parlay.css'];
const liveStyles = ['/assets/css/styles.css','/assets/css/live.css'];

function fmtDate(date){ return new Date(date || Date.now()).toLocaleDateString('id-ID',{day:'2-digit',month:'long',year:'numeric'}); }
function siteUrl(req){ return (process.env.BASE_URL || `${req.protocol}://${req.get('host')}`).replace(/\/+$/,''); }
function categorySlug(category=''){ return String(category||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''); }
function sortPosts(posts=[]){ return [...posts].sort((a,b)=> new Date(b.createdAt||0)-new Date(a.createdAt||0)); }
function isPrediction(post={}){ const c=categorySlug(post.category); return post.type==='prediction' || c.includes('prediksi') || c.includes('parlay') || (Array.isArray(post.predictions)&&post.predictions.length); }
function isArticle(post={}){ return !isPrediction(post); }
function parlayUrl(post){ return `/prediksi-parlay/${post.slug}`; }
function postUrl(post){ return isPrediction(post) ? parlayUrl(post) : `/berita/${post.slug}`; }
function flattenPredictions(posts=[]){
  const rows=[];
  for(const post of posts){
    for(const group of post.predictions || []){
      for(const m of group.matches || []){
        const teams = String(m.match||'').split(/\s+vs\s+|\s+-\s+/i);
        rows.push({
          ...m,
          league: group.league || m.league || post.category || 'Liga',
          homeName: m.homeName || teams[0] || 'Home', awayName: m.awayName || teams[1] || 'Away',
          homeLogo: m.homeLogo || '', awayLogo: m.awayLogo || '', kickoffWib: m.kickoffWib || m.time || '-',
          prediction: m.prediction || m.pick || '-', overUnder: m.overUnder || m.ou || '-', predictedScore: m.predictedScore || m.score || '-',
          confidence: Number(m.confidence || 70), odds: m.odds || '-', url: parlayUrl(post), postTitle: post.title
        });
      }
    }
  }
  return rows.slice(0,12);
}
function renderMatch(m){ return m; }

router.get('/', async (req,res)=>{
  const posts = await getPosts();
  const predictions = sortPosts(posts.filter(isPrediction));
  const articles = sortPosts(posts.filter(isArticle));
  const featured = posts.find(p=>p.featured) || articles[0] || predictions[0];
  const trending = sortPosts(posts.filter(p=>p.trending)).slice(0,5);
  res.render('pages/home',{
    pageTitle: res.locals.settings.metaTitle || res.locals.settings.siteName || 'Portal Bola',
    pageDescription: res.locals.settings.metaDescription || '', activePage:'home', styles:siteStyles, scripts:['/assets/js/home.js'], bodyClass:'',
    featured, latestArticles:articles.slice(0,6), hotNews:articles.slice(0,3), selectedArticles:articles.slice(3,9), latestParlay:predictions.slice(0,6), homePredictions:flattenPredictions(predictions), trending,
    canonical:siteUrl(req)+'/', fmtDate, postUrl, parlayUrl, categorySlug, schema:{'@context':'https://schema.org','@type':'WebSite',name:res.locals.settings.siteName,url:siteUrl(req)}
  });
});

router.get('/berita', async (req,res)=>{
  const q=String(req.query.q||'').trim().toLowerCase();
  const all=sortPosts((await getPosts()).filter(isArticle));
  const posts=q?all.filter(p=>[p.title,p.excerpt,p.category,(p.tags||[]).join(' ')].join(' ').toLowerCase().includes(q)):all;
  res.render('pages/berita',{pageTitle:`Berita Bola • ${res.locals.settings.siteName||'Portal Bola'}`,pageDescription:'Berita bola terbaru, hot news, transfer, jadwal, dan artikel pilihan.',activePage:'berita',styles:siteStyles,scripts:[],bodyClass:'',posts,q,fmtDate,postUrl,categorySlug,canonical:siteUrl(req)+'/berita'});
});

router.get('/berita/:slug', async (req,res,next)=>{
  const post=await findPostBySlug(req.params.slug); if(!post || isPrediction(post)) return next();
  const posts=await getPosts();
  const related=sortPosts(posts.filter(p=>p.id!==post.id && isArticle(p) && (p.category===post.category || (p.tags||[]).some(t=>(post.tags||[]).includes(t))))).slice(0,4);
  res.render('pages/post',{pageTitle:`${post.title} • ${res.locals.settings.siteName||'Portal Bola'}`,pageDescription:post.excerpt||'',activePage:'berita',styles:siteStyles,scripts:[],bodyClass:'',post,related,fmtDate,postUrl,categorySlug,canonical:siteUrl(req)+'/berita/'+post.slug,ogType:'article',ogImage:post.cover||post.thumbnail||'',schema:{'@context':'https://schema.org','@type':'NewsArticle',headline:post.title,datePublished:post.createdAt,author:{'@type':'Person',name:post.author||'Redaksi'}}});
});

router.get('/category/:slug', async (req,res)=>{
  const all=await getPosts();
  const posts=sortPosts(all.filter(p=>categorySlug(p.category)===req.params.slug));
  const title=posts[0]?.category || req.params.slug.replace(/-/g,' ');
  res.render('pages/berita',{pageTitle:`${title} • ${res.locals.settings.siteName||'Portal Bola'}`,pageDescription:`Artikel kategori ${title}`,activePage:'berita',styles:siteStyles,scripts:[],bodyClass:'',posts,q:'',fmtDate,postUrl,categorySlug,canonical:siteUrl(req)+'/category/'+req.params.slug});
});

router.get('/prediksi-parlay', async (req,res)=>{
  const posts=sortPosts((await getPosts()).filter(isPrediction));
  res.render('pages/prediksi-parlay',{pageTitle:'Prediksi Bola Hari Ini',pageDescription:'Prediksi bola hari ini dari liga besar dan Liga Indonesia lengkap dengan skor, 1X2, over/under, confidence, dan statistik ringkas.',activePage:'parlay',styles:parlayStyles,scripts:['/assets/js/home.js'],bodyClass:'body-parlay',posts,allPosts:posts,homePredictions:flattenPredictions(posts),fmtDate,parlayUrl,categorySlug,canonical:siteUrl(req)+'/prediksi-parlay'});
});

router.get('/prediksi-parlay/:slug', async (req,res,next)=>{
  const post=await findPostBySlug(req.params.slug); if(!post || !isPrediction(post)) return next();
  const posts=await getPosts(); const related=sortPosts(posts.filter(p=>p.id!==post.id && isPrediction(p))).slice(0,4); const ads=(await getAds()).filter(a=>a.active);
  res.render('pages/parlay-detail',{pageTitle:`${post.title} • ${res.locals.settings.siteName||'Portal Bola'}`,pageDescription:post.excerpt||'',activePage:'parlay',styles:parlayStyles,scripts:[],bodyClass:'body-parlay',post,related,ads,fmtDate,parlayUrl,postUrl,categorySlug,canonical:siteUrl(req)+'/prediksi-parlay/'+post.slug,ogImage:post.cover||post.thumbnail||''});
});

router.get('/live',(req,res)=>res.render('pages/live',{pageTitle:`Live Score • ${res.locals.settings.siteName||'Portal Bola'}`,pageDescription:'Live score modern dengan filter live, upcoming, dan finished dari liga besar.',activePage:'live',styles:liveStyles,scripts:['/assets/js/live.js'],bodyClass:'',canonical:siteUrl(req)+'/live'}));

router.get('/search', async (req,res)=>{
  const q=String(req.query.q||'').trim().toLowerCase(); const all=await getPosts();
  const posts=q?sortPosts(all.filter(p=>[p.title,p.excerpt,p.category,(p.tags||[]).join(' ')].join(' ').toLowerCase().includes(q))):[];
  res.render('pages/search',{pageTitle:'Pencarian Berita Bola',pageDescription:'Cari berita bola dan prediksi bola.',activePage:'search',styles:siteStyles,scripts:[],bodyClass:'',posts,q,fmtDate,postUrl,categorySlug,canonical:siteUrl(req)+'/search'});
});

router.get('/robots.txt',(req,res)=>{res.type('text/plain').send(`User-agent: *\nAllow: /\nSitemap: ${siteUrl(req)}/sitemap.xml\n`);});
router.get('/sitemap.xml', async (req,res)=>{ const posts=await getPosts(); const urls=['/','/berita','/prediksi-parlay','/live',...posts.map(postUrl)].map(u=>`<url><loc>${siteUrl(req)}${u}</loc></url>`).join(''); res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`); });
export default router;
