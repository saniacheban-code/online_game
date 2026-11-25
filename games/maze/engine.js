const isSolo=Arena.mode==='solo';
let soloControl=null,soloPrivate=false;
function soloCall(fn){soloPrivate=true;try{return fn()}finally{soloPrivate=false}}
function soloHelp(q){soloControl?.render(document,".player-side-p2",q)}
const MAZE_SIZE = 7;
let selectedGrade = null;
let players = {
            1: { x: 0, y: 0, path: [], solvedCount: 0, selectedDir: null, currentProblem: null, isMoving: false, scratchTool: 'pen', scratchColor: '#0284c7' },
            2: { x: 0, y: 0, path: [], solvedCount: 0, selectedDir: null, currentProblem: null, isMoving: false, scratchTool: 'pen', scratchColor: '#059669' }
        };
let mazes = { 1: null, 2: null };
const ASSET_BG="../../assets/images/88f641f96d90435aafdb.webp",ASSET_TILES="../../assets/images/b34fca7886c1e55bb05d.webp",ASSET_HEROES="../../assets/images/e559d11805bf95884202.webp";
const tileImage=new Image(),heroImage=new Image();
let taskGenerator=null,onExit=()=>{},gameActive=false,gameOver=true,epoch=0,animationFrame=0,lastPaint=0;
const pending=new Set(),terrainCache={1:null,2:null};
function later(fn,ms){const token=epoch,id=setTimeout(()=>{pending.delete(id);if(token===epoch)fn()},ms);pending.add(id);return id}
function stopTimers(){epoch++;for(const id of pending)clearTimeout(id);pending.clear();for(const p of Object.values(players)){clearInterval(p.moveTimer);p.moveTimer=null;p.isMoving=false}}
function numericValue(value){
            const s=value.replaceAll('−','-').replaceAll(',','.').trim();
            if(/^-?\d+(?:\.\d+)?$/.test(s))return Number(s);
            const plain=s.match(/^(-?\d+)\/(-?\d+)$/);if(plain&&Number(plain[2])!==0)return Number(plain[1])/Number(plain[2]);
            const f=s.match(/^(-?)<span class="fr"><i>(\d+)<\/i><b>(\d+)<\/b><\/span>$/);if(f&&Number(f[3])!==0)return (f[1]?-1:1)*Number(f[2])/Number(f[3]);
            return null;
        }
function generateProblem(pId=1){if(isSolo){const q=taskGenerator(pId-1);return{source:q,htmlText:q.q,numericAns:numericValue(q.o[q.ci]),options:[...q.o],correct:q.ci}}else{const q=taskGenerator(pId-1);return{htmlText:q.q,numericAns:numericValue(q.o[q.ci]),options:[...q.o],correct:q.ci}}}
function calculateDecisionPoints(grid, cols, rows) {
            let queue = [{ r: 0, c: 0, decisions: 0, parentDir: null }];
            let visited = new Set(['0,0']);

            while (queue.length > 0) {
                let curr = queue.shift();
                if (curr.r === rows - 1 && curr.c === cols - 1) return curr.decisions;

                let cell = grid[curr.r][curr.c];
                let moves = [];
                if (!cell.walls.up) moves.push({ r: curr.r - 1, c: curr.c, dir: 'up' });
                if (!cell.walls.right) moves.push({ r: curr.r, c: curr.c + 1, dir: 'right' });
                if (!cell.walls.down) moves.push({ r: curr.r + 1, c: curr.c, dir: 'down' });
                if (!cell.walls.left) moves.push({ r: curr.r, c: curr.c - 1, dir: 'left' });

                for (let m of moves) {
                    let key = `${m.r},${m.c}`;
                    if (!visited.has(key)) {
                        visited.add(key);
                        let newDecisions = curr.decisions;
                        if (curr.parentDir === null || curr.parentDir !== m.dir) newDecisions++;
                        queue.push({ r: m.r, c: m.c, decisions: newDecisions, parentDir: m.dir });
                    }
                }
            }
            return 0;
        }
