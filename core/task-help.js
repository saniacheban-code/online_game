(function(){'use strict';const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));const plain=s=>String(s??'').replace(/<span class="fr"><i>(.*?)<\/i><b>(.*?)<\/b><\/span>/g,'(($1)/($2))').replace(/<sup>(.*?)<\/sup>/g,'^($1)').replace(/<[^>]*>/g,' ').replace(/&nbsp;/g,' ').replace(/&minus;/g,'−').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim(),fmt=n=>Number.isInteger(n)?String(n):String(Math.round(n*1e8)/1e8).replace('.',',');
// A small arithmetic parser, never eval(): only numbers and five operators.
function calculate(input){let s=plain(input).replace(/,/g,'.').replace(/[−–]/g,'-').replace(/[×·]/g,'*').replace(/[:÷]/g,'/').replace(/\s/g,''),at=0,steps=[];function atom(){if(s[at]==='+'){at++;return atom()}if(s[at]==='-'){at++;return-expr(3)}if(s[at]==='('){at++;const v=expr(0);if(s[at++]!==')')throw Error('bracket');return v}const m=s.slice(at).match(/^(?:\d+(?:\.\d*)?|\.\d+)/);if(!m)throw Error('number');at+=m[0].length;return +m[0]}function expr(min){let a=atom();for(;;){const op=s[at],p={'+':1,'-':1,'*':2,'/':2,'^':3}[op];if(!p||p<min)break;at++;const b=expr(p+(op==='^'?0:1)),x=op==='+'?a+b:op==='-'?a-b:op==='*'?a*b:op==='/'?a/b:a**b;if(!Number.isFinite(x))throw Error('finite');steps.push(fmt(a)+' '+({'*':'·','/':':','-':'−'}[op]||op)+' '+fmt(b)+(Math.abs(x-Math.round(x*1e8)/1e8)>1e-12?' ≈ ':' = ')+fmt(x));a=x}return a}try{const value=expr(0);if(at!==s.length)throw Error('tail');return{value,steps}}catch{return null}}
function fractionText(n,d){if(d<0){n=-n;d=-d}return d===1?String(n):n+'/'+d}
function gcd(a,b){a=Math.abs(a);b=Math.abs(b);while(b){const r=a%b;a=b;b=r}return a||1}
function simplified(n,d){const g=gcd(n,d);return fractionText(n/g,d/g)}
function specificMath(q){
 const raw=plain(q.rawQuestion||q.prompt||q.q),number=raw.match(/(-?\d+),(\d*)\((\d+)\)/);
 const simpleRule=q.skill||q.soloHint?.skill;
 if(simpleRule==='shape'){
  const facts=[[/сколько сторон у треугольника/i,3,'У треугольника три стороны: обходим границу и считаем 1, 2, 3.'],[/сколько вершин у квадрата/i,4,'У квадрата четыре угла; в каждом встречаются две соседние стороны. Каждому углу соответствует вершина.'],[/сколько углов у прямоугольника/i,4,'У прямоугольника четыре прямых угла. Считаем их по порядку вдоль границы.'],[/сколько концов у отрезка/i,2,'Отрезок ограничен начальной и конечной точками; это два его конца.'],[/трёх отдельных отрезков/i,6,'У каждого отдельного отрезка два конца. Всего 3 · 2 = 6.'],[/один треугольник и один квадрат/i,7,'У треугольника 3 стороны, у квадрата 4. Вместе: 3 + 4 = 7.'],[/два квадрата соединили целой стороной/i,4,'После соединения целой стороной получается прямоугольник. У него четыре стороны; точки на прямой границе не создают новых углов.'],[/квадрат разрезали по диагонали/i,2,'Диагональ соединяет противоположные вершины квадрата и делит его на два треугольника.']];
  const f=facts.find(([re])=>re.test(raw));if(f)return{rule:((/квадрат/i.test(raw)?'У квадрата четыре стороны и четыре вершины. ':'')+'Вершина — точка встречи соседних сторон. Не путайте стороны и вершины; считайте именно то, о чём спрашивают.'),steps:[f[2],'Ответ: '+f[1]+'.']};
 }
 let m=raw.match(/(?:стоит перед|предыдущее.*?)\s*(\d+)/i);if(m)return{rule:'Предыдущее число при счёте меньше данного на 1.',steps:['От данного числа '+m[1]+' отступаем на один шаг влево. ',m[1]+' − 1 = '+(Number(m[1])-1)+'.']};
 m=raw.match(/НО([ДК])\((\d+);\s*(\d+)\)/i);
 if(m&&Math.max(+m[2],+m[3])<=500){const a=+m[2],b=+m[3],g=gcd(a,b),multiple=m[1].toUpperCase()==='К';return{rule:multiple?'НОК — наименьшее положительное общее кратное. НОК(a,b)=ab/НОД(a,b).':'НОД — наибольший из общих положительных делителей.',steps:['Делители '+a+': '+Array.from({length:a},(_,i)=>i+1).filter(x=>a%x===0).join(', ')+'.','Делители '+b+': '+Array.from({length:b},(_,i)=>i+1).filter(x=>b%x===0).join(', ')+'.','Наибольший общий делитель: '+g+'.',...(multiple?['НОК = '+a+' · '+b+' : '+g+' = '+(a*b/g)+'.']:[])]};}

 if(number&&/сколько цифр в периоде/i.test(raw)){
  const whole=number[1],prefix=number[2],period=number[3],digits=[...period];
  return{rule:'Период — наименьший блок цифр, который повторяется бесконечно в десятичной записи. В записи со скобками период указан внутри скобок; его длина — количество цифр этого блока.',steps:[
   'Раскроем запись: '+number[0]+' = '+whole+','+prefix+period.repeat(3)+'…',
   'В скобках записан повторяющийся блок «'+period+'». Цифры до скобок в длину периода не входят.',
   'Посчитаем цифры блока: '+digits.map((d,i)=>d+' — '+(i+1)+'-я цифра').join('; ')+'.',
   'Длина периода: '+digits.length+'.'
  ]};
 }
 if(number&&/в обыкновенную|обыкновенн.*дроб/i.test(raw)){
  const whole=Number(number[1]),prefix=number[2],period=number[3];
  if(number[1].startsWith('-')||period.length+prefix.length>9)return null;
  const m=prefix.length,k=period.length,a=10**m,b=10**(m+k),left=Number(String(whole)+prefix),right=Number(String(whole)+prefix+period),n=right-left,d=b-a;
  return{rule:'Умножьте дробь на степени 10 так, чтобы бесконечные повторяющиеся части после запятой совпали. Вычтите равенства, выразите x и сократите дробь.',steps:[
   'Обозначим x = '+number[0]+'. До периода '+m+' цифр; в периоде '+k+' цифр.',
   a+'x = '+left+',('+period+'); '+b+'x = '+right+',('+period+').',
   b+'x − '+a+'x = '+right+' − '+left+', поэтому '+d+'x = '+n+'.',
   'x = '+fractionText(n,d)+' = '+simplified(n,d)+'.'
  ]};
 }
 const ordinary=raw.match(/\(\(([−-]?\d+)\)\/\(([−-]?\d+)\)\)/);
 if(ordinary&&/периодическ/i.test(raw)&&/(?:Запишите|Представьте)/i.test(raw)){
  const n=Number(ordinary[1].replace('−','-')),d=Number(ordinary[2].replace('−','-'));
  if(n<0||d<=0)return null;
  const integer=Math.floor(n/d),seen=new Map(),digits=[],steps=['Делим числитель '+n+' на знаменатель '+d+'. Целая часть: '+integer+'; остаток: '+(n%d)+'.'];
  let rest=n%d;
  while(rest&&!seen.has(rest)&&digits.length<40){
   seen.set(rest,digits.length);
   const previous=rest,t=rest*10,digit=Math.floor(t/d);rest=t%d;digits.push(String(digit));
   steps.push('Сносим ноль: '+previous+' · 10 = '+t+'. '+t+' : '+d+' даёт цифру '+digit+' и остаток '+rest+'.');
  }
  if(rest&&!seen.has(rest))return null;
  if(rest){const from=seen.get(rest),pre=digits.slice(0,from).join(''),period=digits.slice(from).join('');steps.push('Остаток '+rest+' повторился: далее повторятся те же цифры «'+period+'».');steps.push(fractionText(n,d)+' = '+integer+','+pre+'('+period+'). Период — «'+period+'», его длина '+period.length+'.');}
  else steps.push('Остаток стал нулём: '+fractionText(n,d)+' = '+integer+','+digits.join('')+'. Это конечная десятичная дробь.');
  return{rule:'Разделите числитель на знаменатель. После целой части приписывайте к остатку ноль и находите очередную цифру. Повторение остатка означает начало повторяющегося блока цифр — периода.',steps};
 }
 // Only a complete expression of two ordinary fractions, never numbers from a word problem.
 const f='\\(\\(([−-]?\\d+)\\)\\/\\(([−-]?\\d+)\\)\\)';
 const match=raw.replace(/^(?:Вычислите|Найдите значение выражения)\s*:?[ ]*/i,'').replace(/[.?]$/,'').trim().match(new RegExp('^'+f+'\\s*([+−·:×÷*/-])\\s*'+f+'$'));
 if(match){
  let a=Number(match[1].replace('−','-')),b=Number(match[2].replace('−','-')),op=match[3],c=Number(match[4].replace('−','-')),d=Number(match[5].replace('−','-'));
  if(!b||!d)return null;if(b<0){a=-a;b=-b}if(d<0){c=-c;d=-d}
  const x=fractionText(a,b),y=fractionText(c,d);
  if(op==='+'||op==='−'||op==='-'){
   const den=b/gcd(b,d)*d,u=den/b,v=den/d,n=a*u+(op==='+'?1:-1)*c*v;
   return{rule:'Для сложения или вычитания обыкновенных дробей приведите их к общему знаменателю, выполните действие с числителями, знаменатель сохраните. Затем сократите результат.',steps:[
    'Общий знаменатель для '+b+' и '+d+': НОК('+b+'; '+d+') = '+den+'.',
    'Дополнительные множители: '+den+' : '+b+' = '+u+'; '+den+' : '+d+' = '+v+'.',
    x+' = '+fractionText(a*u,den)+'; '+y+' = '+fractionText(c*v,den)+'.',
    'Числитель результата: '+(a*u)+' '+op+' ('+(c*v)+') = '+n+'. Знаменатель: '+den+'.',
    'Результат: '+fractionText(n,den)+(gcd(n,den)>1?' = '+simplified(n,den):' (дробь несократима)')+'.'
   ]};
  }
  const multiply=/[·×*]/.test(op);if(!multiply&&!c)return null;
  const n=multiply?a*c:a*d,den=multiply?b*d:b*c;
  return{rule:multiply?'При умножении дробей перемножьте числители и знаменатели. Результат сократите.':'Чтобы разделить на ненулевую дробь, умножьте на обратную ей дробь. Затем сократите результат.',steps:[
   multiply?'Запишем произведение: '+x+' · '+y+'.':'Обратная дробь к '+y+' — '+fractionText(d,c)+'. Поэтому '+x+' : '+y+' = '+x+' · '+fractionText(d,c)+'.',
   'Перемножим числители: '+a+' · ('+(multiply?c:d)+') = '+n+'.',
   'Перемножим знаменатели: '+b+' · ('+(multiply?d:c)+') = '+den+'.',
   'Результат: '+fractionText(n,den)+' = '+simplified(n,den)+'.'
  ]};
 }
 const seq=raw.match(/следующий член последовательности:\s*([−\d,; .-]+)/i);
 if(seq){
  const values=seq[1].split(';').filter(v=>v.trim()).map(v=>Number(v.trim().replace('−','-').replace(',','.'))).filter(Number.isFinite);
  if(values.length>=3){const delta=values[1]-values[0],ratio=values[0]!==0?values[1]/values[0]:NaN,last=values[values.length-1];
   if(values.every((v,i)=>!i||Math.abs(v-values[i-1]-delta)<1e-9))return{rule:'В арифметической прогрессии разность соседних членов постоянна. Следующий член получают прибавлением этой разности к последнему известному.',steps:['Соседние разности: '+values.slice(1).map((v,i)=>fmt(v)+' − ('+fmt(values[i])+') = '+fmt(delta)).join('; ')+'.','Разность постоянна: d = '+fmt(delta)+'.','Следующий член: '+fmt(last)+' + ('+fmt(delta)+') = '+fmt(last+delta)+'.']};
   if(Number.isFinite(ratio)&&values.every((v,i)=>!i||Math.abs(v-values[i-1]*ratio)<1e-9))return{rule:'В геометрической прогрессии каждый следующий член получают умножением предыдущего на постоянный знаменатель q.',steps:['Отношение соседних членов: '+fmt(values[1])+' : ('+fmt(values[0])+') = '+fmt(ratio)+'.','Проверяем остальные пары: отношение также равно '+fmt(ratio)+'.','Следующий член: '+fmt(last)+' · ('+fmt(ratio)+') = '+fmt(last*ratio)+'.']};
  }
 }
 return null;
}

