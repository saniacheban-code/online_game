(function(){
 'use strict';
 Arena.subjectPages=Object.freeze([
  {"id": "world-around", "title": "Познание мира", "symbol": "◉", "accent": "amber", "file": "subjects/world-around.html", "available": true, "description": "1–4 классы. Семья, общество, родной край, история и безопасное поведение."},
  {"id": "literacy", "title": "Букварь и обучение грамоте", "symbol": "АБ", "accent": "mint", "file": "subjects/literacy.html", "available": true, "description": "1 класс. Звуки и буквы, слоги, предложение, чтение коротких текстов; два полугодия."},
  {"id": "literary-reading", "title": "Литературное чтение", "symbol": "▤", "accent": "mint", "file": "subjects/literary-reading.html", "available": true, "description": "2–4 классы. Авторские мини-тексты, смысл, поступки героев, жанры и выразительные средства."},
  {"id": "music-primary", "title": "Музыка", "symbol": "♫", "accent": "mint", "file": "subjects/music-primary.html", "available": true, "description": "1–4 классы. Ритм, мелодия, инструменты, музыкальные жанры и культура слушания."},
  {"id": "visual-art", "title": "Изобразительное искусство", "symbol": "✎", "accent": "mint", "file": "subjects/visual-art.html", "available": true, "description": "1–4 классы. Цвет, линия, композиция, жанры и выразительные средства искусства."},
  {"id": "handicraft", "title": "Трудовое обучение", "symbol": "✂", "accent": "amber", "file": "subjects/handicraft.html", "available": true, "description": "1–4 классы. Материалы, конструирование, план работы, безопасное использование инструментов."},
  {id:'math',title:'Математика',symbol:'∑',accent:'mint',file:'subjects/math.html',available:true,description:'Числа, алгебра и геометрия. Задания для 1–11 классов.'},
  {id:'russian',title:'Русский язык',symbol:'Аа',accent:'sky',file:'subjects/russian.html',available:true,description:'2–11 классы. Орфография, грамматика, пунктуация и работа с текстом; 10–11 — ЕМН.'},
  {id:'kazakh',title:'Қазақ тілі',symbol:'Әә',accent:'sky',file:'subjects/kazakh.html',available:true,description:'1–11 классы, неказахский язык обучения. Лексика, грамматика и чтение; пояснения на русском. 10–11 — ЕМН и ОГН.'},
  {id:'english',title:'Английский язык',symbol:'Aa',accent:'sky',file:'subjects/english.html',available:true,description:'3–11 классы. Лексика, грамматика и чтение; 10–11 — ЕМН. Объяснения на русском.'},
  {id:'physics',title:'Физика',symbol:'φ',accent:'violet',file:'subjects/physics.html',available:true,description:'7–11 классы. Формулы, явления и задачи; 10–11 — ЕМН.'},
  {id:'chemistry',title:'Химия',symbol:'H₂O',accent:'violet',file:'subjects/chemistry.html',available:true,description:'7–11 классы. Вещества, реакции и расчёты; 10–11 — ЕМН.'},
  {id:'biology',title:'Биология',symbol:'ДНК',accent:'mint',file:'subjects/biology.html',available:true,description:'7–11 классы. Живые системы, наследственность и экология; 10–11 — ЕМН.'},
  {id:'geography',title:'География',symbol:'◎',accent:'mint',file:'subjects/geography.html',available:true,description:'7–11 классы. Природа, население и хозяйство; 10–11 — ЕМН.'},
  {id:'kazakhstan-history',title:'История Казахстана',symbol:'Қ',accent:'amber',file:'subjects/kazakhstan-history.html',available:true,description:'5–11 классы. События, хронология, причины и источники; 10–11 — ЕМН и ОГН.'},
  {id:'world-history',title:'Всемирная история',symbol:'⌛',accent:'amber',file:'subjects/world-history.html',available:true,description:'5–11 классы. Цивилизации, события, исторические источники и сравнение процессов; 10–11 — ЕМН.'},
  {id:'informatics',title:'Информатика',symbol:'01',accent:'violet',file:'subjects/informatics.html',available:true,description:'5–11 классы. Алгоритмы, программы и данные; 10–11 — ЕМН.'},
  {id:'natural-science',title:'Естествознание',symbol:'☀',accent:'amber',file:'subjects/natural-science.html',available:true,description:'1–6 классы. Природа, исследования, вещества, энергия и экосистемы.'}
 ].map(subject=>Object.freeze(subject)));
})();
