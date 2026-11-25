(function(g){
 'use strict';
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const text=s=>String(s).replace(/<span class="fr"><i>(.*?)<\/i><b>(.*?)<\/b><\/span>/g,'$1/$2').replace(/<sup>(.*?)<\/sup>/g,'^($1)').replace(/<sub>(.*?)<\/sub>/g,'_$1').replace(/<\/?(?:span|i|b|em|strong|code|pre|br|div|p|small)(?:\s+(?:class|style)=(?:"[^"]*"|'[^']*'|[^\s>]+))*\s*\/?>/gi,'').replace(/&nbsp;|&#160;/g,' ').replace(/&minus;/g,'−').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&times;/g,'×').replace(/&divide;/g,'÷').replace(/&amp;/g,'&').trim();
 const shuffle=(a,r)=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
 function chunks(s,n=3){const words=s.trim().split(/\s+/);if(words.length<3)return[s];const count=Math.min(n,Math.ceil(words.length/2)),out=[];for(let i=0;i<count;i++)out.push(words.slice(Math.floor(i*words.length/count),Math.floor((i+1)*words.length/count)).join(' '));return out}
 // Restricted arithmetic parser: only numbers and arithmetic, never JavaScript evaluation.
 function arithmetic(source){const s=text(source).replace(/[−–]/g,'-').replace(/[·×]/g,'*').replace(/÷/g,'/').replace(/,/g,'.').replace(/\s/g,'');if(!s||s.length>100||!/^[\d.+*/^()\-]+$/.test(s))return null;const tokens=s.match(/(?:\d+(?:\.\d*)?|\.\d+)|[+*/^()\-]/g)||[];if(tokens.join('')!==s||tokens.length>70)return null;let at=0;function primary(){if(tokens[at]==='('){at++;const n=sum();if(tokens[at++]!==')')throw 0;return n}const n=tokens[at++];if(!n||!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(n))throw 0;return Number(n)}function power(){const n=primary();if(tokens[at]==='^'){at++;return n**unary()}return n}function unary(){if(tokens[at]==='+'){at++;return unary()}if(tokens[at]==='-'){at++;return-unary()}return power()}function term(){let n=unary();while(['*','/'].includes(tokens[at])){const op=tokens[at++],v=unary();n=op==='*'?n*v:n/v}return n}function sum(){let n=term();while(['+','-'].includes(tokens[at])){const op=tokens[at++],v=term();n=op==='+'?n+v:n-v}return n}try{const n=sum();return at===tokens.length&&Number.isFinite(n)&&Math.abs(n)<1e14?n:null}catch{return null}}
 function create(task,random=Math.random){
  const choices=task.choices||task.o,ci=task.correctIndex??task.ci,answer=choices[ci],correct=text(answer),slots=[],parts=[],tiles=[];let serial=0;
  const fixed=s=>parts.push({html:esc(s)}),blank=s=>{const id=slots.length;slots.push({id,expected:s,filled:false});parts.push({slot:id});tiles.push({id:'t'+serial++,text:s,used:false})};
  let rawFormula=task.formula||task[task.subjectId+'Help']?.formula||'',calculation=false;
  if(!rawFormula&&task.subjectId==='math'&&task.hintTrace?.expressions?.length===1){const expression=task.hintTrace.expressions[0],n=arithmetic(expression),answer=arithmetic(correct);if(n!==null&&answer!==null&&/[+−·×÷*/^]/.test(expression)&&Math.abs(n-answer)<1e-8*Math.max(1,Math.abs(answer))){rawFormula=expression;calculation=true}}
  const formula=text(rawFormula);
  let kind='answer';
  // Formula text comes from the same validated question, never from another topic.
  if(formula&&formula.length<=90&&!/[\\<>\n]/.test(formula)){
   const words=formula.match(/\^\([^)]*\)|[\p{L}\p{N}_.²³₀₁₂₃]+|[^\s]/gu)||[];
   if(words.length>=3&&words.length<=24){kind=calculation?'calculation':'formula';if(calculation)fixed('Вычисление: ');const pick=shuffle(words.map((_,i)=>i).filter(i=>!['=',':','(',')','[',']','{','}',',',';'].includes(words[i])),random).slice(0,2);for(let i=0;i<words.length;i++){pick.includes(i)?blank(words[i]):fixed(words[i]);fixed(' ')}fixed(calculation?' = ':' → Ответ: ');blank(correct)}
  }
  const rule=text(task.rule||task[task.subjectId+'Help']?.rule||'');
  if(kind==='answer'&&rule.length<=170&&rule.split(/\s+/).length>=4&&correct.length<=55&&random()<.4){kind='rule';const pieces=chunks(rule,3),missing=shuffle(pieces.map((_,i)=>i),random).slice(0,2);fixed('Правило: ');pieces.forEach((piece,i)=>{if(i)fixed(' ');missing.includes(i)?blank(piece):fixed(piece)});fixed(' → Ответ на вопрос: ');blank(correct)}
  if(kind==='answer'){
   const c=chunks(correct,3);kind=c.length>1?'phrase':'answer';fixed(kind==='phrase'?'Ответ на вопрос: ':'Ответ: ');for(let i=0;i<c.length;i++){if(i)fixed(' ');blank(c[i])}
  }
  const expected=new Set(slots.map(s=>s.expected)),decoys=[];
  const add=s=>{s=text(s);if(s&&!expected.has(s)&&!decoys.includes(s)&&s.length<200)decoys.push(s)};
  choices.forEach((s,i)=>{if(i!==ci)for(const chunk of chunks(text(s),3))add(chunk)});
  if(kind==='formula'||kind==='calculation')for(const s of ['+','−','×','÷','2','0'])add(s);
  for(const s of shuffle(decoys,random).slice(0,Math.min(3,Math.max(2,slots.length))))tiles.push({id:'t'+serial++,text:s,used:false});
  return{task,kind,prompt:task.prompt||task.q,parts,slots,tiles:shuffle(tiles,random),mistakes:0,complete:false};
 }
 function place(puzzle,tileId,slotId){const tile=puzzle.tiles.find(t=>t.id===tileId),slot=puzzle.slots.find(s=>s.id===slotId);if(!tile||!slot||tile.used||slot.filled||puzzle.complete)return{accepted:false};const correct=tile.text===slot.expected;if(correct){tile.used=true;slot.filled=true;puzzle.complete=puzzle.slots.every(s=>s.filled)}else puzzle.mistakes++;return{accepted:true,correct,complete:puzzle.complete}}
 g.BuilderPuzzles={create,place,esc,text,chunks,arithmetic};
})(globalThis);
