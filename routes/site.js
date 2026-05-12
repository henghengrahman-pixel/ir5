import express from "express";
import { findPostBySlug, getAds, getPosts } from "../helpers/store.js";

const router = express.Router();

const blogStyles = ["/assets/css/styles.css", "/assets/css/blog.css"];

function fmtDate(date) {
  return new Date(date || Date.now()).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
}

function siteUrl(req) {
  return process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;
}

function categorySlug(category = "") {
  return String(category || "Berita Bola")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function articleUrl(post) {
  return `/berita/${post.slug}`;
}

function sortPosts(posts = []) {
  return [...posts].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
}

function publicArticles(posts = []) {
  return sortPosts(posts.filter(post => post.published !== false));
}

function getRelated(posts = [], post = {}, limit = 4) {
  const cat = categorySlug(post.category);
  const tags = new Set((post.tags || []).map(t => String(t).toLowerCase()));
  return sortPosts(posts.filter(item => {
    if (item.id === post.id || item.published === false) return false;
    if (categorySlug(item.category) === cat) return true;
    return (item.tags || []).some(tag => tags.has(String(tag).toLowerCase()));
  })).slice(0, limit);
}

router.get("/", async (req, res) => {
  const allPosts = await getPosts();
  const latestArticles = publicArticles(allPosts).slice(0, 8);

  res.render("pages/home", {
    pageTitle: res.locals.settings.metaTitle || "Prediksi Bola",
    pageDescription: res.locals.settings.metaDescription || "",
    activePage: "home",
    styles: ["/assets/css/styles.css"],
    scripts: ["/assets/js/home.js"],
    bodyClass: "",
    homePredictions: latestArticles,
    latestParlay: latestArticles,
    latestArticles,
    fmtDate,
    articleUrl
  });
});

router.get("/live", (req, res) =>
  res.render("pages/live", {
    pageTitle: `Live Score • ${res.locals.settings.siteName || "Bandar Toto"}`,
    pageDescription: res.locals.settings.metaDescription || "",
    activePage: "live",
    styles: ["/assets/css/styles.css", "/assets/css/live.css"],
    scripts: ["/assets/js/live.js"],
    bodyClass: ""
  })
);

router.get("/berita", async (req, res) => {
  const page = Math.max(1, Number(req.query.page || 1));
  const perPage = Number(process.env.ARTICLE_PER_PAGE || 8);
  const allPosts = publicArticles(await getPosts());
  const totalPages = Math.max(1, Math.ceil(allPosts.length / perPage));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * perPage;
  const posts = allPosts.slice(start, start + perPage);
  const ads = await getAds();

  res.render("pages/berita", {
    pageTitle: `Berita Bola • ${res.locals.settings.siteName || "Portal Bola"}`,
    pageDescription: "Kumpulan berita bola terbaru, kabar transfer, jadwal big match, update liga besar, dan artikel pilihan sepak bola.",
    activePage: "berita",
    styles: blogStyles,
    scripts: [],
    bodyClass: "body-news",
    posts,
    allPosts,
    currentPage,
    totalPages,
    ads: ads.filter(a => a.active),
    canonical: `${siteUrl(req).replace(/\/+$/, "")}/berita`,
    fmtDate,
    articleUrl,
    categorySlug
  });
});

router.get("/berita/:slug", async (req, res, next) => {
  const post = await findPostBySlug(req.params.slug);
  if (!post || post.published === false) return next();
  const posts = await getPosts();
  const related = getRelated(posts, post, 4);
  const latest = publicArticles(posts).filter(p => p.id !== post.id).slice(0, 6);
  const ads = await getAds();

  res.render("pages/berita-detail", {
    pageTitle: `${post.title} • ${res.locals.settings.siteName || "Portal Bola"}`,
    pageDescription: post.excerpt || res.locals.settings.metaDescription || "",
    activePage: "berita",
    styles: blogStyles,
    scripts: [],
    bodyClass: "body-news",
    post,
    related,
    latest,
    ads: ads.filter(a => a.active),
    canonical: `${siteUrl(req).replace(/\/+$/, "")}/berita/${post.slug}`,
    shareUrl: `${siteUrl(req).replace(/\/+$/, "")}/berita/${post.slug}`,
    fmtDate,
    articleUrl,
    categorySlug
  });
});

router.get("/prediksi-parlay", (_req, res) => res.redirect(301, "/berita"));
router.get("/prediksi-parlay/:slug", (req, res) => res.redirect(301, `/berita/${req.params.slug}`));

router.get("/search", async (req, res) => {
  const q = String(req.query.q || "").trim().toLowerCase();
  const all = await getPosts();
  const posts = q
    ? publicArticles(all).filter(p => [p.title, p.excerpt, p.category, p.author, (p.tags || []).join(" ")].join(" ").toLowerCase().includes(q))
    : [];

  res.render("pages/search", {
    pageTitle: q ? `Hasil pencarian: ${q}` : "Pencarian Berita",
    pageDescription: q ? `Hasil pencarian berita bola untuk ${q}` : "Cari berita bola terbaru",
    activePage: "search",
    styles: blogStyles,
    scripts: [],
    bodyClass: "body-news",
    posts,
    q,
    fmtDate,
    articleUrl,
    parlayUrl: articleUrl,
    categorySlug
  });
});

router.get("/category/:category", async (req, res) => {
  const cat = req.params.category;
  const all = await getPosts();
  const posts = publicArticles(all).filter(p => categorySlug(p.category) === cat);

  res.render("pages/search", {
    pageTitle: `Kategori ${cat} • Berita Bola`,
    pageDescription: `Artikel dan berita bola kategori ${cat}`,
    activePage: "category",
    styles: blogStyles,
    scripts: [],
    bodyClass: "body-news",
    posts,
    q: `Kategori: ${cat}`,
    fmtDate,
    articleUrl,
    parlayUrl: articleUrl,
    categorySlug
  });
});

router.get("/sitemap.xml", async (req, res) => {
  const base = siteUrl(req).replace(/\/+$/, "");
  const posts = publicArticles(await getPosts());
  const cats = [...new Set(posts.map(p => categorySlug(p.category)).filter(Boolean))];
  const urls = ["/", "/berita", "/live", ...cats.map(c => `/category/${c}`), ...posts.map(p => `/berita/${p.slug}`)];
  res.type("application/xml").send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${base}${u}</loc></url>`).join("\n")}
</urlset>`);
});

router.get("/robots.txt", (req, res) => {
  const base = siteUrl(req).replace(/\/+$/, "");
  res.type("text/plain").send(`User-agent: *\nAllow: /\nSitemap: ${base}/sitemap.xml\n`);
});

router.get("/:slug", async (req, res, next) => {
  const post = await findPostBySlug(req.params.slug);
  if (!post || post.published === false) return next();
  return res.redirect(301, `/berita/${post.slug}`);
});

export default router;
