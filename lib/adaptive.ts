export type AdaptiveAttempt={domain:string;skill:string;correct:boolean;hintUsed:boolean;confidence:"Unsure"|"Okay"|"Confident";answeredAt?:string;responseSeconds?:number};
export type AdaptiveRecommendation={domain:string;skill:string;difficulty:"Foundations"|"Medium"|"Challenge";reason:string;accuracy:number;attempts:number};

const domains=["Algebra","Advanced Math","Problem Solving & Data","Geometry & Trig"];
export function recommendPractice(attempts:AdaptiveAttempt[]):AdaptiveRecommendation{
  if(!attempts.length)return{domain:"Advanced Math",skill:"Functions and factoring",difficulty:"Foundations",reason:"A balanced starting point before Orbit has enough history",accuracy:0,attempts:0};
  const recent=attempts.slice(0,80),groups=new Map<string,{domain:string;skill:string;points:number;correct:number;attempts:number;hints:number;unsure:number;slow:number}>();
  recent.forEach((attempt,index)=>{const key=`${attempt.domain}|${attempt.skill}`,current=groups.get(key)||{domain:attempt.domain,skill:attempt.skill,points:0,correct:0,attempts:0,hints:0,unsure:0,slow:0};const recency=Math.max(.35,1-index/recent.length*.65);current.points+=recency*(attempt.correct?1:0);current.correct+=attempt.correct?1:0;current.attempts++;current.hints+=attempt.hintUsed?1:0;current.unsure+=attempt.confidence==="Unsure"?1:0;current.slow+=(attempt.responseSeconds||0)>90?1:0;groups.set(key,current)});
  const ranked=Array.from(groups.values()).map(group=>{const accuracy=group.correct/group.attempts;const support=(group.hints+group.unsure)/group.attempts;const pace=group.slow/group.attempts;const uncertainty=(1-accuracy)*.64+support*.18+pace*.08+Math.max(0,4-group.attempts)/4*.1;return{...group,accuracy,uncertainty}}).sort((a,b)=>b.uncertainty-a.uncertainty);
  const focus=ranked[0],accuracy=Math.round(focus.accuracy*100),difficulty=focus.attempts<3||accuracy<55?"Foundations":accuracy>=85&&focus.attempts>=5?"Challenge":"Medium";
  const signals=[focus.hints?`${focus.hints} hint-assisted`:"",focus.unsure?`${focus.unsure} low-confidence`:"",focus.slow?`${focus.slow} slow-paced`:""].filter(Boolean).join(", ");
  return{domain:domains.includes(focus.domain)?focus.domain:"Advanced Math",skill:focus.skill,difficulty,reason:`Highest-value recent skill: ${accuracy}% accuracy across ${focus.attempts} attempt${focus.attempts===1?"":"s"}${signals?` · ${signals}`:""}`,accuracy,attempts:focus.attempts};
}