function generateMaze(cols, rows) {
            let attempts = 0,bestGrid=null,bestDistance=Infinity;
            while (attempts < 80) {
                attempts++;
                let grid = [];
                for (let r = 0; r < rows; r++) {
                    let row = [];
                    for (let c = 0; c < cols; c++) {
                        row.push({ r, c, walls: { up: true, right: true, down: true, left: true }, visited: false });
                    }
                    grid.push(row);
                }

                let stack = [];
                let current = grid[0][0];
                current.visited = true;

                while (true) {
                    let neighbors = [];
                    let { r, c } = current;

                    if (r > 0 && !grid[r - 1][c].visited) neighbors.push({ cell: grid[r - 1][c], dir: 'up' });
                    if (c < cols - 1 && !grid[r][c + 1].visited) neighbors.push({ cell: grid[r][c + 1], dir: 'right' });
                    if (r < rows - 1 && !grid[r + 1][c].visited) neighbors.push({ cell: grid[r + 1][c], dir: 'down' });
                    if (c > 0 && !grid[r][c - 1].visited) neighbors.push({ cell: grid[r][c - 1], dir: 'left' });

                    if (neighbors.length > 0) {
                        let nextObj = neighbors[Math.floor(Math.random() * neighbors.length)];
                        let next = nextObj.cell;

                        if (nextObj.dir === 'up') { current.walls.up = false; next.walls.down = false; }
                        else if (nextObj.dir === 'right') { current.walls.right = false; next.walls.left = false; }
                        else if (nextObj.dir === 'down') { current.walls.down = false; next.walls.up = false; }
                        else if (nextObj.dir === 'left') { current.walls.left = false; next.walls.right = false; }

                        stack.push(current);
                        current = next;
                        current.visited = true;
                    } else if (stack.length > 0) {
                        current = stack.pop();
                    } else break;
                }

                for (let r = 0; r < rows; r++) {
                    for (let c = 0; c < cols; c++) {
                        if (c < cols - 1 && grid[r][c].walls.right && Math.random() < 0.18) {
                            grid[r][c].walls.right = false; grid[r][c + 1].walls.left = false;
                        }
                        if (r < rows - 1 && grid[r][c].walls.down && Math.random() < 0.18) {
                            grid[r][c].walls.down = false; grid[r + 1][c].walls.up = false;
                        }
                    }
                }

                let requiredSolves = calculateDecisionPoints(grid, cols, rows);
                if (requiredSolves >= 3 && requiredSolves <= 6) return grid;
                const distance=Math.abs(requiredSolves-4);if(distance<bestDistance){bestDistance=distance;bestGrid=grid}
            }
            return bestGrid;
        }
