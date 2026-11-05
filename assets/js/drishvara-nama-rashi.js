/* Drishvara: Nāma Rāśi v1 — traditional name-sound reference, separate from Janma Rāśi.
 * Source basis: Avakahaḍā/Nakshatra-pada naming syllables.
 * This module has no network calls, persistence, identity inference, or astrology API calls.
 * Do not use its editorial daily prompt as a planetary-transit prediction.
 */
(function () {
  "use strict";
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

  const dailyQuestions=[
    ["What is one task worth completing carefully?","कौन-सा एक काम ध्यानपूर्वक पूरा करना उचित होगा?"],
    ["Which conversation deserves more listening?","किस बातचीत में अधिक सुनना उपयोगी होगा?"],
    ["What small habit deserves your attention?","किस छोटी आदत पर ध्यान देना चाहिए?"],
    ["Where would a balanced choice help today?","आज किस निर्णय में संतुलन उपयोगी होगा?"],
    ["What can you learn without rushing to judgement?","बिना जल्द निर्णय किए आज क्या सीख सकते हैं?"],
    ["What responsibility can you simplify?","किस जिम्मेदारी को सरल बनाया जा सकता है?"],
    ["Which meaningful moment deserves some quiet reflection?","किस सार्थक अनुभव पर शांतिपूर्वक विचार करना चाहिए?"]
  ];
  function localLanguage() {
    return document.querySelector("#reflect")?.getAttribute("data-dv2-lang")==="hi" ? "hi":"en";
  }
  const say=(en,hi)=>localLanguage()==="hi"?hi:en;
  const el=(tag,className,textContent)=>{
    const node=document.createElement(tag);
    if(className)node.className=className;
    if(textContent!==undefined)node.textContent=textContent;
    return node;
  };
  function mount() {
    const name=document.getElementById("star-reflection-name");
    const parent=name?.closest(".card");
    if (!name || !parent || document.getElementById("nama-rashi-panel")) return;
    const anchor=document.getElementById("star-name-privacy")||name.parentElement;
    const panel=el("section","r-nama-panel");
    panel.id="nama-rashi-panel";
    panel.setAttribute("aria-labelledby","nama-rashi-heading");
    const heading=el("h3","r-nama-heading","Nāma Rāśi · Name-based horoscope");
    heading.id="nama-rashi-heading";
    const explain=el("p","r-nama-explain");
    const consentLabel=el("label","r-nama-consent");
    const consent=el("input");
    consent.type="checkbox";consent.id="nama-rashi-consent";
    consent.setAttribute("autocomplete","off");
    const consentText=el("span");
    consentLabel.append(consent,consentText);
    const status=el("p","r-nama-status");
    status.id="nama-rashi-status";status.setAttribute("role","status");status.setAttribute("aria-live","polite");
    const confirmation=el("div","r-nama-confirm");
    const confirmLabel=el("label");
    confirmLabel.htmlFor="nama-rashi-sound";
    const choice=el("select");
    choice.id="nama-rashi-sound";choice.setAttribute("aria-label","Confirm traditional starting syllable");
    confirmLabel.append(choice);
    const confirmNote=el("p","r-nama-note");
    confirmation.append(confirmLabel,choice,confirmNote);
    const result=el("div","r-nama-result");
    result.id="nama-rashi-result";result.setAttribute("aria-live","polite");
    const basis=el("p","r-nama-note");
    const source=el("details","r-nama-sources");
    const summary=el("summary");
    const list=el("ul");
    SOURCES.forEach(item=>{
      const li=el("li"),a=el("a",null,item.title);
      a.href=item.url;a.target="_blank";a.rel="noopener noreferrer";
      li.append(a);list.append(li);
    });
    source.append(summary,list);
    panel.append(heading,explain,consentLabel,status,confirmation,result,basis,source);
    anchor.insertAdjacentElement("afterend",panel);
    let selectedKey="";
    function buildChoices(candidates){
      const fallback=RECORDS;
      const sourceChoices=candidates.length?candidates:fallback;
      choice.replaceChildren();
      const empty=el("option",null,say("Select the initial sound…","प्रारम्भिक ध्वनि चुनें…"));
      empty.value="";choice.append(empty);
      sourceChoices.forEach(row=>{
        const rashi=RASHIS[row.rashiIndex];
        const opt=el("option",null,row.syllable+" ("+row.roman+") · "+row.nakshatra+" "+row.pada+" · "+rashi[1]);
        opt.value=row.key;choice.append(opt);
      });
      choice.value=selectedKey&&sourceChoices.some(x=>x.key===selectedKey)?selectedKey:"";
    }
    function render(){
      const language=localLanguage();
      heading.textContent=say("Nāma Rāśi · Name-based horoscope","नाम राशि · नामाधारित राशिफल");
      explain.textContent=say("Uses the first traditional name-syllable, not the birth-time Moon position. Use the name you intend to associate with the tradition (for example, a naming-ceremony name).",
        "यह परम्परागत नाम के प्रारम्भिक अक्षर पर आधारित है, जन्म समय की चन्द्रस्थिति पर नहीं। जिस नाम को इस परम्परा से जोड़ना चाहते हैं, वही लिखें (जैसे नामकरण में रखा नाम)।");
      consentText.textContent=say("I agree to use my entered name in this browser for this reading only.","मैं अपने नाम का केवल इस ब्राउज़र में इस चिंतन हेतु उपयोग स्वीकार करता/करती हूँ।");
      confirmLabel.firstChild && confirmLabel.firstChild.nodeType===3 && confirmLabel.firstChild.remove();
      confirmLabel.insertBefore(document.createTextNode(say("Confirm traditional starting syllable","परम्परागत प्रारम्भिक अक्षर की पुष्टि करें")),choice);
      confirmNote.textContent=say("Roman spelling can represent several Sanskrit sounds. Confirmation is required; no phonetic Sanskritisation is assumed.",
        "रोमन वर्तनी से कई संस्कृत ध्वनियाँ सम्भव हैं। पुष्टि आवश्यक है; बिना सहमति लिप्यन्तरण नहीं माना जाता।");
      summary.textContent=say("Naming method and sources","नामाक्षर पद्धति और स्रोत");
      basis.textContent=say("Name-sign guidance is a traditional association plus a Drishvara editorial daily question—not a birth-chart result, planetary-transit forecast, or certain prediction. Janma Rāśi remains separate. No name is transmitted or saved.",
        "नाम राशि पारम्परिक अक्षर-संबंध और द्रिश्वरा का संपादकीय दैनिक प्रश्न है—यह जन्मपत्री, गोचर फलादेश अथवा निश्चित भविष्यवाणी नहीं है। जन्म राशि अलग है। नाम न भेजा जाता है न सहेजा जाता है।");
      result.replaceChildren();
      confirmation.hidden=true;
      if(!consent.checked){status.textContent=say("Optional. Tick consent to derive Nāma Rāśi from the entered name.","वैकल्पिक। नाम से राशि जानने के लिए सहमति दें।");return;}
      const resolved=resolveName(name.value);
      if(resolved.state==="empty"){status.textContent=say("Enter your first or traditional name above.","ऊपर अपना प्रथम या परम्परागत नाम लिखें।");return;}
      if(resolved.state==="unsupported"){status.textContent=say("A name beginning with a letter is required.","अक्षर से आरम्भ होने वाला नाम आवश्यक है।");return;}
      if(resolved.state==="exact" && resolved.script==="devanagari") {
        selectedKey=resolved.candidates[0].key;
      }else{
        confirmation.hidden=false;
        const candidates=resolved.candidates;
        buildChoices(candidates);
        status.textContent=say(candidates.length?
          "Verify the first sound of the entered name before assigning a Rāśi.":
          "The starting sound does not match an approved syllable exactly. Choose the traditional initial sound manually.",
          candidates.length?
          "राशि तय करने से पहले नाम की प्रारम्भिक ध्वनि की पुष्टि करें।":
          "प्रारम्भिक ध्वनि का सटीक मिलान नहीं मिला। परम्परागत प्रारम्भिक अक्षर स्वयं चुनें।");
        if(!selectedKey)return;
      }
      const syllable=RECORDS.find(row=>row.key===selectedKey);
      if(!syllable)return;
      // Never retain the entire raw name in a computed record or network call.
      const rashi=RASHIS[syllable.rashiIndex];
      const day=new Date();
      const dayLabel=day.toLocaleDateString(language==="hi"?"hi-IN":"en-IN",{day:"numeric",month:"long",year:"numeric"});
      const weekday=dailyQuestions[day.getDay()];
      status.textContent=say("Traditional name-sound match (not birth Moon sign).","परम्परागत नामाक्षर मिलान (जन्म चन्द्र राशि नहीं)।");
      result.append(
        el("h4",null,rashi[0]+" · "+rashi[1]+" ("+rashi[2]+")"),
        el("p",null,say("Starting sound: ","प्रारम्भिक अक्षर: ")+syllable.syllable+
          " ("+syllable.roman+") · "+(language==="hi"?syllable.nakshatraHi:syllable.nakshatra)+
          " · "+say("Pada ","चरण ")+syllable.pada),
        el("strong",null,say("Today's name-sign reflection · ","आज का नामराशि चिंतन · ")+dayLabel),
        el("p",null,language==="hi"?rashi[4]:rashi[3]),
        el("p",null,language==="hi"?weekday[1]:weekday[0])
      );
    }
    name.addEventListener("input",()=>{selectedKey="";render();});
    consent.addEventListener("change",()=>{selectedKey="";render();});
    choice.addEventListener("change",()=>{selectedKey=choice.value;render();});
    const languageRoot=document.getElementById("reflect");
    if(languageRoot)new MutationObserver(render).observe(languageRoot,{attributes:true,attributeFilter:["data-dv2-lang"]});
    render();
  }
  window.DrishvaraNamaRashi=Object.freeze({
    version:"1.0.0",records:RECORDS,rashis:RASHIS,resolveName,resolveSyllable,
    sourceTitles:SOURCES.map(s=>s.title),mount
  });
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount,{once:true});
  else mount();
})();
