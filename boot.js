(()=>{"use strict";
const M=()=>document.getElementById("modal"),T=()=>document.getElementById("modalTitle"),B=()=>document.getElementById("modalBody");
function show(t,h){const m=M(),tt=T(),b=B();if(!m||!tt||!b)return;tt.textContent=t;b.innerHTML=h;m.classList.add("show");m.style.display="grid";m.setAttribute("aria-hidden","false");document.body.classList.add("modal-open")}
function hide(){const m=M();if(!m)return;m.classList.remove("show");m.style.display="none";m.setAttribute("aria-hidden","true");document.body.classList.remove("modal-open")}
window.mizoBootModalShow=show;window.mizoBootModalHide=hide;
const SB_URL="https://ffzhwsxmfxojrhszumwa.supabase.co",SB_KEY="sb_publishable_oYyJcQpOVta7i1vstZvhzA_EfRzQNsr";
const bootClient=window.supabase?.createClient?window.supabase.createClient(SB_URL,SB_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}):null;
window.supabaseClientForPopup=window.supabaseClientForPopup||bootClient;
function authFallback(mode){
 const register=mode==="register";
 show(register?"CREATE ACCOUNT":"LOGIN",register
 ?"<p class='muted'>Create your MIZOBOARD account.</p><input id='bootUsername' class='field' placeholder='username' maxlength='24'><input id='bootEmail' class='field' type='email' placeholder='email'><input id='bootPass' class='field' type='password' placeholder='password'><input id='bootConfirm' class='field' type='password' placeholder='repeat password'><button class='primary' id='bootAuth'>CREATE ACCOUNT</button>"
 :"<p class='muted'>Sign in to MIZOBOARD.</p><input id='bootEmail' class='field' type='email' placeholder='email'><input id='bootPass' class='field' type='password' placeholder='password'><button class='primary' id='bootAuth'>LOGIN</button><button class='secondary' id='bootRegister'>CREATE ACCOUNT</button>");
 document.getElementById("bootRegister")?.addEventListener("click",()=>authFallback("register"));
 document.getElementById("bootAuth").onclick=async()=>{
  if(!bootClient)return show("ERROR","<p>Authentication service could not load. Refresh the page and try again.</p>");
  const email=document.getElementById("bootEmail").value.trim(),pass=document.getElementById("bootPass").value;
  if(!email||pass.length<8)return show("LOGIN ERROR","<p>Enter a valid email and a password of at least 8 characters.</p>");
  if(register){
   const u=document.getElementById("bootUsername").value.trim(),c=document.getElementById("bootConfirm").value;
   if(!/^[A-Za-z0-9_]{3,24}$/.test(u))return show("REGISTER ERROR","<p>Username must be 3–24 letters, numbers or underscores.</p>");
   if(pass!==c)return show("REGISTER ERROR","<p>Passwords do not match.</p>");
   const r=await bootClient.auth.signUp({email,password:pass,options:{data:{username:u},emailRedirectTo:location.href}});
   if(r.error)return show("REGISTER ERROR","<p>"+String(r.error.message).replace(/[&<>]/g,"")+"</p>");
   return show("CHECK YOUR EMAIL","<p>Your account was created. Check your email to confirm it, then log in.</p>");
  }
  const r=await bootClient.auth.signInWithPassword({email,password:pass});
  if(r.error)return show("LOGIN ERROR","<p>"+String(r.error.message).replace(/[&<>]/g,"")+"</p>");
  hide();location.reload();
 };
}
document.addEventListener("click",e=>{
 const close=e.target.closest("#modalClose");if(close){e.preventDefault();hide();return}
 if(e.target===M()){hide();return}
 const a=e.target.closest("[data-action]");
 if(a){e.preventDefault();e.stopImmediatePropagation();const x=a.dataset.action;
  if(x==="login"&&typeof window.openAuth==="function")return window.openAuth("login");
  if(x==="register"&&typeof window.openAuth==="function")return window.openAuth("register");
  if(x==="account"&&typeof window.openAccount==="function")return window.openAccount();
  if(x==="logout"&&window.supabaseClientForPopup)return window.supabaseClientForPopup.auth.signOut();
  if(x==="terms")return show("TERMS","<p>Be respectful. No spam, threats, harassment, impersonation, or private information.</p>");
  if(x==="privacy")return show("PRIVACY","<p>Your account credentials are handled by Supabase Auth. Do not post private information publicly.</p>");
  if(x==="contact")return show("CONTACT","<p>Contact information can be added here before launch.</p>");
 }
 const p=e.target.closest("#anonymousPostBtn");
 if(p){e.preventDefault();e.stopImmediatePropagation();if(typeof window.openCompose==="function")return window.openCompose();return show("Post anonymously","<p class='muted'>Posting anonymously — no account required.</p><textarea class='field area' maxlength='500' placeholder='Share your thoughts...'></textarea><button class='primary'>SEND</button>")}
},true);
document.addEventListener("keydown",e=>{if(e.key==="Escape")hide()});
})();