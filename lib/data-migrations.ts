export const LOCAL_SCHEMA_VERSION=4;

type UnknownRecord=Record<string,unknown>;
const record=(value:unknown):UnknownRecord=>value&&typeof value==="object"?value as UnknownRecord:{};
const array=(value:unknown)=>Array.isArray(value)?value:[];

export function migrateLocalState(profileValue:unknown,statsValue:unknown){
  const sourceProfile=record(profileValue),sourceStats=record(statsValue);
  const profile=profileValue?{
    ...sourceProfile,
    name:typeof sourceProfile.name==="string"&&sourceProfile.name.trim()?sourceProfile.name:"Student",
    lastName:typeof sourceProfile.lastName==="string"?sourceProfile.lastName:"",
    interests:array(sourceProfile.interests).filter(item=>typeof item==="string"),
    learningStyles:array(sourceProfile.learningStyles).filter(item=>typeof item==="string"),
    contextMode:sourceProfile.contextMode==="high"||sourceProfile.contextMode==="neutral"?sourceProfile.contextMode:"balanced",
    studyDays:array(sourceProfile.studyDays).filter(item=>typeof item==="string"),
    schemaVersion:LOCAL_SCHEMA_VERSION
  }:null;
  const baseStats={completed:0,correct:0,sessions:0,missed:0,missedItems:[],history:[],mastery:{},skillMastery:{},masteryProfiles:{},hintAssisted:0,confidenceTotal:0,attemptHistory:[],...sourceStats};
  const stats={
    ...baseStats,
    missedItems:array(sourceStats.missedItems),history:array(sourceStats.history),attemptHistory:array(sourceStats.attemptHistory),
    mastery:record(sourceStats.mastery),skillMastery:record(sourceStats.skillMastery),masteryProfiles:record(sourceStats.masteryProfiles),schemaVersion:LOCAL_SCHEMA_VERSION
  };
  return{profile,stats};
}
