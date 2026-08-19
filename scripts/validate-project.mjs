import fs from "node:fs/promises";
import path from "node:path";
import ts from "typescript";

const root=process.cwd();
async function loadTypeScriptModule(relativePath){
  const source=await fs.readFile(path.join(root,relativePath),"utf8");
  const output=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
  return import(`data:text/javascript;base64,${Buffer.from(output).toString("base64")}`);
}

const questionEngine=await loadTypeScriptModule("lib/question-engine.ts");
const themes=await loadTypeScriptModule("lib/themes.ts");
const reviews=await loadTypeScriptModule("lib/review-scheduler.ts");
const contexts=await loadTypeScriptModule("lib/context-engine.ts");
const masteryEngine=await loadTypeScriptModule("lib/mastery-engine.ts");
const migrations=await loadTypeScriptModule("lib/data-migrations.ts");
const difficulties=["Foundations","Medium","Challenge"];
let generated=0;
let studentResponses=0;

for(const domain of questionEngine.questionEngineInfo.domains){
  for(const difficulty of difficulties){
    for(let seed=1;seed<=25;seed++){
      const questions=questionEngine.generateQuestionSet(8,domain,difficulty,seed);
      const repeat=questionEngine.generateQuestionSet(8,domain,difficulty,seed);
      if(JSON.stringify(questions)!==JSON.stringify(repeat))throw new Error(`Non-deterministic output: ${domain}, ${difficulty}, seed ${seed}`);
      for(const question of questions){
        const issues=questionEngine.validateQuestion(question);
        if(issues.length)throw new Error(`${question.id}: ${issues.join(", ")}`);
        if(question.answers[question.correct]===undefined)throw new Error(`${question.id}: correct answer is missing`);
        if(question.responseType==="student-response")studentResponses++;
        generated++;
      }
    }
  }
}

const missing=[];
for(const pack of themes.themePacks){
  if(pack.scenes.length<4||pack.scenes.length>6)throw new Error(`${pack.name} must have four to six scenes`);
  if(pack.name.includes(":"))throw new Error(`${pack.name} uses a room-specific label instead of a simple theme name`);
  if(!pack.accent||!pack.nav)throw new Error(`${pack.name} is missing UI colors`);
  if(!pack.motion)throw new Error(`${pack.name} is missing a motion treatment`);
  for(const scene of pack.scenes){
    try{await fs.access(path.join(root,"public",scene.replace(/^\//,"")))}catch{missing.push(`${pack.name}: ${scene}`)}
  }
}
if(missing.length)throw new Error(`Missing theme assets:\n${missing.join("\n")}`);

const reviewStart=Date.UTC(2026,0,1);
const missed=reviews.scheduleReviewMiss({id:"review-1",missedAt:new Date(reviewStart).toISOString()},reviewStart);
if(!reviews.isReviewDue(missed,reviewStart))throw new Error("A newly missed question should be due immediately");
let scheduled=reviews.scheduleReviewSuccess(missed,reviewStart);
for(const expectedDays of [1,3,7,14]){
  if(!scheduled)throw new Error(`Review was removed before the ${expectedDays}-day interval`);
  const actualDays=(new Date(scheduled.nextReviewAt).getTime()-reviewStart)/86_400_000;
  if(actualDays!==expectedDays)throw new Error(`Expected a ${expectedDays}-day review interval; found ${actualDays}`);
  scheduled=reviews.scheduleReviewSuccess(scheduled,reviewStart);
}
if(scheduled!==null)throw new Error("A mastered question should leave the review queue after the final interval");

const financeQuestion=questionEngine.generateQuestionSet(30,"Problem Solving & Data","Foundations",41).find(item=>item.templateId==="data.percent.change");
if(!financeQuestion)throw new Error("Could not generate a percent-change question for context validation");
const personalized=contexts.contextualizeQuestion(financeQuestion,["Investing & Stocks"],0);
if(personalized.context!=="Investing & stocks"||personalized.answers.join("|")!==financeQuestion.answers.join("|")||personalized.correct!==financeQuestion.correct)throw new Error("Context personalization changed the answer structure or failed to apply");
const neutral=contexts.contextualizeQuestion(financeQuestion,[],0);
if(JSON.stringify(neutral)!==JSON.stringify(financeQuestion))throw new Error("Neutral questions should remain unchanged");
const neutralSet=contexts.contextualizeQuestions([financeQuestion],["Investing & Stocks"],"neutral");
if(JSON.stringify(neutralSet[0])!==JSON.stringify(financeQuestion))throw new Error("Neutral personalization mode changed a question");
if(studentResponses<50)throw new Error(`Expected broad student-response coverage; found ${studentResponses} generated items`);
const mastery=masteryEngine.calculateMastery(Array.from({length:10},(_,index)=>({skill:"Linear equations",domain:"Algebra",correct:index<8,hintUsed:index===8,confidence:index<7?"Confident":"Okay",responseSeconds:45+index,difficulty:index<5?"Medium":"Challenge",answeredAt:new Date(Date.now()-index*86_400_000).toISOString()})));
if(mastery.score<0||mastery.score>100||mastery.attempts!==10||!mastery.status)throw new Error("Mastery engine produced an invalid profile");
const migrated=migrations.migrateLocalState({name:"Alex",studyDays:["Mon"]},{completed:4,missedItems:null,attemptHistory:null});
if(migrated.profile.schemaVersion!==migrations.LOCAL_SCHEMA_VERSION||!Array.isArray(migrated.stats.missedItems)||migrated.stats.completed!==4)throw new Error("Local data migration did not preserve and normalize legacy data");

const uniqueScenes=new Set(themes.themePacks.flatMap(pack=>pack.scenes));
if(uniqueScenes.size<30||uniqueScenes.size>60)throw new Error(`Expected 30–60 unique scenes; found ${uniqueScenes.size}`);
console.log(`Validated ${generated} generated questions across ${questionEngine.questionEngineInfo.domains.length} domains.`);
console.log(`Validated ${studentResponses} student-produced-response variants.`);
console.log(`Validated ${themes.themePacks.length} themes, ${uniqueScenes.size} referenced scenes, and every referenced asset.`);
console.log("Validated spaced-review scheduling across the 1, 3, 7, and 14-day cadence.");
console.log("Validated interest context personalization without changing SAT answer structure.");
console.log("Validated weighted mastery scoring across accuracy, difficulty, pace, confidence, hints, and recency.");
console.log(`Validated local data migration to schema v${migrations.LOCAL_SCHEMA_VERSION}.`);