function mathWork(q){const specific=specificMath(q);if(specific)return specific.steps;const out=[],raw=plain(q.rawQuestion||q.q),answer=plain((q.o||q.choices)?.[q.ci??q.correctIndex]),target=calculate(answer);let expression=q.hintTrace?.expressions?.length===2?'('+q.hintTrace.expressions[0]+')/('+q.hintTrace.expressions[1]+')':q.hintTrace?.expressions?.[0];if(!expression){const match=raw.match(/(?:Вычислите|Найдите значение выражения)\s+(.+?)(?:[.?]|$)/i)||raw.match(/^([\d\s()+−–\-·×:*÷/^,]+)\s*=\s*\?/);if(match)expression=match[1]}
let c=expression&&calculate(expression);if(c&&target&&Math.abs(c.value-target.value)<1e-6*Math.max(1,Math.abs(target.value)))out.push(...c.steps);
const equation=raw.match(/([\d\s()+−\-·×:*÷/^,.xх□]+)=\s*([\d\s()+−\-·×:*÷/^,.xх□]+)/);if(!out.length&&equation&&target){let a=equation[1].trim(),b=equation[2].trim().replace(/[.,]$/,'');if(/[xх□]/.test(a+b)){const sub=(s,x)=>s.replace(/[xх□]/g,'('+x+')').replace(/(\d)\(/g,'$1*('),f=x=>{const l=calculate(sub(a,x)),r=calculate(sub(b,x));return l&&r?l.value-r.value:null},v0=f(0),v1=f(1),v2=f(2),check=f(target.value);if(check!==null&&Math.abs(check)<1e-6){if(v0!==null&&v1!==null&&v2!==null&&Math.abs(v2-2*v1+v0)<1e-6&&Math.abs(v1-v0)>1e-9){out.push('Обозначим неизвестное через x. Перенесём члены с x влево, числа вправо.');const sign=v1-v0<0?-1:1;out.push(fmt(sign*(v1-v0))+' · x = '+fmt(sign*-v0));out.push('x = '+fmt(sign*-v0)+' : '+fmt(sign*(v1-v0))+' = '+answer)}else{out.push('Выразите пропущенное число обратным действием. Проверка найденного значения:');const l=calculate(sub(a,target.value)),r=calculate(sub(b,target.value));out.push(a.replace(/[xх□]/g,answer)+' = '+fmt(l.value)+'; '+b.replace(/[xх□]/g,answer)+' = '+fmt(r.value)+'. Обе части равны.')}}}}
if(q.solution)out.push(plain(q.solution));if(!out.length)out.push('Ответ для самопроверки: '+answer+'.');return [...new Set(out)]}
function helpOf(q){return Object.entries(q||{}).find(([k,v])=>/Help$/.test(k)&&v&&typeof v==='object'&&v.rule)?.[1]}
function matching(q,e){if(!e)return false;const prompt=e.rawQuestion||e.prompt||e.q;if(!prompt||plain(prompt)===plain(q.rawQuestion||q.prompt||q.q))return false;if(q.primaryHelp){const shape=s=>plain(s).toLowerCase().replace(/[«"].*?[»"]/g,' слово ').replace(/\d+(?:[.,]\d+)?/g,'#').replace(/\s+/g,' ').trim();if(shape(prompt)!==shape(q.rawQuestion||q.prompt||q.q))return false;}const a=q.hintTrace?.id,b=e.hintTrace?.id;if(a&&a!==b)return false;if(q.metadata?.templateId&&e.metadata?.templateId&&q.metadata.templateId!==e.metadata.templateId)return false;if(q.skill&&e.skill&&q.skill!==e.skill)return false;return true}
function describe(q,native=''){
 const h=helpOf(q),specific=specificMath(q),math=(q.subjectId==='math'||q.hintTrace||q.soloHint)?Arena.mathStudyGuide?.(q):null;
 const source=h?.steps?.length?h.steps:q.steps?.length?q.steps:mathWork(q);
 const fallback=source.length===1&&source[0].startsWith('Ответ для самопроверки:');
 let rule=specific?.rule||h?.rule||q.rule||math?.rule||plain(native.match(/<div class="solo-rule">([\s\S]*?)<\/div>/)?.[1])||'';
 let steps=specific?.steps||source,kind=fallback&&math?'method':'worked';
 if(kind==='method')steps=math.method;
 // Factual correspondence tasks carry their own truth table. Explain every pair.
 if(q.audit?.kind==='pairs'&&q.audit.truth&&q.audit.pairs){const truth=new Map(q.audit.truth);steps=[...source,q.audit.findFalse?'Ищем ошибочную связь: правильных соответствий три.':'Ищем единственное правильное соответствие.',...q.audit.pairs.map(([term,value])=>term+' — '+value+': '+(truth.get(term)===value?'верно.':'неверно. Правильно: '+term+' — '+truth.get(term)+'.'))];}
 let example=h?.example||q.soloHint?.example,exampleKind='parallel',exampleSteps=[];
 if(matching(q,example)){
  exampleSteps=example.steps?.length?example.steps:mathWork({...example,skill:example.skill||q.skill});
  if(exampleSteps.length===1&&exampleSteps[0].startsWith('Ответ для самопроверки:'))example=null;
 }else example=null;
 if(!example&&q.primaryHelp?.example?.rule===rule&&plain(q.primaryHelp.example.q)!==plain(q.rawQuestion||q.q)){example=q.primaryHelp.example;exampleSteps=example.steps;exampleKind='rule';}
 if(!example&&math?.example){example=math.example;exampleSteps=math.example.steps;exampleKind='rule';}
 const answer=plain((q.o||q.choices||[])[q.ci??q.correctIndex]);
 return{rule,steps,kind,example,exampleSteps,exampleKind,answer};
}
Arena.taskHelp={calculate,mathWork,matching,describe,render(q,native=''){
 if(!q?.q)return native;
 if(q.parts?.length)return '<h3>Разбор выбранной полосы</h3>'+q.parts.map((p,i)=>'<section class="solo-part"><h3>Часть '+(i+1)+'</h3>'+Arena.taskHelp.render({...p,skill:p.skill||q.skill,subjectId:p.subjectId||q.subjectId,topic:p.topic||q.topic},'')+'</section>').join('');
 const d=describe(q,native),h=helpOf(q),list=steps=>'<ol>'+steps.map(s=>'<li>'+esc(s)+'</li>').join('')+'</ol>';
 let html='<div class="solo-coach-head">Помощник · '+esc(q.topic||'Текущее задание')+'</div><h3>Сейчас решаем</h3><div class="solo-current">'+(q.rawQuestion||q.soloHint?.question||q.q)+'</div><h3>Правило для этого задания</h3><div class="solo-rule">'+esc(d.rule)+'</div>';
 if(h?.formula||q.formula)html+='<p class="solo-formula">'+esc(h?.formula||q.formula)+'</p>';
 if(d.kind==='method')html+='<h3>План решения</h3>'+list(d.steps)+'<details class="current-solution"><summary>Проверка ответа</summary><p>'+esc(d.answer)+'</p></details>';
 else html+='<details class="current-solution"><summary>Разбор текущего задания по шагам</summary>'+list(d.steps)+'</details>';
 if(d.example)html+='<h3>'+(d.exampleKind==='parallel'?'Аналогичный пример':'Учебный пример применения правила')+'</h3><div class="solo-example">'+(d.example.rawQuestion||d.example.prompt||d.example.q)+'</div>'+list(d.exampleSteps);
 else html+='<h3>Пример рассуждения по текущему вопросу</h3>'+list(d.steps)+'<p>Закройте разбор и объясните выбор своими словами. Назовите отличительный признак, по которому вы исключили остальные варианты.</p>';
 html+='<p class="solo-try">Проверьте себя: что дано, какое правило подходит и почему? Сначала решите самостоятельно, затем откройте разбор.</p>';
 return html;
}};
})();