function makeTile(column,size){const c=document.createElement('canvas');c.width=c.height=size;const cx=c.getContext('2d');cx.drawImage(tileImage,column*tileImage.width/2,0,tileImage.width/2,tileImage.height,0,0,size,size);return c}
function drawMaze(pId,now=performance.now()){
            const canvas=document.getElementById(`canvas-maze-p${pId}`);if(!canvas||!mazes[pId])return;
            const parent=canvas.parentElement,size=Math.max(84,Math.floor(Math.min((parent.clientWidth||300)-12,(parent.clientHeight||300)-12))),dpr=Math.min(window.devicePixelRatio||1,2),pixels=Math.round(size*dpr);
            if(canvas.width!==pixels||canvas.height!==pixels){canvas.width=canvas.height=pixels;canvas.style.width=canvas.style.height=size+'px';terrainCache[pId]=null}
            const ctx=canvas.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);const cs=size/MAZE_SIZE,grid=mazes[pId],p=players[pId];
            if(!terrainCache[pId]){
                const layer=document.createElement('canvas');layer.width=layer.height=pixels;const c=layer.getContext('2d');c.setTransform(dpr,0,0,dpr,0,0);
                c.fillStyle=tileImage.naturalWidth?c.createPattern(makeTile(1,64),'repeat'):'#617066';c.fillRect(0,0,size,size);c.fillStyle='#071e2028';c.fillRect(0,0,size,size);
                const wallPath=()=>{c.beginPath();for(let r=0;r<MAZE_SIZE;r++)for(let col=0;col<MAZE_SIZE;col++){const cell=grid[r][col],x=col*cs,y=r*cs;if(cell.walls.up){c.moveTo(x,y);c.lineTo(x+cs,y)}if(cell.walls.left){c.moveTo(x,y);c.lineTo(x,y+cs)}if(r===MAZE_SIZE-1&&cell.walls.down){c.moveTo(x,y+cs);c.lineTo(x+cs,y+cs)}if(col===MAZE_SIZE-1&&cell.walls.right){c.moveTo(x+cs,y);c.lineTo(x+cs,y+cs)}}};
                c.lineCap='square';c.lineJoin='miter';const thickness=Math.max(4,cs*.15);wallPath();c.strokeStyle='#071416';c.lineWidth=thickness+3;c.shadowColor='#000b';c.shadowBlur=4;c.shadowOffsetY=2;c.stroke();c.shadowBlur=0;c.shadowOffsetY=0;wallPath();c.strokeStyle=tileImage.naturalWidth?c.createPattern(makeTile(0,48),'repeat'):'#789080';c.lineWidth=thickness;c.stroke();wallPath();c.strokeStyle='#bdd3b244';c.lineWidth=Math.max(1,thickness*.2);c.stroke();terrainCache[pId]=layer;
            }
            ctx.clearRect(0,0,size,size);ctx.drawImage(terrainCache[pId],0,0,pixels,pixels,0,0,size,size);
            ctx.fillStyle=pId===1?'#55d9ff3b':'#67e8a53b';for(const pos of p.path)ctx.fillRect(pos.c*cs+cs*.12,pos.r*cs+cs*.12,cs*.76,cs*.76);
            const gx=size-cs/2,gy=size-cs/2;ctx.save();ctx.translate(gx,gy);ctx.shadowColor='#ffc857';ctx.shadowBlur=12;ctx.strokeStyle='#ffda78';ctx.lineWidth=Math.max(2,cs*.055);ctx.beginPath();ctx.ellipse(0,0,cs*.24,cs*.31,0,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#ffd56b66';ctx.fill();ctx.shadowBlur=0;ctx.fillStyle='#fff4ce';ctx.font=`bold ${Math.max(8,cs*.18)}px system-ui`;ctx.textAlign='center';ctx.fillText('ВЫХОД',0,cs*.41);ctx.restore();
            const u=Math.min(1,Math.max(0,(now-(p.stepStart||0))/120)),from=p.renderFrom||{x:p.x,y:p.y},rx=from.x+(p.x-from.x)*u,ry=from.y+(p.y-from.y)*u,px=(ry+.5)*cs,py=(rx+.5)*cs,bob=p.isMoving?Math.sin(now/65)*cs*.035:0;
            ctx.fillStyle='#06191d55';ctx.beginPath();ctx.ellipse(px,py+cs*.25,cs*.24,cs*.13,0,0,Math.PI*2);ctx.fill();
            if(heroImage.naturalWidth){const frame={down:0,left:1,up:2,right:3}[p.facing||'down'],w=heroImage.width/4,h=heroImage.height/2;ctx.drawImage(heroImage,frame*w,(pId-1)*h,w,h,px-cs*.43,py-cs*.44+bob,cs*.86,cs*.86)}else{ctx.fillStyle=pId===1?'#36bded':'#45d997';ctx.beginPath();ctx.arc(px,py,cs*.25,0,Math.PI*2);ctx.fill()}
        }
let soloMazeLast=0;
function animateMaze(now){if(isSolo){const soloDt=Math.max(0,(now-soloMazeLast)/1000);soloMazeLast=now;if(gameActive&&!gameOver)soloControl?.tick(soloDt,!players[2].isMoving,ok=>soloMazeMove(ok));if(gameActive&&now-lastPaint>25){drawMaze(1,now);drawMaze(2,now);lastPaint=now}animationFrame=requestAnimationFrame(animateMaze)}else{if(gameActive&&now-lastPaint>25){drawMaze(1,now);drawMaze(2,now);lastPaint=now}animationFrame=requestAnimationFrame(animateMaze)}}
tileImage.onload=()=>{terrainCache[1]=terrainCache[2]=null};
tileImage.src=ASSET_TILES;
heroImage.src=ASSET_HEROES;
function updateControls(pId) {
            if (!mazes[pId]) return;
            const { x, y } = players[pId];
            const cell = mazes[pId][x][y];

            document.getElementById(`p${pId}-btn-up`).disabled = cell.walls.up || players[pId].isMoving || gameOver;
            document.getElementById(`p${pId}-btn-down`).disabled = cell.walls.down || players[pId].isMoving || gameOver;
            document.getElementById(`p${pId}-btn-left`).disabled = cell.walls.left || players[pId].isMoving || gameOver;
            document.getElementById(`p${pId}-btn-right`).disabled = cell.walls.right || players[pId].isMoving || gameOver;
        }
