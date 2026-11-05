/**
 * WSS07 pure Nāma Rāśi resolver, ported from tested, unmerged PR #16.
 * No DOM, network, storage, account linkage or birth-chart mutation.
 * Source basis: fixed traditional Avakahada 27x4 table; Roman names need sound confirmation.
 */
const RASHIS = [
  ["Mesha", "मेष", "Aries", "Choose one beginning you can approach with intention.", "एक नई शुरुआत को सोच-समझकर चुनें।"],
  ["Vrishabha", "वृषभ", "Taurus", "Value steadiness and one achievable commitment.", "स्थिरता और एक निभाने योग्य संकल्प को महत्व दें।"],
  ["Mithuna", "मिथुन", "Gemini", "Seek clarity in one conversation or question.", "किसी संवाद या प्रश्न में स्पष्टता खोजें।"],
  ["Karka", "कर्क", "Cancer", "Notice what brings a sense of care and belonging.", "देखें कि अपनापन और देखभाल किससे बढ़ती है।"],
  ["Simha", "सिंह", "Leo", "Use confidence in service of a worthwhile task.", "आत्मविश्वास को किसी सार्थक कार्य में लगाएँ।"],
  ["Kanya", "कन्या", "Virgo", "Improve one detail without losing the whole picture.", "समग्र दृष्टि बनाए रखते हुए एक विवरण सुधारें।"],
  ["Tula", "तुला", "Libra", "Consider both fairness and your own boundaries.", "न्याय और अपनी सीमाओं दोनों पर विचार करें।"],
  ["Vrishchika", "वृश्चिक", "Scorpio", "Reflect before reacting to an intense feeling.", "तीव्र भावना पर प्रतिक्रिया से पहले विचार करें।"],
  ["Dhanu", "धनु", "Sagittarius", "Make room for learning and a wider perspective.", "सीखने और व्यापक दृष्टिकोण के लिए समय दें।"],
  ["Makara", "मकर", "Capricorn", "Take a practical step toward a longer-term goal.", "दीर्घकालीन लक्ष्य की दिशा में एक व्यावहारिक कदम लें।"],
  ["Kumbha", "कुम्भ", "Aquarius", "Explore a useful idea with others in mind.", "दूसरों का ध्यान रखते हुए किसी उपयोगी विचार को परखें।"],
  ["Meena", "मीन", "Pisces", "Balance imagination with a clear next action.", "कल्पनाशीलता को स्पष्ट अगले कदम से जोड़ें।"]
];
// Canonical, inspectable list: one record per Nakshatra and four pada syllables.
// Roman labels are search aids, never a forced conversion of a user's spelling.
const NAKSHATRAS = [
  ["Ashwini","अश्विनी","चू चे चो ला","chu che cho la"],
  ["Bharani","भरणी","ली लू ले लो","li lu le lo"],
  ["Krittika","कृत्तिका","अ ई उ ए","a i u e"],
  ["Rohini","रोहिणी","ओ वा वी वू","o va vi vu"],
  ["Mrigashira","मृगशिरा","वे वो का की","ve vo ka ki"],
  ["Ardra","आर्द्रा","कू घ ङ छ","ku gha nga chha"],
  ["Punarvasu","पुनर्वसु","के को हा ही","ke ko ha hi"],
  ["Pushya","पुष्य","हु हे हो डा","hu he ho da"],
  ["Ashlesha","आश्लेषा","डी डू डे डो","di du de do"],
  ["Magha","मघा","मा मी मू मे","ma mi mu me"],
  ["Purva Phalguni","पूर्वाफाल्गुनी","मो टा टी टू","mo ta ti tu"],
  ["Uttara Phalguni","उत्तराफाल्गुनी","टे टो पा पी","te to pa pi"],
  ["Hasta","हस्त","पू ष ण ठ","pu sha na tha"],
  ["Chitra","चित्रा","पे पो रा री","pe po ra ri"],
  ["Swati","स्वाती","रू रे रो ता","ru re ro ta"],
  ["Vishakha","विशाखा","ती तू ते तो","ti tu te to"],
  ["Anuradha","अनुराधा","ना नी नू ने","na ni nu ne"],
  ["Jyeshtha","ज्येष्ठा","नो या यी यू","no ya yi yu"],
  ["Mula","मूल","ये यो भा भी","ye yo bha bhi"],
  ["Purva Ashadha","पूर्वाषाढा","भू धा फा ढा","bhu dha pha dha"],
  ["Uttara Ashadha","उत्तराषाढा","भे भो जा जी","bhe bho ja ji"],
  ["Shravana","श्रवण","खी खू खे खो","khi khu khe kho"],
  ["Dhanishtha","धनिष्ठा","गा गी गु गे","ga gi gu ge"],
  ["Shatabhisha","शतभिषा","गो सा सी सू","go sa si su"],
  ["Purva Bhadrapada","पूर्वाभाद्रपदा","से सो दा दी","se so da di"],
  ["Uttara Bhadrapada","उत्तराभाद्रपदा","दू थ झ ञ","du tha jha nya"],
  ["Revati","रेवती","दे दो चा ची","de do cha chi"]
];
const SOURCES = Object.freeze([
  {title:"Uttarakhand Open University, Janmākṣara Nirṇaya, §3.3.2",url:"https://uou.ac.in/sites/default/files/slm/BAJY-102.pdf"},
  {title:"Avakahaḍā Chakra (27 Nakshatras, 108 padas)",url:"https://www.vedicpatro.com/panchanga/avakahada-chakra"},
  {title:"Drik Panchang — Rashi by birth-name syllable",url:"https://www.drikpanchang.com/astrology/prediction/info/find-rashi-with-name.html"}
]);
const RECORDS = Object.freeze(NAKSHATRAS.flatMap((row, index) => {
  const devanagari = row[2].split(" ");
  const roman = row[3].split(" ");
  if (devanagari.length !== 4 || roman.length !== 4) throw new Error("Incomplete Nakshatra syllables");
  return devanagari.map((syllable, i) => Object.freeze({
    key:index + "-" + (i + 1),syllable,roman:roman[i],
    nakshatra:row[0],nakshatraHi:row[1],nakshatraIndex:index + 1,
    pada:i + 1,rashiIndex:Math.floor((index * 4 + i) / 9)
  }));
}));
if (RECORDS.length !== 108 || RASHIS.length !== 12 ||
    RASHIS.some((_,i) => RECORDS.filter(r => r.rashiIndex === i).length !== 9))
  throw new Error("Name-syllable mapping does not cover 108 padas / 12 Rashis");

