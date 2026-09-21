(()=>{"use strict";
const M=()=>document.getElementById("modal"),T=()=>document.getElementById("modalTitle"),B=()=>document.getElementById("modalBody");
function show(t,h){const m=M(),tt=T(),b=B();if(!m||!tt||!b)return;tt.textContent=t;b.innerHTML=h;m.classList.add("show");m.style.display="grid";m.setAttribute("aria-hidden","false");document.body.classList.add("modal-open")}
function hide(){const m=M();if(!m)return;m.classList.remove("show");m.style.display="none";m.setAttribute("aria-hidden","true");document.body.classList.remove("modal-open")}
window.mizoBootModalShow=show;window.mizoBootModalHide=hide;
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