function selectDirection(pId,dir){if(isSolo){if(pId===2&&!soloPrivate)return;
            const p=players[pId];if(!gameActive||gameOver||p.isMoving||p.currentProblem||!['up','right','down','left'].includes(dir)||mazes[pId][p.x][p.y].walls[dir])return;
            p.selectedDir=dir;p.facing=dir;const prob=generateProblem(pId);if(pId===1)soloHelp(prob.source);p.currentProblem=prob;p.optionsMode=prob.numericAns===null;
            document.getElementById(`p${pId}-dir-indicator`).innerText={up:'↑ Вверх',down:'↓ Вниз',left:'← Влево',right:'→ Вправо'}[dir];
            document.getElementById(`p${pId}-move-controls`).classList.add('hidden');document.getElementById(`p${pId}-math-gate`).classList.remove('hidden');document.getElementById(`p${pId}-math-question`).innerHTML=prob.htmlText;
            document.getElementById(`p${pId}-answer-input`).value='';
            document.getElementById(`p${pId}-options`).innerHTML=prob.options.map((o,i)=>`<button type="button" onclick="answerOption(${pId},${i})">${o}</button>`).join('');renderAnswerMode(pId);
        }else{
            const p=players[pId];if(!gameActive||gameOver||p.isMoving||p.currentProblem||!['up','right','down','left'].includes(dir)||mazes[pId][p.x][p.y].walls[dir])return;
            p.selectedDir=dir;p.facing=dir;const prob=generateProblem(pId);p.currentProblem=prob;p.optionsMode=prob.numericAns===null;
            document.getElementById(`p${pId}-dir-indicator`).innerText={up:'↑ Вверх',down:'↓ Вниз',left:'← Влево',right:'→ Вправо'}[dir];
            document.getElementById(`p${pId}-move-controls`).classList.add('hidden');document.getElementById(`p${pId}-math-gate`).classList.remove('hidden');document.getElementById(`p${pId}-math-question`).innerHTML=prob.htmlText;
            document.getElementById(`p${pId}-answer-input`).value='';
            document.getElementById(`p${pId}-options`).innerHTML=prob.options.map((o,i)=>`<button type="button" onclick="answerOption(${pId},${i})">${o}</button>`).join('');renderAnswerMode(pId);
        }}
