const fs=require('fs'),vm=require('vm');
// Exercise the established real-engine harnesses with the new subject bank.
const files=fs.readdirSync('tests').filter(f=>/^biology-.*-(two|solo)\.cjs$/.test(f));
for(const file of files){
 let code=fs.readFileSync('tests/'+file,'utf8')
 .replaceAll('biology','russian').replaceAll('Biology','Russian').replaceAll('Биология','Русский язык')
 .replaceAll("'content/russian/generator.js'","'content/russian/bank-data.js','content/russian/topics-data.js','content/russian/generator.js'")
 .replace(/grade:[79]/g,'grade:6').replace(/[79] класс/g,'6 класс');
 if(file==='biology-towers-solo.cjs')code=code.replace(/for\(const ch of run\('players\[0\]\.task\.o\[players\[0\]\.task\.ci\]'\)\).*?run\('submit\(0\)'\);/,"run('answer(0,players[0].task.ci)');");
 vm.runInNewContext(code,{require,console,module:{exports:{}}},{filename:'russian/'+file});
}
if(files.length!==16)throw Error('Expected 16 game/mode harnesses');
console.log('Russian: 16 actual engine answer flows passed; siege and builder adapters covered by bank tests.');
