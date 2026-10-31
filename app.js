"use strict";
// أضف الكتب المعتمدة للنشر هنا. يجب وضع ملفات PDF في مجلد books.
// لا تنشر كتابًا لم تتأكد من الإذن القانوني لإعادة نشره.
const books = [];
const grid = document.getElementById("bookGrid");
const count = document.getElementById("bookCount");
const search = document.getElementById("searchInput");
const filters = [...document.querySelectorAll("[data-filter]")];
const empty = document.getElementById("emptyState");
const dialog = document.getElementById("readerDialog");
const frame = document.getElementById("readerFrame");
let category = "all";
function safeText(text){return String(text ?? "");}
function card(book){
  const article=document.createElement("article"); article.className="book-card";
  const cover=document.createElement("div");cover.className="book-cover";cover.setAttribute("aria-hidden","true");cover.textContent="۞";
  if(book.cover){const img=document.createElement("img");img.src=book.cover;img.alt="";img.loading="lazy";cover.append(img);}
  const info=document.createElement("div");info.className="book-info";
  const type=document.createElement("span");type.className="book-type";type.textContent=book.category==="personal"?"كتابات شخصية":"كتب قديمة";
  const title=document.createElement("h3");title.textContent=safeText(book.title);
  const author=document.createElement("p");author.className="book-author";author.textContent=safeText(book.author);
  const description=document.createElement("p");description.className="book-description";description.textContent=safeText(book.description);
  const actions=document.createElement("div");actions.className="book-actions";
  const read=document.createElement("button");read.type="button";read.textContent="اقرأ الآن";read.addEventListener("click",()=>openReader(book));
  const download=document.createElement("a");download.textContent="تحميل ↓";download.href=book.file;download.download="";download.setAttribute("aria-label","تحميل "+book.title);
  actions.append(read,download);info.append(type,title,author,description,actions);article.append(cover,info);return article;
}
function render(){
 const q=search.value.trim().toLocaleLowerCase("ar");
 const result=books.filter(b=>(category==="all"||b.category===category)&&[b.title,b.author,b.description].join(" ").toLocaleLowerCase("ar").includes(q));
 grid.replaceChildren(...result.map(card));count.textContent=books.length+" كتاب";empty.hidden=result.length>0;
 empty.textContent=books.length===0?"المكتبة قيد التجهيز. ستظهر الكتب هنا فور اعتمادها للنشر.":"لا توجد كتب تطابق البحث حاليًا.";
}
function openReader(book){
 document.getElementById("readerTitle").textContent=book.title;
 const url=new URL(book.file,location.href);
 if(url.origin!==location.origin){return;}
 frame.src=url.href+"#toolbar=1&navpanes=0";
 document.getElementById("readerDownload").href=url.href;
 document.getElementById("readerOpen").href=url.href;
 dialog.showModal();
}
document.getElementById("readerClose").addEventListener("click",()=>dialog.close());
dialog.addEventListener("close",()=>{frame.removeAttribute("src");});
dialog.addEventListener("click",e=>{if(e.target===dialog)dialog.close();});
search.addEventListener("input",render);
filters.forEach(btn=>btn.addEventListener("click",()=>{category=btn.dataset.filter;filters.forEach(b=>{b.classList.toggle("active",b===btn);b.setAttribute("aria-pressed",String(b===btn));});render();}));
const themeToggle=document.getElementById("themeToggle");
const savedTheme=localStorage.getItem("wird-theme");
if(savedTheme==="dark")document.documentElement.classList.add("dark");
function syncTheme(){const dark=document.documentElement.classList.contains("dark");themeToggle.textContent=dark?"☀":"☾";themeToggle.setAttribute("aria-label",dark?"تفعيل المظهر الفاتح":"تفعيل المظهر الداكن");}
themeToggle.addEventListener("click",()=>{document.documentElement.classList.toggle("dark");localStorage.setItem("wird-theme",document.documentElement.classList.contains("dark")?"dark":"light");syncTheme();});
document.getElementById("year").textContent=new Date().getFullYear();syncTheme();render();
