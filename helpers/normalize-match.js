
function safeUrl(v=''){
 if(!v) return '';
 return String(v).replace('http://','https://');
}
function pick(...vals){
 for(const v of vals){
   if(v!==undefined && v!==null && v!=='') return v;
 }
 return '';
}
function normalizeMatch(match={}){
 const homeName = pick(match.home?.name,match.teams?.home?.name,match.homeTeam?.name,'Home');
 const awayName = pick(match.away?.name,match.teams?.away?.name,match.awayTeam?.name,'Away');
 const homeLogo = safeUrl(pick(match.home?.logo,match.teams?.home?.logo,match.homeTeam?.logo));
 const awayLogo = safeUrl(pick(match.away?.logo,match.teams?.away?.logo,match.awayTeam?.logo));
 const leagueName = pick(match.league?.name,match.leagueName,match.league,'League');
 const leagueLogo = safeUrl(pick(match.league?.logo,match.leagueLogo));
 return {
   homeName,awayName,homeLogo,awayLogo,leagueName,leagueLogo,
   kickoffWib: pick(match.kickoffWib,match.time,match.fixture?.date,'00:00'),
   status: pick(match.status,match.fixture?.status?.short,'NS'),
   score: pick(match.score,match.predictedScore,'-'),
   prediction: pick(match.prediction,match.pick,match.market,'HOME'),
   confidence: Number(pick(match.confidence,65)),
   odds: pick(match.odds,'1.90'),
   form: match.form || {home:['W','D','W'],away:['W','L','D']},
   stats: match.stats || {},
   h2h: match.h2h || []
 }
}
module.exports={normalizeMatch};
