const SUPABASE_URL="https://atuwtktnxeimwvprkdgp.supabase.co";
const SUPABASE_KEY="sb_publishable_II673G5TTeusbLVOtaKm8g_8GL6XEEI";
const grid=document.getElementById("feedGrid"),count=document.getElementById("messageCount"),input=document.getElementById("messageInput"),counter=document.getElementById("counter");
const rest=SUPABASE_URL+"/rest/v1/messages";
const authHeaders={"apikey":SUPABASE_KEY,"Authorization":"Bearer "+SUPABASE_KEY};
function escapeHtml(s){return s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[c]))}
function timeAgo(iso){const sec=Math.max(0,Math.floor((Date.now()-new Date(iso).getTime())/1000));if(sec<60)return"just now";if(sec<3600)return Math.floor(sec/60)+" min ago";if(sec<86400)return Math.floor(sec/3600)+" hr ago";return Math.floor(sec/86400)+" days ago"}
function render(messages){count.textContent=messages.length;if(!messages.length){grid.innerHTML='<div class="empty">The sky is quiet. Be the first to release a thought.</div>';return}grid.innerHTML=messages.map(m=>'<article class="card"><p>'+escapeHtml(m.content)+'</p><small>Anonymous · '+timeAgo(m.created_at)+'</small></article>').join("")}
async function loadMessages(){try{const r=await fetch(rest+"?select=id,content,created_at&order=created_at.desc&limit=100",{headers:authHeaders});if(!r.ok)throw new Error(await r.text());render(await r.json())}catch(e){console.error(e);render([])}}
input.addEventListener("input",()=>counter.textContent=input.value.length+" / 500");
document.getElementById("messageForm").addEventListener("submit",async e=>{e.preventDefault();const text=input.value.trim();if(!text)return;const button=e.submitter;button.disabled=true;button.textContent="Releasing...";try{const r=await fetch(rest,{method:"POST",headers:{...authHeaders,"Content-Type":"application/json","Prefer":"return=minimal"},body:JSON.stringify({content:text})});if(!r.ok)throw new Error(await r.text());input.value="";counter.textContent="0 / 500";await loadMessages();document.getElementById("feed").scrollIntoView({behavior:"smooth"})}catch(err){alert("Couldn't release the thought. Please try again.");console.error(err)}finally{button.disabled=false;button.textContent="Release it ✦"}});
document.getElementById("clearLocal").onclick=()=>loadMessages();
const music=document.getElementById("bgMusic"),musicBtn=document.getElementById("musicBtn");
musicBtn.onclick=async()=>{if(music.paused){try{await music.play();musicBtn.textContent="❚❚"}catch{alert("Add Mass Anasthesia.mp3 to the repository to enable the music.")}}else{music.pause();musicBtn.textContent="♫"}};
loadMessages();setInterval(loadMessages,30000);