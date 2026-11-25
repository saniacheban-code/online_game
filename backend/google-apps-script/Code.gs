/* Bound Apps Script, V8. Keep spreadsheet and Script Properties private. */
const ARENA_GAMES=['drones','planes','fighters','towers','cyber','maze','race','forest','runner','builder','siege','expedition','parkour','lighthouse','voxel','alchemy','capsule'];
const ARENA_SUBJECTS=['math','physics','chemistry','biology','geography','informatics','natural-science','russian','english','kazakhstan-history','world-history','kazakh','world-around','literacy','literary-reading','music-primary','visual-art','handicraft'];
const SCHEMA={Users:['id','login','display','salt','verifier','created','disabled','grade'],Sessions:['tokenHash','userId','expires'],Rounds:['id','userId','started','game','subject','grade','topic','profileGrade','reward'],Scores:['id','userId','roundId','seq','game','subject','correct','points','created','eventAt','profileGrade','taskGrade','percent'],Leaderboard:['rank','playerId','display','points','correct','grade']};
// Editor-only initialization. Never exposed as a web API action.
function setup(){
 const props=PropertiesService.getScriptProperties();
 const saved=props.getProperty('SPREADSHEET_ID');
 const book=saved?SpreadsheetApp.openById(saved):(SpreadsheetApp.getActiveSpreadsheet()||SpreadsheetApp.create('Учебная арена — аккаунты и рейтинг'));
 const oldUsers=book.getSheetByName('Users');
 if(!props.getProperty('AUTH_PEPPER')&&oldUsers&&oldUsers.getLastRow()>1)throw Error('В базе уже есть аккаунты, но отсутствует AUTH_PEPPER. Восстановите прежнее свойство скрипта; новый секрет изменит проверку старых паролей.');
 props.setProperty('SPREADSHEET_ID',book.getId());
 if(!props.getProperty('AUTH_PEPPER'))props.setProperty('AUTH_PEPPER',random_()+random_());
 Object.keys(SCHEMA).forEach(name=>{
  const sheet=book.getSheetByName(name)||book.insertSheet(name),headers=SCHEMA[name];
  if(!sheet.getLastRow())sheet.appendRow(headers);
  else{const current=sheet.getRange(1,1,1,headers.length).getValues()[0];current.forEach((v,i)=>{if(v!==''&&v!==headers[i])throw Error('Заголовки листа '+name+' отличаются от ожидаемых. Не меняйте их вручную.');});sheet.getRange(1,1,1,headers.length).setValues([headers]);}
  sheet.setFrozenRows(1);
 });
 props.setProperty('SCHEMA_VERSION','2');refreshLeaderboard_();
 const url=book.getUrl();console.log('База настроена: '+url);return{ready:true,spreadsheetUrl:url};
}
function serverInfo_(){const p=PropertiesService.getScriptProperties(),ready=!!p.getProperty('SPREADSHEET_ID')&&!!p.getProperty('AUTH_PEPPER')&&p.getProperty('SCHEMA_VERSION')==='2';return{service:'arena-mobile',version:2,ready,message:ready?'База подключена.':'Владелец должен один раз выполнить setup в этом проекте Apps Script и предоставить доступ к Google Таблицам.'}}
function db_(){const p=PropertiesService.getScriptProperties(),id=p.getProperty('SPREADSHEET_ID');if(!id||p.getProperty('SCHEMA_VERSION')!=='2')fail_('База ещё не инициализирована. Откройте этот проект Apps Script, выберите setup и нажмите «Выполнить». Одной ссылки /exec недостаточно.','SETUP');return SpreadsheetApp.openById(id)}
function grade_(value){if(!Number.isInteger(value)||value<1||value>11)fail_('Выберите свой класс от 1 до 11.','GRADE_REQUIRED');return value}
function reward_(profileGrade,taskGrade){const delta=Math.abs(grade_(profileGrade)-grade_(taskGrade));return delta===0?10:Math.max(1,6-delta)}
function rows_(n){const s=db_().getSheetByName(n);if(!s)fail_('Сервис ещё не настроен.','SETUP');return s.getLastRow()>1?s.getRange(2,1,s.getLastRow()-1,SCHEMA[n].length).getValues():[]}
function append_(n,rows){if(!rows.length)return;const s=db_().getSheetByName(n);s.getRange(s.getLastRow()+1,1,rows.length,SCHEMA[n].length).setValues(rows)}
function random_(){return Utilities.getUuid().replace(/-/g,'')+Utilities.getUuid().replace(/-/g,'')}
function hex_(a){return a.map(x=>('0'+((x+256)%256).toString(16)).slice(-2)).join('')}
function hash_(t){return hex_(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,String(t),Utilities.Charset.UTF_8))}
function pepper_(t){const k=PropertiesService.getScriptProperties().getProperty('AUTH_PEPPER');if(!k)fail_('Сервис ещё не настроен.','SETUP');return hex_(Utilities.computeHmacSha256Signature(String(t),k))}
function equal_(a,b){a=String(a);b=String(b);let r=a.length^b.length;for(let i=0;i<Math.max(a.length,b.length);i++)r|=(a.charCodeAt(i)||0)^(b.charCodeAt(i)||0);return r===0}
function fail_(message,code){const e=new Error(message);e.publicCode=code||'INPUT';throw e}
function login_(v){const s=String(v||'').toLowerCase().trim();if(!/^[a-z][a-z0-9_]{2,23}$/.test(s))fail_('Логин: 3–24 латинских символа, цифры и _. Начните с буквы.');return s}
function rate_(key,max,seconds){const c=CacheService.getScriptCache(),k='rate:'+hash_(key),n=Number(c.get(k)||0);if(n>=max)fail_('Слишком много попыток. Подождите несколько минут.','RATE');c.put(k,String(n+1),seconds)}
function user_(id){return rows_('Users').find(u=>u[0]===id&&!u[6])}
function session_(token){if(typeof token!=='string'||!/^[a-f0-9]{128}$/.test(token))fail_('Войдите ещё раз.','AUTH');const digest=hash_(token),s=rows_('Sessions').find(r=>r[0]===digest&&Number(r[2])>Date.now()),u=s&&user_(s[1]);if(!u)fail_('Сеанс истёк. Войдите ещё раз.','AUTH');return{user:u,hash:digest}}
function profile_(u,scores){const own=(scores||rows_('Scores')).filter(r=>r[1]===u[0]);return{id:u[0],display:u[2],points:own.reduce((s,r)=>s+Number(r[7]),0),correct:own.filter(r=>r[6]===true||r[6]==='true').length,grade:Number.isInteger(Number(u[7]))&&Number(u[7])>=1&&Number(u[7])<=11?Number(u[7]):null}}
function issue_(u){const token=random_()+random_();append_('Sessions',[[hash_(token),u[0],Date.now()+7*86400000]]);return{token,user:profile_(u),apiVersion:2}}
function leaderboard_(){const scores=rows_('Scores'),totals=new Map();scores.forEach(r=>{const old=totals.get(r[1])||{points:0,correct:0};old.points+=Number(r[7]);if(r[6]===true||r[6]==='true')old.correct++;totals.set(r[1],old)});const players=rows_('Users').filter(u=>!u[6]).map(u=>({id:u[0],display:u[2],grade:Number(u[7])||null,...(totals.get(u[0])||{points:0,correct:0})})).sort((a,b)=>b.points-a.points||a.id.localeCompare(b.id));let rank=0,previous=null;players.forEach((p,i)=>{if(p.points!==previous)rank=i+1;p.rank=rank;previous=p.points});return players}
function refreshLeaderboard_(){const players=leaderboard_(),s=db_().getSheetByName('Leaderboard');if(s.getLastRow()>1)s.getRange(2,1,s.getLastRow()-1,6).clearContent();if(players.length)s.getRange(2,1,players.length,6).setValues(players.map(p=>[p.rank,p.id,p.display,p.points,p.correct,p.grade||'']));return players}
function route_(d){const now=Date.now();if(d.action==='serverInfo')return serverInfo_();
 if(d.action==='challenge'){const login=login_(d.login);rate_('challenge:'+login,30,300);const u=rows_('Users').find(r=>r[1]===login);return{salt:u?u[3]:pepper_('unknown:'+login).slice(0,32),iterations:600000}}
 if(d.action==='register'){rate_('register-global',200,3600);const login=login_(d.login),display=String(d.display||'').trim(),schoolGrade=grade_(d.grade);if(!Number.isInteger(d.passwordLength)||d.passwordLength<6||d.passwordLength>128)fail_('Пароль должен содержать от 6 до 128 символов.');if(!/^[\p{L}\p{N}][\p{L}\p{N} _-]{1,23}$/u.test(display))fail_('Псевдоним: 2–24 буквы, цифры, пробел, дефис или _.');if(!/^[a-f0-9]{32}$/.test(d.salt||'')||!/^[a-f0-9]{64}$/.test(d.proof||''))fail_('Некорректная регистрация.');if(rows_('Users').some(u=>u[1]===login))fail_('Этот логин уже занят.');const u=[random_().slice(0,24),login,display,d.salt,pepper_(login+':'+d.proof),now,false,schoolGrade];append_('Users',[u]);return issue_(u)}
 if(d.action==='login'){const login=login_(d.login);rate_('login:'+login,8,300);const u=rows_('Users').find(r=>r[1]===login&&!r[6]);if(!/^[a-f0-9]{64}$/.test(d.proof||'')||!equal_(u?u[4]:pepper_('fake'),pepper_(login+':'+d.proof)))fail_('Неверный логин или пароль.','LOGIN');return issue_(u)}
 if(d.action==='leaderboard')return{players:leaderboard_().slice(0,100),updatedAt:now};
 const auth=session_(d.token),u=auth.user;
 if(d.action==='me')return profile_(u);
 if(d.action==='setGrade'){if(profile_(u).grade)fail_('Класс уже закреплён за аккаунтом. Для изменения обратитесь к учителю.');const selected=grade_(d.grade),users=rows_('Users'),index=users.findIndex(row=>row[0]===u[0]);db_().getSheetByName('Users').getRange(index+2,8).setValue(selected);u[7]=selected;return profile_(u);}
 if(d.action==='logout'){const s=db_().getSheetByName('Sessions');rows_('Sessions').forEach((r,i)=>{if(r[0]===auth.hash)s.getRange(i+2,3).setValue(0)});return{loggedOut:true}}
 if(d.action==='startRound'){rate_('start:'+u[0],60,600);if(!ARENA_GAMES.includes(d.game)||!ARENA_SUBJECTS.includes(d.subject)||!Number.isInteger(d.grade)||d.grade<1||d.grade>11)fail_('Игра или предмет не поддерживаются.');const profileGrade=grade_(profile_(u).grade),reward=reward_(profileGrade,d.grade),id=random_().slice(0,32);append_('Rounds',[[id,u[0],now,d.game,d.subject,d.grade,Math.max(0,Math.min(500,Number(d.topic)||0)),profileGrade,reward]]);return{roundId:id,serverNow:now,reward,percent:reward*10,profileGrade,taskGrade:d.grade}}
 if(d.action==='score'){if(!Array.isArray(d.events)||!d.events.length||d.events.length>20)fail_('Некорректный пакет.');const rounds=rows_('Rounds'),scores=rows_('Scores'),ids=new Set(scores.map(r=>r[0])),processed=[],out=[],times=scores.filter(r=>r[1]===u[0]&&Number(r[7])>0).map(r=>Number(r[9]));let limited=false;
  for(const e of d.events){if(!/^[a-f0-9]{32}$/.test(e.roundId||'')||!Number.isInteger(e.seq)||e.seq<1||e.seq>10000||!Number.isInteger(e.elapsed)||e.elapsed<0||typeof e.correct!=='boolean')fail_('Некорректный результат.');const key=e.roundId+':'+e.seq,id=u[0]+':'+key;processed.push(key);if(ids.has(id))continue;const r=rounds.find(r=>r[0]===e.roundId&&r[1]===u[0]);if(!r)fail_('Игровая сессия не найдена.');const profileGrade=Number(r[7])||grade_(profile_(u, scores).grade),taskGrade=grade_(Number(r[5])),reward=reward_(profileGrade,taskGrade);const at=Number(r[2])+e.elapsed;if(at>now+2500||e.elapsed>45*60000)fail_('Некорректное время результата.');if(now-Number(r[2])>7*86400000){limited=true;continue}let points=0;if(e.correct){if(times.every(t=>Math.abs(at-t)>=5000)){points=reward;times.push(at)}else limited=true}out.push([id,u[0],e.roundId,e.seq,r[3],r[4],e.correct,points,now,at,profileGrade,taskGrade,reward*10]);ids.add(id)}
  append_('Scores',out);refreshLeaderboard_();return{processed,user:profile_(u,scores.concat(out)),limited};
 }
 fail_('Неизвестное действие.');
}
function doPost(e){const lock=LockService.getScriptLock();let held=false;try{if(!e||!e.postData||e.postData.contents.length>32768)fail_('Слишком большой запрос.');const d=JSON.parse(e.postData.contents);if(!d||typeof d!=='object'||Array.isArray(d))fail_('Некорректный запрос.');held=lock.tryLock(15000);if(!held)fail_('Сервис занят. Повторите отправку.','BUSY');return json_({ok:true,data:route_(d)})}catch(e){return json_({ok:false,code:e.publicCode||'SERVER',error:e.publicCode?e.message:'Сервис временно недоступен.'})}finally{if(held)lock.releaseLock()}}
function doGet(){return json_({ok:true,data:serverInfo_()})}
function json_(data){return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON)}
