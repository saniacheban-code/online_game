(function(g){'use strict';
 const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const plain=s=>Arena.inputAnswer.plain(s).replace(/&times;|&middot;/g,'×').replace(/&divide;/g,'÷').replace(/&radic;/g,'√').replace(/&pi;/g,'π').replace(/&quot;/g,'"').replace(/&#39;/g,"'");
 const norm=s=>plain(s).replace(/²/g,'^2').replace(/³/g,'^3').normalize('NFKC').toLowerCase().replace(/ё/g,'е').replace(/[−–]/g,'-').replace(/,/g,'.').replace(/\^\(([^()]*)\)/g,'^$1').replace(/[\s×*·]/g,'').replace(/[.!?]+$/,'');
 function prepare(task){const choices=task.choices||task.o,answer=plain(choices[task.correctIndex??task.ci]),num=Arena.inputAnswer.value(answer);let prompt=task.prompt||task.q,expected=answer,kind='number';
  if(num===null&&/[a-zа-яәіңғүұқөһ]/i.test(answer)&&!/[=^√π\d]/.test(answer)){
   kind='word';const words=[...answer.matchAll(/[a-zа-яёәіңғүұқөһ]+(?:-[a-zа-яёәіңғүұқөһ]+)*/gi)].filter(m=>m[0].length>2).sort((a,b)=>b[0].length-a[0].length);const w=words[0]||[...answer.matchAll(/[a-zа-яёәіңғүұқөһ]+/gi)][0];
   if(w){expected=w[0];prompt+='<div class="cloze">Восстановите слово в верном ответе:<br><strong>'+escape(answer.slice(0,w.index))+'<mark>…</mark>'+escape(answer.slice(w.index+w[0].length))+'</strong><small>Введите слово целиком · '+expected.length+' букв · начинается на «'+escape(expected.slice(0,Math.min(2,expected.length)))+'»</small></div>'}
  }else if(num===null)kind='expression';
  return{task,prompt,expected,kind,language:/[а-яәіңғүұқөһ]/i.test(expected)?'ru':'en'};
 }
 function check(text,p){if(!String(text).trim())return{valid:false,correct:false};const a=Arena.inputAnswer.value(text),b=Arena.inputAnswer.value(p.expected);return{valid:true,correct:a!==null&&b!==null?Math.abs(a-b)<1e-8*Math.max(1,Math.abs(b)):norm(text)===norm(p.expected)}}
 g.Arena.typedAnswer={prepare,check,plain,norm};
})(globalThis);
