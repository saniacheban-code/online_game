(function(){
 'use strict';
 const params=new URLSearchParams(location.search);const requested=Arena.subjectPages.find(s=>s.id===params.get('subject')&&s.available);if(requested){const mode=params.get('mode')==='two'?'?mode=two':'?mode=solo';location.replace(requested.file+mode);return;}
 const grid=document.getElementById('subjectGrid'),status=document.getElementById('availableCount');
 const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 grid.innerHTML=Arena.subjectPages.map(subject=>`<a class="subject-card ${subject.available?'available':'upcoming'}" data-accent="${subject.accent}" href="${subject.file}"><div class="card-top"><span class="subject-symbol" aria-hidden="true">${escape(subject.symbol)}</span><span class="subject-state">${subject.available?'Можно играть':'Задания готовятся'}</span></div><h2>${escape(subject.title)}</h2><p>${escape(subject.description)}</p><span class="subject-action">${subject.available?'Выбрать игру':'О предмете'} <span aria-hidden="true">↗</span></span></a>`).join('');
 const available=Arena.subjectPages.filter(s=>s.available);status.textContent=available.length===1?'Доступный предмет: '+available[0].title:`Доступно предметов: ${available.length}`;
})();
