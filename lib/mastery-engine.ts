export type MasteryAttempt={skill:string;domain:string;correct:boolean;hintUsed:boolean;confidence:"Unsure"|"Okay"|"Confident";responseSeconds?:number;difficulty?:string;answeredAt?:string;context?:string};
export type MasteryProfile={score:number;attempts:number;accuracy:number;independence:number;confidenceCalibration:number;pace:number;retention:number;status:"Starting"|"Developing"|"Secure"|"Mastered";updatedAt:string};

const difficultyWeight=(difficulty="")=>difficulty==="Challenge"?1.18:difficulty==="Medium"?1.08:difficulty==="Foundations"?0.94:1;
const recencyWeight=(date?:string)=>{if(!date)return 1;const days=Math.max(0,(Date.now()-new Date(date).getTime())/86_400_000);return Math.max(.55,Math.exp(-days/45))};

export function calculateMastery(attempts:MasteryAttempt[]):MasteryProfile{
  if(!attempts.length)return{score:0,attempts:0,accuracy:0,independence:0,confidenceCalibration:0,pace:0,retention:0,status:"Starting",updatedAt:new Date().toISOString()};
  let earned=0,possible=0,independent=0,calibrated=0,paceTotal=0,paceCount=0,recentCorrect=0,recentTotal=0;
  attempts.forEach(attempt=>{const weight=difficultyWeight(attempt.difficulty)*recencyWeight(attempt.answeredAt);possible+=weight;earned+=(attempt.correct?1:0)*weight;independent+=attempt.hintUsed?0:1;calibrated+=(attempt.confidence==="Confident")===attempt.correct?1:attempt.confidence==="Okay"?0.65:0.35;if(attempt.responseSeconds){paceTotal+=Math.max(0,Math.min(1,120/attempt.responseSeconds));paceCount++}if(recencyWeight(attempt.answeredAt)>.8){recentTotal++;recentCorrect+=attempt.correct?1:0}});
  const accuracy=Math.round(earned/possible*100),independence=Math.round(independent/attempts.length*100),confidenceCalibration=Math.round(calibrated/attempts.length*100),pace=Math.round((paceCount?paceTotal/paceCount:.65)*100),retention=Math.round((recentTotal?recentCorrect/recentTotal:earned/possible)*100);
  const score=Math.round(accuracy*.55+independence*.12+confidenceCalibration*.1+pace*.08+retention*.15),status=score>=88&&attempts.length>=8?"Mastered":score>=74&&attempts.length>=5?"Secure":score>=45?"Developing":"Starting";
  return{score,attempts:attempts.length,accuracy,independence,confidenceCalibration,pace,retention,status,updatedAt:new Date().toISOString()};
}

export function buildMasteryProfiles(attempts:MasteryAttempt[]){
  return Object.fromEntries(Array.from(new Set(attempts.map(item=>item.skill))).map(skill=>[skill,calculateMastery(attempts.filter(item=>item.skill===skill))]));
}
