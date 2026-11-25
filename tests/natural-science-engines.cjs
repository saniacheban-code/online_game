const fs=require('fs'),vm=require('vm');
// Exercise the established real-engine harnesses with the new subject bank.
const files=fs.readdirSync('tests').filter(f=>/^biology-.*-(two|solo)\.cjs$/.test(f));
for(const file of files){
 const code=fs.readFileSync('tests/'+file,'utf8')
 .replaceAll('biology','natural-science').replaceAll('Biology','NaturalScience').replaceAll('Биология','Естествознание')
 .replaceAll("'content/natural-science/generator.js'","'content/natural-science/facts-data.js','content/natural-science/generator.js'")
 .replace(/grade:[79]/g,'grade:6').replace(/[79] класс/g,'6 класс');
 vm.runInNewContext(code,{require,console,module:{exports:{}}},{filename:'natural-science/'+file});
}
if(files.length!==16)throw Error('Expected 16 game/mode harnesses');
console.log('Natural science: 16 actual engine answer flows passed; siege and builder adapters covered by bank tests.');