function renderAnswerMode(pId){const p=players[pId];document.getElementById(`p${pId}-numeric-row`).classList.toggle('hidden',p.optionsMode);document.getElementById(`p${pId}-numpad`).classList.toggle('hidden',p.optionsMode);document.getElementById(`p${pId}-options`).classList.toggle('hidden',!p.optionsMode);const b=document.getElementById(`p${pId}-mode`);b.classList.toggle('hidden',p.currentProblem.numericAns===null);b.innerText=p.optionsMode?'Ввести ответ числом':'Выбрать из четырёх вариантов'}
function toggleAnswerMode(pId){if(isSolo){if(pId===2&&!soloPrivate)return;const p=players[pId];if(gameOver||!p.currentProblem||p.currentProblem.numericAns===null)return;p.optionsMode=!p.optionsMode;renderAnswerMode(pId)}else{const p=players[pId];if(gameOver||!p.currentProblem||p.currentProblem.numericAns===null)return;p.optionsMode=!p.optionsMode;renderAnswerMode(pId)}}
function appendInput(pId,val){if(isSolo){if(pId===2&&!soloPrivate)return;const p=players[pId];if(gameOver||!p.currentProblem||p.isMoving||p.optionsMode)return;const el=document.getElementById(`p${pId}-answer-input`);if(el.value.length<24)el.value+=val}else{const p=players[pId];if(gameOver||!p.currentProblem||p.isMoving||p.optionsMode)return;const el=document.getElementById(`p${pId}-answer-input`);if(el.value.length<24)el.value+=val}}
function clearInput(pId){if(isSolo){if(pId===2&&!soloPrivate)return;const el=document.getElementById(`p${pId}-answer-input`);el.value=el.value.slice(0,-1)}else{const el=document.getElementById(`p${pId}-answer-input`);el.value=el.value.slice(0,-1)}}
function showStatusMsg(pId,msg,isError=false){const el=document.getElementById(`p${pId}-status-msg`);el.innerText=msg;el.className=`status-msg ${isError?'status-err':'status-ok'}`;clearTimeout(players[pId].statusTimer);players[pId].statusTimer=later(()=>el.classList.add('hidden'),2000)}
function submitAnswer(pId){if(isSolo){if(pId===2&&!soloPrivate)return;const p=players[pId];if(gameOver||!p.currentProblem||p.isMoving||p.optionsMode)return;const value=document.getElementById(`p${pId}-answer-input`).value.trim(),n=numericValue(value);if(!value||n===null)return;resolveMazeAnswer(pId,Math.abs(n-p.currentProblem.numericAns)<1e-7)}else{const p=players[pId];if(gameOver||!p.currentProblem||p.isMoving||p.optionsMode)return;const value=document.getElementById(`p${pId}-answer-input`).value.trim(),n=numericValue(value);if(!value||n===null)return;resolveMazeAnswer(pId,Math.abs(n-p.currentProblem.numericAns)<1e-7)}}
function answerOption(pId,index){if(isSolo){if(pId===2&&!soloPrivate)return;const p=players[pId];if(gameOver||!p.currentProblem||p.isMoving||!p.optionsMode||!Number.isInteger(index)||index<0||index>3)return;resolveMazeAnswer(pId,index===p.currentProblem.correct)}else{const p=players[pId];if(gameOver||!p.currentProblem||p.isMoving||!p.optionsMode||!Number.isInteger(index)||index<0||index>3)return;resolveMazeAnswer(pId,index===p.currentProblem.correct)}}
function resolveMazeAnswer(pId,correct){const p=players[pId];if(gameOver||p.isMoving||!p.currentProblem)return;taskGenerator.answer?.(pId-1,correct);if(!correct){showStatusMsg(pId,'Ошибка! Попробуйте ещё раз.',true);document.getElementById(`p${pId}-answer-input`).value='';return}showStatusMsg(pId,'Верно! В путь!');p.solvedCount++;document.getElementById(`p${pId}-progress`).innerText=p.solvedCount;p.currentProblem=null;document.getElementById(`p${pId}-math-gate`).classList.add('hidden');document.getElementById(`p${pId}-move-controls`).classList.remove('hidden');moveUntilWallOrJunction(pId,p.selectedDir)}
function moveUntilWallOrJunction(pId, dir) {
            let p = players[pId];
            p.isMoving = true;
            updateControls(pId);

            p.moveTimer = setInterval(() => {
                if(gameOver||!gameActive){clearInterval(p.moveTimer);p.isMoving=false;return}
                let grid = mazes[pId];
                let currentCell = grid[p.x][p.y];

                if (currentCell.walls[dir]) {
                    clearInterval(p.moveTimer);
                    p.isMoving = false;
                    updateControls(pId);
                    if (p.x === MAZE_SIZE - 1 && p.y === MAZE_SIZE - 1) showVictory(pId);
                    return;
                }

                p.renderFrom={x:p.x,y:p.y};p.stepStart=performance.now();p.facing=dir;
                if (dir === 'up') p.x--;
                if (dir === 'down') p.x++;
                if (dir === 'left') p.y--;
                if (dir === 'right') p.y++;

                p.path.push({ r: p.x, c: p.y });
                drawMaze(pId);

                let nextCell = grid[p.x][p.y];
                let openPaths = 0;
                ['up', 'right', 'down', 'left'].forEach(d => { if (!nextCell.walls[d]) openPaths++; });

                if (p.x === MAZE_SIZE - 1 && p.y === MAZE_SIZE - 1) {
                    clearInterval(p.moveTimer);
                    p.isMoving = false;
                    updateControls(pId);
                    showVictory(pId);
                    return;
                }

                if (nextCell.walls[dir] || openPaths > 2) {
                    clearInterval(p.moveTimer);
                    p.isMoving = false;
                    updateControls(pId);
                }
            }, 140);
        }
