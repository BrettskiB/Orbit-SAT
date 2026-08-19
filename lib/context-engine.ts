export type ContextQuestion={prompt:string;explain:string;templateId?:string;params?:Record<string,number|string>;context?:string};

const has=(interests:string[],...terms:string[])=>terms.some(term=>interests.some(item=>item.toLowerCase().includes(term)));

export function contextualizeQuestion<T extends ContextQuestion>(question:T,interests:string[],position=0):T{
  if(!interests.length||position%10>=7)return question;
  const p=question.params||{},id=question.templateId||"";
  if(id==="data.percent.change"&&has(interests,"finance","investing","stocks","business"))return{...question,context:"Investing & stocks",prompt:`A stock priced at $${p.original} increases by ${p.percent}%. What is its new price?`,explain:`A percentage return uses the same percent-change structure tested on the SAT. ${p.percent}% of ${p.original} is ${p.increase}; add it to the original price.`};
  if(id==="data.mean"&&has(interests,"sports","basketball","football","tennis","baseball"))return{...question,context:"Sports analytics",prompt:`An athlete records ${String(p.values).replaceAll(",",", ")} points across three drills. What is the mean?`,explain:`Sports analysts calculate the mean the same way: the values total ${Number(p.middle)*3}; divide by 3 to get ${p.middle}.`};
  if(id==="data.ratio.scale"&&has(interests,"gaming","minecraft","fortnite","strategy"))return{...question,context:"Gaming & resources",prompt:`A crafting recipe uses red and blue resources in a ${p.a}:${p.b} ratio. If you have ${p.known} red resources, how many blue resources are required?`};
  if(id==="alg.linear.one-step"&&has(interests,"finance","accounting","business","real estate"))return{...question,context:"Business operations",prompt:`A business pays a fixed $${p.b} fee plus $${p.a} per unit. Its total is $${p.c}. How many units, x, were purchased?`,explain:`This real cost model is ${p.a}x + ${p.b} = ${p.c}. Subtract ${p.b}, then divide by ${p.a}, giving x = ${p.x}.`};
  if(id==="advanced.function.evaluate"&&has(interests,"computer science","gaming","engineering"))return{...question,context:"Computer science",prompt:`A program models an output with f(x) = ${p.a}x² − ${p.b}. What output does it return for input ${p.x}?`,explain:`A function behaves like a reusable program rule. Substitute ${p.x}: ${p.a}(${p.x}²) − ${p.b} = ${p.value}.`};
  if(id==="geo.right-triangle"&&has(interests,"football","sports","architecture","engineering"))return{...question,context:has(interests,"football")?"Football field geometry":"Architecture & engineering",prompt:`A training route moves ${p.a} yards straight across and ${p.b} yards downfield, forming perpendicular legs. What is the direct distance between its endpoints?`};
  if(id==="geo.circle.area"&&has(interests,"architecture","art","design","basketball"))return{...question,context:"Design & geometry",prompt:`A circular design feature has radius ${p.radius}. What is its area?`,explain:`Designers use the same circle formula tested on the SAT: A = πr². With r = ${p.radius}, the area is ${p.square}π.`};
  return question;
}

export function contextualizeQuestions<T extends ContextQuestion>(questions:T[],interests:string[],mode:"balanced"|"high"|"neutral"="balanced"){
  if(mode==="neutral")return questions;
  const threshold=mode==="high"?9:7;
  return questions.map((question,index)=>index%10<threshold?contextualizeQuestion(question,interests,0):question);
}
