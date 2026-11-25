const assert=require('assert'),M=require('../games/expedition/model.js');
assert.equal(M.rows.join('').length,49);for(const r of M.rows)assert.equal(r.length,7);assert(!M.adjacent(6,7));assert(!M.adjacent(-1,0));assert(M.adjacent(42,35));assert(!M.adjacent(42,34));
let s=M.create('solo');assert.equal(s.players.length,1);assert(s.players[0].seen[35]);assert(!s.players[0].seen[0]);assert(!M.select(s,0));assert(M.select(s,35));assert(!M.scout(s));assert(!M.select(s,43));M.answer(s,false);assert.equal(s.players[0].pos,42);assert.equal(s.players[0].errors,1);assert.equal(s.turn,0);assert(!M.answer(s,true));
assert(M.scout(s));assert(!M.scout(s));assert(s.players[0].seen[28]);
function pass(st,cell,ok=true){assert(M.select(st,cell));return M.answer(st,ok)}
s=M.create('solo');pass(s,43);pass(s,44);pass(s,37);assert.equal(s.players[0].relics,3);assert.equal(s.players[0].shields,1);pass(s,44);pass(s,37);assert.equal(s.players[0].relics,3,'chest cannot be farmed');
// A difficult target stores partial progress, a shield protects it, then a later error resets it.
s=M.create('solo');s.players[0].pos=1;s.players[0].shields=1;assert(M.select(s,2));assert.equal(s.pending.need,1);M.answer(s,true);pass(s,9);assert.equal(s.players[0].progress[9],1);const protectedResult=pass(s,9,false);assert(protectedResult.protectedProgress);assert.equal(s.players[0].progress[9],1);assert.equal(s.players[0].shields,0);pass(s,9,false);assert(!s.players[0].progress[9]);for(let n=0;n<3;n++)pass(s,9);assert.equal(s.players[0].pos,9);
// Camp replenishes scouting once; a guardian grants relics only on its first clear.
s=M.create('solo');s.players[0].pos=38;pass(s,39);assert.equal(s.players[0].compass,2);pass(s,38);pass(s,39);assert.equal(s.players[0].compass,2);s.players[0].pos=3;for(let n=0;n<3;n++)pass(s,4);assert.equal(s.players[0].relics,2);
// Equal-turn finish: player one arriving grants player two the final attempt.
s=M.create('two');for(const p of s.players){p.pos=5;p.progress[6]=2}pass(s,6);assert.equal(s.status,'playing');assert.equal(s.turn,1);assert(!s.players[1].finished);pass(s,6);assert.equal(s.status,'finished');assert.equal(s.winner,'draw');assert(!M.select(s,5));assert(!M.scout(s));
s=M.create('two');s.players[0].pos=5;s.players[0].progress[6]=2;pass(s,6);pass(s,35,false);assert.equal(s.winner,0);assert.equal(s.players[0].turns,s.players[1].turns);
s=M.create('two');s.players[1].pos=5;s.players[1].progress[6]=2;pass(s,35,false);pass(s,6);assert.equal(s.winner,1);
s=M.create('two');s.maxRounds=1;pass(s,35,false);pass(s,35,false);assert.equal(s.winner,'draw');s=M.create('two');s.maxRounds=1;pass(s,35);pass(s,43,false);assert.equal(s.winner,0,'closer to finish wins at cap');
s=M.create('solo');s.players[0].pos=5;s.players[0].progress[6]=2;pass(s,6);assert.equal(s.winner,0);assert.equal(s.status,'finished');
console.log('Expedition model: adjacency, fog, compass, multi-answer terrain, errors, shield, non-farmable rewards, solo finish, equal-turn victory/draw and round cap passed.');
