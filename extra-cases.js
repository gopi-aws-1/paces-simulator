const d=(topic,keys,answer)=>({topic,keys,answer});
/* These bonus cases are original teaching scenarios for the extended practice
   circuit, NOT additional encounters in the official MRCP(UK) PACES format. */
export const extraCases=[
 {id:8,kind:'Consultation',name:'Owen Price',age:62,sex:'Man',location:'General medical assessment unit',title:'Increasing thirst and numb feet',
 instruction:'You are the medical registrar assessing Owen, who reports thirst, fatigue and numbness of both feet. Take a focused history, consider immediate risks, discuss appropriate investigation and a safe follow-up plan. This is a ten-minute extended-practice consultation.',
 opening:'Doctor, I am thirsty all the time and my feet have started tingling. I am a bit worried.',
 concern:'My dad had diabetes and lost part of his foot. Is that going to happen to me?',
 diagnosis:'Symptoms suggest hyperglycaemia, potentially previously unrecognised type 2 diabetes. Confirm with testing, assess for acute hyperglycaemic emergency if unwell and examine for neuropathy and vascular risk.',
 dialogue:[
 d('Symptoms',['thirst','drink','water','urinat','toilet','wee'],'For about six weeks I have been drinking a lot and going to the toilet several times each night.'),
 d('Course',['start','how long','when','worse'],'It started around six weeks ago and has been gradually getting worse.'),
 d('Weight and fatigue',['weight','tired','fatigue','appetite'],'I feel tired after work and think I have lost about three kilograms without trying.'),
 d('Acute risk',['vomit','sick','nausea','abdom','confus','drowsy','breath'],'No vomiting, abdominal pain, confusion or unusual deep breathing. I can eat and drink normally.'),
 d('Feet',['numb','tingl','feet','foot','sensation'],'My toes feel tingly, especially at night. There is no wound or pain when walking.'),
 d('Vision',['vision','eyes','blur'],'My vision seems a little blurry at the end of a long day.'),
 d('Medical history',['medic','health','history','condition','blood pressure'],'I take amlodipine for high blood pressure. I have never been told that I have diabetes.'),
 d('Family',['family','father','relative'],'My father had type 2 diabetes and developed foot problems.'),
 d('Lifestyle',['smok','alcohol','diet','exercise','work'],'I drive a delivery van. I do not smoke, drink two pints at weekends, and often eat takeaways while working.'),
 d('Concern',['worr','concern','afraid','amputat','foot care'],'I am frightened of losing my foot like my dad. What can I do to prevent that?'),
 d('Expectations',['test','plan','follow','help','treat'],'I want to know what is going on and how to keep my feet safe.')
 ],signs:[
 ['Check observations and hydration','Pulse 84/min, blood pressure 146/88 mmHg, temperature 36.8°C; alert and well hydrated.'],
 ['Inspect both feet','Skin intact without ulcers, callus is present on the heels. No erythema or swelling.'],
 ['Assess protective sensation','Reduced monofilament sensation at the tips of both great toes.'],
 ['Check peripheral pulses','Dorsalis pedis and posterior tibial pulses palpable bilaterally.'],
 ['Assess ankle reflexes','Ankle reflexes reduced bilaterally.'],
 ['Examine cardiovascular system','Regular pulse; no murmurs or peripheral oedema.']
 ],qa:[
 ['How would you confirm diabetes and assess for an acute emergency?','Arrange appropriate glucose testing and HbA1c in a suitable patient, while checking capillary glucose and ketones promptly if acute symptoms or marked hyperglycaemia suggest a hyperglycaemic emergency.'],
 ['How would you address foot risks?','Explain daily foot checks, footwear advice, routine structured foot assessment, glycaemic and cardiovascular risk management and prompt review of any wound or infection.']
 ],checklist:['Characterise osmotic symptoms','Ask about acute red flags','Assess weight and visual change','Examine feet and protective sensation','Explore family concerns and fears','Arrange glucose assessment and follow-up','Discuss foot safety and shared care'],refs:[0,1,2]},
 {id:9,kind:'Consultation',name:'Aisha Khan',age:36,sex:'Woman',location:'Acute ambulatory clinic',title:'Recurrent disabling headaches',
 instruction:'You are the medical registrar. Aisha has headaches that are affecting work. Take a focused headache history, screen for dangerous secondary causes, examine appropriately and explain a shared plan. This is a ten-minute extended-practice consultation.',
 opening:'I keep getting these terrible headaches, usually with nausea. I am scared it could be something serious.',
 concern:'My neighbour had a brain tumour, so I worry every time a headache starts.',
 diagnosis:'The recurrent unilateral, throbbing, disabling headaches with photophobia and nausea suggest migraine without aura, but secondary headache red flags must be actively assessed.',
 dialogue:[
 d('Character',['pain','where','side','feel','throb','severity'],'The pain throbs behind my left eye and temple. It gets quite severe and I need to lie in a dark room.'),
 d('Timing',['when','duration','how long','frequency','start'],'Each attack lasts about twelve hours. I have had two or three each month for six months.'),
 d('Associated features',['nausea','vomit','light','sound','photo'],'Bright light and noise make it worse and I often feel nauseated. I have vomited once.'),
 d('Aura',['aura','flash','vision','tingl','speech'],'I do not get flashing lights, weakness, numbness or changes in speech beforehand.'),
 d('Emergency onset',['sudden','thunderclap','worst','seconds','instant'],'No. They build gradually over an hour, not suddenly at full intensity.'),
 d('Red flags',['fever','neck','stiff','cancer','weight','seizure','faint','neurolog'],'No fever, neck stiffness, seizures, unexplained weight loss or fainting. I feel normal between attacks.'),
 d('Positional features',['cough','bend','positional','morning','lying'],'Coughing, bending or lying down do not bring the headache on.'),
 d('Medication',['tablets','medicine','painkiller','drug'],'I take ibuprofen on one or two days a month. I do not take daily painkillers.'),
 d('Triggers',['period','sleep','stress','trigger','caffeine'],'They are more common around my period and after nights with little sleep.'),
 d('Pregnancy',['pregnan','contraception','baby'],'I am not pregnant; I use an intrauterine device.'),
 d('Concern',['worr','concern','tumour','cancer'],'I am afraid it is a brain tumour. Can you tell me how you rule that out?'),
 d('Impact',['work','function','home','life'],'I work as an accountant and have missed two days of work because of the headaches.')
 ],signs:[
 ['Check observations','Blood pressure 118/74 mmHg, temperature 36.7°C, pulse 72/min.'],
 ['Assess general and neck examination','Comfortable at rest; neck supple, no meningism.'],
 ['Perform cranial nerve examination','Cranial nerves II–XII intact on screening examination.'],
 ['Assess limb power and coordination','Normal power, reflexes, finger–nose and heel–shin testing.'],
 ['Assess gait and balance','Normal tandem gait and Romberg test.'],
 ['Consider funduscopic examination','No papilloedema seen on this simulated examination.']
 ],qa:[
 ['What is your differential and what findings would prompt urgent action?','Migraine is likely; consider tension-type and secondary causes. Sudden thunderclap onset, new focal deficits, fever/meningism, papilloedema or other major red flags require urgent assessment.'],
 ['How would you communicate a management plan?','Explain likely migraine and limits of remote simulation, explore fears and triggers, advise a headache diary and discuss suitable acute and preventive options tailored to frequency, comorbidity and reproductive plans.']
 ],checklist:['Explore pattern and attack characteristics','Screen for sudden-onset headache and neurological red flags','Ask about medication overuse','Assess impact and triggers','Perform focused neurological examination','Address tumour anxiety empathetically','Agree safety-netting and follow-up'],refs:[0,1,2]}
];
