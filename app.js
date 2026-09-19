const SUPABASE_URL="https://atuwtktnxeimwvprkdgp.supabase.co";
const SUPABASE_KEY="sb_publishable_II673G5TTeusbLVOtaKm8g_8GL6XEEI";
const rest=SUPABASE_URL+"/rest/v1/messages";
const headers={"apikey":SUPABASE_KEY,"Authorization":"Bearer "+SUPABASE_KEY};
const grid=document.getElementById("feedGrid"),input=document.getElementById("messageInput"),counter=document.getElementById("counter");
const music=document.getElementById("bgMusic"),playBtn=document.getElementById("playBtn"),mainPlay=document.getElementById("mainPlay");
function esc(s){return s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[c]))}
function ago(v){const n=Math.max(0,Math.floor((Date.now()-new Date(v))/1000));if(n<60)return"just now";if(n<3600)return Math.floor(n/60)+" minutes ago";if(n<86400)return Math.floor(n/3600)+" hours ago";return Math.floor(n/86400)+" days ago"}
let reactionRows=[];
let visitorId=localStorage.getItem("anonymousSkyVisitorId");
if(!visitorId){visitorId=(crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+Math.random().toString(36).slice(2)+Math.random().toString(36).slice(2));localStorage.setItem("anonymousSkyVisitorId",visitorId)}
function render(rows){if(!rows.length){grid.innerHTML='<div class="empty">The sky is quiet. Be the first to release a thought.</div>';return}const counts={};const mine=new Set();reactionRows.forEach(r=>{counts[r.message_id]=(counts[r.message_id]||0)+1;if(r.visitor_id===visitorId)mine.add(r.message_id)});grid.innerHTML=rows.map(m=>'<article class="card"><b>Anonymous</b><small>'+ago(m.created_at)+'</small><p>'+esc(m.content)+'</p><button class="reaction-btn'+(mine.has(m.id)?' reacted':'')+'" data-reaction="'+m.id+'" aria-label="'+(mine.has(m.id)?'Remove like':'Like')+'">♡ <span>'+((counts[m.id]||0))+'</span></button><small>▢　0</small></article>').join("");grid.querySelectorAll("[data-reaction]").forEach(b=>b.onclick=()=>toggleReaction(Number(b.dataset.reaction)))}
async function load(){try{const [messagesRes,reactionsRes]=await Promise.all([fetch(rest+"?select=id,content,created_at&order=created_at.desc&limit=100",{headers}),fetch(SUPABASE_URL+"/rest/v1/message_reactions?select=message_id,visitor_id&limit=5000",{headers})]);if(!messagesRes.ok)throw Error(await messagesRes.text());if(!reactionsRes.ok)throw Error(await reactionsRes.text());reactionRows=await reactionsRes.json();render(await messagesRes.json())}catch(e){console.error(e);grid.innerHTML='<div class="empty">Could not connect to the sky right now.</div>'}}
async function toggleReaction(messageId){const mine=reactionRows.some(r=>r.message_id===messageId&&r.visitor_id===visitorId);try{const url=SUPABASE_URL+"/rest/v1/message_reactions";const r=await fetch(mine?url+"?message_id=eq."+messageId+"&visitor_id=eq."+encodeURIComponent(visitorId):url,{method:mine?"DELETE":"POST",headers:{...headers,"Content-Type":"application/json","Prefer":"return=minimal"},body:mine?undefined:JSON.stringify({message_id:messageId,visitor_id:visitorId})});if(!r.ok)throw Error(await r.text());await load()}catch(e){console.error(e)}}
async function send(){const text=input.value.trim();if(!text)return;const b=document.getElementById("sendButton");b.disabled=true;b.textContent="Sending...";try{const r=await fetch(rest,{method:"POST",headers:{...headers,"Content-Type":"application/json","Prefer":"return=minimal"},body:JSON.stringify({content:text})});if(!r.ok)throw Error(await r.text());input.value="";counter.textContent="0/500";await load()}catch(e){alert("Could not send the message.");console.error(e)}finally{b.disabled=false;b.textContent="Send"}}
input.addEventListener("input",()=>counter.textContent=input.value.length+"/500");
document.getElementById("sendButton").onclick=send;
function setPlaying(on){playBtn.textContent=on?"❚❚":"▶";mainPlay.textContent=on?"❚❚":"▶";document.getElementById("readyText").textContent=on?"Playing":"Ready"}
async function toggleMusic(){if(music.paused){try{await music.play();setPlaying(true)}catch{alert("Add Mass Anasthesia.mp3 to the repository first.")}}else{music.pause();setPlaying(false)}}
playBtn.onclick=toggleMusic;mainPlay.onclick=toggleMusic;
document.getElementById("mainStop").onclick=()=>{music.pause();music.currentTime=0;setPlaying(false)};
document.getElementById("prevBtn").onclick=()=>music.currentTime=0;
document.getElementById("mainPrev").onclick=()=>music.currentTime=0;
document.getElementById("nextBtn").onclick=()=>music.currentTime=0;
document.getElementById("mainNext").onclick=()=>music.currentTime=0;
document.getElementById("volume").oninput=e=>music.volume=e.target.value;
document.getElementById("mainVolume").oninput=e=>music.volume=e.target.value;
document.getElementById("mainMute").onclick=()=>music.muted=!music.muted;
music.addEventListener("timeupdate",()=>{const p=music.duration?(music.currentTime/music.duration)*100:0;document.getElementById("progressBar").style.width=p+"%";document.getElementById("mainProgress").style.width=p+"%";document.querySelector(".time span").textContent=new Date(music.currentTime*1000).toISOString().slice(14,19);if(music.duration)document.getElementById("duration").textContent=new Date(music.duration*1000).toISOString().slice(14,19)});
function modal(title,text){document.getElementById("modalTitle").textContent=title;document.getElementById("modalText").textContent=text;document.getElementById("modal").classList.add("show")}
document.getElementById("modalClose").onclick=()=>document.getElementById("modal").classList.remove("show");
document.getElementById("modal").onclick=e=>{if(e.target.id==="modal")e.currentTarget.classList.remove("show")};
document.querySelectorAll("[data-action]").forEach(b=>b.addEventListener("click",()=>{const a=b.dataset.action;if(a==="home")window.scrollTo({top:0,behavior:"smooth"});if(a==="messages")document.getElementById("feed").scrollIntoView({behavior:"smooth"});if(a==="music")toggleMusic();if(a==="explore")modal("Explore","Welcome to Anonymous Sky. Messages are shared anonymously through Supabase. Look around, listen to the music, and leave a thought.");if(a==="about")modal("About Anonymous Sky","A small Y2K / Futiger Aero anonymous message board. No account. No profile. Just thoughts floating through the sky.")}));
load();setInterval(load,30000);music.volume=.7;
