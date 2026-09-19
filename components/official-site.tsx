'use client';

import {useEffect, useRef, useState} from 'react';
import {ArrowUpRight, ArrowDown, ArrowRight, ArrowLeft, Bookmark, BookOpen, Check, Compass, Eye, ImageIcon, MapPin, Menu, Pause, Play, Plus, Search, X, ZoomIn, ZoomOut, RotateCcw, Wind, CloudRain, Sun, Waves} from 'lucide-react';
import {Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose} from '@/components/ui/dialog';
import {Sheet, SheetContent, SheetTitle, SheetDescription, SheetClose} from '@/components/ui/sheet';
import {Tabs, TabsList, TabsTrigger, TabsContent} from '@/components/ui/tabs';
import {Accordion, AccordionItem, AccordionTrigger, AccordionContent} from '@/components/ui/accordion';
import {Switch} from '@/components/ui/switch';
import {Slider} from '@/components/ui/slider';
import {Input} from '@/components/ui/input';
import {Toaster} from '@/components/ui/sonner';
import {toast} from 'sonner';
import {asset, navigation, characters, regions, cityLayers, domains, gallery, volumes, readingParagraphs, faq} from '@/lib/site-content';

type Modal = {type:'character';id:string} | {type:'gallery';index:number} | {type:'reader'} | {type:'favorites'} | {type:'map'} | null;
const seasonDetails = [
 {name:'暖雨',icon:CloudRain,description:'低雲與橫霧雨把城層染亮。出門前，先擦乾鏡頭。'},
 {name:'高風',icon:Wind,description:'平台陣風與乾冷風切。即使是晴天，空渡也可能停航。'},
 {name:'明乾',icon:Sun,description:'低雨、硬光與清楚的遠景。好天氣裡，仍要照顧自己的體力。'},
 {name:'回潮',icon:Waves,description:'海霧、潮濕布物與鹽蝕。船班、清洗與睡眠都要重新安排。'},
];
const galleryFilters = ['全部圖像','城市與地景','人物肖像','日常與物件'];
const lifeCards = [
 {image:'A23',title:'一起生活，各自發光',label:'棲光宅',text:'餐桌可以共用，私人資料仍要先問。兩個人的日常，在留飯與出門時間裡慢慢磨合。'},
 {image:'A32',title:'掌聲之前的那些重來',label:'曜環排練室',text:'進拍、氣息、走位和一句工作玩笑。一場表演，是五個人反覆調整後的結果。'},
 {image:'A41',title:'先好好吃一頓飯',label:'餐桌與食材',text:'果穀糕、熱湯與失敗的早餐。食物的季節、來處與味道，讓世界有了可以記住的日常。'},
];

function SectionTitle({number,en,title,description}:{number:string;en:string;title:string;description?:string}) {
 return <div className="section-heading"><div className="eyebrow"><span>{number}</span><span>{en}</span></div><h2>{title}</h2>{description&&<p>{description}</p>}</div>;
}