function showVictory(pId){if(isSolo){if(gameOver)return;gameOver=true;stopTimers();document.getElementById('winner-title').innerText=pId===1?'Вы нашли выход!':'Компьютер нашёл выход первым';document.getElementById('winner-desc').innerText=`Решено вами: ${players[1].solvedCount}. Компьютером: ${players[2].solvedCount}.`;document.getElementById('victory-modal').classList.remove('hidden');[1,2].forEach(updateControls)}else{if(gameOver)return;gameOver=true;stopTimers();document.getElementById('winner-title').innerText=`Победа игрока ${pId}!`;document.getElementById('winner-desc').innerText=`Игрок ${pId} первым нашёл выход. Решено заданий: ${players[pId].solvedCount}.`;document.getElementById('victory-modal').classList.remove('hidden');[1,2].forEach(updateControls)}}
function startNewGame(){if(!taskGenerator)return;stopTimers();taskGenerator.reset?.();gameOver=false;gameActive=true;document.getElementById('victory-modal').classList.add('hidden');document.getElementById('grade-modal').classList.add('hidden');mazes[1]=generateMaze(MAZE_SIZE,MAZE_SIZE);mazes[2]=JSON.parse(JSON.stringify(mazes[1]));terrainCache[1]=terrainCache[2]=null;
            for(const pId of [1,2]){const p=players[pId];Object.assign(p,{x:0,y:0,path:[{r:0,c:0}],solvedCount:0,selectedDir:null,currentProblem:null,isMoving:false,facing:'down',renderFrom:{x:0,y:0},stepStart:0});document.getElementById(`p${pId}-progress`).innerText='0';document.getElementById(`p${pId}-math-gate`).classList.add('hidden');document.getElementById(`p${pId}-move-controls`).classList.remove('hidden');document.getElementById(`p${pId}-status-msg`).classList.add('hidden');clearScratchpad(pId);resizeScratchpad(pId);drawMaze(pId);updateControls(pId)}
        }
function leaveMaze(){gameOver=true;gameActive=false;stopTimers();cancelAnimationFrame(animationFrame);onExit()}
if(isSolo){window.configureArena=(next,label,exit)=>{stopTimers();gameOver=true;gameActive=false;taskGenerator=next;onExit=exit;selectedGrade=true;document.getElementById('grade-badge').innerText='1 игрок + компьютер';document.getElementById('topic-title-text').innerText=label;document.getElementById('selected-topic').innerText=label;document.getElementById('maze-intro').src=ASSET_BG;document.querySelectorAll('.maze-scene').forEach(im=>im.src=ASSET_BG);document.getElementById('grade-modal').classList.remove('hidden');document.getElementById('victory-modal').classList.add('hidden')};}else{window.configureArena=(next,label,exit)=>{stopTimers();gameOver=true;gameActive=false;taskGenerator=next;onExit=exit;selectedGrade=true;document.getElementById('grade-badge').innerText='2 игрока';document.getElementById('topic-title-text').innerText=label;document.getElementById('selected-topic').innerText=label;document.getElementById('maze-intro').src=ASSET_BG;document.querySelectorAll('.maze-scene').forEach(im=>im.src=ASSET_BG);document.getElementById('grade-modal').classList.remove('hidden');document.getElementById('victory-modal').classList.add('hidden')};}
window.addEventListener('keydown',e=>{if(gameOver||!gameActive||e.repeat||e.ctrlKey||e.altKey||e.metaKey)return;const p1={w:'up',a:'left',s:'down',d:'right'},p2={ArrowUp:'up',ArrowLeft:'left',ArrowDown:'down',ArrowRight:'right'};if(p1[e.key.toLowerCase()]){e.preventDefault();selectDirection(1,p1[e.key.toLowerCase()])}else if(p2[e.key]){e.preventDefault();selectDirection(2,p2[e.key])}else for(const id of [1,2]){const j=(id===1?'1234':'7890').indexOf(e.key);if(j>=0&&players[id].optionsMode){e.preventDefault();answerOption(id,j)}}});
function initScratchpad(pId){const canvas=document.getElementById(`scratchpad-p${pId}`),ctx=canvas.getContext('2d'),points=new Map();const pos=e=>{const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)*canvas.width/r.width,y:(e.clientY-r.top)*canvas.height/r.height}};canvas.addEventListener('pointerdown',e=>{e.preventDefault();canvas.setPointerCapture(e.pointerId);points.set(e.pointerId,pos(e))});canvas.addEventListener('pointermove',e=>{const a=points.get(e.pointerId);if(!a)return;e.preventDefault();const b=pos(e);ctx.strokeStyle=players[pId].scratchTool==='eraser'?'#fff':players[pId].scratchColor;ctx.lineWidth=players[pId].scratchTool==='eraser'?20:3;ctx.lineCap=ctx.lineJoin='round';ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();points.set(e.pointerId,b)});for(const name of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(name,e=>points.delete(e.pointerId))}
function resizeScratchpad(pId) {
            const canvas = document.getElementById(`scratchpad-p${pId}`);
            if (!canvas || !canvas.parentElement) return;
            const rect = canvas.parentElement.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
                if(canvas.width===Math.round(rect.width)&&canvas.height===Math.round(rect.height))return;
                const copy=document.createElement('canvas');copy.width=canvas.width;copy.height=canvas.height;copy.getContext('2d').drawImage(canvas,0,0);canvas.width=Math.round(rect.width);canvas.height=Math.round(rect.height);canvas.getContext('2d').drawImage(copy,0,0,copy.width,copy.height,0,0,canvas.width,canvas.height);
            }
        }
