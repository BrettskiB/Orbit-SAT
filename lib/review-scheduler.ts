export type ReviewState={id:string;missedAt:string;reviewStage?:number;nextReviewAt?:string;lastReviewedAt?:string};

const DAY=86_400_000;
const intervals=[1,3,7,14];

export function isReviewDue(item:ReviewState,now=Date.now()){
  return !item.nextReviewAt||new Date(item.nextReviewAt).getTime()<=now;
}

export function dueReviewItems<T extends ReviewState>(items:T[],now=Date.now()){
  return items.filter(item=>isReviewDue(item,now)).sort((a,b)=>new Date(a.nextReviewAt||a.missedAt).getTime()-new Date(b.nextReviewAt||b.missedAt).getTime());
}

export function scheduleReviewMiss<T extends ReviewState>(item:T,now=Date.now()):T{
  return{...item,reviewStage:0,nextReviewAt:new Date(now).toISOString()};
}

export function scheduleReviewSuccess<T extends ReviewState>(item:T,now=Date.now()):T|null{
  const nextStage=(item.reviewStage||0)+1;
  if(nextStage>intervals.length)return null;
  return{...item,reviewStage:nextStage,lastReviewedAt:new Date(now).toISOString(),nextReviewAt:new Date(now+intervals[nextStage-1]*DAY).toISOString()};
}

export function nextReviewLabel(item:ReviewState,now=Date.now()){
  if(isReviewDue(item,now))return"Due now";
  const days=Math.max(1,Math.ceil((new Date(item.nextReviewAt!).getTime()-now)/DAY));
  return days===1?"Tomorrow":`In ${days} days`;
}

export function updateReviewQueue<T extends ReviewState>(existing:T[],misses:T[],reviewedIds:string[],now=Date.now()){
  const reviewed=new Set(reviewedIds),missedById=new Map(misses.map(item=>[item.id,item]));
  const next:T[]=[];
  existing.forEach(item=>{
    const missed=missedById.get(item.id);
    if(missed){next.push(scheduleReviewMiss({...item,...missed},now));missedById.delete(item.id);return}
    if(reviewed.has(item.id)){const scheduled=scheduleReviewSuccess(item,now);if(scheduled)next.push(scheduled);return}
    next.push(item);
  });
  missedById.forEach(item=>next.push(scheduleReviewMiss(item,now)));
  return next;
}
