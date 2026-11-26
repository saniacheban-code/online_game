(function(global){
 'use strict';
 const plain=html=>String(html).replace(/<span class="fr"><i>(.*?)<\/i><b>(.*?)<\/b><\/span>/g,(_,a,b)=>a+'/'+b).replace(/<sup>(.*?)<\/sup>/g,'^($1)').replace(/<sub>(.*?)<\/sub>/g,'_$1').replace(/<[^>]*>/g,'').replace(/&minus;/g,'−').replace(/&nbsp;|&#160;/g,' ').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&').trim();
 function expressionNumber(text){
  const powers={'⁰':'0','¹':'1','²':'2','³':'3','⁴':'4','⁵':'5','⁶':'6','⁷':'7','⁸':'8','⁹':'9','⁻':'-'};
  let s=String(text).replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+/g,x=>'^('+[...x].map(c=>powers[c]).join('')+')').replace(/[−–]/g,'-').replace(/,/g,'.').replace(/pi/gi,'π').replace(/sqrt/gi,'√').replace(/[×·]/g,'*').replace(/[:÷]/g,'/').replace(/\s/g,'');
  const period=s.match(/^([+-]?)(\d*)\.(\d*)\((\d+)\)$/);
  if(period){const pre=period[3],p=period[4];if(pre.length+p.length>14)return null;return(period[1]==='-'?-1:1)*(Number(period[2]||0)+Number(pre||0)/10**pre.length+Number(p)/(10**pre.length*(10**p.length-1)))}
  if(!s||s.length>120||/[^\deE.()+*/^π√-]/.test(s))return null;
  let i=0,depth=0;
  function atom(){if(++depth>25)throw Error('depth');let v;
   if(s[i]==='+'){i++;v=atom()}else if(s[i]==='-'){i++;v=-expr(3)}else if(s[i]==='√'){i++;v=Math.sqrt(atom())}else if(s[i]==='π'){i++;v=Math.PI}else if(s[i]==='('){i++;v=expr(0);if(s[i++]!==')')throw Error('bracket')}else{const m=s.slice(i).match(/^(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?/);if(!m)throw Error('number');i+=m[0].length;v=Number(m[0])}depth--;return v;
  }
  function expr(min){let a=atom();while(i<s.length){let op=s[i],implicit=/[π√(]/.test(op);if(implicit)op='*';const p={'+':1,'-':1,'*':2,'/':2,'^':3}[op];if(!p||p<min)break;if(!implicit)i++;const b=expr(p+(op==='^'?0:1));if(op==='^'&&Math.abs(b)>1000)throw Error('exponent');a=op==='+'?a+b:op==='-'?a-b:op==='*'?a*b:op==='/'?a/b:a**b;if(!Number.isFinite(a))throw Error('finite')}return a}
  try{const n=expr(0);return i===s.length&&Number.isFinite(n)?n:null}catch{return null}
 }

 function value(text){if(/^\s*\d+\s*[-–—]\s*\d+\s*$/.test(plain(text)))return null;const s=plain(text).replace(/[−–]/g,'-').replace(/,/g,'.').trim();if(/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(s)){const n=Number(s);return Number.isFinite(n)?n:null}let m=s.match(/^([+-]?\d+(?:\.\d+)?)\s*\/\s*([+-]?\d+(?:\.\d+)?)$/);if(m){const n=Number(m[1])/Number(m[2]);return Number(m[2])!==0&&Number.isFinite(n)?n:null}m=s.match(/^([+-]?)(\d+)\s+(\d+)\s*\/\s*(\d+)$/);if(m&&+m[4]!==0)return(m[1]==='-'?-1:1)*(+m[2]+m[3]/m[4]);return expressionNumber(s)}
 function prepare(task){const choices=task.choices||task.o,index=task.correctIndex??task.ci,answer=plain(choices[index]),numeric=value(answer),prompt=task.prompt||task.q;
  if(numeric!==null)return{task,prompt,expected:numeric,numbered:false};
  return{task,prompt:prompt+'<p class="siege-number-hint">Введите номер выбранного ответа.</p><ol class="siege-statements">'+choices.map(s=>'<li>'+s+'</li>').join('')+'</ol>',expected:index+1,numbered:true};
 }
 function check(text,expected){const n=value(text);return{valid:n!==null,correct:n!==null&&Math.abs(n-expected)<=1e-9*Math.max(1e-12,Math.abs(n),Math.abs(expected))}}
 global.Arena.inputAnswer={plain,value,prepare,check};
})(globalThis);
