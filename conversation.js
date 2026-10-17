/*
 * Original PACES patient conversation fallback.
 * A deterministic educational script: no unrecorded clinical facts are invented.
 * For truly unscripted voice, configure the protected AI Realtime Worker.
 */
const CLEAN=s=>String(s||'').toLowerCase().replace(/[’']/g,'').replace(/[^a-z0-9 ]+/g,' ').replace(/\s+/g,' ').trim();
const ROOTS={breathless:'breath',breathing:'breath',dyspnoea:'breath',winded:'breath',painful:'pain',hurts:'pain',aching:'pain',ache:'pain',stiffness:'stiff',swollen:'swell',swelling:'swell',fainted:'faint',fainting:'faint',collapsed:'faint',started:'start',began:'start',beginning:'start',nauseous:'nausea',sick:'vomit',vomiting:'vomit',palpitations:'palpitat',smoking:'smok',cigarettes:'smok',drinking:'alcohol',medication:'medicin',medications:'medicin',medicines:'medicin',tablets:'medicin',allergies:'allerg',allergic:'allerg',worried:'worr',scared:'worr',afraid:'worr',constipation:'constipat',constipated:'constipat',pregnant:'pregnan',pregnancy:'pregnan',relatives:'family',operation:'surgery',operations:'surgery',ankles:'ankle',legs:'leg',wrists:'wrist',hands:'hand',headaches:'headache',urinating:'urinat',urination:'urinat',peeing:'urinat',wee:'urinat',travelled:'travel',travelling:'travel',dizzy:'dizz',exhausted:'tired',tiredness:'tired',father:'family',mother:'family'};
const STEM=w=>ROOTS[w]||((w.length>5&&w.endsWith('ing'))?w.slice(0,-3):(w.length>5&&w.endsWith('ed'))?w.slice(0,-2):(w.length>4&&w.endsWith('s'))?w.slice(0,-1):w);
const STOP=new Set('and are the this that with from have has had you your what when where which who why does did will would could please about doctor like tell know any other how can was were there them they for into after before'.split(' '));
const KEYWORDS={
 Symptoms:['symptom','problem','feel','trouble','cough','short of breath','main issue'],
 Onset:['start','first notice','begin','since when','onset','how long ago'],
 Duration:['start','how long','since','week','month','first'],
 Timing:['how often','frequency','how long','episode','attack','lasting'],
 Course:['start','progress','worse','getting better','how long'],
 Pain:['pain','hurt','ache','sharp','dull','spread','radiat','severity','out of ten'],
 Character:['pain','where','throb','sharp','dull','severity','headache'],
 Pattern:['which joints','where','hand','wrist','knuckle','both sides','fingertip'],
 Breathlessness:['breath','short of breath','winded','walk','exercise','stairs'],
 'DVT symptoms':['calf','leg','thigh','swell','tender'],
 'Associated symptoms':['fever','cough','blood','faint','palpitat','dizz','other symptoms'],
 'Systemic features':['fever','weight','rash','tired','fatigue','joint'],
 'Non-motor':['smell','sleep','bowel','constipat'],
 'Risk factors':['travel','flight','operation','surgery','immobil','long journey'],
 Medication:['medicin','drug','pill','tablets','prescription','regular medication'],
 Medicines:['medicin','drug','pill','tablets','prescription','regular medication'],
 'Pregnancy and allergies':['pregnan','last period','contracept','allerg'],
 Pregnancy:['pregnan','baby','contracept','last period','conceive'],
 'Family and social':['family','relatives','smok','alcohol','work','partner'],
 Family:['family','relatives','genetic','hereditary'],
 Background:['previous','past medical','history','clot','family','illness'],
 History:['history','previous','murmur','rheumatic','fever'],
 Lifestyle:['work','job','smok','alcohol','diet','exercise','home'],
 Social:['smok','alcohol','work','home','living','partner'],
 Concerns:['worr','concern','scared','afraid','fear','expect'],
 Plan:['next steps','follow','appointment','refer','treatment','test','scan','plan'],
 'Next steps':['next steps','biopsy','sample','test','scan'],
 Function:['work','job','daily life','dress','button','grip','open jars'],
 Impact:['work','job','missed work','daily life','impact'],
 Exposure:['asbestos','bird','mould','dust','work','environment'],
 Falls:['fall','stumble','balance','turning'],
 Bleeding:['blood in vomit','black stool','bleed'],
 Confusion:['confus','sleep','forget'],
 Capacity:['capacity','decision','understand','weigh'],
 Understanding:['understand','told','know','result','explain'],
 Reasons:['why leave','mother','home','care'],
 Alternatives:['brother','relative','support','neighbour','care'],
 'Safety net':['worse','return','emergency','warning','help'],
 'Emergency onset':['sudden','thunderclap','worst headache','instantly'],
 'Positional features':['lying','bending','coughing','position'],
 'Red flags':['fever','neck','seizure','weak','faint','neurolog'],
 'Medical history':['previous','history','medical condition','blood pressure']
};
const F={
0:[
 [['blood in phlegm','cough up blood','haemoptysis'],'No, I have not coughed up blood.'],
 [['weight loss','lost weight','weight change'],'I have lost about three kilograms, without trying.'],
 [['smoke','cigarettes','tobacco'],'I stopped smoking ten years ago. Before that I smoked about ten cigarettes a day for thirty years.'],
 [['ct scan','scan result','shadow on scan'],'They mentioned a shadow, but nobody has explained exactly what it means.'],
 [['bring your husband','someone with you','support person'],'My husband is outside. I would like him with me if possible.']
],
1:[
 [['exercise tolerance','walking uphill','up the stairs','breathless on exertion'],'I get short of breath when I walk uphill. It has been gradually getting worse over a year.'],
 [['dry cough','phlegm','sputum'],'It is a dry cough. My main problem is the breathlessness.'],
 [['asbestos','birds','mould'],'I used to work in an office. I do not know of any asbestos, birds or mould exposure.']
],
2:[
 [['out of ten','rate the pain','how severe','pain score'],'It is about six out of ten. Sharp, on the right side of my chest.'],
 [['coughing blood','cough up blood','haemoptysis'],'No, I have not coughed up blood.'],
 [['pain when breathing','deep breath hurts','worse with breathing'],'Yes, the pain is worse when I take a deep breath.'],
 [['recent flight','long haul','long flight','recent travel'],'I returned from a ten-hour flight five days ago.'],
 [['recent operation','recent surgery'],'No, I have not had any recent surgery.'],
 [['calf pain','leg swelling','swollen leg'],'My left calf has been sore and swollen for two days.'],
 [['fainted','passed out','lost consciousness'],'I have not fainted, but my heart feels fast.'],
 [['daughter','childcare','collect my child'],'I need to collect my daughter. Could you help me contact my partner if I have to stay?']
],
3:[
 [['chest pain','angina','chest tightness'],'I have not had chest pain. I just get tired and short of breath on the stairs.'],
 [['climbing stairs','walk upstairs','exercise tolerance'],'I feel breathless on the stairs, but am fine sitting here.'],
 [['how long murmur','murmur diagnosed','heard murmur'],'Doctors have mentioned a murmur for years.']
],
4:[
 [['which hand','right hand shaking','when tremor started'],'The shaking is in my right hand. It began about eighteen months ago.'],
 [['any falls','fallen over','tripping'],'I have not fallen, but I am slower when I turn.'],
 [['sense of smell','lost smell'],'My sense of smell is not as good as it used to be.'],
 [['constipation','bowel habits'],'I have been constipated too.']
],
5:[
 [['why leave','need to go home','why go home'],'My mother has dementia and depends on me for her meals and medicines. There is nobody with her tonight.'],
 [['call your brother','phone brother','ask your brother'],'Yes, could we call him together? He lives nearby.'],
 [['could you stay','willing to stay','consider staying'],'If my mother can be looked after, I could stay.'],
 [['understand the risk','what do you know about infection'],'You said the infection might get worse and the results were not settled, even though I feel better.']
],
6:[
 [['how long swollen','swollen stomach','swollen abdomen'],'My stomach has got bigger over about a month and feels tight.'],
 [['abdominal pain','tummy pain','stomach pain'],'No pain today, just tightness from the swelling.'],
 [['blood in vomit','vomited blood','black stool'],'No, I have not vomited blood or had black stools.'],
 [['last drink','stopped drinking','drinking alcohol'],'I used to drink heavily, but stopped six months ago. I have support.']
],
7:[
 [['morning stiffness','stiff in morning','how long stiff'],'It lasts around ninety minutes in the morning and improves once I get moving.'],
 [['which joints','which fingers','where is pain','knuckles'],'Both wrists and the knuckles of both hands. My fingertips are less affected.'],
 [['opening jars','holding scissors','doing buttons'],'I am a hairdresser and using scissors, opening jars and doing buttons have all become difficult.'],
 [['pregnant now','planning a baby','trying for baby'],'Not right now. We hope to have a baby next year.'],
 [['family arthritis','rheumatoid in family'],'My aunt has rheumatoid arthritis.']
],
8:[
 [['passing urine','urinate often','get up at night','wee more'],'I am going to the toilet much more often, even during the night.'],
 [['lost weight','weight change'],'I think I have lost about three kilograms without trying.'],
 [['foot ulcers','wounds on feet','tingling toes'],'My toes tingle especially at night, but there are no wounds or pain when I walk.'],
 [['blurred vision','blurry sight','vision changes'],'My vision seems blurry towards the end of the day.'],
 [['diabetes in family','father diabetes'],'My dad had type 2 diabetes and serious foot problems. That really worries me.']
],
9:[
 [['thunderclap','sudden headache','worst ever headache'],'No, they come on gradually and build over roughly an hour.'],
 [['how often headaches','headache frequency','how long headache lasts'],'Two or three attacks a month, lasting about twelve hours each.'],
 [['where headache','which side','throbbing headache'],'It throbs behind my left eye and temple. I usually need a dark room.'],
 [['bright lights','sensitive to light','sensitive to noise'],'Yes, both bright lights and noise make them worse.'],
 [['before headache weakness','flashing lights','aura'],'No flashing lights, weakness, numbness or speech changes beforehand.'],
 [['painkillers often','ibuprofen usage'],'I take ibuprofen on one or two days a month, not every day.']
]
};
function score(question,phrase){
 const q=CLEAN(question),p=CLEAN(phrase),t=new Set(q.split(' ').map(STEM));
 if(!p)return 0;
 if(p.includes(' ')){
  if((' '+q+' ').includes(' '+p+' '))return 12;
  const parts=p.split(' ').filter(w=>!STOP.has(w)).map(STEM);
  return parts.length>=2&&parts.every(x=>t.has(x))?8:0;
 }
 const root=STEM(p);
 if(t.has(root))return root.length<4?2:5;
 return root.length>=4&&[...t].some(x=>x.length>=4&&(x.startsWith(root)||root.startsWith(x)&&x.length>=5))?3:0;
}
function authored(c,q){
 let best=null;
 for(const [triggers,answer] of F[c.id]||[]){
  const n=Math.max(0,...triggers.map(x=>score(q,x)));
  if(n&&(!best||n>best.n))best={n,answer};
 }
 return best;
}
function scripted(c,q,history){
 const last=history.filter(m=>m.who==='patient').at(-1)?.text||'';
 let best=null;
 for(const d of c.dialogue||[]){
  const terms=[...(d.keys||[]),...(KEYWORDS[d.topic]||[]),d.topic];
  const strengths=terms.map(x=>score(q,x)).filter(Boolean);
  let n=strengths.length?Math.max(...strengths)+Math.min(2,strengths.length-1):0;
  if((/Onset|Duration|Timing|Course/.test(d.topic))&&/^(when|how long|since when)/.test(CLEAN(q)))n+=3;
  if(d.answer===last)n-=2;
  if(n>0&&(!best||n>best.n))best={n,answer:d.answer,topic:d.topic};
 }
 return best;
}
function backup(c,q,h){
 const patientMessages=h.filter(x=>x.who==='patient');
 const i=patientMessages.length;
 const last=patientMessages.at(-1)?.text||'';
 if(/^(what do you mean|could you explain|tell me more|go on|why is that)/.test(CLEAN(q))&&last)
  return i%2?'It is difficult to explain. I can tell you more about what I have noticed if that would help.':'I can describe how it has felt, though I do not know what is causing it.';
 const fact=c.dialogue.find(d=>/Symptoms|Onset|Duration|Pain|Pattern|Character|Reasons/.test(d.topic))?.answer||c.opening;
 return [
  'That is not something I can answer confidently, doctor. '+fact,
  'I am not quite sure about that particular detail. The main thing I have noticed is: '+fact,
  'Could you put that another way for me? I want to answer properly.',
  'I have not really considered that before. What worries me most is: '+c.concern,
  'I do not want to guess about that. '+fact
 ][(i+c.id)%5];
}
const result=(text,topic)=>({text,topics:topic?[topic]:[]});
export function naturalReply(c,input,history=[]){
 if(!c||!String(input||'').trim())return result('Sorry doctor, could you say that again?');
 const s=CLEAN(input),h=Array.isArray(history)?history:[],name=c.name.split(' ')[0];
 if(/^(hi|hello|hey|good morning|good afternoon|good evening|my name is|im doctor|i am doctor|im dr|i am dr)/.test(s))
  return result('Hello, doctor. I am '+name+'. '+c.opening,'Introduction');
 if(/what is your name|what should i call you|may i call you/.test(s))
  return result('You can call me '+name+', doctor.','Introduction');
 if(/how are you feeling|how are you today|what brings you|why are you here|what seems to be wrong|how can i help|tell me what happened|tell me about your problem/.test(s))
  return result(c.opening,'Presenting complaint');
 if(/can i examine|may i examine|permission to examine|would you mind if i|may i listen to|can i check your|is it okay if i|is it alright if i/.test(s))
  return result('Yes, of course, doctor. Please tell me what you are going to do first.','Consent');
 if(/are you comfortable|need a break/.test(s))return result('I am comfortable enough at the moment, thank you.','Welfare');
 if(/sorry to hear|that sounds difficult|must be hard|i understand why|sorry about|sounds worrying/.test(s))
  return result('Thank you, doctor. I have been quite worried about it.','Empathy');
 if(/^(thank you|thanks|cheers|that is helpful)/.test(s))return result('Of course, doctor.','Acknowledgement');
 if(/what concerns you|what worries you|biggest concern|anything worrying you|any questions for me|what are you afraid|what do you think is happening|what is your main worry/.test(s))
  return result(c.concern,'Concerns');
 if(/^(anything else|is there anything else|any other concerns|have i missed anything)/.test(s))
  return result(h.filter(m=>m.who==='patient').at(-1)?.text===c.concern?'No, that is the main thing worrying me.':c.concern,'Concerns');
 // Exact authored clinical answers take priority over broad category words.
 const direct=authored(c,input),general=scripted(c,input,h);
 if(direct&&(!general||direct.n>=general.n||direct.n>=12))return result(direct.answer,'Clinical history');
 if(general&&general.n>=3)return result(general.answer,general.topic);
 if(direct)return result(direct.answer,'Clinical history');
 if(general&&general.n>=2)return result(general.answer,general.topic);
 return result(backup(c,input,h));
}
