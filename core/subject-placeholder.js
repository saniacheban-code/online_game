(function(){
 'use strict';
 const subject=Arena.subjectPages.find(s=>s.id===document.body.dataset.subject);
 if(!subject){document.getElementById('placeholderTitle').textContent='Предмет не найден';return}
 document.title=subject.title+' — Учебная арена';
 document.getElementById('placeholderTitle').textContent=subject.title;
 document.getElementById('placeholderSymbol').textContent=subject.symbol;
 document.getElementById('placeholderCopy').textContent='Здесь появятся темы и задания по предмету «'+subject.title+'». Пока можно выбрать игры по математике или вернуться к списку предметов.';
})();