export default function OfficialSite() {
 const [menuOpen,setMenuOpen]=useState(false);
 const [modal,setModal]=useState<Modal>(null);
 const [charGroup,setCharGroup]=useState('精選人物');
 const [query,setQuery]=useState('');
 const [region,setRegion]=useState(0);
 const [layer,setLayer]=useState(1);
 const [season,setSeason]=useState(0);
 const [galleryFilter,setGalleryFilter]=useState('全部圖像');
 const [showAllGallery,setShowAllGallery]=useState(false);
 const [spoilers,setSpoilers]=useState(false);
 const [favorites,setFavorites]=useState<string[]>([]);
 const [motion,setMotion]=useState(true);
 const [fontSize,setFontSize]=useState(20);
 const [readerLight,setReaderLight]=useState(false);
 const [zoom,setZoom]=useState(1);
 const [activeSection,setActiveSection]=useState('');
 const [hydrated,setHydrated]=useState(false);
 const heroRef=useRef<HTMLElement>(null);

 useEffect(()=>{
  try {
   const saved=JSON.parse(localStorage.getItem('kmzz-favorites')||'[]');
   if(Array.isArray(saved))setFavorites(saved.filter(v=>typeof v==='string'&&(v.startsWith('char:')||v.startsWith('art:')||v==='read:intro')));
   const prefs=JSON.parse(localStorage.getItem('kmzz-preferences')||'{}');
   setMotion(prefs.motion!==false&&!matchMedia('(prefers-reduced-motion: reduce)').matches);
   if(typeof prefs.fontSize==='number')setFontSize(Math.max(16,Math.min(26,prefs.fontSize)));
   setReaderLight(prefs.readerLight===true);
  } catch { /* Private browsing can disable local storage. */ }
  setHydrated(true);
 },[]);
 useEffect(()=>{
  if(!hydrated)return;
  try {localStorage.setItem('kmzz-preferences',JSON.stringify({motion,fontSize,readerLight}));}catch{}
 },[motion,fontSize,readerLight,hydrated]);
 useEffect(()=>{
  const observer=new IntersectionObserver(entries=>{
   entries.forEach(entry=>{if(entry.isIntersecting)setActiveSection(entry.target.id);});
  },{rootMargin:'-15% 0px -70% 0px'});
  document.querySelectorAll('main section[id]').forEach(el=>observer.observe(el));
  return ()=>observer.disconnect();
 },[]);
 useEffect(()=>{setZoom(1);},[modal?.type]);
 useEffect(()=>{
  document.documentElement.dataset.motion=motion?'on':'off';
  return ()=>{delete document.documentElement.dataset.motion;};
 },[motion]);

 function toggleFavorite(key:string) {
  const remove=favorites.includes(key);
  const next=remove?favorites.filter(x=>x!==key):[...favorites,key];
  setFavorites(next);
  try {localStorage.setItem('kmzz-favorites',JSON.stringify(next));toast(remove?'已移出收藏':'已加入這個瀏覽器的收藏');}
  catch {toast('已保留本次收藏；目前瀏覽器無法永久儲存。');}
 }
 function openModal(next:Modal){setZoom(1);setModal(next);}
 const chosenChar=modal?.type==='character'?characters.find(c=>c.id===modal.id):null;
 const chosenArt=modal?.type==='gallery'?gallery[modal.index]:null;
 const filteredCharacters=characters.filter(c=>(charGroup==='所有人物'||(charGroup==='精選人物'&&['lin','zhou','he','qin'].includes(c.id))||c.group===charGroup)&&`${c.name}${c.role}`.includes(query.trim()));
 const filteredGallery=gallery.filter(g=>galleryFilter==='全部圖像'||g.category===galleryFilter);
 const shownGallery=showAllGallery?filteredGallery:filteredGallery.slice(0,6);
 const selectedLayer=cityLayers[layer];
 const selectedRegion=regions[region];
 const modalTitle=chosenChar?.name||chosenArt?.title||(modal?.type==='map'?'曦衡聯域區域圖':modal?.type==='favorites'?'我的收藏':'走進《空名之子》');

 return <>
  <a className="skip-link" href="#story">跳至主要內容</a>
  <header className="site-header">
   <a className="wordmark" href="#top" aria-label="空名之子，回到首頁"><span className="brand-mark" aria-hidden="true">空</span><span>空名之子<small>OFFICIAL NOVEL</small></span></a>
   <nav className="desktop-nav" aria-label="主要導覽">{navigation.map(n=><a key={n.id} className={activeSection===n.id?'active':''} href={`#${n.id}`}>{n.label}</a>)}</nav>
   <div className="header-actions">
    <button className="icon-button motion-toggle" onClick={()=>setMotion(!motion)} aria-label={motion?'暫停動態':'啟用動態'} aria-pressed={!motion}>{motion?<Pause size={17}/>:<Play size={17}/>}</button>
    <button className="icon-button" onClick={()=>openModal({type:'favorites'})} aria-label={`我的收藏，${favorites.length} 項`}><Bookmark size={18}/>{favorites.length>0&&<span className="count">{favorites.length}</span>}</button>
    <a className="header-read" href="#reading">閱讀導覽 <ArrowUpRight size={15}/></a>
    <button className="icon-button mobile-menu" aria-label="開啟導覽選單" onClick={()=>setMenuOpen(true)}><Menu/></button>
   </div>
  </header>
  <Sheet open={menuOpen} onOpenChange={setMenuOpen}><SheetContent className="mobile-sheet" showCloseButton={false}>
   <SheetTitle className="serif">空名之子</SheetTitle><SheetDescription>小說官方網站</SheetDescription>
   <SheetClose className="close-button" aria-label="關閉選單"><X/></SheetClose>
   <nav aria-label="手機導覽">{navigation.map((n,i)=><a key={n.id} href={`#${n.id}`} onClick={()=>setMenuOpen(false)}><small>0{i+1}</small>{n.label}<ArrowUpRight size={20}/></a>)}</nav>
   <button className="text-link" onClick={()=>setMotion(!motion)}>{motion?<Pause size={16}/>:<Play size={16}/>} {motion?'暫停背景動態':'啟用背景動態'}</button>
  </SheetContent></Sheet>

  <main>
   <section id="top" className="hero" ref={heroRef} onPointerMove={e=>{if(motion&&e.pointerType==='mouse'&&heroRef.current){const r=e.currentTarget.getBoundingClientRect();heroRef.current.style.setProperty('--mx',`${(e.clientX-r.left-r.width/2)/85}px`);heroRef.current.style.setProperty('--my',`${(e.clientY-r.top-r.height/2)/85}px`);}}}>
    <img className="hero-image" src={asset('A18')} alt="層層錯位臺地、跨層軌道與暖色燈火構成的映京城市全景" fetchPriority="high"/>
    <div className="hero-shade"/>
    <div className="hero-grain" aria-hidden="true"/>
    <div className="motes" aria-hidden="true">{Array.from({length:14},(_,i)=><i key={i} style={{left:`${(i*17+5)%100}%`,top:`${(i*23+9)%100}%`,animationDelay:`${-i*1.7}s`}}/>)}</div>
    <div className="hero-content wrap">
     <p className="eyebrow hero-kicker">都市異常 <span>／</span> 人物悲劇 <span>／</span> 群像救援</p>
     <p className="hero-question">當世界都在替你回答，<br/>你還能留下自己的聲音嗎？</p>
     <h1>空名<span>之子</span></h1>
     <div className="hero-bottom"><p>一個關於注視、選擇，<br/>與活著承擔的故事。</p><a className="button button-gold" href="#story">走進故事 <ArrowRight size={19}/></a></div>
    </div>
    <div className="hero-foot wrap"><span>NOAS <i/> 映京 · 暖雨期</span><a href="#story">向下探索 <ArrowDown size={16}/></a><span className="hero-foot-end">每一個名字，都有自己的生活。</span></div>
   </section>

   <section id="story" className="story-section section wrap">
    <div className="story-text"><SectionTitle number="01" en="THE STORY" title="被看見之後，然後呢？"/>
     <p className="lead">他熟悉掌聲，<br/>卻還在學習怎麼聽見別人。</p>
     <p>林晏珩，二十歲，曜環成員。舞臺、工作與一個剛開始磨合的家，構成他的生活。他渴望被需要，也害怕被替代。</p>
     <p>在這座讓聲音與影像不斷流動的城市，方便的回答未必屬於真正的本人。當日常出現異常，每一次選擇都將留下後果。</p>
     <p>從映京的餐桌到沿海港埠，《空名之子》讓人物先好好生活，再面對注視、失去與責任。</p>
     <button className="text-link" onClick={()=>openModal({type:'reader'})}>閱讀作品導讀 <ArrowUpRight size={18}/></button>
    </div>
    <figure className="story-picture"><img src={asset('A23')} alt="棲光宅裡有餐桌、暖光與日常物件的共同生活空間" loading="lazy"/><figcaption><span>棲光宅</span><span>浮岬 · 第十一層</span></figcaption><div className="picture-note" aria-hidden="true">從一盞留下的燈開始。</div></figure>
   </section>

   <section id="characters" className="section characters-section">
    <div className="wrap"><SectionTitle number="02" en="THE PEOPLE" title="每個人，都有自己的故事。" description="從身分與日常開始認識他們。更多的選擇，留在故事裡相遇。"/>
     <div className="filter-toolbar"><Tabs value={charGroup} onValueChange={setCharGroup} className="filter-tabs"><TabsList variant="line" aria-label="人物分類">{['精選人物','曜環','其他人物','所有人物'].map(t=><TabsTrigger key={t} value={t}>{t}</TabsTrigger>)}</TabsList></Tabs>
      <div className="search-field"><Search size={17} aria-hidden="true"/><Input aria-label="搜尋人物姓名或身分" placeholder="尋找一個名字" value={query} onChange={e=>setQuery(e.target.value)}/></div>
     </div>
     <div className="character-grid">{filteredCharacters.map((c,i)=><button className="character-card" key={c.id} onClick={()=>openModal({type:'character',id:c.id})} aria-label={`認識${c.name}`}>
      <div className="character-image"><img src={asset(c.image)} alt={`${c.name}官方人物肖像`} loading="lazy"/><span className="character-number">{String(characters.indexOf(c)+1).padStart(2,'0')}</span><span className="character-open"><Plus size={22}/></span>{favorites.includes(`char:${c.id}`)&&<Bookmark className="card-saved" size={19}/>}</div>
      <div className="character-info"><span>{c.role}</span><h3>{c.name}</h3><p>{c.intro}</p></div>
     </button>)}</div>
     {filteredCharacters.length===0&&<p className="empty-state" role="status">沒有找到這個名字。試試其他關鍵字，或選擇「所有人物」。</p>}
     <p className="tiny-note">人物圖像取自作品現有美術設定；介紹不包含重大事件與結局。</p>
    </div>
   </section>

   <section id="world" className="section world-section wrap">
    <SectionTitle number="03" en="THE WORLD" title="從映京，走向更遠的地方。" description="城層、山地與海岸，各自有不同的風、食物與生活節奏。"/>
    <Tabs defaultValue="regions" className="world-tabs"><TabsList variant="line" aria-label="世界導覽分類"><TabsTrigger value="regions"><Compass size={17}/>曦衡聯域</TabsTrigger><TabsTrigger value="city">映京十二層</TabsTrigger><TabsTrigger value="seasons">四氣候期</TabsTrigger></TabsList>
     <TabsContent value="regions"><div className="world-grid"><button className="map-preview" onClick={()=>openModal({type:'map'})} aria-label="放大曦衡聯域地圖"><img src={asset('M09')} alt="曦衡聯域正典區域圖，含映京、白潮岬、天光山脈、環星群島與海域" loading="lazy"/><span><ZoomIn size={17}/>放大查看完整地圖</span></button>
      <div className="region-panel"><p className="eyebrow">地方索引</p><div className="region-buttons" aria-label="選擇地區">{regions.map((r,i)=><button key={r.id} aria-pressed={region===i} onClick={()=>setRegion(i)}>{r.name}</button>)}</div>
       <article className="region-detail" aria-live="polite"><div className="location-line"><MapPin size={15}/>{selectedRegion.position}</div><h3>{selectedRegion.name}</h3><p className="region-lead">{selectedRegion.lead}</p><p>{selectedRegion.description}</p><dl><dt>餐桌上的地方風味</dt><dd>{selectedRegion.food}</dd><dt>抵達之前</dt><dd>{selectedRegion.detail}</dd></dl></article>
       <p className="tiny-note">地圖提供方位；旅程仍受交通、權限與天候影響。</p>
      </div></div></TabsContent>
     <TabsContent value="city"><div className="city-grid"><div className="layer-list" aria-label="選擇映京城層">{cityLayers.map((l,i)=><button key={l[0]} className={layer===i?'selected':''} onClick={()=>setLayer(i)} aria-pressed={layer===i}><span>{String(l[0]).padStart(2,'0')}</span><strong>{l[1]}</strong><small>{l[2]}</small></button>)}</div><article className="city-detail" aria-live="polite"><img src={asset('A18')} alt="映京城市全景，錯位平台與跨層軌道" loading="lazy"/><div><span className="eyebrow">第 {selectedLayer[0]} 層 · {selectedLayer[2]}</span><h3>{selectedLayer[1]}</h3><p className="region-lead">{selectedLayer[3]}</p><p>{selectedLayer[4]}</p><p className="tiny-note">標高以城市地面為基準。十二層是錯位臺地，並非同軸圓塔。</p></div></article></div></TabsContent>
     <TabsContent value="seasons"><div className="seasons-view"><img src={asset('A40')} alt="白潮岬海岸與受天候影響的岬路" loading="lazy"/><div><p className="eyebrow">映京與澄灣的氣候</p><h3>同一個地方，<br/>不同的抵達方式。</h3><div className="season-buttons">{seasonDetails.map((s,i)=><button key={s.name} onClick={()=>setSeason(i)} aria-pressed={season===i}><s.icon size={22}/>{s.name}</button>)}</div><p className="season-description" aria-live="polite">{seasonDetails[season].description}</p><p className="tiny-note">氣候期依地方公告，不是固定每三個月更換。</p></div></div></TabsContent>
    </Tabs>
   </section>

   <section className="life-section section"><div className="wrap"><SectionTitle number="04" en="THE EVERYDAY" title="世界，藏在生活的縫隙裡。"/>
    <div className="life-grid">{lifeCards.map(c=><article className="life-card" key={c.image}><img src={asset(c.image)} alt={c.label} loading="lazy"/><p className="eyebrow">{c.label}</p><h3>{c.title}</h3><p>{c.text}</p></article>)}</div>
   </div></section>

   <section id="domains" className="section domains-section wrap"><div><SectionTitle number="05" en="THE DOMAINS" title="從實踐之中，得到回應。"/><p>人們長期的實踐，匯聚成神域。一次回應有它的對象與邊界；得到回應，並不代表一個人的全部選擇都值得信任。</p><p className="domain-quote">看見一個人，<br/>也留給他說不的空間。</p></div>
    <Accordion type="single" collapsible defaultValue="存照" className="domains-list">{domains.map((d,i)=><AccordionItem value={d.name} key={d.name}><AccordionTrigger><span className="domain-index">0{i+1}</span><span className="domain-name">{d.name}</span><span className="domain-word">{d.word}</span></AccordionTrigger><AccordionContent><p className="domain-practice">{d.practice}</p><p>{d.effect}</p><p className="domain-limit">{d.limit}</p></AccordionContent></AccordionItem>)}</Accordion>
   </section>

   <section id="gallery" className="section gallery-section"><div className="wrap"><SectionTitle number="06" en="THE GALLERY" title="把這一刻，留下來。" description="城市的輪廓、人物的神情，以及值得慢一點看的日常。"/>
    <Tabs value={galleryFilter} onValueChange={v=>{setGalleryFilter(v);setShowAllGallery(false);}} className="filter-tabs"><TabsList variant="line" aria-label="圖像分類">{galleryFilters.map(f=><TabsTrigger value={f} key={f}>{f}</TabsTrigger>)}</TabsList></Tabs>
    <div className="gallery-grid">{shownGallery.map(g=><button className="gallery-card" onClick={()=>openModal({type:'gallery',index:gallery.indexOf(g)})} key={g.image}><div><img src={asset(g.image)} alt={g.title} loading="lazy"/><span className="gallery-expand"><ZoomIn size={22}/></span>{favorites.includes(`art:${g.image}`)&&<Bookmark className="card-saved" size={18}/>}</div><span className="eyebrow">{g.category}</span><h3>{g.title}<ArrowUpRight size={17}/></h3></button>)}</div>
    {!showAllGallery&&filteredGallery.length>6&&<div className="center"><button className="button button-outline" onClick={()=>setShowAllGallery(true)}>展開全部 {filteredGallery.length} 幅圖像 <Plus size={17}/></button></div>}
   </div></section>

   <section id="reading" className="section reading-section wrap"><div className="reading-intro"><SectionTitle number="07" en="THE READING ROOM" title="故事，從這裡開始。"/><p>先用一篇不劇透的導讀，走進人物與城市。<br/>正文尚未公開，卷次規劃會隨創作更新。</p><button className="button button-gold" onClick={()=>openModal({type:'reader'})}><BookOpen size={19}/>閱讀作品導讀 <ArrowUpRight size={18}/></button></div>
    <div className="volume-shelf"><div className="shelf-title"><span>九卷故事規劃</span><label className="switch-label"><Switch checked={spoilers} onCheckedChange={setSpoilers} aria-label="顯示後續卷名，可能有劇透"/><span>顯示後續卷名</span></label></div>
     <div className="volume-grid">{volumes.map((v,i)=><div className={`volume ${i===0?'first-volume':''}`} key={v}><span className="volume-number">{String(i+1).padStart(2,'0')}</span><div><span className="volume-label">第 {i+1} 卷</span><h3>{i===0||spoilers?v:'故事尚待展開'}</h3><span className="volume-status">{i===0?'正文尚未公開':'規劃中'}</span></div>{i>0&&!spoilers&&<Eye size={15} aria-label="卷名已隱藏"/>}</div>)}</div>
     <p className="tiny-note">卷名屬創作規劃，不代表出版或上線時程。後續卷名可能暗示故事走向。</p>
    </div>
   </section>

   <section id="news" className="updates-section section wrap"><SectionTitle number="08" en="FROM THE ARCHIVE" title="世界的近況"/>
    <div className="news-list"><a href="#characters"><time dateTime="2026-09-19">2026.09.19</time><span className="news-type">人物美術</span><h3>群像肖像與人物工作日常</h3><ArrowUpRight size={20}/></a><a href="#world"><time dateTime="2026-09-19">2026.09.19</time><span className="news-type">世界圖冊</span><h3>曦衡地理、城市層次與地方生活</h3><ArrowUpRight size={20}/></a><a href="#reading"><time dateTime="2026-09-18">2026.09.18</time><span className="news-type">創作進度</span><h3>九卷故事規劃整理</h3><ArrowUpRight size={20}/></a></div>
   </section>
   <section id="faq" className="faq-section section wrap"><SectionTitle number="09" en="BEFORE YOU GO" title="你可能想知道"/><Accordion type="single" collapsible>{faq.map(([q,a],i)=><AccordionItem value={`faq-${i}`} key={q}><AccordionTrigger>{q}</AccordionTrigger><AccordionContent><p>{a}</p></AccordionContent></AccordionItem>)}</Accordion></section>
  </main>
  <footer className="site-footer"><div className="wrap"><div className="footer-top"><a className="footer-brand" href="#top">空名之子</a><p>讓每一個名字，<br/>保有自己的聲音。</p><a className="text-link" href="#top">回到最初 <ArrowUpRight size={18}/></a></div><div className="footer-bottom"><span>© 2026 空名之子</span><div><a href="#reading">閱讀導覽</a><a href="#faq">使用與轉載</a><button onClick={()=>openModal({type:'favorites'})}>我的收藏</button></div><span>文字與圖像・保留所有權利</span></div></div></footer>

  <Dialog open={modal!==null} onOpenChange={open=>{if(!open)setModal(null);}}>
   <DialogContent showCloseButton={false} className={`content-dialog ${modal?.type==='reader'?'reader-dialog':''} ${modal?.type==='gallery'||modal?.type==='map'?'image-dialog':''} ${readerLight&&modal?.type==='reader'?'reader-light':''}`}>
    <DialogTitle className={chosenChar||chosenArt||modal?.type==='reader'?'sr-only':'dialog-visible-title'}>{modalTitle}</DialogTitle>
    <DialogDescription className="sr-only">{modal?.type==='reader'?'作品導讀，非小說正文。可調整字級、配色並收藏。':modal?.type==='favorites'?'收藏只保存在目前瀏覽器。':'作品介紹與美術圖像。'}</DialogDescription>
    <DialogClose className="close-button" aria-label="關閉視窗"><X size={22}/></DialogClose>
    {chosenChar&&<div className="profile-layout"><img className="profile-portrait" src={asset(chosenChar.image)} alt={`${chosenChar.name}完整人物肖像`}/><div className="profile-body"><p className="eyebrow">{chosenChar.roman}</p><h2>{chosenChar.name}</h2><p className="profile-role">{chosenChar.role} <span>／ {chosenChar.tag}</span></p><p className="profile-intro">{chosenChar.intro}</p><p>{chosenChar.detail}</p><h3>日常的一面</h3><p>{chosenChar.life}</p><h3>人物之間</h3><p>{chosenChar.relations}</p><button className="button button-outline" onClick={()=>toggleFavorite(`char:${chosenChar.id}`)} aria-pressed={favorites.includes(`char:${chosenChar.id}`)}>{favorites.includes(`char:${chosenChar.id}`)?<Check size={17}/>:<Bookmark size={17}/>} {favorites.includes(`char:${chosenChar.id}`)?'已收藏人物':'收藏這個名字'}</button></div></div>}
    {chosenArt&&modal?.type==='gallery'&&<div className="lightbox"><div className="art-stage"><img src={asset(chosenArt.image)} alt={chosenArt.title}/></div><div className="lightbox-description"><div><p className="eyebrow">{chosenArt.category}</p><h2>{chosenArt.title}</h2><p>{chosenArt.caption}</p></div><div className="lightbox-controls"><button className="icon-button" aria-label="上一張圖像" onClick={()=>openModal({type:'gallery',index:(modal.index-1+gallery.length)%gallery.length})}><ArrowLeft/></button><span>{modal.index+1} / {gallery.length}</span><button className="icon-button" aria-label="下一張圖像" onClick={()=>openModal({type:'gallery',index:(modal.index+1)%gallery.length})}><ArrowRight/></button><button className="icon-button" aria-label={favorites.includes(`art:${chosenArt.image}`)?'取消收藏圖像':'收藏圖像'} aria-pressed={favorites.includes(`art:${chosenArt.image}`)} onClick={()=>toggleFavorite(`art:${chosenArt.image}`)}>{favorites.includes(`art:${chosenArt.image}`)?<Check/>:<Bookmark/>}</button></div></div></div>}
    {modal?.type==='map'&&<div className="map-viewer"><div className="map-controls"><button className="icon-button" aria-label="縮小地圖" disabled={zoom<=1} onClick={()=>setZoom(z=>Math.max(1,z-.5))}><ZoomOut/></button><output>{Math.round(zoom*100)}%</output><button className="icon-button" aria-label="放大地圖" disabled={zoom>=3} onClick={()=>setZoom(z=>Math.min(3,z+.5))}><ZoomIn/></button><button className="icon-button" aria-label="重設地圖" onClick={()=>setZoom(1)}><RotateCcw size={18}/></button><span>放大後可捲動查看</span></div><div className="map-scroll"><img style={{width:`${zoom*100}%`,maxWidth:'none'}} src={asset('M09')} alt="曦衡聯域完整正典區域圖"/></div></div>}
    {modal?.type==='reader'&&<div className="reader-content"><div className="reader-tools"><label>字級 {fontSize}<Slider aria-label="閱讀字級" value={[fontSize]} min={16} max={26} step={1} onValueChange={v=>setFontSize(v[0])}/></label><button className="icon-button" aria-label={readerLight?'切換深色閱讀':'切換淺色閱讀'} aria-pressed={readerLight} onClick={()=>setReaderLight(!readerLight)}><Sun size={19}/></button><button className="icon-button" aria-label="收藏作品導讀" aria-pressed={favorites.includes('read:intro')} onClick={()=>toggleFavorite('read:intro')}>{favorites.includes('read:intro')?<Check size={19}/>:<Bookmark size={19}/>}</button></div><article style={{fontSize:`${fontSize/16}rem`}}><p className="eyebrow">作品導讀 · 無重大劇透</p><h2>走進《空名之子》</h2><p className="reader-deck">先認識他們怎麼生活，<br/>再看看每個人願意留下什麼。</p>{readingParagraphs.map(p=><p key={p.slice(0,12)}>{p}</p>)}<div className="reader-end"><span>導讀完</span><p>這篇是作品介紹，非小說章節。正文公開資訊將更新於本站閱讀區。</p></div></article></div>}
    {modal?.type==='favorites'&&<div className="favorites-content"><p>收藏留在目前瀏覽器，方便下次回來。</p>{favorites.length===0?<div className="empty-favorites"><Bookmark size={36}/><h3>還沒有收藏</h3><p>打開人物介紹、圖像或作品導讀，<br/>按下書籤，就能在這裡再次找到。</p></div>:<div className="favorites-list">{favorites.map(key=>{const [kind,id]=key.split(':');const c=characters.find(x=>x.id===id);const index=gallery.findIndex(x=>x.image===id);const g=gallery[index];const label=kind==='char'?c?.name:kind==='art'?g?.title:'作品導讀';if(!label)return null;return <div key={key}><button onClick={()=>openModal(kind==='char'?{type:'character',id}:kind==='art'?{type:'gallery',index}:{type:'reader'})}>{kind==='char'&&c?<img src={asset(c.image)} alt=""/>:kind==='art'&&g?<img src={asset(g.image)} alt=""/>:<BookOpen size={24}/>}<span><small>{kind==='char'?'人物':kind==='art'?'圖像':'閱讀'}</small>{label}</span><ArrowUpRight size={17}/></button><button className="icon-button" aria-label={`移除收藏：${label}`} onClick={()=>toggleFavorite(key)}><X size={17}/></button></div>;})}</div>}</div>}
   </DialogContent>
  </Dialog>
  <Toaster position="bottom-center"/>
 </>;
}
