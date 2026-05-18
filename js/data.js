const DATA = (() => {
  function mulberry32(a) {
    return function() {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function pick(arr, rng) { const rnd = typeof rng === 'function' ? rng : (rng && rng.random) || Math.random; return arr[Math.floor(rnd() * arr.length)]; }
  function rInt(min,max,r){const rnd=typeof r==='function'?r:(r&&r.random)||Math.random;return Math.floor(rnd()*(max-min+1))+min}
  function clamp(v,lo,hi){return Math.max(lo,Math.min(hi,v))}

  const COMPS=['Synergenix','CloudNest','Pivotly','HireHive','WorkNoodle','Optimaxxing Labs','Stakeholderly','PromptPilot','AgileOtter','KPI Garden','TalentPuddle','VibeStack','CircleBack Systems','VentureToast','DeckBard','SaaSquatch','Quantivo','Velocityscape','LinearPivot','Empathetic Capital','Foundr','Blockwise','Nodemancer','Loopholdings','Brandify','Outscaled','Onboardio'];
  const CA=['Quantum','Holistic','Stealth','Hyper','Agentic','Composable','Resilient','Federated'];
  const CN=['Loop','Stack','Mesh','Pivot','Fabric','Forge','Atlas','Compass','Grid','Core'];
  const CS=['.ai','Labs','Group','Holdings','Systems','(Acquired)'];
  function genComp(){if(Math.random()<.4)return pick(COMPS);return pick(CA)+pick(CN)+pick(CS)}

  const JOBS=['Junior Senior Developer','Entry-Level Principal Architect','AI-Enhanced Spreadsheet Strategist','Associate Thought Leadership Intern','Remote Onsite Coordinator','Human-Centered Automation Specialist','Prompt Operations Ninja','B2B SaaS Empathy Manager','Growth Mindset Evangelist','Stakeholder Whisperer','Digital Transformation Goblin','Resume Parsing Sacrifice Analyst','Culture Fit Engineer','VP of Just Vibes','Senior Junior Lead','Distinguished Intern','Director of First Impressions','Chief Vibes Officer','Full-Stack Anything Engineer','Customer Success Hostage Negotiator','Revenue Alignment Officer','Cloud Synergy Architect','Talent Experience Ninja','Data Storyteller','Micro-SaaS Founder-in-Residence','Ecosystem Alignment Manager'];

  const BUZZWORDS=['synergy','alignment','stakeholder','scalable','agile','AI-powered','growth mindset','disruptive','mission-driven','high agency','founder mode','thought leadership','value-add','async','lean-in','strategic narrative','unlock','optimize','ecosystem','human-centered','paradigm','flywheel','GTM','B2B SaaS','authentic vulnerability','personal brand','north star','velocity','empathy at scale','10x','tip-of-the-spear','radical candor','low-ego','ownership','intentionality','operating cadence','best-in-class'];

  const CITIES=['Knoxville','Topeka','Fargo','Sioux Falls','Bismarck','Cheyenne','Pierre','Biloxi','Cedar Rapids','Rock Hill'];

  const HEADLINES=[
    "Today on Linkfluence: someone discovered empathy and turned it into a carousel.",
    "A CEO has announced that sleep is a legacy dependency.",
    "Recruiters are circling back by moving forward.",
    "The Parser has rejected itself for insufficient keyword alignment.",
    "A startup is hiring a founding intern to disrupt compensation.",
    "The market demands AI skills. The robot rejects your AI résumé.",
    "A job post has been reposted so many times it gained sentience.",
    "Someone made a 37-slide post about being concise.",
    "Founders are bringing back the office. The office did not consent.",
    "A recruiter has personally reviewed your application — to find that one thing wrong with it.",
    "Layoff post hits 12k reactions, none from the laid-off person's manager.",
    "Local man's 'humble update' is, in fact, a brag.",
    "Linkfluence rolls out new feature: 'Open to Work, but Skeptical.'",
    "AI-generated cover letter detected by AI-generated screening tool. Both are crying.",
    "Hiring freeze enters its 14th month, now sentient.",
    "Coffee chat with VP yields one piece of advice: 'lean in.'",
    "Take-home assignment leaks as company's actual product.",
    "New trend: 'authentic vulnerability' posts now require a CFO sign-off.",
    "Salary transparency law passes. Posting says '$30,000 — $750,000.'",
    "Unicorn founder admits hiring is 'mostly vibes.'",
    "Recruiter named 'Brenda' has now contacted every developer on Earth.",
    "Workday has launched a meditation app. It requires a password reset.",
    "Glassbore review: '4 stars, would be PIPped again.'",
    "Industry expert announces pivot from 'pivot' to 'inflect.'",
    "You opened Linkfluence. Why.",
    "New study finds 73% of job descriptions are written by chatbots.",
    "Linkfluence CEO says company culture is 'like family, but better funded.'",
    "A recruiter sent 10,000 messages today. You were one of them.",
    "The average job seeker applies to 200+ jobs. The average company receives 250,000 résumés.",
    "Remote work debate concludes: 'We're remote, but also, please come in.'"
  ];

  /* Card constructor */
  function mk(o){
    return Object.assign({id:'',title:'',category:'job',flavor:'',cost:{energy:1},redFlags:0,ghostChance:.25,scamChance:0,weight:1,effects:[],conditions:[],buttons:[{label:'Ignore',cost:{energy:0},effect:'discard'}],pay:null,isRealChance:.3,source:'job-board',isUnicorn:false,isBoss:false,permaPlayed:false},o);
  }

  /* ========== CARD POOLS ========== */
  const POOLS={
    job:[
      mk({id:'entry-principal',title:'Entry-Level Principal Architect',category:'job',flavor:'Requires 8 years experience in a framework released 3 years ago, fluency in 4 cloud providers, and "a passion for ambiguity."',cost:{energy:1},redFlags:3,ghostChance:.4,weight:1.2,effects:[{type:'lead',real:.35,ats:40,gm:.1,sm:.05}],buttons:[{label:'Easy Apply Into Abyss',cost:{energy:1},effect:'apply'},{label:'Ignore',cost:{energy:0},effect:'discard'}],pay:'$85k–$130k (maybe)'}),
      mk({id:'reposted',title:'This Role Reposted 93 Times',category:'job',flavor:'This role has been open since the invention of Kubernetes. Possibly load-bearing.',cost:{energy:1},redFlags:4,ghostChance:.85,weight:.8,effects:[{type:'lead',real:.1,ats:20,gm:.3,sm:.05}],buttons:[{label:'Apply (Desperate)',cost:{energy:1},effect:'applyDesperate'},{label:'Ignore',cost:{energy:0},effect:'discard'}],isGhostReveal:true,pay:'$??? (the void decides)'}),
      mk({id:'confidential',title:'Confidential Company, Confidential Salary, Confidential Duties',category:'job',flavor:'Even the job description signed an NDA.',cost:{energy:1},redFlags:5,ghostChance:.6,scamChance:.3,weight:.7,effects:[{type:'lead',real:.15,ats:30,gm:.1,sm:.2}],buttons:[{label:'Apply Into NDA Void',cost:{energy:1},effect:'apply'},{label:'Report Scam',cost:{energy:0},effect:'reportScam'},{label:'Ignore',cost:{energy:0},effect:'discard'}],pay:'Confidential'}),
      mk({id:'remote-first',title:'Remote-First, Office-Mandatory',category:'job',flavor:'Fully remote culture. Must be onsite five days a week. Commute is unpaid mindfulness.',cost:{energy:1},redFlags:2,ghostChance:.3,weight:1.3,effects:[{type:'lead',real:.45,ats:35,gm:-.05,sm:.05}],buttons:[{label:'Easy Apply',cost:{energy:1},effect:'apply'},{label:'Negotiate Remote',cost:{energy:1},effect:'negotiateRemote'},{label:'Ignore',cost:{energy:0},effect:'discard'}],pay:'$90k–$120k + "mindful" commute'}),
      mk({id:'easy-abyss',title:'One-Click Easy Apply Abyss',category:'job',flavor:'One click. Zero witnesses. The void receives your résumé like a pearl into the sea.',cost:{energy:0},redFlags:1,ghostChance:.95,weight:2,effects:[{type:'lead',real:.01,ats:5,gm:.4,sm:.1}],buttons:[{label:'Click Into Void',cost:{energy:0},effect:'applyEasy'},{label:'Back Away',cost:{energy:0},effect:'discard'}],pay:'Your dignity'}),
      mk({id:'portal-labyrinth',title:'Company Portal Labyrinth',category:'job',flavor:'Create account, verify email, upload résumé, retype résumé, answer 47 dropdowns including \'how did you hear about us\' and three different versions of your address, wait.',cost:{energy:2},redFlags:2,ghostChance:.3,weight:.9,effects:[{type:'lead',real:.55,ats:25,gm:-.1,sm:.05,hope:-.1}],buttons:[{label:'Enter the Labyrinth',cost:{energy:2},effect:'applyPortal'},{label:'Back Away',cost:{energy:0},effect:'discard'}],pay:'$80k–$110k (after the ordeal)'}),
      mk({id:'stealth-startup',title:'Stealth Startup Seeking Founding Intern',category:'job',flavor:'Compensation: equity, exposure, and a hoodie.',cost:{energy:1},redFlags:3,ghostChance:.7,weight:.6,effects:[{type:'lead',real:.15,ats:10,gm:.2,sm:.15,founder:1}],buttons:[{label:'Join the Startup',cost:{energy:1},effect:'apply'},{label:'Ignore',cost:{energy:0},effect:'discard'}],pay:'Vibes + equity (worth $0–$2M)'}),
      mk({id:'evergreen',title:'Evergreen Talent Pipeline',category:'job',flavor:'There is no job. Only pipeline.',cost:{energy:1},redFlags:5,ghostChance:1,weight:.5,effects:[{type:'lead',real:0,ats:50,gm:.5,sm:0}],buttons:[{label:'Enter the Pipeline',cost:{energy:1},effect:'applyPipeline'},{label:'Expose Ghost Job',cost:{energy:0},effect:'exposeGhost'},{label:'Ignore',cost:{energy:0},effect:'discard'}],pay:'"Exposure"'}),
      mk({id:'actually-normal',title:'Actually Normal Job, Posted by a Person',category:'job',flavor:'Salary range listed. PTO described. The hiring manager has a face. This is illegal.',cost:{energy:1},redFlags:0,ghostChance:.1,weight:.3,effects:[{type:'lead',real:.85,ats:30,gm:-.2,sm:0,offer:.2}],buttons:[{label:'Apply (Carefully)',cost:{energy:1},effect:'applyCareful'},{label:'Ignore',cost:{energy:0},effect:'discard'}],pay:'$95k–$125k + real PTO'}),
      mk({id:'ai-vibe',title:'AI-Required Senior Vibe Coder',category:'job',flavor:'Must have 6 years experience with a tool released last quarter. Bonus: you\'ve vibe-coded.',cost:{energy:1},redFlags:2,ghostChance:.4,weight:1,effects:[{type:'lead',real:.4,ats:50,gm:.1,sm:.05}],buttons:[{label:'Easy Apply',cost:{energy:1},effect:'apply'},{label:'Add "AI" to Résumé',cost:{energy:1},effect:'addAI'},{label:'Ignore',cost:{energy:0},effect:'discard'}],pay:'Competitive (in crypto)'}),
      mk({id:'unpaid-th',title:'Unpaid Take-Home That Builds Their Product',category:'job',flavor:'Brief: design our entire onboarding flow. Should take you "a couple hours."',cost:{energy:2},redFlags:3,ghostChance:.5,weight:.7,effects:[{type:'lead',real:.3,ats:40,gm:.1,sm:.1,hope:-.2,th:1}],buttons:[{label:'Build Their Product',cost:{energy:2},effect:'applyTH'},{label:'Decline Unpaid',cost:{energy:0},effect:'discard'},{label:'Ignore',cost:{energy:0},effect:'discard'}],pay:'Exposure + maybe an offer'}),
      mk({id:'disrupting',title:'Disrupting the [Industry] Space',category:'job',flavor:'We\'re like Uber for filing cabinets. No wait — we\'re like Slack for drywall.',cost:{energy:1},redFlags:2,ghostChance:.5,weight:1,effects:[{type:'lead',real:.35,ats:35,gm:.05,sm:.05}],buttons:[{label:'Apply',cost:{energy:1},effect:'apply'},{label:'Ignore',cost:{energy:0},effect:'discard'}],pay:'$75k–$100k + "disruption equity"'}),
      mk({id:'already-filled',title:'The Role Was Already Filled',category:'job',flavor:'We post quarterly to maintain top-of-funnel awareness with talent. You\'re aware now. Thanks.',cost:{energy:1},redFlags:5,ghostChance:1,weight:.5,effects:[{type:'lead',real:0,ats:100,gm:.5,sm:0}],buttons:[{label:'Apply Anyway',cost:{energy:1},effect:'applyDesperate'},{label:'Expose Ghost Job',cost:{energy:0},effect:'exposeGhost'},{label:'Ignore',cost:{energy:0},effect:'discard'}],pay:'Your time (already spent)'}),
      mk({id:'family-culture',title:'"We\'re Like a Family Here"',category:'job',flavor:'We work hard, play hard, and stay late hard. Unpaid.',cost:{energy:1},redFlags:4,ghostChance:.5,weight:.8,effects:[{type:'lead',real:.3,ats:30,gm:.15,sm:.1,hope:-.15}],buttons:[{label:'Join the Family',cost:{energy:1},effect:'apply'},{label:'Ask About PTO',cost:{energy:1},effect:'askPTO'},{label:'Ignore',cost:{energy:0},effect:'discard'}],pay:'Family love (non-transferable)'}),
      mk({id:'pip-speedrun',title:'PIP Speedrun, Inc.',category:'job',flavor:'Six-month average tenure. Don\'t ask why. High pay though.',cost:{energy:1},redFlags:3,ghostChance:.3,weight:.7,effects:[{type:'lead',real:.5,ats:30,gm:-.05,sm:.05,hope:-.25}],buttons:[{label:'Take the Money',cost:{energy:1},effect:'apply'},{label:'Ignore',cost:{energy:0},effect:'discard'}],pay:'$150k (you won\'t last)'}),
      mk({id:'foreign-rec',title:'Foreign Recruiter for a US Role',category:'job',flavor:'"Hello dear, are you available for opportunity?" No salary. No company. Just vibes.',cost:{energy:1},redFlags:4,ghostChance:.6,scamChance:.2,weight:.6,effects:[{type:'lead',real:.15,ats:20,gm:.15,sm:.25}],buttons:[{label:'Respond Politely',cost:{energy:1},effect:'apply'},{label:'Report Scam',cost:{energy:0},effect:'reportScam'},{label:'Ignore',cost:{energy:0},effect:'discard'}],pay:'"Competitive (in your currency)"'}),
      mk({id:'pays-tokens',title:'The Job That Pays in Tokens',category:'job',flavor:'Base: 500 $HIVE tokens. Vesting: 4 years. Valuation: "soon."',cost:{energy:1},redFlags:4,ghostChance:.7,weight:.4,effects:[{type:'lead',real:.1,ats:15,gm:.2,sm:.2,founder:1}],buttons:[{label:'Accept Tokens',cost:{energy:1},effect:'applyTokens'},{label:'Ask for USD',cost:{energy:1},effect:'askUSD'},{label:'Ignore',cost:{energy:0},effect:'discard'}],pay:'500 $HIVE (worth... vibes?)'}),
      mk({id:'hvac-company',title:'A Real, Boring, Mid-Sized B2B Company',category:'job',flavor:'They make accounting software for HVAC contractors. The benefits are genuinely good. The dream.',cost:{energy:1},redFlags:0,ghostChance:.1,weight:.3,effects:[{type:'lead',real:.9,ats:20,gm:-.3,sm:0,offer:.15}],buttons:[{label:'Apply (This is the one)',cost:{energy:1},effect:'applyCareful'},{label:'Ignore',cost:{energy:0},effect:'discard'}],pay:'$70k–$95k + dental + 401k'}),
      mk({id:'unicorn',title:'THE UNICORN JOB',category:'job',flavor:'Perfect role. Perfect salary. Requires: Network ≥ 30, Bot Aura ≥ 60, Credibility ≥ 60.',cost:{energy:1},redFlags:0,ghostChance:.05,weight:.05,conditions:[{stat:'atsFavor',min:60},{stat:'credibility',min:60},{stat:'humanContact',min:30}],effects:[{type:'lead',real:.95,ats:10,gm:-.4,sm:0,offer:.3}],buttons:[{label:'Apply (You Earned This)',cost:{energy:1},effect:'applyCareful'},{label:'Ignore',cost:{energy:0},effect:'discard'}],pay:'$140k–$180k + equity + PTO + standing desk'}),
      mk({id:'boss-fight',title:'Workday Password Reset',category:'job',flavor:'"Your new password must contain a capital letter, a number, a symbol, and the tears of a junior developer."',cost:{energy:1},isBoss:true,weight:.3,effects:[{type:'bossFight'}],buttons:[{label:'Face the Boss',cost:{energy:1},effect:'bossFight'},{label:'Back Away',cost:{energy:0},effect:'discard'}],pay:'Your sanity'}),
      mk({id:'easy-apply-10',title:'Easy Apply to 10 Jobs',category:'job',flavor:'One button. Zero thought. Your résumé is now in 10 Bot Aura systems weeping simultaneously.',cost:{energy:1},redFlags:0,ghostChance:.8,weight:1.5,effects:[{type:'bulkApply',count:10}],buttons:[{label:'Mass Apply',cost:{energy:1},effect:'bulkApply'},{label:'Stop Before Ruin',cost:{energy:0},effect:'discard'}],pay:'Your dignity × 10'}),
     mk({id:'glassdoor-portal',title:'Company Website Portal',category:'job',flavor:'The application form has 47 mandatory fields. Three require essay responses. All are "optional."',cost:{energy:2},redFlags:2,ghostChance:.35,weight:.7,effects:[{type:'lead',real:.5,ats:20,gm:-.05,sm:.05,hope:-.1}],buttons:[{label:'Face the Labyrinth',cost:{energy:2},effect:'applyPortal'},{label:'Back Away',cost:{energy:0},effect:'discard'}],pay:'$75k–$105k'}),
      mk({id:'overqualified',title:'"Overqualified" Auto-Rejection',category:'job',flavor:'"We\'re looking for someone who won\'t leave in 6 months." Translation: someone you can underpay forever.',cost:{energy:1},redFlags:2,ghostChance:.4,weight:.7,effects:[{type:'lead',real:.25,ats:20,gm:.1,sm:.05}],buttons:[{label:'Apply Anyway',cost:{energy:1},effect:'apply'},{label:'Negotiate Down',cost:{energy:1},effect:'negotiateRemote'},{label:'Ignore',cost:{energy:0},effect:'discard'}],pay:'$55k (you\'re worth $95k)'}),
      mk({id:'contract-to-hire',title:'"Contract-to-Hire" Opportunity',category:'job',flavor:'"We see this becoming permanent." It is permanent. Permanent contracting.',cost:{energy:1},redFlags:3,ghostChance:.5,weight:.8,effects:[{type:'lead',real:.3,ats:25,gm:.1,sm:.05}],buttons:[{label:'Accept Contract',cost:{energy:1},effect:'apply'},{label:'Ask Timeline',cost:{energy:1},effect:'askSalary'},{label:'Ignore',cost:{energy:0},effect:'discard'}],pay:'$45/hr (for 3 months, then nothing)'}),
     ],
    recruiter:[
      mk({id:'amazing-opp',title:'Amazing Opportunity!!!',category:'recruiter',flavor:'No salary. No company. No JD. Just vibes and three exclamation points.',cost:{energy:1},redFlags:2,ghostChance:.5,weight:1.2,effects:[{type:'recruit',roll:'real_waste_scam'}],buttons:[{label:'Reply',cost:{energy:1},effect:'recruitReply'},{label:'Block',cost:{energy:0},effect:'recruitBlock'},{label:'Ignore',cost:{energy:0},effect:'discard'}]}),
      mk({id:'perfect-role',title:'"You\'d be perfect for this role"',category:'recruiter',flavor:'(sent to 4,000 people today)',cost:{energy:1},redFlags:2,ghostChance:.6,weight:1,effects:[{type:'recruit',roll:'copyPaste'}],buttons:[{label:'Reply',cost:{energy:1},effect:'recruitReply'},{label:'Reverse Image Search',cost:{energy:1},effect:'reverseImg'},{label:'Ignore',cost:{energy:0},effect:'discard'}]}),
      mk({id:'quick-15min',title:'"Quick 15-min call?"',category:'recruiter',flavor:'15 minutes. (Tomorrow. In 20 minutes. With the CEO, the board, and your future children.)',cost:{energy:1},redFlags:1,ghostChance:.3,weight:1.3,effects:[{type:'recruit',roll:'call'}],buttons:[{label:'Schedule Call',cost:{energy:1},effect:'recruitCall'},{label:'Decline',cost:{energy:0},effect:'discard'}]}),
      mk({id:'send-ssn',title:'"Kindly send your SSN to onboard"',category:'recruiter',flavor:'This is not a drill. This is a scam. Click it anyway.',cost:{energy:0},redFlags:5,scamChance:1,weight:.5,effects:[{type:'scamDM'}],buttons:[{label:'Report Scam',cost:{energy:0},effect:'reportScam'},{label:'Send SSN (DON\'T)',cost:{energy:0},effect:'sendSSN'},{label:'Ignore',cost:{energy:0},effect:'discard'}]}),
      mk({id:'crypto-payroll',title:'"Crypto Payroll Startup Wants You"',category:'recruiter',flavor:'"Compensation is competitive if you believe."',cost:{energy:1},redFlags:3,ghostChance:.4,scamChance:.2,weight:.6,effects:[{type:'lead',real:.2,ats:20,gm:.1,sm:.2,founder:1}],buttons:[{label:'Apply',cost:{energy:1},effect:'apply'},{label:'Ask for USD',cost:{energy:1},effect:'askUSD'},{label:'Ignore',cost:{energy:0},effect:'discard'}]}),
      mk({id:'check-deposit',title:'"Check Deposit for Equipment Purchase"',category:'recruiter',flavor:'We\'ll send you a check. You buy equipment. You keep the difference. (It\'s a scam.)',cost:{energy:0},redFlags:5,scamChance:1,weight:.4,effects:[{type:'scamDM',checkAmt:500}],buttons:[{label:'Report Scam',cost:{energy:0},effect:'reportScam'},{label:'Accept Check',cost:{energy:0},effect:'acceptCheck'},{label:'Ignore',cost:{energy:0},effect:'discard'}]}),
      mk({id:'stock-photo',title:'"Recruiter With Stock Photo"',category:'recruiter',flavor:'Their profile pic is a Shutterstock model named "Professional Woman Holding Tablet."',cost:{energy:1},redFlags:4,ghostChance:.6,scamChance:.15,weight:.5,effects:[{type:'recruit',roll:'stockPhoto'}],buttons:[{label:'Reverse Image Search',cost:{energy:1},effect:'reverseImg'},{label:'Reply',cost:{energy:1},effect:'recruitReply'},{label:'Ignore',cost:{energy:0},effect:'discard'}]}),
      mk({id:'salary-cryptid',title:'"Salary Range: Listed!!!"',category:'recruiter',flavor:'A cryptid! A myth! A recruiter who actually states the salary range!',cost:{energy:1},redFlags:0,ghostChance:.05,weight:.1,effects:[{type:'recruit',roll:'salaryCryptid'}],buttons:[{label:'Apply (It\'s Real)',cost:{energy:1},effect:'applyCareful'},{label:'Ignore',cost:{energy:0},effect:'discard'}]}),
      mk({id:'high-caliber',title:'"Reaching out to high-caliber talent like yourself"',category:'recruiter',flavor:'"Your profile stood out among the 12,000 I messaged today."',cost:{energy:1},redFlags:1,ghostChance:.5,weight:1.1,effects:[{type:'recruit',roll:'flattery'}],buttons:[{label:'Reply',cost:{energy:1},effect:'recruitReply'},{label:'Ask for Salary',cost:{energy:1},effect:'askSalary'},{label:'Ignore',cost:{energy:0},effect:'discard'}]}),
mk({id:'relocate',title:'"Open to relocating to [City]?"',category:'recruiter',flavor:'"We\'re looking for someone open to relocating to... a city. You\'ll love it."',cost:{energy:1},redFlags:2,ghostChance:.4,weight:.8,effects:[{type:'lead',real:.35,ats:30,gm:.05,sm:.05,relocate:1}],buttons:[{label:'Apply',cost:{energy:1},effect:'apply'},{label:'Which City?',cost:{energy:1},effect:'askCity'},{label:'Ignore',cost:{energy:0},effect:'discard'}]}),
      mk({id:'voice-note-recruiter',title:'Recruiter Sent a Voice Note',category:'recruiter',flavor:'47 seconds of ambient coffee shop noise, then: "...so just wanted to touch base on the opportunity!"',cost:{energy:1},redFlags:1,ghostChance:.4,weight:.6,effects:[{type:'recruit',roll:'call'}],buttons:[{label:'Listen',cost:{energy:1},effect:'recruitCall'},{label:'Pretend You Did',cost:{energy:0},effect:'discard'}]}),
     ],
    post:[
      mk({id:'thrilled',title:'"Thrilled to Announce..."',category:'post',flavor:'"I\'m thrilled to announce that I\'m actively, desperately, looking for a job!"',cost:{energy:1},redFlags:0,weight:1.2,effects:[{type:'post',clout:8,cred:-2}],buttons:[{label:'Post This',cost:{energy:1},effect:'postThis'},{label:'Delete',cost:{energy:0},effect:'discard'}]}),
      mk({id:'humbled',title:'"Humbled to Be Rejected — Here\'s What I Learned"',category:'post',flavor:'"The rejection taught me that rejection exists. Thank you, Bot Aura #47."',cost:{energy:1},redFlags:0,weight:1,effects:[{type:'post',clout:12,cred:5,viral:.15}],buttons:[{label:'Post (Sincere) ✨',cost:{energy:1},effect:'postSincere'},{label:'Post (Cringe) 📉',cost:{energy:1},effect:'postCringe'},{label:'Delete',cost:{energy:0},effect:'discard'}]}),
      mk({id:'interviewed-toddler',title:'"I Interviewed My Toddler. Here\'s What It Taught Me About B2B SaaS."',category:'post',flavor:'"My 2-year-old said no 47 times. This is how your funnel feels."',cost:{energy:1},redFlags:0,weight:.6,effects:[{type:'post',clout:25,cred:3,viral:.4}],buttons:[{label:'Post (Viral Lottery)',cost:{energy:1},effect:'postViral'},{label:'Too Cringe',cost:{energy:0},effect:'discard'}]}),
      mk({id:'comment-resume',title:'"Comment RESUME for My Free Template"',category:'post',flavor:'The oldest trick in the book. Engagement bait at its finest.',cost:{energy:1},redFlags:1,weight:1.3,effects:[{type:'post',clout:10,cred:-5,buzz:.3}],buttons:[{label:'Post Engagement Bait',cost:{energy:1},effect:'postBait'},{label:'Too Cringe',cost:{energy:0},effect:'discard'}]}),
      mk({id:'agree-post',title:'"Agree?"',category:'post',flavor:'A single-word post under a photo of a laptop at sunset.',cost:{energy:0},redFlags:1,weight:1.5,effects:[{type:'post',clout:5,cred:-8,viral:.1,agree:true}],buttons:[{label:'Post "Agree?"',cost:{energy:1},effect:'postAgree'},{label:'Delete',cost:{energy:0},effect:'discard'}]}),
      mk({id:'hot-take',title:'"Hot Take: Networking Is Just Friendship With KPIs"',category:'post',flavor:'Actually pretty good advice disguised as a hot take.',cost:{energy:1},redFlags:0,weight:1,effects:[{type:'post',clout:8,cred:6,network:3}],buttons:[{label:'Post (Actually Good)',cost:{energy:1},effect:'postGood'},{label:'Too Vulnerable',cost:{energy:0},effect:'discard'}]}),
      mk({id:'layoff-brag',title:'"I Posted My Layoff and Got 14k Reactions"',category:'post',flavor:'"2 weeks at Google. 2 weeks at Stripe. 14,347 reactions."',cost:{energy:1},redFlags:1,weight:.8,effects:[{type:'post',clout:20,cred:-3,viral:.2,hope:-5}],buttons:[{label:'Post',cost:{energy:1},effect:'postViral'},{label:'Too Performative',cost:{energy:0},effect:'discard'}]}),
      mk({id:'day47',title:'"Day 47 of Posting Until I Get Hired"',category:'post',flavor:'"Day 47. Still no offers. Still posting. The grind doesn\'t stop."',cost:{energy:1},redFlags:0,weight:1,effects:[{type:'post',clout:3,cred:2,hope:3}],buttons:[{label:'Post',cost:{energy:1},effect:'postSlowBurn'},{label:'Stop Posting',cost:{energy:0},effect:'discard'}]}),
      mk({id:'carousel',title:'"7 Things I Stopped Doing to Be More Productive"',category:'post',flavor:'"7. Breathing. It was taking too much time."',cost:{energy:1},redFlags:1,weight:.9,effects:[{type:'post',clout:15,cred:-4,viral:.2,buzz:.4}],buttons:[{label:'Post (Carousel)',cost:{energy:1},effect:'postCarousel'},{label:'Too Cringe',cost:{energy:0},effect:'discard'}]}),
mk({id:'useful-advice',title:'"Actually Useful Advice Thread"',category:'post',flavor:'"Here are 3 things I learned in 5 years of job hunting. None involve AI."',cost:{energy:1},redFlags:0,weight:1.1,effects:[{type:'post',clout:3,cred:8,network:2}],buttons:[{label:'Post (Boring but Good)',cost:{energy:1},effect:'postGood'},{label:'Delete',cost:{energy:0},effect:'discard'}]}),
      mk({id:'reframe-rejection',title:'"Reframing Rejection as Redirection"',category:'post',flavor:'"I was rejected 400 times. Here\'s what that taught me: companies are doing you a favor by ignoring you."',cost:{energy:1},redFlags:0,weight:.8,effects:[{type:'post',clout:10,cred:4,hope:3,viral:.2}],buttons:[{label:'Post (Sincere)',cost:{energy:1},effect:'postSincere'},{label:'Too On the Nose',cost:{energy:0},effect:'discard'}]}),
     ],
    network:[
      mk({id:'coffee-chat',title:'Coffee Chat With a Human',category:'network',flavor:'A real person. A real conversation. No buzzwords.',cost:{energy:1},redFlags:0,weight:1.2,effects:[{type:'net',hope:8,network:3,referral:.1}],buttons:[{label:'Go (Networking)',cost:{energy:1},effect:'networkGo'},{label:'Stay Home',cost:{energy:0},effect:'discard'}]}),
      mk({id:'alumni-dm',title:'Alumni DM',category:'network',flavor:'"Hey fellow [University] grad! What are you up to?"',cost:{energy:1},redFlags:0,weight:1,effects:[{type:'net',humanContact:3,referral:.15}],buttons:[{label:'Send DM',cost:{energy:1},effect:'sendDM'},{label:'Too Scary',cost:{energy:0},effect:'discard'}]}),
      mk({id:'endorse-k8s',title:'Endorse Stranger for Kubernetes',category:'network',flavor:'They may endorse you back. Or not.',cost:{energy:0},redFlags:0,weight:1.5,effects:[{type:'net',clout:1,ats:.5}],buttons:[{label:'Endorse',cost:{energy:1},effect:'endorse'},{label:'Skip',cost:{energy:0},effect:'discard'}]}),
      mk({id:'work-anniv',title:'Congratulate Someone on Their Work Anniversary',category:'network',flavor:'"10 years at the same company? In this economy? Respect."',cost:{energy:0},redFlags:0,weight:1,effects:[{type:'net',clout:.5}],buttons:[{label:'Congratulate',cost:{energy:1},effect:'congrats'},{label:'Skip',cost:{energy:0},effect:'discard'}]}),
      mk({id:'slide-dms',title:'Slide Into Hiring Manager\'s DMs (Politely)',category:'network',flavor:'"Hey, I saw your opening. I\'m not spamming, I\'m just passionate." (This is spam.)',cost:{energy:1},redFlags:1,weight:.8,effects:[{type:'net',hope:3,cred:3,credFail:-5,referral:.2}],buttons:[{label:'Slide In',cost:{energy:1},effect:'slideIn'},{label:'Too Bold',cost:{energy:0},effect:'discard'}]}),
      mk({id:'friend-ref',title:'Friend of a Friend Referral',category:'network',flavor:'"My friend\'s cousin works there and says they\'re hiring."',cost:{energy:1},redFlags:0,weight:.8,effects:[{type:'referral'}],buttons:[{label:'Use Referral',cost:{energy:1},effect:'useReferral'},{label:'Save for Later',cost:{energy:0},effect:'discard'},{label:'Ignore',cost:{energy:0},effect:'discard'}]}),
      mk({id:'slack',title:'Industry Slack / Discord',category:'network',flavor:'Slow network gain. Like compound interest, but for LinkedIn.',cost:{energy:1},redFlags:0,weight:.7,effects:[{type:'net',network:2,hope:1}],buttons:[{label:'Hang Out',cost:{energy:1},effect:'slackHang'},{label:'Scroll Only',cost:{energy:0},effect:'discard'}]}),
mk({id:'mentor',title:'Mentor Coffee',category:'network',flavor:'"I\'ve been where you are. Let me tell you about my journey."',cost:{energy:1},redFlags:0,weight:.6,effects:[{type:'net',cred:5,hope:5}],buttons:[{label:'Meet',cost:{energy:1},effect:'mentorMeet'},{label:'Too Much Effort',cost:{energy:0},effect:'discard'}]}),
      mk({id:'counter-lowball',title:'Counter a Lowball Offer',category:'network',flavor:'"We can offer $52,000." You said "$78,000." They said "we\'ll get back to you." They did not.',cost:{energy:1},redFlags:0,weight:.5,effects:[{type:'credMod',mod:8},{type:'hopeMod',mod:-3}],buttons:[{label:'Counter Offer',cost:{energy:1},effect:'askSalary'},{label:'Accept the $52k',cost:{energy:0},effect:'discard'}]}),
     ],
    resume:[
      mk({id:'keyword-stuff',title:'Keyword Stuff Résumé',category:'resume',flavor:'Added "synergy," "AI-powered," "disruptive," and "thought leadership." Looks deeply robotic. Humans flee.',cost:{energy:1},redFlags:2,weight:1.2,effects:[{type:'atsFavor',mod:8},{type:'robotSuspicion',mod:-5},{type:'credMod',mod:-2,ifBelow:5}],buttons:[{label:'Keyword Stuff',cost:{energy:1},effect:'keywordStuff'},{label:'Be Honest',cost:{energy:0},effect:'discard'}]}),
      mk({id:'rewrite-bullets',title:'Rewrite Bullets as Impact Metrics',category:'resume',flavor:'"Increased synergy by 40% YoY by leveraging stakeholders."',cost:{energy:1},redFlags:0,weight:1,effects:[{type:'atsFavor',mod:5},{type:'credMod',mod:5}],buttons:[{label:'Rewrite',cost:{energy:1},effect:'rewriteBullets'},{label:'Too Boring',cost:{energy:0},effect:'discard'}]}),
      mk({id:'add-ai',title:'Add "AI" to Everything',category:'resume',flavor:'"Java Developer" → "AI-Powered Java Developer." "Filing Clerk" → "AI-Enhanced Document Strategist."',cost:{energy:1},redFlags:1,weight:1.5,effects:[{type:'buzzwordAdd'},{type:'atsFavor',mod:3},{type:'robotSuspicion',mod:-8}],buttons:[{label:'AI-ify',cost:{energy:1},effect:'addAI'},{label:'Keep It Real',cost:{energy:0},effect:'discard'}]}),
      mk({id:'certificate',title:'Take Free Certificate',category:'resume',flavor:'"AI for Business Leaders: A Beginner\'s Guide to Nothing." Certificate awarded instantly.',cost:{energy:1},redFlags:0,weight:1,effects:[{type:'atsFavor',mod:4},{type:'cloutMod',mod:3}],buttons:[{label:'Complete Certificate',cost:{energy:1},effect:'certComplete'},{label:'Not Worth It',cost:{energy:0},effect:'discard'}]}),
      mk({id:'portfolio',title:'Build Portfolio Project',category:'resume',flavor:'A real project. Real code. Real credibility.',cost:{energy:2},redFlags:0,weight:.8,effects:[{type:'credMod',mod:8},{type:'atsFavor',mod:5},{type:'offerChance',mod:.05}],buttons:[{label:'Build It',cost:{energy:2},effect:'buildPortfolio'},{label:'Too Time-Consuming',cost:{energy:0},effect:'discard'}]}),
      mk({id:'plain-text',title:'Plain-Text Résumé Cleanup',category:'resume',flavor:'Removed all fancy formatting that the Bot Aura hates. Looks like a crime report.',cost:{energy:1},redFlags:0,weight:.8,effects:[{type:'robotSuspicion',mod:5},{type:'atsFavor',mod:3}],buttons:[{label:'Clean Up',cost:{energy:1},effect:'plainText'},{label:'Keep Fancy Format',cost:{energy:0},effect:'discard'}]}),
      mk({id:'cover-letter',title:'Customize Cover Letter',category:'resume',flavor:'A genuine, personalized cover letter. Not written by an AI. How quaint.',cost:{energy:1},redFlags:0,weight:.7,effects:[{type:'offerChance',mod:.1}],buttons:[{label:'Write Cover Letter',cost:{energy:1},effect:'writeCover'},{label:'AI-Generated',cost:{energy:0},effect:'aiCover'},{label:'Skip',cost:{energy:0},effect:'discard'}]}),
      mk({id:'lie-years',title:'Lie About Years of Experience',category:'resume',flavor:'You have 2 years. You put 8. The Bot Aura is pleased. The background check will not be.',cost:{energy:0},redFlags:4,weight:.6,effects:[{type:'atsFavor',mod:10},{type:'robotSuspicion',mod:-8}],buttons:[{label:'Lie (8 Years)',cost:{energy:1},effect:'lieYears'},{label:'Tell Truth (2 Years)',cost:{energy:0},effect:'discard'},{label:'Ignore',cost:{energy:0},effect:'discard'}]}),
    ],
    gig:[
      mk({id:'fiverr-gig',title:'Fiverr Gig: "I Will Write Your LinkedIn About"',category:'gig',flavor:'$5 for 50 words of corporate nonsense. The algorithm loves you.',cost:{energy:1},weight:.9,effects:[{type:'rentMod',mod:15}],buttons:[{label:'Do the Gig',cost:{energy:1},effect:'fiverrGig'},{label:'My Dignity > $5',cost:{energy:0},effect:'discard'}]}),
      mk({id:'uber-gig',title:'Drive for RideShare',category:'gig',flavor:'The void of the road. A stranger texts "where are you" for the 3rd time.',cost:{energy:1},weight:1.0,effects:[{type:'hopeMod',mod:-3},{type:'rentMod',mod:20}],buttons:[{label:'Accept the Trip',cost:{energy:1},effect:'uberGig'},{label:'Keep Scrolling',cost:{energy:0},effect:'discard'}]}),
      mk({id:'user-test',title:'$10 User Testing',category:'gig',flavor:'"Please think out loud while we watch you fail at clicking the right button."',cost:{energy:1},weight:.8,effects:[{type:'hopeMod',mod:2},{type:'rentMod',mod:10}],buttons:[{label:'Think Out Loud',cost:{energy:1},effect:'userTest'},{label:'Not Worth It',cost:{energy:0},effect:'discard'}]}),
      mk({id:'data-entry',title:'Data Entry Marathon',category:'gig',flavor:'10,000 rows. Spreadsheet. Silence. The ancient art of being replaced by a script.',cost:{energy:1},weight:.7,effects:[{type:'hopeMod',mod:-5},{type:'rentMod',mod:12},{type:'atsFavor',mod:2}],buttons:[{label:'Enter the Data',cost:{energy:1},effect:'dataEntry'},{label:'Let AI Do It',cost:{energy:0},effect:'discard'}]}),
      mk({id:'consulting',title:'$50/hr Consulting Call',category:'gig',flavor:'"So what do you do?" "I advise people on digital transformation." "Cool, can you just...?"',cost:{energy:1},weight:.5,effects:[{type:'humanContact',mod:3},{type:'rentMod',mod:50}],buttons:[{label:'Take the Call',cost:{energy:1},effect:'consulting'},{label:'Too Real',cost:{energy:0},effect:'discard'}]}),
    ],

    rest:[
      mk({id:'touch-grass',title:'Touch Grass',category:'rest',flavor:'You go outside. The sun is bright. People walk their dogs. You feel... alive?',cost:{energy:1},redFlags:0,weight:1.2,effects:[{type:'hopeMod',mod:18}],buttons:[{label:'Touch Grass',cost:{energy:1},effect:'touchGrass'},{label:'Stay Inside',cost:{energy:0},effect:'discard'}]}),
      mk({id:'delete-app',title:'Delete the App for One Day',category:'rest',flavor:'No Linkfluence. No DMs. No "amazing opportunities." Just... peace?',cost:{energy:0},redFlags:0,weight:.8,effects:[{type:'hopeMod',mod:25},{noRecruiterTomorrow:true}],buttons:[{label:'Delete (For Now)',cost:{energy:0},effect:'deleteApp'},{label:'Keep the App',cost:{energy:0},effect:'discard'}]}),
      mk({id:'therapy',title:'Therapy Session ($30)',category:'rest',flavor:'"So you\'re telling me the job market isn\'t a personal attack?" "Exactly." "That\'s... helpful."',cost:{energy:0},redFlags:0,weight:.6,effects:[{type:'hopeMod',mod:35},{type:'rentMod',mod:-30}],buttons:[{label:'Book Session',cost:{energy:0},effect:'therapy'},{label:'Self-Help Book',cost:{energy:0},effect:'discard'}]}),
      mk({id:'cook-meal',title:'Cook a Real Meal',category:'rest',flavor:'You cook something that wasn\'t delivered in plastic. It tastes like... not sadness.',cost:{energy:0},redFlags:0,weight:.8,effects:[{type:'hopeMod',mod:7}],buttons:[{label:'Cook',cost:{energy:0},effect:'cookMeal'},{label:'Order Food ($25)',cost:{energy:0},effect:'orderFood'},{label:'Eat Cereal',cost:{energy:0},effect:'eatCereal'}]}),
mk({id:'sleep-card',title:'Sleep',category:'rest',flavor:'You sleep. It\'s free. The only thing the job market hasn\'t monetized.',cost:{energy:0},redFlags:0,weight:1,effects:[{type:'hopeMod',mod:3}],buttons:[{label:'Sleep',cost:{energy:0},effect:'sleep'},{label:'Doomscroll Instead',cost:{energy:0},effect:'doomscroll'}]}),
      mk({id:'walk-without-phone',title:'Walk Without Your Phone',category:'rest',flavor:'You went outside and forgot to document it for Linkfluence. Did it even happen?',cost:{energy:0},redFlags:0,weight:.7,effects:[{type:'hopeMod',mod:18},{type:'credMod',mod:3}],buttons:[{label:'Touch Grass (No Phone)',cost:{energy:0},effect:'touchGrass'},{label:'Bring the Phone',cost:{energy:0},effect:'discard'}]}),
     ],
    event:[
      mk({id:'alg-change',title:'Algorithm Change',category:'event',flavor:'Linkfluence changed its algorithm. Your old viral combos get nerfed.',cost:{energy:0},redFlags:0,weight:.5,effects:[{type:'cloutMod',mod:-10},{type:'credMod',mod:-3}],buttons:[{label:'Accept Fate',cost:{energy:0},effect:'algChange'}]}),
      mk({id:'layoff-wave',title:'Layoff Wave',category:'event',flavor:'Another round of layoffs. Hope evaporates. Network opportunities double.',cost:{energy:0},redFlags:1,weight:.4,effects:[{type:'hopeMod',mod:-5},{type:'networkMod',mod:3}],buttons:[{label:'Brace Yourself',cost:{energy:0},effect:'layoffWave'}]}),
      mk({id:'profile-viewed',title:'Recruiter Viewed Your Profile',category:'event',flavor:'80% chance of absolutely nothing happening.',cost:{energy:0},redFlags:0,weight:.8,effects:[{type:'hopeMod',mod:5},{type:'nothing',chance:.8}],buttons:[{label:'Get Hyped',cost:{energy:0},effect:'profileViewed'}]}),
      mk({id:'ceo-family',title:'CEO Announces "Family Culture"',category:'event',flavor:'"We\'re like a family!" says the CEO whose family has never seen them.',cost:{energy:0},redFlags:2,weight:.3,effects:[{type:'familyFlag'}],buttons:[{label:'Ugh',cost:{energy:0},effect:'ceoFamily'}]}),
      mk({id:'role-paused',title:'The Role Was Put on Hold',category:'event',flavor:'"Due to strategic realignment..." One of your leads vanished.',cost:{energy:0},redFlags:3,weight:.3,effects:[{type:'rolePaused'}],buttons:[{label:'Accept',cost:{energy:0},effect:'rolePaused'}]}),
      mk({id:'final-interview',title:'Final Interview Added',category:'event',flavor:'"We\'d like to add one more final interview." This is the 3rd "final."',cost:{energy:0},redFlags:3,weight:.2,effects:[{type:'hopeMod',mod:-5},{type:'finalInterview'}],buttons:[{label:'Sigh',cost:{energy:0},effect:'finalInterview'}]}),
      mk({id:'hiring-pto',title:'Hiring Manager on PTO',category:'event',flavor:'"Your hiring manager is on PTO until the heat death of the universe."',cost:{energy:0},redFlags:2,weight:.4,effects:[{type:'leadStall'}],buttons:[{label:'Wait',cost:{energy:0},effect:'hiringPTO'}]}),
      mk({id:'mass-layoffs',title:'Mass Layoffs at Your Top Pick',category:'event',flavor:'Schadenfreude (+20 Hope) followed by existential dread (-30 Hope).',cost:{energy:0},redFlags:1,weight:.3,effects:[{type:'hopeMod',mod:-10}],buttons:[{label:'Mixed Emotions',cost:{energy:0},effect:'massLayoffs'}]}),
      mk({id:'friend-hired',title:'A Friend Got Hired',category:'event',flavor:'Your friend just got a job offer. Depending on your Credibility, this either inspires or destroys you.',cost:{energy:0},redFlags:0,weight:.5,effects:[{type:'friendHired'}],buttons:[{label:'React',cost:{energy:0},effect:'friendHired'}]}),
      mk({id:'vibes-shift',title:'Macroeconomic Vibes Shift',category:'event',flavor:'The vibes have shifted. Nobody knows what this means.',cost:{energy:0},redFlags:1,weight:.4,effects:[{type:'vibesShift'}],buttons:[{label:'Feel It',cost:{energy:0},effect:'vibesShift'}]}),
      mk({id:'captcha-event',title:'Captcha for Employment',category:'event',flavor:'"Prove you\'re human by selecting all squares containing transferable skills."',cost:{energy:0},redFlags:0,weight:.3,effects:[{type:'captchaEvent'}],buttons:[{label:'Solve Captcha',cost:{energy:0},effect:'captchaEvent'}]}),
      mk({id:'pa-event',title:'Personality Assessment',category:'event',flavor:'"I would describe myself as a closer." No matter what you pick: "Borderline Culture Fit."',cost:{energy:0},redFlags:1,weight:.3,effects:[{type:'paEvent'}],buttons:[{label:'Take Assessment',cost:{energy:0},effect:'paEvent'}]}),
      mk({id:'video-interview',title:'One-Way Video Interview',category:'event',flavor:'"Record a 60-second response to our question." You recorded a 60-second response to yourself crying.',cost:{energy:0},redFlags:1,weight:.2,effects:[{type:'videoInterview'}],buttons:[{label:'Record Answer',cost:{energy:0},effect:'videoInterview'},{label:'Decline',cost:{energy:0},effect:'discard'}]}),
    ]
  };

  /* BACKGROUNDS */
  const BACKGROUNDS=[
    {id:'recent-grad',name:'Recent Grad',icon:'🎓',vibe:'Optimistic. Doomed.',perk:'+2 Hope, free "Brand New LinkedIn" card',penalty:'Lower Sus',stats:{hope:52,credibility:50,rent:100,clout:0,atsFavor:7,robotSuspicion:100,humanContact:5,energy:3,maxEnergy:3}},
    {id:'mid-career',name:'Mid-Career Pivot',icon:'🔄',vibe:'Tired. Wise. Tired.',perk:'+20 Network, +5 Credibility',penalty:'"Overqualified" event fires more',stats:{hope:50,credibility:55,rent:100,clout:0,atsFavor:10,robotSuspicion:100,humanContact:25,energy:3,maxEnergy:3}},
    {id:'tech-refugee',name:'Tech Refugee',icon:'🏚️',vibe:'Eyes have seen things.',perk:'+30 Rent (severance), Open-to-Work Halo',penalty:'Recruiter spam doubled',stats:{hope:40,credibility:50,rent:130,clout:0,atsFavor:10,robotSuspicion:100,humanContact:5,energy:3,maxEnergy:3}},
    {id:'bootcamp',name:'Bootcamp Survivor',icon:'💻',vibe:'Confident in JavaScript.',perk:'+15 Bot Aura, +1 Energy day 1',penalty:'-15 Sus, AI detection risk doubled',stats:{hope:50,credibility:50,rent:100,clout:0,atsFavor:25,robotSuspicion:85,humanContact:5,energy:4,maxEnergy:4}},
    {id:'career-goblin',name:'Career Goblin',icon:'👺',vibe:'The everyman experience.',perk:'Balanced stats, +1 extra feed card/day',penalty:'Nothing',stats:{hope:50,credibility:50,rent:100,clout:0,atsFavor:10,robotSuspicion:100,humanContact:5,energy:3,maxEnergy:3}},
    {id:'reformed-influencer',name:'Reformed Influencer',icon:'📱',vibe:'Chastened. Still posts.',perk:'First post each day is free',penalty:'-10 Credibility',locked:true,lockHint:'Unlock: Hit 200 Clout in a run',stats:{hope:50,credibility:40,rent:100,clout:0,atsFavor:10,robotSuspicion:100,humanContact:5,energy:3,maxEnergy:3}},
    {id:'ghost-vigilante',name:'Ghost Job Vigilante',icon:'🔍',vibe:'Sees through walls.',perk:'Ghost Vibe reads are sharper (±15 noise)',penalty:'Cannot use Easy Apply',locked:true,lockHint:'Unlock: Expose 25 ghost jobs across runs',stats:{hope:50,credibility:50,rent:100,clout:0,atsFavor:10,robotSuspicion:100,humanContact:5,energy:3,maxEnergy:3}},
  ];

 /* ACHIEVEMENTS (42) */
  const ACHIEVEMENTS=[
    {id:'win-job',name:'Just Hire Me, Bro',desc:'Win with an actual job.',icon:'🎉',hidden:false},
    {id:'robot-said-no',name:'The Robot Said No',desc:'Get auto-rejected 10 times in one run.',icon:'🤖',hidden:false},
    {id:'resume-bh',name:'Résumé Black Hole Researcher',desc:'Have 15 leads ghost in one run.',icon:'🕳️',hidden:false},
    {id:'open-scams',name:'Open to Work, Open to Scams',desc:'Receive 10 scam DMs in one run.',icon:'📨',hidden:false},
    {id:'salary-crypt',name:'Salary Range Cryptid',desc:'Find a recruiter who states salary upfront.',icon:'🦄',hidden:false},
    {id:'net-kpis',name:'Networking Is Just Friendship With KPIs',desc:'Win via referral.',icon:'🤝',hidden:false},
    {id:'prompt-eng',name:'Prompt Engineer by Accident',desc:'Win the AI ending.',icon:'🧠',hidden:false},
    {id:'final-v7',name:'Final Round Forever',desc:'Reach 4+ "final" interviews on a single lead.',icon:'♾️',hidden:false},
    {id:'repost-antiq',name:'Reposted Since Antiquity',desc:'Expose a job marked "reposted 50+ times."',icon:'👴',hidden:false},
    {id:'one-click',name:'One Click, No Witnesses',desc:'Submit 20 Easy Apply applications.',icon:'🖱️',hidden:false},
    {id:'ghostbuster',name:'Ghostbuster',desc:'Expose 10 ghost jobs in one run.',icon:'👻',hidden:false},
    {id:'ghost-vig',name:'Ghost Job Vigilante',desc:'Expose 25 ghost jobs across all runs.',icon:'🔍',hidden:false},
    {id:'kindly-champ',name:'Kindly Champion',desc:'Correctly report 5 scam recruiters.',icon:'🛡️',hidden:false},
    {id:'workday-warr',name:'Workday Warrior',desc:'Survive 10 company portal applications.',icon:'🔐',hidden:false},
    {id:'parser-ate',name:'The Parser Ate My Homework',desc:'Lose 30+ Bot Aura to a single event.',icon:'💀',hidden:false},
    {id:'humbled-hon',name:'Humbled and Honored',desc:'Gain 100 Clout in one day.',icon:'📣',hidden:false},
    {id:'agree-ach',name:'Agree?',desc:'Get a one-word "Agree?" post to go viral.',icon:'✅',hidden:false},
    {id:'touch-grass-s',name:'Touch Grass Speedrun',desc:'Win without hope ever dropping below 50.',icon:'🌿',hidden:false},
    {id:'quiet-win',name:'The Quiet Win',desc:'Achieve "The Quiet Win" ending.',icon:'🌅',hidden:false},
    {id:'founder-mode',name:'Founder Mode Activated',desc:'Collect 15 buzzwords.',icon:'🚀',hidden:false},
    {id:'reformed-inf',name:'Reformed Influencer',desc:'Hit 200 Clout.',icon:'📱',hidden:false},
    {id:'circle-back',name:'Circle Back Champion',desc:'Have 8 active leads at once.',icon:'🔄',hidden:false},
    {id:'no-takehomes',name:'No Take-Homes',desc:'Win without completing a take-home.',icon:'🚫',hidden:false},
    {id:'pure-human',name:'Pure Human',desc:'Win with Sus ≥ 80 throughout.',icon:'💚',hidden:false},
    {id:'pure-robot',name:'Pure Robot',desc:'Win with Bot Aura ≥ 90 and Sus ≤ 20.',icon:'⚙️',hidden:false},
    {id:'recruiter-bingo',name:'Recruiter Bingo',desc:'Trigger 5 distinct recruiter cards in one run.',icon:'🎯',hidden:false},
    {id:'30-days',name:'The 30 Days Are a Lifetime',desc:'Reach day 30 in any state.',icon:'📅',hidden:false},
    {id:'first-round',name:'First-Round Knockout',desc:'Get an offer on or before day 10.',icon:'⚡',hidden:false},
    {id:'speedrun-app',name:'Speedrunner',desc:'Submit 50+ applications in 5 days or fewer.',icon:'💨',hidden:false},
    {id:'touch-crypt',name:'Touch Cryptid',desc:'Encounter a Salary Range Cryptid in 3+ runs.',icon:'🦕',hidden:false},
    {id:'true-boss',name:'True Boss',desc:'Defeat a boss fight without failing a single requirement.',icon:'👑',hidden:false},
    {id:'agi-pilled',name:'AGI Pilled',desc:'Win the Prompt Engineer ending 5 times across all runs.',icon:'🤯',hidden:false},
    {id:'good-morning',name:'Good Morning',desc:'Experience 10 morning events across all runs.',icon:'🌅',hidden:false},
    {id:'right-thing',name:'The Right Thing',desc:'Report the DoorDash glitch.',icon:'😇',hidden:true},
    {id:'free-pizza',name:'Free Pizza Generation',desc:'Go to a meetup for the pizza alone.',icon:'🍕',hidden:true},
    {id:'mom-knows',name:'Mom Knows',desc:'Answer 3 mom calls in a single run.',icon:'❤️',hidden:false},
    {id:'patient-zero',icon:'⏳',name:'Patient Zero',desc:'Follow up on the same lead 5 times while it\'s in Waiting.',hidden:false},
    {id:'real-answer',icon:'💯',name:'A Real Answer',desc:'Pick the honest answer in a Panel Interview and survive.',hidden:false},
    {id:'principled',icon:'⚖️',name:'Principled',desc:'Decline an unpaid take-home and still get the offer.',hidden:false},
    {id:'silent-power',icon:'🤫',name:'Silent Power',desc:'Choose to stare back in the Panel Interview and survive.',hidden:true},
    {id:'form-survivor',icon:'📝',name:'Form Survivor',desc:'Complete 10 Screening Forms.',hidden:false},
    {id:'salary-warrior',icon:'⚔️',name:'Salary Warrior',desc:'Get an offer using the disclosed salary range.',hidden:false},
    {id:'ghost-them-back',icon:'🚫',name:'Ghost Them Back',desc:'Mark 10 leads as spam in one run.',hidden:false},
    {id:'good-instincts',icon:'🧠',name:'Good Instincts',desc:'Mark 5 leads as spam when vibe was below 20.',hidden:false},
    {id:'oops',icon:'😬',name:'Oops',desc:'Mark a legitimate advanced lead as spam.',hidden:false},
    {id:'vibe-check',icon:'🌡️',name:'Vibe Check',desc:'Have 5 warm or promising leads simultaneously.',hidden:false},
    {id:'trust-no-one',icon:'👁️',name:'Trust No One',desc:'Win a run with 8+ marks as spam.',hidden:false},
  ];

  /* ENDINGS */
  const ENDINGS={
    'just-hired':{name:'Just Hired, Bro',type:'victory',icon:'🎉',review:'After a 30-day evaluation, the candidate demonstrated exceptional alignment with the modern hiring funnel. Strengths: resilience in the face of {autoRejections} automated rejections. Outcome: **Just Hired, Bro**.'},
    'human-referral':{name:'Human Referral Network',type:'victory',icon:'🤝',review:'The candidate bypassed the robot pipeline through the ancient art of "knowing someone." HR is not ready.'},
    'ghost-vig-end':{name:'Ghost Job Vigilante',type:'victory',icon:'🕵️',review:'After exposing {ghostEvidence} ghost listings, the candidate has become a menace to fake-job-posters. Linkfluence has issued a cease-and-desist.'},
    'scam-scammers':{name:'Scam the Scammers',type:'victory',icon:'🛡️',review:'After reporting {scamEvidence} scams, the candidate is a one-person FTC for the job market.'},
    'prompt-eng-end':{name:'Prompt Engineer by Accident',type:'victory',icon:'🤖',review:'By adding "AI" to your résumé so many times, Synergenix hired you to automate hiring. You are now the thing you fought.'},
    'thought-leader':{name:'Thought Leader Containment Breach',type:'victory',icon:'📣',review:'With {clout} Clout and Credibility ≥ 30, you are simultaneously a thought leader and a functioning human.'},
    'founder-mode-end':{name:'Founder Mode',type:'victory',icon:'🚀',review:'After collecting {buzzwords} buzzwords and turning down 3 offers, you pivoted to PromptPivot.ai. Your first hire is an AI that writes job descriptions.'},
    'network-wizard':{name:'Network Wizard',type:'victory',icon:'✨',review:'With {hc} Human Contact and zero Easy Apply uses, you proved human connections beat algorithms.'},
    'quiet-win-end':{name:'The Quiet Win',type:'victory',icon:'🌅',review:'You survived 30 days. Took a job at an HVAC accounting software company. The benefits are good. You feel okay. Maybe that\'s the real victory.'},
    'resume-bh-end':{name:'Résumé Black Hole',type:'loss',icon:'🕳️',review:'After {apps} applications with no human contact, your résumé has entered the shadow dimension. It is now a legend.'},
    'doomscroll-end':{name:'Doomscroll Spiral',type:'loss',icon:'🌀',review:'Your Hope hit 0. You closed the laptop and went outside. The sun was still there. You didn\'t notice.'},

    'rent-end':{name:'Rent Has Entered the Chat',type:'loss',icon:'💸',review:'Your Rent Money hit 0. The landlord has entered the chat. They are not asking nicely.'},
    'final-round-end':{name:'Final Round Forever',type:'loss',icon:'♾️',review:'Trapped in interview loops past day 30. You are now in "Final_Final_v7" status. You have forgotten your own name.'},
    'times-up-end':{name:'Time\'s Up, Bro',type:'loss',icon:'⏰',review:'Day 31 hit with no leads in the final stages. The job market moved on. You remain in applied limbo.'},
    'kindly-end':{name:'Kindly Do the Needful',type:'loss',icon:'🎭',review:'You fell for {scams} scams. The scammers now have your SSN, your check deposit, and your dignity.'},
    'ai-detected':{name:'AI Detected AI',type:'loss',icon:'🤖',review:'Your Sus hit 0. An AI determined you are an AI. The bureaucracy of machines is endless.'},
    'culture-fit':{name:'Culture Fit Not Found',type:'loss',icon:'🧩',review:'Your Credibility hit 0. You are now "not a culture fit" in every system on Earth.'},
    'ats-ate-end':{name:'The Parser Ate Your Résumé',type:'loss',icon:'📄',review:'A catastrophic Parser loss has left your résumé as digital soup. Your career is now a .txt file titled "HELP."'},
  };

  /* MICRO-EVENT DATA */
  const PW_REQS=['At least 8 characters','One uppercase letter','One number','One special character','One emoji','A pet name','Your mother\'s maiden name reversed','A haiku about your career goals'];
  const VID_PROMPTS=['Tell us about a time you resolved conflict with a stakeholder.','Describe where you pivoted rapidly.','How do you handle ambiguity?','Tell us about leveraging cross-functional synergy.','Describe your experience with async, mission-driven work.'];
  const VID_SUBS=['I demonstrated synergy by...','circling back to align stakeholders...','thrilled to... leverage the ecosystem...','moving the needle on... strategic narrative...','and taking a lean-in approach to... paradigm shifts.'];
  const PA_QS=[
    {q:'I would describe myself as "a closer."',opts:['Strongly Disagree','Disagree','Neutral','Agree','Strongly Agree']},
    {q:'I see PTO as a sign of weakness.',opts:['Strongly Disagree','Disagree','Neutral','Agree','Strongly Agree']},
    {q:'I\'m a "hustle culture" person at heart.',opts:['Strongly Disagree','Disagree','Neutral','Agree','Strongly Agree']},
    {q:'I believe in work-life integration, not balance.',opts:['Strongly Disagree','Disagree','Neutral','Agree','Strongly Agree']},
    {q:'I\'d rather be respected than liked.',opts:['Strongly Disagree','Disagree','Neutral','Agree','Strongly Agree']},
    {q:'Passion for ambiguity is a personality trait.',opts:['Strongly Disagree','Disagree','Neutral','Agree','Strongly Agree']},
  ];
  const CAPTCHA_ITEMS=[
    {icon:'📎',label:'Stapler',ok:true},{icon:'🤝',label:'Handshake',ok:true},{icon:'📊',label:'Vague Chart',ok:true},
    {icon:'🌅',label:'Sunset',ok:false},{icon:'💪',label:'Flexing',ok:true},{icon:'📝',label:'Untitled Doc',ok:false},
    {icon:'🏢',label:'Office Building',ok:true},{icon:'📱',label:'Smartphone',ok:false},{icon:'💡',label:'Lightbulb',ok:true},
  ];

  const FOLLOWUP_FLAVOR={
    waiting:[
      'No reply. The void is reviewing your application.',
      'You refreshed your inbox 14 times. Nothing.',
      'Your application status is still "Received." It has been "Received" since the Mesozoic Era.',
      'The portal shows "1 of 1 stages complete." There were never any stages.',
      'You see a recruiter "viewed your profile." That\'s the last thing you\'ll see.',
      'A read receipt confirmed they opened your message. They have not replied.',
      'Their "out of office" reply is now 14 days old. They are not on vacation.',
      'You drafted three follow-ups. You sent zero.',
    ],
    autoReply:[
      'Subject: "Thank you for your interest!" Body: 400 words saying nothing.',
      '"We\'ve received your application." This is the last thing you\'ll hear from them.',
      'An auto-reply addressed to "{{FIRST_NAME}}" arrived. They forgot the merge field.',
      '"Due to high volume, we\'re unable to respond individually." You\'ll be back to "individually" in 6 weeks.',
      '"Your application is now in our talent pipeline." The pipeline does not flow.',
    ],
    recruiterScreenNoSalary:[
      '"Just a quick chat to learn about you!" 47 minutes of you talking about yourself.',
      '"We\'re a small but mighty team!" Translation: you\'ll wear 6 hats unpaid.',
      'The recruiter said "let me get back to you on compensation." They will not.',
      '"What\'s your salary expectation?" You said a number. They went silent.',
      '"We\'re flexible on comp for the right candidate!" You are not the right candidate.',
    ],
    recruiterScreenWithSalary:[
      'They stated the range upfront. You almost cried. You held it together.',
      '"The band is $95k–$120k." A miracle in our time.',
      'They said "we list salary because we respect candidates." You believe them.',
      'A real salary range. Confirmed in writing. You took a screenshot.',
    ],
    finalInterview1:[
      '"Just one final chat with leadership." You smile. You think this is the end.',
      '"This is the last step!" Spoiler: it is not.',
      'The "final" interview went well. You\'re cautiously optimistic. Past-you would warn you.',
    ],
    finalInterview2:[
      '"Just ONE more final chat — with the COO this time." Of course.',
      '"We added one more round, sorry!" They are not sorry.',
      'Another "final." The CEO wants to "vibe check" you. You vibe.',
    ],
    finalInterview3:[
      '"One last final — the founder wants to meet everyone." She just met you on Zoom 4 days ago.',
      'The 3rd "final." You\'re not asking about timeline anymore. You don\'t want to know.',
      '"Last one we promise." You have heard this twice. You will hear it again.',
    ],
    ghost:[
      'You followed up. Twice. Three times. The silence remained.',
      'They saw your message at 11:47 PM. They did not reply.',
      'You sent a polite "just checking in!" It was checked into the void.',
      '"I\'ll get back to you by end of week." That was 4 weeks ago.',
      'The recruiter left the company. Your application went with them.',
    ],
    rejection:[
      '"We\'ve decided to move forward with other candidates." Same template, same Wednesday.',
      'A two-line rejection. At least it was a reply.',
      '"You were a strong candidate, but we chose someone with more direct experience." There were 400 candidates.',
      '"We\'ll keep your résumé on file." They will not.',
      '"Unfortunately we won\'t be moving forward at this time." At least the suspense is over.',
    ],
  };

  const SCREENING_FIELDS=[
    {label:'Re-enter your full legal name as it appears on your résumé',type:'text',placeholder:'(also on your résumé we just downloaded)'},
    {label:'Years of experience with React',type:'select',options:['<1','1-2','3-5','6-10','10+','I invented it']},
    {label:'How did you hear about us?',type:'select',options:['LinkedIn','Indeed','Glassdoor','Company website','A recruiter slid into my DMs','A dream'],required:true},
    {label:'Salary expectations (this will not be used in negotiations, we promise)',type:'text',placeholder:'$'},
    {label:'Are you authorized to work in the United States?',type:'select',options:['Yes','Yes, but I\'d like to discuss','No']},
    {label:'Will you require visa sponsorship now or in the future?',type:'select',options:['No','Yes','Define "future"']},
    {label:'Why do you want to work at this company?',type:'textarea',placeholder:'(200 character minimum, will be parsed by AI)'},
    {label:'Race/ethnicity (voluntary — used for "diversity tracking")',type:'select',options:['Prefer not to say','Prefer not to say','Prefer not to say','Other']},
    {label:'Gender (voluntary)',type:'select',options:['Prefer not to say','Prefer not to say','Prefer not to say']},
    {label:'LinkedIn URL (already on your résumé)',type:'text'},
    {label:'Upload your résumé again',type:'file-fake',placeholder:'[File: ETERNAL_RESUME_V47_FINAL_FINAL.pdf]'},
  ];

  const TAKE_HOME_OPTIONS=[
    {label:'Option A: "Quick Design Doc"',description:'Write up your approach to scaling our API. (~2 hours estimated.)',outcomes:[
      {weight:3,hopeDelta:-5,credDelta:5,msg:'Took six hours. You wrote 8 pages. They scanned the first paragraph.'},
      {weight:2,hopeDelta:-2,credDelta:8,msg:'You nailed it. The hiring manager said "this is the best one we\'ve seen." (They say this to everyone.)'},
      {weight:1,hopeDelta:-10,credDelta:0,msg:'You wrote it. They never acknowledged receipt.'},
    ]},
    {label:'Option B: "Small Coding Task"',description:'Build a simple feature in our codebase. (~2 hours, we provide the repo.)',outcomes:[
      {weight:3,hopeDelta:-10,credDelta:8,msg:'Their "repo" was a 40,000-line monolith. You shipped something. They were impressed.'},
      {weight:2,hopeDelta:-15,credDelta:3,msg:'Their setup instructions were 4 years old. You spent 7 hours getting it to run.'},
      {weight:1,hopeDelta:-6,credDelta:12,msg:'You crushed it. They have already used your PR in production. You will not be hired.'},
    ]},
    {label:'Option C: "Live Working Session"',description:'A 90-minute call where we build something together. (Lowest time commitment!)',outcomes:[
      {weight:4,hopeDelta:-3,credDelta:4,msg:'90 minutes of pair-programming on their actual ticket. You did most of the work. They called it "collaborative."'},
      {weight:2,hopeDelta:2,credDelta:6,msg:'You vibed. The interviewer said "this was fun." That\'s rare.'},
    ]},
    {label:'Option D: Decline politely',description:'Tell them you don\'t do unpaid work over 1 hour.',requireCred:60,outcomes:[
      {weight:2,hopeDelta:5,credDelta:10,msg:'They respected it. The conversation continued.'},
      {weight:3,hopeDelta:-3,credDelta:5,msg:'They thanked you and "moved forward with other candidates."'},
    ]},
  ];

  const WEAKNESS_ANSWERS=[
    {label:'"I work too hard."',credDelta:-5,hopeDelta:-2,msg:'They visibly recoiled. One smiled politely.'},
    {label:'"Perfectionism."',credDelta:-3,hopeDelta:-1,msg:'The recruiter wrote something down. It was probably the eye-roll.'},
    {label:'"I struggle with delegation."',credDelta:3,hopeDelta:0,msg:'They nodded. This was an acceptable answer.'},
    {label:'"I get impatient with inefficient meetings."',credDelta:5,hopeDelta:-3,msg:'You hit a nerve. The hiring manager has called 4 meetings about meetings this week.'},
    {label:'"Honestly? I overcommit and then burn out."',credDelta:8,hopeDelta:3,msg:'A real answer. They were not ready. The silent ones leaned in.'},
    {label:'(Just stare back)',credDelta:0,hopeDelta:-5,msg:'You held the silence for 11 seconds. They blinked first. This is a power move or a disaster.'},
  ];

  const SALARY_STALL_OPTIONS=[
    {label:'Lowball yourself (~$60k)',hopeDelta:-3,credDelta:-5,msg:'They said "great, we can work with that!" You feel a knot in your stomach.'},
    {label:'Market rate (~$90k)',hopeDelta:2,credDelta:3,msg:'They said "let me check with the team." They will check.'},
    {label:'Aim high (~$120k)',hopeDelta:0,credDelta:8,ghostChance:0.30,msg:'They said "interesting." A long pause. "We\'ll get back to you."'},
    {label:'"Per the job post, the band is..."',hopeDelta:5,credDelta:10,signalOnly:'salaryDisclosed',msg:'A power move. They confirmed the range. Negotiation begins from a real number.'},
  ];

  function pickWaitingMessage(rng) { return DATA.pick(DATA.FOLLOWUP_FLAVOR.waiting, rng); }
  function pickAutoReplyMessage(rng) { return DATA.pick(DATA.FOLLOWUP_FLAVOR.autoReply, rng); }
  function pickRecruiterScreenMessage(disclosed, rng) {
    return DATA.pick(disclosed ? DATA.FOLLOWUP_FLAVOR.recruiterScreenWithSalary : DATA.FOLLOWUP_FLAVOR.recruiterScreenNoSalary, rng);
  }
  function pickFinalInterviewMessage(n, rng) {
    const pool = n === 1 ? DATA.FOLLOWUP_FLAVOR.finalInterview1
                 : n === 2 ? DATA.FOLLOWUP_FLAVOR.finalInterview2
                 : DATA.FOLLOWUP_FLAVOR.finalInterview3;
    return DATA.pick(pool, rng);
  }
  function pickGhostMessage(rng) { return DATA.pick(DATA.FOLLOWUP_FLAVOR.ghost, rng); }
  function pickRejectionMessage(rng) { return DATA.pick(DATA.FOLLOWUP_FLAVOR.rejection, rng); }

  const MORNING_EVENTS=[
    {id:'car-wont-start',icon:'🚗',title:'Your Car Won\'t Start',flavor:'You turn the key. Nothing. The car has read the room.',choices:[
      {label:'Call a mechanic (-$40 guaranteed)',outcomes:[{weight:1,effects:[{stat:'rent',delta:-40}],result:'Mechanic charged $40. Says "alternator." You nod knowingly.'}]},
      {label:'YouTube tutorial it yourself',outcomes:[
        {weight:2,effects:[{stat:'rent',delta:-8},{stat:'credibility',delta:3}],result:'You fixed it! Three hours and one bleeding knuckle later.'},
        {weight:2,effects:[{stat:'rent',delta:-15},{stat:'hope',delta:-5}],result:'You made it worse. Now it ALSO smells like coolant.'},
        {weight:1,effects:[{stat:'rent',delta:-60}],result:'You broke something else. Tow truck. Mechanic. Apology.'},
      ]},
      {label:'Take the bus to your interview',outcomes:[{weight:1,effects:[{stat:'hope',delta:-3},{stat:'humanContact',delta:1}],result:'The bus was 20 minutes late. You met a guy named Carl. He gave you life advice.'}]},
    ]},
    {id:'mom-calls',icon:'📞',title:'Your Mom Is Calling',flavor:'It\'s 9:14 AM. She\'s never called this early unless something\'s wrong or she saw something on the news.',choices:[
      {label:'Pick up',outcomes:[
        {weight:3,effects:[{stat:'hope',delta:5}],result:'She just wanted to say hi. And ask if you\'ve eaten. You have not.'},
        {weight:2,effects:[{stat:'hope',delta:-5},{stat:'credibility',delta:2}],result:'She asked when you\'re getting "a real job." You changed the subject.'},
        {weight:1,effects:[{stat:'rent',delta:30},{stat:'hope',delta:8}],result:'She Venmo\'d you "for groceries." You feel both loved and 34.'},
      ]},
      {label:'Send to voicemail',outcomes:[{weight:1,effects:[{stat:'hope',delta:-4}],result:'You\'ll feel guilty about this for 6–8 business hours.'}]},
    ]},
    {id:'jacket-twenty',icon:'💵',title:'Twenty Dollars in a Jacket',flavor:'You reach into your fall jacket and find a folded twenty. Past-you, you absolute legend.',choices:[
      {label:'Save it',outcomes:[{weight:1,effects:[{stat:'rent',delta:20},{stat:'hope',delta:3}],result:'Twenty whole dollars. The economy is saved.'}]},
      {label:'Buy yourself something nice',outcomes:[
        {weight:2,effects:[{stat:'hope',delta:8}],result:'You bought a $7 coffee and a pastry. Worth it.'},
        {weight:1,effects:[{stat:'hope',delta:12},{stat:'credibility',delta:2}],result:'You bought a real book. You will read 4 pages of it.'},
      ]},
    ]},
    {id:'wifi-out',icon:'📶',title:'The Wi-Fi Is Out',flavor:'Comcast says "we\'re experiencing higher than normal call volumes." It is 8:47 AM.',choices:[
      {label:'Drive to a coffee shop',outcomes:[
        {weight:3,effects:[{stat:'rent',delta:-8},{stat:'humanContact',delta:1}],result:'Bought a $6 latte. Made eye contact with another human.'},
        {weight:1,effects:[{stat:'rent',delta:-8},{stat:'humanContact',delta:3},{stat:'clout',delta:4}],result:'You overheard a guy pitching a startup. You networked. It was unhinged.'},
      ]},
      {label:'Hotspot off your phone',outcomes:[{weight:1,effects:[{stat:'rent',delta:-3},{stat:'hope',delta:-2}],result:'You burned through your data cap by 10 AM. Worth it, technically.'}]},
      {label:'Take the day off',outcomes:[{weight:1,effects:[{stat:'energy',delta:-1},{stat:'hope',delta:5}],result:'You read a book. Or stared at a book. Same energy.'}]},
    ]},
    {id:'roommate-locked-out',icon:'🔑',title:'Your Roommate Locked Themselves Out',flavor:'They\'re calling from a neighbor\'s phone. They are barefoot. It is 7:30 AM.',choices:[
      {label:'Drive over and let them in',outcomes:[{weight:1,effects:[{stat:'humanContact',delta:3},{stat:'energy',delta:-1},{stat:'hope',delta:2}],result:'They owe you. They will not pay you back.'}]},
      {label:'Tell them to call a locksmith',outcomes:[
        {weight:3,effects:[{stat:'hope',delta:-2}],result:'They did. They were silent at dinner.'},
        {weight:1,effects:[{stat:'humanContact',delta:-2}],result:'They posted about it. Subtweet-style.'},
      ]},
    ]},
    {id:'dentist-bill',icon:'🦷',title:'A Dentist Bill From 2023',flavor:'A collections agency would like to talk to you about a cleaning you barely remember.',choices:[
      {label:'Pay it',outcomes:[{weight:1,effects:[{stat:'rent',delta:-35},{stat:'hope',delta:4}],result:'Adulting completed. Painful, but completed.'}]},
      {label:'Dispute it',outcomes:[
        {weight:2,effects:[{stat:'rent',delta:-10}],result:'They agreed to drop it to $10. They were bluffing the whole time.'},
        {weight:2,effects:[{stat:'rent',delta:-35},{stat:'hope',delta:-3}],result:'They were not bluffing. Pay up.'},
      ]},
      {label:'Ignore it',outcomes:[
        {weight:3,effects:[{stat:'hope',delta:-2}],result:'It\'ll come back. It always does.'},
        {weight:1,effects:[{stat:'credibility',delta:-3},{stat:'hope',delta:-5}],result:'You got a letter about your credit score. Your future self will not thank you.'},
      ]},
    ]},
    {id:'old-friend-text',icon:'💬',title:'An Old Friend Texted',flavor:'"Hey stranger! Saw you on Linkfluence. We should catch up."',choices:[
      {label:'Schedule the catch-up',outcomes:[
        {weight:3,effects:[{stat:'humanContact',delta:4},{stat:'hope',delta:5}],result:'You talked for two hours. Felt like a person again.'},
        {weight:2,effects:[{stat:'humanContact',delta:2},{stat:'clout',delta:6}],result:'They mentioned an opening at their company. Interesting.'},
        {weight:1,effects:[{stat:'hope',delta:-3}],result:'It was a multi-level marketing pitch. You have notes.'},
      ]},
      {label:'"Sure, let me know when works!" (never reply)',outcomes:[{weight:1,effects:[{stat:'humanContact',delta:-1}],result:'The text sits unread. You sit unsmiling.'}]},
    ]},
    {id:'amazon-package',icon:'📦',title:'A Package You Don\'t Remember Ordering',flavor:'On the porch. Your name. From a vendor called "GLIMMR-X PRO."',choices:[
      {label:'Open it',outcomes:[
        {weight:2,effects:[{stat:'hope',delta:4}],result:'It\'s a stapler you ordered drunk in October. Welcome home, stapler.'},
        {weight:1,effects:[{stat:'hope',delta:8},{stat:'clout',delta:3}],result:'It\'s a hoodie that actually fits. Genuinely a great day.'},
        {weight:1,effects:[{stat:'rent',delta:-25}],result:'It\'s a subscription box you forgot to cancel. -$25.'},
      ]},
      {label:'Leave it on the porch',outcomes:[{weight:1,effects:[{stat:'hope',delta:-2}],result:'You\'ll deal with it later. Later will arrive.'}]},
    ]},
    {id:'gym-renewal',icon:'🏋️',title:'Gym Membership Auto-Renewed',flavor:'You haven\'t been since February. The treadmill misses you.',choices:[
      {label:'Cancel it',outcomes:[{weight:1,effects:[{stat:'rent',delta:-15},{stat:'hope',delta:3}],result:'They charged a $15 "cancellation fee." Of course they did.'}]},
      {label:'Actually go today',outcomes:[
        {weight:2,effects:[{stat:'energy',delta:1},{stat:'hope',delta:7}],result:'You went. You feel like a different, slightly sweatier person.'},
        {weight:1,effects:[{stat:'hope',delta:-4}],result:'You walked in, looked around, walked out. The treadmill judges you.'},
      ]},
      {label:'Let it ride for another month',outcomes:[{weight:1,effects:[{stat:'rent',delta:-30},{stat:'hope',delta:-3}],result:'$30 to maintain the *possibility* of fitness. Aspirational spending.'}]},
    ]},
    {id:'wedding-invite',icon:'💌',title:'A Wedding Invitation',flavor:'Old college friend. Destination wedding. The dress code is "festival chic."',choices:[
      {label:'RSVP yes',outcomes:[
        {weight:2,effects:[{stat:'rent',delta:-40},{stat:'humanContact',delta:5},{stat:'hope',delta:6}],result:'It\'ll cost a fortune. You\'ll see people. Worth it.'},
        {weight:1,effects:[{stat:'rent',delta:-40},{stat:'humanContact',delta:8},{stat:'clout',delta:10}],result:'You networked your way through the cocktail hour. Two leads.'},
      ]},
      {label:'RSVP no (cite "work conflict")',outcomes:[{weight:1,effects:[{stat:'hope',delta:-5},{stat:'humanContact',delta:-2}],result:'You are unemployed. The "work conflict" is a Tuesday.'}]},
      {label:'Don\'t respond at all',outcomes:[{weight:1,effects:[{stat:'humanContact',delta:-3},{stat:'credibility',delta:-3}],result:'They\'ll remember. Weddings have long memories.'}]},
    ]},
    {id:'jury-duty',icon:'⚖️',title:'Jury Duty Summons',flavor:'The envelope just says "JURY SUMMONS" in courier font. You can feel it through the paper.',choices:[
      {label:'Show up',outcomes:[
        {weight:3,effects:[{stat:'rent',delta:15},{stat:'energy',delta:-1},{stat:'hope',delta:2}],result:'$15 stipend. You read a magazine from 2019. Released by lunch.'},
        {weight:1,effects:[{stat:'rent',delta:30},{stat:'humanContact',delta:2}],result:'Selected. Three-day trial. You made a friend in the deliberation room.'},
      ]},
      {label:'Request a delay',outcomes:[{weight:1,effects:[{stat:'hope',delta:-2}],result:'Granted. It\'ll come back in 90 days. The cycle continues.'}]},
    ]},
    {id:'dog-sick',icon:'🐕',title:'Your Dog Looks Off',flavor:'He\'s eating, but slowly. He\'s wagging, but cautiously. He\'s judging you, but lovingly.',choices:[
      {label:'Vet visit ($60)',outcomes:[
        {weight:3,effects:[{stat:'rent',delta:-60},{stat:'hope',delta:8}],result:'He\'s fine. He just needed attention. Worth every dollar.'},
        {weight:1,effects:[{stat:'rent',delta:-120},{stat:'hope',delta:5}],result:'He needed meds. He\'s on meds. He hates them, but he\'s fine.'},
      ]},
      {label:'Wait it out',outcomes:[
        {weight:3,effects:[{stat:'hope',delta:-3}],result:'You spent the day Googling. He is fine. You are not.'},
        {weight:1,effects:[{stat:'rent',delta:-100},{stat:'hope',delta:-8}],result:'It got worse. Emergency vet. Should have gone.'},
      ]},
    ]},
    {id:'recruiter-irl',icon:'☕',title:'A Recruiter Recognizes You at the Coffee Shop',flavor:'"Wait — are you the candidate from Tuesday\'s screen? Funny seeing you here!"',choices:[
      {label:'Pitch yourself in line',outcomes:[
        {weight:2,effects:[{stat:'humanContact',delta:3},{stat:'clout',delta:5}],result:'They liked it. They said "I\'ll reach out." This time they might mean it.'},
        {weight:2,effects:[{stat:'credibility',delta:-3},{stat:'hope',delta:-3}],result:'You overpitched. They left. You ordered a second coffee.'},
        {weight:1,effects:[{stat:'humanContact',delta:6},{stat:'credibility',delta:5}],result:'They were impressed. Asked for your résumé on the spot.'},
      ]},
      {label:'Pretend you didn\'t hear',outcomes:[{weight:1,effects:[{stat:'hope',delta:-3}],result:'You stared at your phone for ten minutes. They left.'}]},
    ]},
    {id:'doordash-glitch',icon:'🍕',title:'DoorDash Glitched and Gave You $20',flavor:'A promo code worked twice. The math says you owe them nothing and they owe you $20.',choices:[
      {label:'Take the free meal',outcomes:[{weight:1,effects:[{stat:'rent',delta:20},{stat:'hope',delta:6}],result:'A free pad thai. The universe owes you this one.'}]},
      {label:'Report it',outcomes:[
        {weight:2,effects:[{stat:'credibility',delta:5}],result:'Customer support thanked you. They did not refund you. You did the right thing.'},
        {weight:1,effects:[{stat:'credibility',delta:5},{stat:'rent',delta:15},{stat:'clout',delta:2}],result:'They gave you $15 credit "for your honesty." Karma is a confused intern.'},
      ]},
    ]},
    {id:'landlord-knock',icon:'🚪',title:'Your Landlord Is at the Door',flavor:'He\'s holding a clipboard. He\'s wearing the smile he wears before he says "just a quick thing."',choices:[
      {label:'Open the door',outcomes:[
        {weight:2,effects:[{stat:'hope',delta:-4}],result:'"Just letting you know we\'re raising rent next quarter." Cool. Cool cool cool.'},
        {weight:1,effects:[{stat:'hope',delta:3}],result:'He\'s here to fix the leak you reported in March. Welcome to today.'},
      ]},
      {label:'Pretend you\'re not home',outcomes:[
        {weight:3,effects:[{stat:'hope',delta:-2}],result:'He left a note. The note rhymes. It shouldn\'t.'},
        {weight:1,effects:[{stat:'rent',delta:-20},{stat:'hope',delta:-5}],result:'He came back. He had a friend. They had paperwork.'},
      ]},
    ]},
    {id:'free-conference',icon:'🎤',title:'Free Local Tech Meetup Tonight',flavor:'Pizza included. Speakers TBD. "Networking opportunity" said the Eventbrite page, ominously.',choices:[
      {label:'Go',outcomes:[
        {weight:2,effects:[{stat:'humanContact',delta:5},{stat:'clout',delta:3},{stat:'energy',delta:-1}],result:'You ate three slices and got two new connections. Net positive.'},
        {weight:1,effects:[{stat:'humanContact',delta:8},{stat:'credibility',delta:4}],result:'You met a hiring manager. They liked you. They will email. Probably.'},
        {weight:1,effects:[{stat:'energy',delta:-1},{stat:'hope',delta:-3}],result:'The "speakers" were 4 founders pitching crypto. You stayed for the pizza.'},
      ]},
      {label:'Stay home',outcomes:[{weight:1,effects:[{stat:'hope',delta:-2}],result:'You watched the LinkedIn post about it the next morning. Regretful.'}]},
    ]},
    {id:'sick-day',icon:'🤧',title:'You Woke Up With a Sore Throat',flavor:'It might be allergies. It might be the dread. It might be both.',choices:[
      {label:'Push through the day',outcomes:[
        {weight:2,effects:[{stat:'hope',delta:-6}],result:'You did less than half of what you planned. You feel worse.'},
        {weight:1,effects:[{stat:'hope',delta:-10},{stat:'energy',delta:-1}],result:'You crashed by 2 PM. Should\'ve rested.'},
      ]},
      {label:'Rest. Skip the day.',outcomes:[{weight:1,effects:[{stat:'energy',delta:-1},{stat:'hope',delta:10}],result:'You slept until noon. Drank tea. Watched something dumb. Healed.'}]},
      {label:'Cold meds + soldier on',outcomes:[
        {weight:2,effects:[{stat:'rent',delta:-12},{stat:'hope',delta:-2}],result:'Loopy but functional. Sent two emails you might regret.'},
        {weight:1,effects:[{stat:'rent',delta:-12},{stat:'hope',delta:4}],result:'The drugs hit just right. You felt invincible. Briefly.'},
      ]},
    ]},
    {id:'parking-ticket',icon:'🅿️',title:'A Parking Ticket',flavor:'Tucked under your wiper. The sign was technically there. The sign was also behind a tree.',choices:[
      {label:'Pay it ($45)',outcomes:[{weight:1,effects:[{stat:'rent',delta:-45}],result:'Civic duty complete. The city has won, as always.'}]},
      {label:'Contest it',outcomes:[
        {weight:2,effects:[{stat:'hope',delta:-3}],result:'You wrote a 4-paragraph email. They replied with a form letter. Pay up.'},
        {weight:1,effects:[{stat:'rent',delta:-10},{stat:'hope',delta:5}],result:'You won. Reduced to $10. You feel like a legal genius.'},
        {weight:1,effects:[{stat:'rent',delta:-60}],result:'You lost. Late fee added. The city has notes.'},
      ]},
      {label:'"Forget" about it',outcomes:[
        {weight:2,effects:[{stat:'rent',delta:-90},{stat:'hope',delta:-5}],result:'A "Notice of Delinquency" arrived. Doubled. Past-you, why.'},
        {weight:1,effects:[{stat:'hope',delta:-2}],result:'It hasn\'t escalated. Yet. The ticket lives in your glove box now.'},
      ]},
    ]},
    {id:'neighbor-music',icon:'🔊',title:'Neighbor Is Playing Bass at 8 AM',flavor:'It\'s the same four notes. They\'ve been playing them for 40 minutes. You can feel them in your teeth.',choices:[
      {label:'Knock and ask nicely',outcomes:[
        {weight:2,effects:[{stat:'humanContact',delta:2},{stat:'hope',delta:4}],result:'They apologized! They had no idea. You feel weirdly bonded now.'},
        {weight:1,effects:[{stat:'humanContact',delta:-3},{stat:'hope',delta:-3}],result:'They got defensive. Now there\'s tension. Now there\'s passive bass.'},
      ]},
      {label:'Noise-cancelling headphones',outcomes:[{weight:1,effects:[{stat:'hope',delta:-2}],result:'You can still feel them. The bass is in your bones now.'}]},
      {label:'Call the landlord',outcomes:[
        {weight:2,effects:[{stat:'hope',delta:3}],result:'He left them a note. The bass stopped. For now.'},
        {weight:1,effects:[{stat:'humanContact',delta:-2}],result:'They figured out it was you. The hallway is awkward now.'},
      ]},
    ]},
    {id:'random-compliment',icon:'✨',title:'A Stranger Said Something Nice',flavor:'You held a door. They said "you have a great smile." Then they were gone.',choices:[
      {label:'Carry it with you all day',outcomes:[{weight:1,effects:[{stat:'hope',delta:12},{stat:'credibility',delta:2}],result:'You\'re still thinking about it at 4 PM. Strangers can be magic.'}]},
      {label:'Overthink it',outcomes:[
        {weight:2,effects:[{stat:'hope',delta:4}],result:'Was it sarcasm? Was it real? You decide to believe it was real.'},
        {weight:1,effects:[{stat:'hope',delta:-1},{stat:'credibility',delta:1}],result:'You spent 20 minutes convinced it was a setup. It wasn\'t. Probably.'},
      ]},
    ]},
    {id:'union-flyer',icon:'📰',title:'Someone Hands You a Flyer',flavor:'A person stands outside a coffee shop handing out "Know Your Rights" pamphlets. They look at you directly when they hand you one.',choices:[
      {label:'Take it and read it later',outcomes:[{weight:1,effects:[{stat:'hope',delta:3},{stat:'credibility',delta:2}],result:'You actually read it. It mentions "at-will" employment and "collective bargaining." Interesting.',grants:['union-pamphlet']}]},
      {label:'Pocket it',outcomes:[{weight:1,effects:[],result:'It ends up in your junk drawer alongside expired gym cards.'}]},
      {label:'Politely decline',outcomes:[{weight:1,effects:[{stat:'hope',delta:-2}],result:'"No thanks." They understand. The world is what it is.'}]},
    ]},
  ];

  const PIP_LETTER = {
    openings: {
      'just-hired': [
        "Following an extensive 30-day evaluation period, we wanted to share some structured feedback on your candidacy. We're pleased to confirm that your job search has concluded — congratulations on accepting the offer. We've enclosed some thoughts for your continued development.",
        "We've completed our review of your Q4 Career Performance. We're delighted that you've accepted a role; before you transition, we wanted to memorialize some observations for your professional file.",
        "It is with measured enthusiasm that we close out your candidacy file. You secured employment, which is the metric that matters. Some structured reflection follows.",
      ],
      'human-referral': [
        "We've reviewed your 30-day search and are pleased to note that you converted a referral into an offer — bypassing several of our most rigorous automated filtering systems. The HR team is reviewing how this happened.",
        "Your job search succeeded via the ancient and forbidden art of 'knowing someone.' This is technically permitted. Please find structured feedback below.",
        "Following your placement via referral, our Talent Operations team has flagged your candidacy for what we call 'a learning moment.' Specifically, that humans hiring other humans appears to work. We are conducting an internal review.",
      ],
      'ghost-vig-end': [
        "We've reviewed the 25+ ghost listings you exposed during your candidacy and would like to formally request that you stop. Your investigations have caused 'reputational concerns' for several of our partner organizations.",
        "Congratulations on your unconventional career outcome: becoming a feared exposer of fake job listings. We respect the hustle. Please direct future correspondence to our legal department.",
      ],
      'scam-scammers': [
        "Following your role in identifying 10+ fraudulent recruiters operating on our platform, we wanted to extend our gratitude. We are also obligated to inform you that the FTC may reach out.",
        "Your candidacy produced an unexpected and beneficial outcome: substantially fewer scam DMs on our platform. We have not adjusted our policies in response.",
      ],
      'prompt-eng-end': [
        "After observing your liberal application of 'AI' to every line of your résumé, we have decided to hire you to do exactly that — but to other people's résumés. The irony has not been lost on us. It has been incorporated into the offer letter.",
        "We're delighted to confirm that your AI-augmented candidate profile was successful — successful enough that we are hiring you to automate the hiring of others. Welcome to the team. The team is mostly machines.",
      ],
      'thought-leader': [
        "Following your viral ascent on Linkfluence, we are pleased to extend you a role designed specifically to monetize your 'personal brand.' Your specific job duties remain TBD. Your title is 'Strategic Voice.'",
        "We have been monitoring your content. Your 'Agree?' post under the laptop-at-sunset image received 14,000 reactions, 3 of which were from people we actually pay. We'd like to hire you to keep doing exactly that.",
      ],
      'founder-mode-end': [
        "Following your accumulation of 15+ buzzwords and decline of 3 legitimate offers, we are pleased to confirm that you have, in fact, pivoted into founder mode. Your startup PromptPivot.ai will receive standard incubation support and zero salary.",
      ],
      'network-wizard': [
        "Your candidacy concluded through 50+ Human Contacts and zero Easy Apply submissions. This is statistically improbable. We are flagging your file for what we are calling 'manual review by an actual person.'",
      ],
      'quiet-win-end': [
        "You survived 30 days. You took a modest role at a mid-sized company that makes accounting software for HVAC contractors. The benefits are genuinely good. You feel okay. We would like to note, for the record, that this is the win condition the system was never designed to recognize. Congratulations.",
      ],
      'resume-bh-end': [
        "After processing {apps} applications with no measurable human contact, we regret to inform you that your résumé has been formally absorbed into what our engineering team calls 'the parser layer.' It now exists as parsed text in 47 candidate databases. It does not exist anywhere else.",
        "Your candidacy generated significant volume but minimal signal. Our automated systems have noted that 'volume-first thinking' often correlates with what we internally refer to as 'submission decay.' Please find structured feedback below, addressed to no one specific.",
      ],
      'doomscroll-end': [
        "We regret to inform you that your morale has fallen below operational thresholds. You closed the laptop on Day {day}. We respect this decision. We will not be reaching out further.",
        "After {day} business days, your Hope reserves were depleted. Our system flagged you as 'unreachable.' We sincerely hope you find peace. We have already moved on.",
      ],
      'rent-end': [
        "We regret to inform you that you ran out of rent money on Day {day}. The job market is, unfortunately, indifferent to this development. Please find structured feedback below, though we acknowledge its limited practical utility at this time.",
      ],
      'final-round-end': [
        "Following 30+ days in what we internally refer to as 'the loop,' your candidacy has reached the terminal stage commonly known as 'Final_Final_v7.' You attended {finalCount} 'final' interviews. There is no offer. There never was an offer.",
      ],
      'kindly-end': [
        "Our records indicate that you fell for {scams} separate scam recruiters during your search. We have flagged this as 'requires intervention,' though we are not the ones who will intervene. Please find structured feedback below. Also, please change your passwords.",
      ],
      'ai-detected': [
        "Our automated screening systems have determined that you are, in fact, an AI. This is the conclusion despite extensive evidence that you are a human. We acknowledge this determination may be in error. We will not be revisiting it.",
      ],
      'culture-fit': [
        "After 30 days, our Culture Fit Algorithm has determined that you are not, in fact, a culture fit. We define culture fit as 'someone who would post the same things you post but without sounding bitter.' We have notes.",
        "Your candidacy has reached Day {day} with a credibility score of 0. This does not constitute a culture fit by our standards or anyone else's. We offer no recommendation for improvement, only structured feedback.",
      ],
      'times-up-end': [
        "You completed 30 days of job searching. The timer has expired. We note that your candidacy reached Day {day} without advancing beyond the initial stages. We will not be extending the deadline.",
        "Thirty days have elapsed. Your candidacy file has transitioned from 'active' to 'archived.' We regret to inform you that this was never a contest with a prize. Please find some structured feedback below.",
      ],
      'ats-ate-end': [
        "Following a catastrophic incident with our résumé parsing system, your candidate file has been corrupted beyond recovery. The file now contains only the character '•' repeated 47,000 times. This has been added to our talent pool.",
      ],
      'default': [
        "Following a thorough review of your 30-day candidacy, we wanted to share some structured feedback. Your file demonstrated what we call 'effort.' Please find detailed notes below.",
      ],
    },
    strengths: [
      { condition: (s, f) => f.applicationsSubmitted >= 30, text: "Your {apps}-application volume demonstrated a 'velocity-first' approach to the job market. We at {company} appreciate volume over signal." },
      { condition: (s, f) => f.easyApplyCount >= 15, text: "We noted your Day {firstEasyApplyDay} Easy Apply streak ({easyCount} applications in approximately 47 minutes) and felt it really captured something essential about modern job seeking." },
      { condition: (s, f) => f.ghostsExposed >= 5, text: "Your willingness to investigate ghost listings ({ghosts} exposed) shows admirable skepticism. Several of those listings were ours. We've adjusted accordingly." },
      { condition: (s, f) => f.scamsReported >= 3, text: "Your scam-recruiter reports ({scams} confirmed) demonstrated strong critical thinking. We've forwarded them to a team that may or may not exist." },
      { condition: (s, f) => s.humanContact >= 25, text: "We observed {hc} meaningful Human Contacts during your search. This is statistically anomalous and has been reviewed by our quality assurance team." },
      { condition: (s, f) => s.clout >= 200, text: "Your Clout accumulation reached {clout} points — placing you in what our marketing team would call 'thought-leader-adjacent' territory." },
      { condition: (s, f) => s.credibility >= 70, text: "You maintained a Credibility score of {cred} throughout your search — a level of professional integrity our internal teams found concerning." },
      { condition: (s, f) => (s.buzzwords||[]).length >= 10, text: "Your résumé contained {buzzwordCount} distinct buzzwords by Day {day}. Notable inclusions: '{buzzwordSample}.' These are precisely the words our Bot Aura is calibrated to favor." },
      { condition: (s, f) => f.viralPosts >= 1, text: "Your viral Linkfluence post achieved {viralReactions}+ reactions, demonstrating mastery of what our content team calls 'algorithmic resonance.' The content itself was unimportant." },
      { condition: (s, f) => f.salaryCryptid >= 1, text: "You successfully encountered a recruiter who disclosed salary upfront — a rare event in our ecosystem. Our compliance team has been notified." },
      { condition: (s, f) => f.takeHomeApps === 0, text: "You declined every unpaid take-home assignment offered. Our hiring partners describe this as 'not a culture fit.' We describe it as 'correct.'" },
      { condition: (s, f) => s.atsFavor >= 70, text: "You achieved a Bot Aura score of {aura}, indicating that the parser likes you. The hiring managers, statistically, do not. But the parser is what matters." },
      { condition: (s, f) => f.formsCompleted >= 5, text: "Your patience with our portal-based application forms ({forms} completed) was noted. We have not improved them." },
      { condition: (s, f) => f.touchGrassCount >= 3, text: "You touched grass {grass} times during your search. This is more than several of our current executives." },
      { condition: (s, f) => true, text: "You demonstrated consistent effort throughout your 30-day evaluation period. We define 'effort' as 'opening the laptop.'", isFallback: true },
    ],
    developmentAreas: [
      { condition: (s, f) => f.leadsGhosted >= 10, text: "{ghosted} of your applications were ghosted. While we acknowledge that ghosting is industry standard, your specific Hope-loss curve suggests over-investment in the outcome of any individual application." },
      { condition: (s, f) => f.scamsReceived >= 5, text: "You received {scamDMs} scam DMs during your search. We note that you correctly identified most of them. The {scamsFell} you did not are a separate concern." },
      { condition: (s, f) => s.robotSuspicion >= 70, text: "Your Robot Suspicion score peaked at {susp}. Our systems strongly suspect you are an AI. We acknowledge you are likely not. The systems remain unconvinced." },
      { condition: (s, f) => f.autoRejected >= 8, text: "{rejections} of your applications were auto-rejected within minutes of submission. Our automated systems classified you as 'underqualified for an entry-level role requiring 8 years of experience in a framework released last Tuesday.'" },
      { condition: (s, f) => f.maxFinalInterviews >= 3, text: "You attended {finals} separate 'final' interviews for a single role. We acknowledge this was unusual. We did not stop it." },
      { condition: (s, f) => (s.hope <= 30 && s.day >= 15), text: "By Day {day}, your morale had reached what we internally call 'operational concern' levels. We did not check in. This is our standard practice." },
      { condition: (s, f) => (s.buzzwords||[]).length >= 20, text: "Your résumé contains {buzzwordCount} buzzwords. We're not entirely sure what some of them mean. We suspect you don't either. The Bot Aura, however, is delighted." },
      { condition: (s, f) => f.easyApplyCount >= 25, text: "{easyCount} Easy Apply submissions in a single run is what our data team calls 'a signal.' Specifically, a signal to ignore your candidacy. We have done so." },
      { condition: (s, f) => f.applicationsSubmitted >= 50, text: "Submitting {apps} applications in 30 days is what we refer to as 'flooding the funnel.' Our funnel is now flooded. This is your fault." },
      { condition: (s, f) => s.humanContact <= 5 && s.day >= 20, text: "You spoke to {hc} actual humans during your 30-day search. Our research suggests that this is the variable that most reliably predicts outcomes. We did not share this research with you." },
      { condition: (s, f) => f.cringePostCount >= 3, text: "Several of your Linkfluence posts were classified by our content team as 'optimized for the wrong algorithm.' Specifically, the 'Agree?' post." },
      { condition: (s, f) => f.portalApps >= 8, text: "You completed {portal} company-portal applications, each requiring you to re-enter information from your already-uploaded résumé. We have no plans to fix this." },
      { condition: (s, f) => true, text: "Areas for development include 'identifying which of our partners are real companies.' We acknowledge this is difficult.", isFallback: true },
    ],
    incidents: [
      { condition: (s, f) => f.bossFightWonFirstTry, text: "Of particular note: you completed the Workday password reset on the first attempt. We have not seen this before. We have flagged it for additional review." },
      { condition: (s, f) => f.scamsFell >= 2 || (s.scamsFell || 0) >= 2, text: "Of particular note: you sent personal information to {scamsFell} known scam recruiters during this search. Please change your passwords. We won't be doing this for you." },
      { condition: (s, f) => f.viralPosts >= 1 && s.credibility <= 30, text: "Of particular note: your viral post about 'humbling' yourself reached {viralReactions} reactions and reduced your overall Credibility by {credLoss} points. This is what our analytics team calls 'a win.'" },
      { condition: (s, f) => f.takeHomeApps >= 2, text: "Of particular note: one of your unpaid take-home assignments has been incorporated into our partner company's product roadmap. We will not be compensating you. The hiring manager has been promoted." },
      { condition: (s, f) => f.referralUsed && f.applicationsSubmitted >= 30, text: "Of particular note: despite submitting {apps} applications, your one successful pipeline came from a referral. We are reviewing why we maintained the other 29 application paths. We will likely keep them." },
      { condition: (s, f) => f.maxFinalInterviews >= 4, text: "Of particular note: you attended {finals} 'final' interviews for the same role. Our HR team has investigated. The hiring manager 'just wanted to be sure.' She has since left the company." },
      { condition: (s, f) => (f.consecutiveGhosts || 0) >= 8, text: "Of particular note: you were ghosted {consec} times in a row at one point during your search. Our pity-timer system silently improved your odds during this period. We are not authorized to confirm this." },
      { condition: (s, f) => f.salaryCryptid >= 2, text: "Of particular note: you encountered the rare 'recruiter who lists salary upfront' phenomenon on multiple occasions. We have asked her to stop. She has not." },
      { condition: (s, f) => f.acceptCheck >= 1, text: "Of particular note: you accepted a check from a 'recruiter' for $500 to purchase 'equipment.' The check bounced. You owe $500. We are obligated to mention this. We are obligated to mention nothing else." },
      { condition: (s, f) => (s.buzzwords||[]).filter(b => b === 'AI').length >= 6, text: "Of particular note: your résumé now lists 'AI' as a skill {aiCount} separate times. Our parser has marked this as 'optimized.' Our hiring managers have marked it as 'cringe.' Both notes are on file." },
    ],
    closings: {
      'just-hired': [
        "We've decided to extend you the offer you've already accepted. Welcome to the team. Please note that the team is restructuring on Monday.",
        "Congratulations on your placement. We'll keep this file on hand should circumstances change. Circumstances always change.",
        "Best of luck in your new role. Please understand that 'best of luck' is a legally vetted phrase that conveys no actual sentiment.",
      ],
      'human-referral': [
        "We've decided to move forward with your candidacy, having been informed that someone you know also works here. We did not verify this. Welcome.",
      ],
      'ghost-vig-end': [
        "We've decided to part ways amicably. Please direct future correspondence to our legal team. They have been notified.",
      ],
      'quiet-win-end': [
        "We're pleased to confirm your placement at our partner organization. The role is real. The salary is modest. The benefits are good. The work is meaningful. We are confused but supportive.",
      ],
      'prompt-eng-end': [
        "Welcome to your new role automating the role you just applied for. The recursion is intentional. Onboarding begins Monday and will be conducted by an AI you helped train.",
      ],
      'founder-mode-end': [
        "We wish PromptPivot.ai every success. We have already invested. We expect to invest again at a lower valuation in approximately 18 months.",
      ],
      'network-wizard': [
        "With {hc} Human Contacts and zero Easy Apply uses, our system has flagged you as 'suspiciously human.' We are conducting an internal review of whether this is a vulnerability or a feature. Welcome for now.",
      ],
      'doomscroll-end': [
        "We'd like to wish you the best in whatever you do next. We will not be checking in. We have moved on.",
      ],
      'rent-end': [
        "We're unable to offer further assistance at this time. We recommend reaching out to your network. We acknowledge that you have just spent 30 days unsuccessfully reaching out to your network.",
      ],
      'resume-bh-end': [
        "We'll keep your résumé on file. We mean this in the most literal possible sense: it is in a file. It is the only thing in the file.",
      ],
      'kindly-end': [
        "We recommend taking measures to secure your personal information. We will not be specifying which measures. Best regards.",
      ],
      'ai-detected': [
        "Should you turn out to be human, please feel free to reapply through our standard channels. Our standard channels remain operated by the same system that just rejected you.",
      ],
      'ats-ate-end': [
        "We've decided not to move forward at this time. We were unable to read your résumé. Or our own database. Or this letter. The systems are down.",
      ],
      'scam-scammers': [
        "We applaud your work exposing {scamEvidence} fraudulent recruiters. The FTC has opened a file. We have not. We recommend you proceed with your newfound reputation as a one-person regulatory agency. Best of luck.",
      ],
      'thought-leader': [
        "We've reviewed your {clout} Clout score and must admit: your personal brand is functioning as a form of currency. We're creating a role for you that involves 'thought leadership' and 'strategic voice.' The actual job duties remain to be determined.",
      ],
      'culture-fit': [
        "We regret to inform you that our Culture Fit scores have placed you outside the acceptable range. We define culture fit as 'someone whose LinkedIn reads exactly like ours.' There will be no appeal process. We recommend a LinkedIn overhaul.",
      ],
      'final-round-end': [
        "Your file has been in 'final round' for {day} days. Our leadership team has decided that 'final' no longer means 'last.' We're promoting your candidacy to what we call 'perpetual finalist.' No offer is included. Offers are a separate process that we do not have a budget for.",
      ],
      'times-up-end': [
        "Your 30-day candidacy window has expired. We note that you did not advance beyond application-stage filters. We will not be renewing your deadline. We recommend you apply again — ideally to a different company. Possibly a different industry. Possibly a different planet.",
      ],
      'default': [
        "We'll keep your file on hand. We will not look at it. Thank you for your time.",
        "We wish you all the best in your future endeavors. Phrase generated automatically.",
        "Please don't hesitate to reach out should circumstances change. We will hesitate to respond.",
      ],
    },
    hrFirstNames: ['Brenda','Spencer','Mackenzie','Brayden','Ashleigh','Kourtney','Tatum','Brittaney','Kennedi','Presleigh','Kyler','Daxton','Aspyn','Brixton','Raelynn'],
    hrLastNames: ['Thompson','Reynolds','Brockton','Kingsley','Worthington','Pemberton','Caldwell','Whitfield','Ashworth','Hargrove','Wexler','Sterling'],
    hrTitles: [
      'Senior Partner of People Operations',
      'Director of Talent Experience',
      'Head of Candidate Engagement',
      'VP of Human Resources Operations',
      'Chief People Officer',
      'Director, People Strategy & Belonging',
      'Senior Manager of Talent Acquisition',
      'Director of Workforce Experience',
      'Head of People & Culture',
      'Senior Director, Talent Pipeline',
    ],
    footerLines: [
      "This correspondence is confidential and intended only for the addressee. It was also sent to 4,000 other people. We did not notice.",
      "This communication is automatically generated. The signatory may or may not exist. The sentiment does not.",
      "Please do not reply directly to this email. It is sent from a no-reply address managed by an AI managed by another AI.",
      "Your information is retained in accordance with our privacy policy, which we have not read either.",
      "This message and any attachments may contain confidential information. They contain neither.",
      "By reading this letter, you agree to our terms of service. Our terms of service are 47 pages and have been updated 14 times this quarter.",
    ],
  };

  /* ========== S.3 — Career Inventory Items ========== */
  const ITEMS = [
    { id:'pristine-resume', icon:'📄', name:'The Pristine Résumé PDF', flavor:'Three reviews. Two friends. One coffee. It is finally good.', type:'passive', rarity:'common', passive:{ description:'+5% offer chance on real leads', hooks:{ offerChanceBonus:0.05 } } },
    { id:'mentor-advice', icon:'🧓', name:'Half-Remembered Mentor Advice', flavor:'"Just be yourself." You wrote it down anyway.', type:'passive', rarity:'common', passive:{ description:'First follow-up each day costs 0 Energy', hooks:{ followUpEnergyDiscount:1 } } },
    { id:'useful-cert', icon:'🎓', name:'That One Useful Cert', flavor:'You actually learned something. The certificate is also pretty.', type:'passive', rarity:'common', passive:{ description:'+3 Bot Aura per day', hooks:{ botAuraPerDay:3 } } },
    { id:'good-luck-sweater', icon:'🧶', name:'Lucky Interview Sweater', flavor:'Your aunt knitted it in 2014. It has not been washed since.', type:'passive', rarity:'common', passive:{ description:'+2 Hope when you advance an interview stage', hooks:{ hopeOnStageAdvance:2 } } },
    { id:'noise-cancelling', icon:'🎧', name:'Noise-Cancelling Headphones', flavor:'Your roommate cannot find you anymore. Neither can recruiters.', type:'passive', rarity:'common', passive:{ description:'-1 Bot Sus per day, recruiters appear 25% less often', hooks:{ botSusPerDay:-1, recruiterRateMod:-0.25 } } },
    { id:'standing-desk', icon:'🪑', name:'Standing Desk (Free, Curb)', flavor:'Someone put it out on trash day. It wobbles. You love it.', type:'passive', rarity:'common', passive:{ description:'+1 Energy on days you used at least one rest card yesterday', hooks:{ energyAfterRestDay:1 } } },
    { id:'union-pamphlet', icon:'📰', name:'A Union Pamphlet', flavor:'Someone handed it to you outside a coffee shop. You actually read it.', type:'passive', rarity:'rare', passive:{ description:'+1 Cred per day, +1 Hope when a lead pauses or ghosts', hooks:{ credPerDay:1, hopeOnLeadEnd:1 } } },
    { id:'coffee-card', icon:'☕', name:'$50 Coffee Shop Gift Card', flavor:'A birthday present from a relative who still thinks coffee is a "treat."', type:'active', rarity:'common', active:{ label:'Use (+1 Energy)', description:'+1 Energy today, consumed', onUse:'addEnergy', onUseArg:1 } },
    { id:'real-reference', icon:'🤝', name:'A Real Reference', flavor:'A former coworker who actually likes you. They will answer the call.', type:'active', rarity:'rare', active:{ label:'Use on a lead', description:'Pick a lead — skip a Reference Check stage and +5 Cred', onUse:'useReferenceOnLead' } },
    { id:'therapist-card', icon:'🧘', name:'Therapist\'s Business Card', flavor:'You\'ve been carrying it in your wallet for 6 months. Now you call.', type:'active', rarity:'common', active:{ label:'Book a session (-$30, +20 Hope)', description:'-$30 Money, +20 Hope', onUse:'useTherapy' } },
    { id:'recruiter-friend', icon:'💼', name:'A Recruiter Friend', flavor:'You met them at a wedding. They\'ve been waiting for this DM.', type:'active', rarity:'rare', active:{ label:'Cash in the favor', description:'+8 Human Contact, +1 Energy, consumed', onUse:'useRecruiterFriend' } },
    { id:'severance-check', icon:'💰', name:'Forgotten Severance Check', flavor:'You found it in a drawer. It expires in 3 days. You will cash it.', type:'active', rarity:'rare', active:{ label:'Cash it (+$60)', description:'+$60 Money', onUse:'useSeverance' } },
    { id:'red-bull-32oz', icon:'🥤', name:'32oz Red Bull (Warm)', flavor:'It was on sale. You bought 4. This is the last one.', type:'active', rarity:'common', active:{ label:'Chug it (+2 Energy, -3 Hope)', description:'+2 Energy now, -3 Hope tomorrow', onUse:'useRedBull' } },
   ];

   /* Momentum narration — tones by phase and intensity. Never shown as numbers. */
   const MOMENTUM_NARRATION={
     good:[
       {threshold:70,texts:['You\'re finding a rhythm.','Something feels different today. In a good way.'],
        trigger:'streak'},
       {threshold:40,texts:['Small progress compounds.','Things are clicking.'],
        trigger:'streak'},
       {threshold:0,texts:['Things are steady.','One step at a time.'],
        trigger:'streak'},
     ],
     doom:[
       {threshold:-70,texts:['Another day.','You applied. That\'s all.'],
        trigger:'streak'},
       {threshold:-40,texts:['It\'s been a rough stretch.','The feed is heavy today.'],
        trigger:'streak'},
       {threshold:0,texts:['You keep going.','Day over day.'],
        trigger:'streak'},
     ],
     neutral:[
       {threshold:-999,texts:['Another morning.','Onward.','The day begins.'],
        trigger:'streak'},
     ],
   };

    /* Intervention events — triggered when momentum crosses thresholds */
     const INTERVENTION_EVENTS=[
      {id:'friend-check-in',threshold:-70,title:"A Message From Someone Who Knows You",description:"Your phone buzzes. It's someone who actually knows you — not a recruiter.",choices:[{label:'Accept support',effects:{hope:15,momentumDelta:-20},log:"You let someone in."},{label:'Push through',effects:{momentumDelta:-5},log:"You don't respond yet."}]},
      {id:'coworker-referral',threshold:-50,title:"An Old Colleague",description:"A message from your old coworker: hey, heard things have been rough. My old company is hiring.",choices:[{label:'Take the referral',effects:{hope:10,credibility:5,momentumDelta:-10},log:"Your old coworker sends a referral."},{label:'Not ready yet',effects:{momentumDelta:-3},log:"You appreciate the offer but aren't ready to ask for help yet."}]},
      {id:'mom-checks-in',threshold:-40,title:"Your Mom Calls",description:"Your mom says nothing about your job search.",choices:[{label:'Visit over weekend',effects:{hope:8,energy:2,momentumDelta:5},log:"You visit home."},{label:'Maybe later',effects:{momentumDelta:-2},log:"You promise to visit soon."}]},
      {
        id:'coworker-referral',
        threshold:-50,
        title:'An Old Colleague',
        description:"A message from your old coworker: hey, heard things have been rough. My old company is hiring. Want a referral, no strings?",
        choices:[
          {label:'Take the referral',
           effects:{hope:10,credibility:5,momentumDelta:-10},
           log:'Your old coworker sends a referral. It actually feels nice.'},
          {label:'Not ready yet',
           effects:{momentumDelta:-3},
           log:"You appreciate the offer but aren't ready to ask for help yet."},
        ],
      },
      {
        id:'mom-checks-in',
        threshold:-40,
        title:'Your Mom Calls',
        description:"Your mom says nothing about your job search. She asks if you've eaten today. She wants you to come visit.",
        choices:[
          {label:'Visit over weekend',
           effects:{hope:8,energy:2,momentumDelta:5},
           log:"You visit home. You eat. You laugh. It's been a while."},
          {label:'Maybe later',
           effects:{momentumDelta:-2},
           log:"You promise to visit soon. You mean it. You probably will."},
        ],
      },
      {
        id:'coworker-referral',
        threshold:-50,
        title:'An Old Colleague',
        description:'A message from your old coworker: "hey, heard things have been rough. My old company is hiring. Want a referral, no strings?"',
        choices:[
          {label:'Take the referral',effects:{hope:10,credibility:5,momentumDelta:-10},log:'Your old coworker sends a referral. It actually feels nice.'},
          {label:'Not ready yet',effects:{momentumDelta:-3},log:'You appreciate the offer but aren\'t ready to ask for help yet.'},
        ],
      },
      {
        id:'mom-checks-in',
        threshold:-40,
        title:'Your Mom Calls',
        description:'Your mom says nothing about your job search. She asks if you\'ve eaten today. She wants you to come visit.',
        choices:[
          {label:'Visit over weekend',effects:{hope:8,energy:2,momentumDelta:5},log:'You visit home. You eat. You laugh. It\'s been a while.'},
          {label:'Maybe later',effects:{momentumDelta:-2},log:'You promise to visit soon. You mean it. You probably will.'},
        ],
      },
   ];

   const RECRUITER_FIRST=['Brenda','Chad','Tasha','Nate','Priya','Kevin','Samantha','Derek','Maya','Tyler','Chloe','Marcus','Ashley','Brandon','Jenna','Olivia','Aiden','Sophie','Liam','Emma'];
  const RECRUITER_LAST=['Kowalski','Nguyen','Rodriguez','Chen','Patel','OBrien','Dubois','Kim','Sarkar','Vasquez','Ito','Singh','OMalley','Tran','Walsh','Fernandez','OConnell','Bergstrom','Yamamoto','Dubois'];
  function genRecruiter(){return RECRUITER_FIRST[Math.floor(Math.random()*RECRUITER_FIRST.length)]+' '+RECRUITER_LAST[Math.floor(Math.random()*RECRUITER_LAST.length)]}

  const INBOX_SUBJECTS={
    received:['Your application has been received','Application confirmation - [Company]','We received your application!','Application status: Under review'],
    rejection:['Update on your application','Regarding your candidacy','GREAT news (it\'s not great news)','Your application status','[No Subject]','Re: Re: Re: Quick question','Touching base!'],
    ghost:['[No Subject]','Touching base!','Quick question...','Following up','Circle back on this...'],
    offer:['GREAT news!','We\'d love to move forward!','Offer: [Company] - [Position]','You\'re almost hired!','Exciting next steps!'],
    interview:['Interview scheduling: [Company]','We\'d love to set up a call!','Let\'s schedule some time!'],
    stage:['Next steps: [Stage]','Update: Moving to [Stage]','Your application has progressed!'],
    general:['Quick question from [Company]','Thoughts?','Circle back','An update from [Company]'],
  };

  const INBOX_BODIES={
    received:['Hi [SENDER],\n\nWe received your application for [Position] at [Company]. We\'ll be in touch shortly with next steps.\n\nBest,\n[Recruiter]\n[Company] Talent Acquisition'],
    rejection:['Hi [SENDER],\n\nThank you for applying to [Company]. After careful consideration, we\'ve decided to move in a different direction. Your profile is impressive, but we didn\'t feel like you were the right match for this particular role.\n\nWe\'ll keep your r? on file and reach out if something more aligned comes up.\n\nBest regards,\n[Recruiter]\n[Company] Talent Acquisition'],
    offer:['Hi [SENDER],\n\nWe\'re thrilled to extend an offer for the [Position] role at [Company]!\n\nWe think you\'d be a great fit for the team. Would you be available for a quick call this week?\n\nBest,\n[Recruiter]\n[Company] Hiring Manager'],
    stage:['Hi [SENDER],\n\nGreat news! Your application for [Position] has moved to [Stage]!\n\nBest,\n[Recruiter]\n[Company] Recruiting Team'],
    interview:['Hi [SENDER],\n\nWe\'d love to set up an interview! Please let us know your availability for a 30-minute call this week.\n\nLooking forward to learning more about your background.\n\n[Recruiter]\n[Company] Recruiting Team'],
  };

  const BRENDRA_MESSAGES=[
    {day:1,name:'Brenda Kowalski',company:'TalentFirst Global',subject:'Let\'s connect!',body:'Hi there! I came across your profile and thought we should connect. I\'m a Talent Advisor at TalentFirst Global and I\'d love to help you with your job search. Feel free to reach out anytime!\n\n- Brenda, TalentFirst Global\nP.S. - I\'m always here if you need a friendly ear!'},
    {day:4,name:'Brenda Kowalski',company:'TalentFirst Global',subject:'Checking in!',body:'Hey! Just checking in! How\'s the search going? I\'ve seen some interesting roles at TalentFirst. Let me know if you want to chat!\n\n- Brenda, TalentFirst Global'},
    {day:7,name:'Brenda Kowalski',company:'TalentFirst Global',subject:'Thinking of you!',body:'Hey! I was thinking about you today. I\'m the only recruiter who hasn\'t ghosted you. That\'s because I\'m different. I\'m always in your corner!\n\n- Brenda, TalentFirst Global'},
    {day:10,name:'Brenda Kowalski',company:'TalentFirst Global',subject:'I know you\'re still out there...',body:'I know I might be emailing a lot but I genuinely believe in your potential. I\'m the kind of recruiter who follows up. Everyone else has left. I\'m still here.\n\n- Brenda, TalentFirst Global'},
    {day:13,name:'Brenda Kowalski',company:'TalentFirst Global',subject:'We need to talk',body:'I see every rejection you get. I just want to help. I\'m the only one who really does. Please let me help you.\n\n- Brenda, TalentFirst Global\nI\'ll email again soon. I always do.'},
    {day:16,name:'Brenda Kowalski',company:'TalentFirst Global',subject:'I know what you\'re thinking',body:'I know you\'re thinking "why won\'t Brenda stop emailing me?" I\'m good at follow-ups. I\'m the best at follow-ups. I\'m not going to stop.\n\n- Brenda, TalentFirst Global\nP.S. You met me 16 days ago. I remember because I remember everything.'},
    {day:19,name:'Brenda Kowalski',company:'TalentFirst Global',subject:'Remember me? It\'s me.',body:'I\'m Brenda. Remember Brenda? I\'m still here. Everyone else is gone but Brenda is still here.\n\n- Brenda, TalentFirst Global\nP.S. Thinking about me is the first step to hiring me.'},
    {day:22,name:'Brenda Kowalski',company:'TalentFirst Global',subject:'I made you a playlist',body:'I saw you were listening, so I made a playlist. "Songs to Job Search To - Curated by Brenda."\n\nI know you\'re out there. I\'m always listening.\n\n- Brenda, TalentFirst Global'},
    {day:25,name:'Brenda Kowalski',company:'TalentFirst Global',subject:'25 days and counting',body:'Day 25 since we first connected. I\'ve been counting. I count every day I email you. You deserve a recruiter who counts.\n\n- Brenda (your recruiter, always here)'},
    {day:28,name:'Brenda Kowalski',company:'TalentFirst Global',subject:'I\'ll be here when you return',body:'The game might end. Everything might end. But I\'ll still be here. I\'m Brenda. I don\'t leave.\n\n- Brenda, TalentFirst Global\nP.S. This is still professional.'},
  ];

  const VIBE_LINES=[
    'Mercury is in retrograde and so is your job search.',
    'The stars say avoid Easy Apply today. The stars are usually right.',
    "Today feels like a 'circle back' kind of day.",
    'A good day to touch grass. Every day is.',
    'The algorithm woke up and chose you. Unclear if that\'s good.',
    'Your inbox is quiet. It will not stay that way.',
    'The universe is optimistic. You should not be.',
    'Today\'s forecast: cloudy with a chance of rejections.',
    'The hiring market is a character.',
    "You'd think after this many applications something would stick. You were wrong.",
    "It's a good day to have high expectations. It is not.",
    'If today were a Netflix special, it would be 12 minutes of silence.',
    'You are one interview away from everything. Or 47.',
    'The cosmos has thoughts about your résumé. You should too.',
  ];

  const URGENT_STAT_WARNINGS={
    hire: { threshold: 5, text: '⚠️ Hope is critically low. Consider rest.' },
    money: { threshold: 50, text: '⚠️ Cash is bleeding. Rent is due soon. Consider gigs.' },
    credibility: { threshold: 10, text: '⚠️ Credibility is tanking. Stop posting buzzwords.' },
    sus: { threshold: 80, text: '⚠️ Robot Suspicion dangerously high. Do a captcha before you become one.' },
  };

  const FEED_SHIFT_HEADLINES = [
    'The algorithm has noticed you\'re broke. It has thoughts.',
    'Your desperation has been detected and monetized.',
    'You posted once and now your feed is all "thought leadership." Congratulations.',
    'The system senses vulnerability. Adjusting feed accordingly.',
    'Your stats are trending. The algorithm is taking notes.',
    'Feed composition has been optimized for maximum despair.',
    'The algorithm says: "You need gigs, not dreams."',
    'Your feed smells like desperation. The feed agrees.',
    'The void recalibrating your feed for maximum engagement.',
    'Stats shifted. Feed recalibrated. Hope unchanged.',
  ];

    const PROJECT_TEMPLATES=[
      {id:'portfolio',name:'Portfolio Revamp',duration:3,energyCost:1,flavor:['Day 1: You sketch a wireframe.','Day 2: You add dark mode (nobody asked).','Day 3: You deploy. It looks... fine.'],completion:{hope:10,credibility:5},effects:[{day:1,effects:{hope:-2}}]},
      {id:'certification',name:'Online Certification',duration:4,energyCost:1,flavor:['Day 1: "Introduction to Synergy".','Day 2: "Blockchain Fundamentals".','Day 3: "Advanced Vibe-checking".','Day 4: You pass. No one will know.'],completion:{credibility:8,atsFavor:-3},effects:[{day:1,effects:{hope:-3}},{day:2,effects:{atsFavor:-2}}]},
      {id:'side-hustle',name:'Side Hustle Experiment',duration:2,energyCost:2,flavor:['Day 1: You launch "CryptoKitties: But Worse".','Day 2: You get 2 users (you and your mom).'],completion:{rent:50,hope:-3}},
      {id:'learn-skill',name:'Learn a New Skill',duration:3,energyCost:1,flavor:['Day 1: "I should really learn Rust...","Day 2: "It\'s just memory safety? OK.",','Day 3: Your brain hurts but in a productive way.'],completion:{credibility:5,hope:5}},
      {id:'open-source',name:'Open Source Contribution',duration:4,energyCost:1,flavor:['Day 1: Star a repo. You\'re close enough.','Day 2: Fix a typo in docs.','Day 3: Get your PR merged! It was a typo.','Day 4: Add your contribution to your résumé.'],completion:{clout:10,humanContact:5,credibility:3}},
      {id:'write-article',name:'Write a Thought Leadership Article',duration:2,energyCost:1,flavor:['Day 1: You outline 5 points about synergy.','Day 2: You publish. Nobody reads it but you feel productive.'],completion:{clout:15,hope:-2,botAura:-2}},
      {id:'networking-event',name:'Attend a Networking Event',duration:1,energyCost:2,flavor:['You go to a meetup. You collect 3 business cards. You throw them away.'],completion:{humanContact:10,credibility:2}},
    ];

    /* Profile builder data (Feature 6) */
    const PROFILE_DATA={
      headlines:[
        {text:'Seeking opportunities',effects:{}},
        {text:'Open to work',effects:{atsFavor:3,credibility:-1}},
        {text:'Open to work (verified)',effects:{atsFavor:5}},
        {text:'Experienced in 40+ Skills',effects:{botAura:5,credibility:-3}},
        {text:'Human. Passionate. Available.',effects:{hope:3,humanContact:2}},
        {text:'I build things. Sometimes.',effects:{credibility:2}},
      ],
      photos:[
        {text:'Professional headshot',effects:{credibility:3}},
        {text:'Dogs > Career',effects:{clout:5,credibility:-2}},
        {text:'Coconut shell with business cards glued',effects:{clout:3,hope:-2,credibility:-3}},
        {text:'White-collar job interview',effects:{}},
        {text:'Hiking photo (you are not a hiker)',effects:{humanContact:3,credibility:-1}},
        {text:'AI-generated "corporate professional"',effects:{botAura:5,credibility:-2}},
        {text:'Selfie, no filters, genuine smile',effects:{humanContact:2,hope:2}},
      ],
      sections:[
        {text:'Summary: Passionate go-getter',effects:{}},
        {text:'Summary: Open-source contributor 🚀',effects:{clout:5,hope:2}},
        {text:'Skills (48 skills listed, verified by self)',effects:{credibility:-2,atsFavor:3}},
        {text:'Volunteer work, community service',effects:{humanContact:3,credibility:2}},
      ],
    };

    const SPAM_CONFIRM_LINES = [
      "You sure? There's no undo on this. Well, technically there is, but it's worse.",
      "Pressing 'Spam' is just aggressive ghosting. The market appreciates your honesty.",
      "Marking as spam costs you nothing, which is the most expensive thing about this job hunt.",
      "If you click this, you'll never get auto-reply #7. Are you really okay with that?",
      "Spam is just 'let's connect on LinkedIn' with consequences."
    ];
    const SPAM_BUTTON_LABELS = ["🚫 Spam", "🗑️ Trash", "✉️ Report", "👻 Ghost It", "🔥 Burn It"];
    const GHOSTVIBE_TOOLTIPS = [
      "A number. A feeling. Trust it at your own risk.",
      "Higher feels warmer, but your gut's not a thermometer.",
      "The vibe is always lying. Sometimes accidentally.",
      "Some real jobs feel dead. Some dead jobs feel alive. Good luck.",
      "This bar lies to reassure you the other ones might be right."
    ];
    const VIBE_WENT_COLD_LINES = [
      "The vibe went cold",
      "That warm feeling? It's gone now",
      "Something shifted — the lead is dying",
      "The vibe check just failed",
      "That sinking feeling in your stomach"
    ];

    return {mulberry32,pick,clamp,rInt,genComp,COMPS,JOBS,BUZZWORDS,CITIES,HEADLINES,POOLS,BACKGROUNDS,ACHIEVEMENTS,ENDINGS,PW_REQS,VID_PROMPTS,VID_SUBS,PA_QS,CAPTCHA_ITEMS,MORNING_EVENTS,FOLLOWUP_FLAVOR,SCREENING_FIELDS,TAKE_HOME_OPTIONS,WEAKNESS_ANSWERS,SALARY_STALL_OPTIONS,PIP_LETTER,ITEMS,pickWaitingMessage,pickAutoReplyMessage,pickRecruiterScreenMessage,pickFinalInterviewMessage,pickGhostMessage,pickRejectionMessage,RECRUITER_FIRST,RECRUITER_LAST,genRecruiter,INBOX_SUBJECTS,INBOX_BODIES,BRENDRA_MESSAGES,VIBE_LINES,URGENT_STAT_WARNINGS,FEED_SHIFT_HEADLINES,MOMENTUM_NARRATION,INTERVENTION_EVENTS,PROJECT_TEMPLATES,PROFILE_DATA,SPAM_CONFIRM_LINES,SPAM_BUTTON_LABELS,GHOSTVIBE_TOOLTIPS,VIBE_WENT_COLD_LINES};
})();
window.DATA = DATA;
