const fs=require('fs'),assert=require('assert'),path=require('path');let checked=0;
for(const game of fs.readdirSync('games'))for(const mode of ['two','solo']){
 const file=path.posix.join('games',game,mode+'.html');if(!fs.existsSync(file))continue;const html=fs.readFileSync(file,'utf8'),a=html.match(/<a\b[^>]*class="arena-change-subject"[^>]*>/);assert(a,file);assert(a[0].includes('target="_top"'),'Navigation must leave the game iframe');assert.equal((html.match(/class="arena-change-subject"/g)||[]).length,1);assert(html.includes('arena-navigation.css'));
 const href=a[0].match(/href="([^"]+)"/)[1];for(const root of ['file:///C:/School%20Games/','file:///home/teacher/arena/','https://example.github.io/school-games/']){const gameURL=new URL(file,root);assert.equal(new URL(href,gameURL).href,new URL('index.html',root).href);checked++}
 if(game==='forest'){assert(html.includes('forest-workspace.css'));assert(html.indexOf('forest-workspace.css')>html.indexOf('978edc04a79e.css'))}
}
console.log('Change subject: top-level navigation from all supported game pages, Windows/Linux file paths and GitHub subdirectory URLs passed:',checked);