function foldDeva(text) {
  // Vowel-length and ऐ/ए, औ/ओ lookup equivalence are explicitly
  // disclosed; the entered spelling is never altered or transliterated.
  return String(text).normalize("NFC")
    .replace(/आ/g,"अ").replace(/इ/g,"ई").replace(/ऊ/g,"उ")
    .replace(/ि/g,"ी").replace(/ु/g,"ू")
    .replace(/ै/g,"े").replace(/ौ/g,"ो");
}
function resolveSyllable(syllable) {
  return RECORDS.find(row => row.syllable === syllable) || null;
}
function resolveName(rawName) {
  const name=String(rawName||"").trim().normalize("NFC");
  if (!name) return {state:"empty",candidates:[],script:null};
  const first=name.split(/\s+/u)[0].replace(/^[^\p{L}]+/u,"");
  if (!first) return {state:"unsupported",candidates:[],script:null};
  if (/^[\u0900-\u097f]/u.test(first)) {
    const m=first.match(/^([\u0904-\u0939\u0958-\u095f])([\u093e-\u094f]?)/u);
    if (!m || (m[2] && m[2] === "्")) return {state:"manual_required",candidates:[],script:"devanagari"};
    const sound=foldDeva(m[1]+(m[2]||""));
    const candidates=RECORDS.filter(row => foldDeva(row.syllable) === sound);
    return {state:candidates.length===1?"exact":candidates.length?"ambiguous":"manual_required",
      candidates,script:"devanagari"};
  }
  if (/^[A-Za-z]/.test(first)) {
    const roman=first.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g,"");
    const matches=RECORDS.filter(row => roman.startsWith(row.roman));
    const maxLength=matches.reduce((max,r)=>Math.max(max,r.roman.length),0);
    const candidates=matches.filter(row=>row.roman.length===maxLength);
    // Roman letters cannot reliably distinguish retroflex and dental
    // consonants; even a single candidate is unconfirmed until the user
    // selects its actual Devanagari sound.
    return {state:candidates.length?"confirm_sound":"manual_required",
      candidates,script:"roman",matchedRoman:roman.slice(0,maxLength)};
  }
  return {state:"manual_required",candidates:[],script:"other"};
}


export {RASHIS,NAKSHATRAS,RECORDS,resolveName,resolveSyllable,SOURCES};
export const NAMA_STATUS="traditional_name_association_only_not_birth_moon";
