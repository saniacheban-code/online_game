const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');const c={Arena:{}};vm.createContext(c);vm.runInContext(fs.readFileSync('core/task-help.js','utf8'),c);const H=c.Arena.taskHelp;
const q=(text,answer)=>({q:text,o:[answer,'other'],ci:0,subjectId:'math'});
for(const period of ['3','63','428571','03','142857']){
 const task=q('Сколько цифр в периоде дроби 0,('+period+')?',String(period.length));const steps=H.mathWork(task).join(' ');assert(steps.includes('«'+period+'»'));assert(steps.includes('Длина периода: '+period.length));assert(!steps.includes('Применяем указанное свойство'));
}
assert(H.mathWork(q('Сколько цифр в периоде дроби 1,25(03)?','2')).join(' ').includes('1,25030303'));
assert(H.mathWork(q('Обратите периодическую дробь 0,1(6) в обыкновенную (несократимую)','1/6')).join(' ').includes('1/6'));
assert(H.mathWork(q('Обратите периодическую дробь 2,(27) в обыкновенную (несократимую)','25/11')).join(' ').includes('25/11'));
const fr=(n,d)=>'<span class="fr"><i>'+n+'</i><b>'+d+'</b></span>';
for(const [a,b,op,d,e,answer] of [[1,3,'+',1,6,'1/2'],[3,8,'−',1,2,'-1/8'],[2,3,'·',3,4,'1/2'],[2,3,':',4,5,'5/6']]){const steps=H.mathWork(q('Вычислите '+fr(a,b)+' '+op+' '+fr(d,e)+'.',answer)).join(' ');assert(steps.includes(answer));assert(!steps.includes('0,33333333'));assert(!steps.includes('пока не подготовлен'))}
const divide=H.mathWork(q('Представьте '+fr(1,7)+' периодической десятичной дробью.','0,(142857)')).join(' ');assert(divide.includes('остаток'));assert(divide.includes('0,(142857)'));
const html=H.render({...q('Сколько цифр в периоде дроби 0,(63)?','2'),soloHint:{example:q('Сколько цифр в периоде дроби 0,(428571)?','6')}},'<div class="solo-rule">Old rule</div>');assert(html.includes('наименьший блок'));assert(html.includes('Длина периода: 6'));assert(!html.includes('Old rule'));
assert(H.calculate('1/3').steps[0].includes('≈'));console.log('Math help: period digits, nonperiodic prefix, decimal conversion both ways, exact fraction arithmetic and independent worked example passed.');
