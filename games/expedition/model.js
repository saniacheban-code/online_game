(function(root){
 'use strict';
 const rows=['.T..G.F','.$^..T.','..^.$..','~~~~~~~','.T..^..','..$.B..','S..T...'];
 const terrain={'.':{name:'Луг',cost:1},T:{name:'Лес',cost:2},'^':{name:'Горный перевал',cost:3},'~':{name:'Река',cost:2},G:{name:'Хранитель руин',cost:3},F:{name:'Финишный замок',cost:3},'$':{name:'Сокровище',cost:1},B:{name:'Лагерь картографов',cost:1},S:{name:'Стартовый лагерь',cost:1}};
 function adjacent(a,b){return Number.isInteger(a)&&Number.isInteger(b)&&a>=0&&b>=0&&a<49&&b<49&&Math.abs(Math.floor(a/7)-Math.floor(b/7))+Math.abs(a%7-b%7)===1}
 function reveal(p,at,radius=1){for(let i=0;i<49;i++)if(Math.abs(Math.floor(at/7)-Math.floor(i/7))+Math.abs(at%7-i%7)<=radius)p.seen[i]=true}
 function create(mode='two'){if(!['solo','two'].includes(mode))throw Error('Unknown expedition mode');const s={mode,map:rows.join('').split(''),players:[],turn:0,round:1,maxRounds:20,pending:null,status:'playing',winner:null,message:''};for(let i=0;i<(mode==='solo'?1:2);i++){const p={pos:42,seen:Array(49).fill(false),visited:Array(49).fill(false),progress:{},relics:0,shields:0,compass:1,good:0,errors:0,turns:0,finished:false};p.visited[42]=true;reveal(p,42);s.players.push(p)}return s}
 function cost(s,p,cell){return p.visited[cell]?1:terrain[s.map[cell]].cost}
 function select(s,cell){if(s.status!=='playing'||s.pending||!adjacent(s.players[s.turn].pos,cell))return false;const p=s.players[s.turn];s.pending={player:s.turn,cell,need:cost(s,p,cell)};return true}
 function scout(s){if(s.status!=='playing'||s.pending)return false;const p=s.players[s.turn];if(!p.compass)return false;p.compass--;reveal(p,p.pos,2);return true}
 function compare(a,b){const distance=p=>Math.abs(Math.floor(p.pos/7))+Math.abs(p.pos%7-6);return distance(b)-distance(a)||a.relics-b.relics||a.good-b.good}
 function resolveRound(s){const[a,b]=s.players;if(a.finished||b.finished){s.status='finished';s.winner=a.finished&&b.finished?'draw':a.finished?0:1;return}if(a.turns>=s.maxRounds&&b.turns>=s.maxRounds){const n=compare(a,b);s.status='finished';s.winner=n===0?'draw':n>0?0:1;s.message='Лимит ходов: сравниваем близость к замку, затем сокровища и верные ответы.'}}
 function answer(s,ok){if(s.status!=='playing'||!s.pending)return null;const c=s.pending,p=s.players[c.player],cell=c.cell;let moved=false,event='',protectedProgress=false;p.turns++;
  if(ok){p.good++;p.progress[cell]=(p.progress[cell]||0)+1;if(p.progress[cell]>=c.need){const fresh=!p.visited[cell];p.pos=cell;p.visited[cell]=true;delete p.progress[cell];reveal(p,cell);moved=true;if(fresh&&s.map[cell]==='$'){p.relics+=3;p.shields++;event='Сокровище: +3 реликвии и щит для сохранения прогресса.'}if(fresh&&s.map[cell]==='B'){p.compass++;event='Лагерь: +1 разведка компасом.'}if(fresh&&s.map[cell]==='G'){p.relics+=2;event='Хранитель побеждён: +2 реликвии.'}if(s.map[cell]==='F'){p.finished=true;event='Исследователь достиг финишного замка!'}}}
  else{p.errors++;if((p.progress[cell]||0)>0&&p.shields>0){p.shields--;protectedProgress=true;event='Щит сохранил прогресс испытания.'}else delete p.progress[cell]}
  s.pending=null;if(s.mode==='solo'){if(p.finished){s.status='finished';s.winner=0}}else if(c.player===0){s.turn=1}else{s.turn=0;resolveRound(s);s.round=p.turns+1}
  return{player:c.player,cell,ok:!!ok,moved,event,protectedProgress,remaining:Math.max(0,c.need-(p.progress[cell]||0))};
 }
 const api={rows,terrain,create,adjacent,reveal,select,scout,answer,cost};root.ExpeditionModel=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