function setScratchTool(pId, tool) {
            players[pId].scratchTool = tool;
            const btnPen = document.getElementById(`p${pId}-tool-pen`);
            const btnEraser = document.getElementById(`p${pId}-tool-eraser`);
            const activeColor = pId === 1 ? '#0284c7' : '#059669';

            if (tool === 'pen') {
                btnPen.style.backgroundColor = activeColor; btnPen.style.color = '#fff';
                btnEraser.style.backgroundColor = '#334155'; btnEraser.style.color = '#cbd5e1';
            } else {
                btnEraser.style.backgroundColor = activeColor; btnEraser.style.color = '#fff';
                btnPen.style.backgroundColor = '#334155'; btnPen.style.color = '#cbd5e1';
            }
        }
function clearScratchpad(pId) {
            const canvas = document.getElementById(`scratchpad-p${pId}`);
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
window.addEventListener('resize', () => {
            if (selectedGrade) {
                [1, 2].forEach(pId => {
                    resizeScratchpad(pId);
                    drawMaze(pId);
                });
            }
        });
if(typeof ResizeObserver==='function')new ResizeObserver(()=>{if(selectedGrade)[1,2].forEach(pId=>{resizeScratchpad(pId);drawMaze(pId)})}).observe(document.querySelector('.board-root'));
window.onload = function() {
            initScratchpad(1);
            initScratchpad(2);
            animationFrame=requestAnimationFrame(animateMaze);
        };
function soloMazeMove(ok){soloCall(()=>{const p=players[2];if(!p.currentProblem){const dirs=['up','right','down','left'],delta={up:[-1,0],right:[0,1],down:[1,0],left:[0,-1]},queue=[[p.x,p.y,null]],seen=new Set([p.x+','+p.y]);let best=null;for(let k=0;k<queue.length;k++){const [x,y,first]=queue[k];if(x===MAZE_SIZE-1&&y===MAZE_SIZE-1){best=first;break}for(const d of dirs)if(!mazes[2][x][y].walls[d]){const [dx,dy]=delta[d],nx=x+dx,ny=y+dy,key=nx+','+ny;if(!seen.has(key)){seen.add(key);queue.push([nx,ny,first||d])}}}const open=dirs.filter(d=>!mazes[2][p.x][p.y].walls[d]);if(soloControl.profile.lead===0&&Math.random()<.15)best=open[Math.floor(Math.random()*open.length)];if(best)selectDirection(2,best)}if(p.currentProblem)resolveMazeAnswer(2,ok)})}
const soloOriginalConfigure=window.configureArena;
if(isSolo){window.configureArena=(next,label,exit)=>{soloControl=next.solo;soloOriginalConfigure(next,label,exit);soloHelp(soloControl?.preview)};}