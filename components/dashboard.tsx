"use client";

import { useEffect, useState } from "react";
import { Icon } from "./icon";
import { ProgressRing } from "./progress-ring";
import { readLocalJson } from "@/lib/storage";
import { recommendPractice } from "@/lib/adaptive";
import { getThemePack, getThemeScene } from "@/lib/themes";
import { dueReviewItems, updateReviewQueue } from "@/lib/review-scheduler";
import { buildMasteryProfiles } from "@/lib/mastery-engine";
import { migrateLocalState } from "@/lib/data-migrations";
import { localDateKey } from "@/lib/date-utils";
import type { CSSProperties } from "react";
import { AccessibilityControls, AccountControls, AttemptHistoryView, CareerExplorerView, ContextInsights, DataControls, DiagnosticView, GoalCenter, GrowthReport, LearnView, OnboardingView, PracticeView, ProfileSettings, ProgressView, QualityEntry, SettingsView, SimulationView, SkillInsights, StudyCircleView, StudyPlanView, WelcomeView, type AttemptSummary, type DiagnosticResult, type EntrySeed, type LocalStudentProfile, type MissedQuestion, type SessionRecord, type StudentStats } from "./product-views";

const modules = [
  { title: "Linear equations", domain: "Algebra", progress: 92, state: "Mastered" },
  { title: "Quadratic equations", domain: "Advanced Math", progress: 62, state: "In progress" },
  { title: "Functions & notation", domain: "Advanced Math", progress: 44, state: "Recommended" },
  { title: "Triangles & trigonometry", domain: "Geometry & Trig", progress: 28, state: "Needs practice" }
];

const nav = [
  ["home", "Dashboard"], ["clock", "My plan"], ["learn", "Learn"], ["bolt", "Practice"],
  ["chart", "Progress"], ["target", "Explore paths"], ["users", "Study circle"], ["user", "Profile"]
];
const routeViews=["Dashboard","My plan","Learn","Practice","Progress","Explore paths","Study circle","Profile","Settings","Diagnostic","Simulation","History"];
const routeSlug=(view:string)=>view.toLowerCase().replaceAll(" ","-");
const viewFromLocation=()=>routeViews.find(view=>routeSlug(view)===window.location.hash.slice(1))||"Dashboard";

export function Dashboard() {
  const [active, setActive] = useState("Dashboard");
  const [toast, setToast] = useState("");
  const [notificationsOpen,setNotificationsOpen]=useState(false);
  const [dismissedNotifications,setDismissedNotifications]=useState<string[]>([]);
  const emptyStats:StudentStats={ completed: 0, correct: 0, sessions: 0, missed: 0, missedItems: [], history: [], mastery:{}, skillMastery:{}, hintAssisted:0, confidenceTotal:0, attemptHistory:[] };
  const [stats, setStats] = useState<StudentStats>(emptyStats);
  const [theme, setTheme] = useState("focus");
  const [sceneMode,setSceneMode]=useState<"daily"|"fixed">("daily"),[fixedScene,setFixedScene]=useState(0);
  const [appearance,setAppearance]=useState("light");
  const [appearanceSource,setAppearanceSource]=useState<"theme"|"manual">("theme");
  const [customThemeName,setCustomThemeName]=useState("");
  const [breakout,setBreakout]=useState(false);
  const [navCollapsed,setNavCollapsed]=useState(false);
  const [dailyGoal,setDailyGoal]=useState(5);
  const [diagnostic,setDiagnostic]=useState<DiagnosticResult|null>(null);
  const [focusMode,setFocusMode]=useState(false);
  const [textSize,setTextSize]=useState("Default"),[highContrast,setHighContrast]=useState(false),[reduceMotion,setReduceMotion]=useState(false);
  const [profile,setProfile]=useState<LocalStudentProfile|null>(null),[hydrated,setHydrated]=useState(false),[entryComplete,setEntryComplete]=useState(false),[entrySeed,setEntrySeed]=useState<EntrySeed>({});
  const navigate=(view:string,replace=false)=>{setActive(view);if(typeof window!=="undefined"){const url=`${window.location.pathname}${window.location.search}#${routeSlug(view)}`;if(replace)window.history.replaceState({view},"",url);else if(window.location.hash!==`#${routeSlug(view)}`)window.history.pushState({view},"",url)}};
  useEffect(() => { const rawStats=readLocalJson<Partial<StudentStats>>("orbit-stats",{}),rawProfile=readLocalJson<LocalStudentProfile|null>("orbit-profile",null),migrated=migrateLocalState(rawProfile,rawStats),saved=migrated.stats as Partial<StudentStats>,savedProfile=migrated.profile as LocalStudentProfile|null,savedTheme=window.localStorage.getItem("orbit-theme")||"focus",savedAppearanceSource=window.localStorage.getItem("orbit-appearance-source")==="manual"?"manual":"theme";setStats(previous=>({...previous,...saved}));setTheme(savedTheme);setSceneMode(window.localStorage.getItem("orbit-scene-mode")==="fixed"?"fixed":"daily");setFixedScene(Number(window.localStorage.getItem("orbit-fixed-scene"))||0);setAppearanceSource(savedAppearanceSource);setAppearance(savedAppearanceSource==="theme"?getThemePack(savedTheme).recommendedAppearance:window.localStorage.getItem("orbit-appearance")||"light");setCustomThemeName(window.localStorage.getItem("orbit-custom-theme-name")||"");setNavCollapsed(window.localStorage.getItem("orbit-nav-collapsed")==="true"); setDailyGoal(Number(window.localStorage.getItem("orbit-goal"))||5); setFocusMode(window.localStorage.getItem("orbit-focus")==="true");setTextSize(localStorage.getItem("orbit-text-size")||"Default");setHighContrast(localStorage.getItem("orbit-contrast")==="true");setReduceMotion(localStorage.getItem("orbit-reduce-motion")==="true");setDiagnostic(readLocalJson<DiagnosticResult|null>("orbit-diagnostic",null));setProfile(savedProfile);setEntryComplete(localStorage.getItem("orbit-entry-complete")==="true");localStorage.setItem("orbit-stats",JSON.stringify(saved));if(savedProfile)localStorage.setItem("orbit-profile",JSON.stringify(savedProfile));setHydrated(true); }, []);
  useEffect(()=>{setActive(viewFromLocation());const sync=()=>setActive(viewFromLocation());window.addEventListener("popstate",sync);return()=>window.removeEventListener("popstate",sync)},[]);
  useEffect(()=>{setDismissedNotifications(readLocalJson<string[]>("orbit-dismissed-notifications",[]))},[]);
  const completePractice = (correct: number, total: number, misses: MissedQuestion[], reviewedIds: string[], sessionName:string, attempts:AttemptSummary[]=[]) => setStats(previous => { const now=new Date().toISOString();const unique=updateReviewQueue(previous.missedItems,misses,reviewedIds,new Date(now).getTime());const record:SessionRecord={id:`session-${Date.now()}`,name:sessionName,completedAt:now,questions:total,correct,accuracy:Math.round(correct/total*100)}; const mastery={...(previous.mastery||{})},skillMastery={...(previous.skillMastery||{})};if(attempts.length){attempts.forEach(attempt=>{const domain=mastery[attempt.domain]||{attempts:0,correct:0};mastery[attempt.domain]={attempts:domain.attempts+1,correct:domain.correct+(attempt.correct?1:0)};const skill=skillMastery[attempt.skill]||{attempts:0,correct:0};skillMastery[attempt.skill]={attempts:skill.attempts+1,correct:skill.correct+(attempt.correct?1:0)}})}else{const domain=["Algebra","Advanced Math","Problem Solving & Data","Geometry & Trig"].find(item=>sessionName.includes(item));if(domain){const current=mastery[domain]||{attempts:0,correct:0};mastery[domain]={attempts:current.attempts+total,correct:current.correct+correct}}}const attemptHistory=attempts.map((attempt,index)=>({...attempt,id:`attempt-${Date.now()}-${index}`,session:sessionName,answeredAt:now}));const allAttempts=[...attemptHistory,...(previous.attemptHistory||[])],masteryProfiles=buildMasteryProfiles(allAttempts);const next = { completed: previous.completed + total, correct: previous.correct + correct, sessions: previous.sessions + 1, missed: previous.missed + (total-correct), missedItems:unique, history:[record,...(previous.history||[])],mastery,skillMastery,hintAssisted:(previous.hintAssisted||0)+attempts.filter(item=>item.hintUsed).length,confidenceTotal:(previous.confidenceTotal||0)+attempts.filter(item=>item.confidence==="Confident").length,attemptHistory:allAttempts,masteryProfiles }; window.localStorage.setItem("orbit-stats", JSON.stringify(next)); return next; });
  const changeTheme = (next: string) => { setTheme(next); window.localStorage.setItem("orbit-theme", next);if(appearanceSource==="theme"){const recommended=getThemePack(next).recommendedAppearance;setAppearance(recommended);window.localStorage.setItem("orbit-appearance",recommended)} };
  const changeAppearance=(value:string)=>{if(value==="theme"){setAppearanceSource("theme");localStorage.setItem("orbit-appearance-source","theme");const recommended=getThemePack(theme).recommendedAppearance;setAppearance(recommended);localStorage.setItem("orbit-appearance",recommended);return}setAppearanceSource("manual");setAppearance(value);localStorage.setItem("orbit-appearance-source","manual");localStorage.setItem("orbit-appearance",value)};
  useEffect(()=>{if(active!=="Practice")setBreakout(false)},[active]);
  const createTheme=(prompt:string)=>{const value=prompt.toLowerCase();const next=value.includes("spider")?"spiderman":value.includes("batman")||value.includes("batcave")?"batman":value.includes("harry")||value.includes("hogwarts")?"harrypotter":value.includes("star wars")||value.includes("falcon")?"starwars":value.includes("block")||value.includes("minecraft")?"block":value.includes("castle")||value.includes("wizard")?"castle":value.includes("comic")||value.includes("hero")?"comic":value.includes("cyber")||value.includes("blade")||value.includes("trading")?"cyber":value.includes("forest")||value.includes("nature")?"forest":value.includes("desert")||value.includes("tatooine")?"desert":value.includes("city")?"city":value.includes("space")||value.includes("star")?"space":"custom";setCustomThemeName(prompt.trim());localStorage.setItem("orbit-custom-theme-name",prompt.trim());changeTheme(next)};
  if(!hydrated)return null;
  if(!entryComplete)return <WelcomeView returningName={profile?.name} onReturn={()=>{setEntryComplete(true);localStorage.setItem("orbit-entry-complete","true")}} onContinue={seed=>{setEntrySeed(seed);setProfile(null);setEntryComplete(true);localStorage.setItem("orbit-entry-complete","true")}}/>;
  if(!profile)return <OnboardingView seed={entrySeed} onComplete={(student,goal)=>{setProfile(student);setTheme(student.theme);setDailyGoal(goal);localStorage.setItem("orbit-profile",JSON.stringify(student));localStorage.setItem("orbit-theme",student.theme);localStorage.setItem("orbit-goal",String(goal))}}/>;
  const now=new Date(),localDay=Number(`${now.getFullYear()}${String(now.getMonth()+1).padStart(2,"0")}${String(now.getDate()).padStart(2,"0")}`),roomVariant=sceneMode==="fixed"?fixedScene:localDay;
  const themePack=getThemePack(theme),isBreakout=breakout||active==="Diagnostic"||active==="Simulation",themeScene=getThemeScene(theme,roomVariant,isBreakout);
  const environmentBackground=themePack.plainBackground||`linear-gradient(90deg, color-mix(in srgb, ${themePack.nav} ${isBreakout?28:48}%, transparent), transparent 82%), url('${themeScene}')`;
  const adaptiveRecommendation=recommendPractice(stats.attemptHistory||[]);
  const dueReviews=dueReviewItems(stats.missedItems);
  const todayKey=localDateKey(now),weekStart=new Date(now);weekStart.setDate(now.getDate()-6);
  const todayQuestions=stats.history.filter(item=>localDateKey(item.completedAt)===todayKey).reduce((sum,item)=>sum+item.questions,0);
  const weekQuestions=stats.history.filter(item=>new Date(item.completedAt)>=weekStart).reduce((sum,item)=>sum+item.questions,0);
  const studiedDates=new Set(stats.history.map(item=>localDateKey(item.completedAt)));let streak=0;const streakCursor=new Date(now);if(!studiedDates.has(localDateKey(streakCursor)))streakCursor.setDate(streakCursor.getDate()-1);while(studiedDates.has(localDateKey(streakCursor))){streak++;streakCursor.setDate(streakCursor.getDate()-1)}
  const accuracy=stats.completed?Math.round(stats.correct/stats.completed*100):null;
  const diagnosticAverage=diagnostic?Math.round(Object.values(diagnostic.scores).reduce((sum,value)=>sum+value,0)/Object.values(diagnostic.scores).length):null;
  const readiness=accuracy??diagnosticAverage??(profile.currentScore!=="Not tested yet"?Math.round(Number(profile.currentScore)/8):0);
  const minutesLeft=Math.max(0,profile.minutesPerDay-Math.min(profile.minutesPerDay,todayQuestions*2));
  const dateLabel=now.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"}).toUpperCase();
  const greeting=now.getHours()<12?"Good morning":now.getHours()<17?"Good afternoon":"Good evening";
  const daysToTest=profile.testDate?Math.max(0,Math.ceil((new Date(`${profile.testDate}T12:00:00`).getTime()-Date.now())/86400000)):null;
  const savedPractice=typeof window!=="undefined"&&Boolean(localStorage.getItem("orbit-active-practice"));
  const notifications=[
    ...(savedPractice?[{id:"saved-practice",title:"Practice session saved",copy:"Continue exactly where you stopped.",view:"Practice"}]:[]),
    ...(dueReviews.length?[{id:`reviews-${dueReviews.length}`,title:`${dueReviews.length} question${dueReviews.length===1?"":"s"} due for review`,copy:"A short spaced review will strengthen recent mistakes.",view:"Practice"}]:[]),
    ...(daysToTest!==null?[{id:`test-${localDateKey()}-${daysToTest}`,title:daysToTest===0?"Your test date is today":`${daysToTest} days until your test`,copy:"Your weekly plan is using this date.",view:"My plan"}]:[]),
    ...(!diagnostic?[{id:"diagnostic",title:"Set your starting baseline",copy:"The optional diagnostic personalizes your study path.",view:"Diagnostic"}]:[])
  ].filter(item=>!dismissedNotifications.includes(item.id));
  const dismissNotifications=()=>{const next=Array.from(new Set([...dismissedNotifications,...notifications.map(item=>item.id)]));setDismissedNotifications(next);localStorage.setItem("orbit-dismissed-notifications",JSON.stringify(next))};
  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(""), 2200); };

  return (
    <main style={{"--orange":themePack.accent,"--nav":themePack.nav} as CSSProperties} className={`app-shell theme-${theme} motion-${themePack.motion||"drift"} mode-${appearance} room-variant-${roomVariant} ${navCollapsed?"nav-collapsed":""} ${isBreakout?"breakout-space":"main-space"} ${focusMode?"focus-mode":""} text-${textSize.toLowerCase().replace(" ","-")} ${highContrast?"high-contrast":""} ${reduceMotion?"reduce-motion":""}`}>
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <div className="environment-layer" style={{background:environmentBackground}} aria-hidden="true"><i/><b/><span>{customThemeName&&theme==="custom"?customThemeName:""}</span></div>
      {focusMode&&<button className="focus-exit" onClick={()=>{setFocusMode(false);window.localStorage.setItem("orbit-focus","false")}}>Exit focus mode</button>}
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">O</span><span>orbit</span><button className="nav-collapse" aria-label={navCollapsed?"Expand navigation":"Collapse navigation"} title={navCollapsed?"Expand navigation":"Collapse navigation"} onClick={()=>setNavCollapsed(value=>{localStorage.setItem("orbit-nav-collapsed",String(!value));return !value})}>{navCollapsed?"›":"‹"}</button></div>
        <nav aria-label="Main navigation">
          {nav.map(([icon, label]) => <button key={label} aria-current={active===label?"page":undefined} onClick={() => navigate(label)} className={active === label ? "active" : ""}><Icon name={icon} /><span>{label}</span></button>)}
          <button className={`mobile-settings ${active==="Settings"?"active":""}`} onClick={()=>navigate("Settings")}><Icon name="settings"/><span>Settings</span></button>
        </nav>
        <div className="side-bottom">
          <button onClick={() => navigate("Settings")}><Icon name="settings" /><span>Settings</span></button>
          <div className="profile"><button className="avatar" aria-label="Open profile" onClick={()=>navigate("Profile")}>{`${profile.name[0]||""}${profile.lastName?.[0]||profile.name[1]||""}`.toUpperCase()}</button><div><strong>{profile.name}{profile.lastName?` ${profile.lastName}`:""}</strong><span>{profile.targetScore} target</span></div><button aria-label="Edit profile" onClick={()=>navigate("Profile")}>•••</button></div>
        </div>
      </aside>

      <section className="content" id="main-content" tabIndex={-1}>
        <header className="topbar">
          <div className="mobile-brand"><span className="brand-mark">O</span> orbit</div>
          <div className="daily"><span>DAILY GOAL</span><b><Icon name="flame" size={17} /> {Math.min(todayQuestions,dailyGoal)} / {dailyGoal} questions</b><i><em style={{width:`${Math.min(100,(todayQuestions/dailyGoal)*100)}%`}} /></i></div>
          <button className="icon-button" aria-label="Notifications" aria-expanded={notificationsOpen} onClick={()=>setNotificationsOpen(value=>!value)}>○{notifications.length>0&&<span />}</button>
          {notificationsOpen&&<aside className="notification-panel"><header><span>NOTIFICATIONS</span><div>{notifications.length>0&&<button onClick={dismissNotifications}>Clear all</button>}<button aria-label="Close notifications" onClick={()=>setNotificationsOpen(false)}>×</button></div></header>{notifications.length?notifications.map(item=><button key={item.id} onClick={()=>{navigate(item.view);setNotificationsOpen(false)}}><strong>{item.title}</strong><small>{item.copy}</small><b>→</b></button>):<p>You’re all caught up.</p>}</aside>}
        </header>

        {active === "Learn" && <LearnView onPractice={() => navigate("Practice")} learningStyles={profile.learningStyles||[]} />}
        {active === "Practice" && <PracticeView onComplete={completePractice} missedItems={stats.missedItems} onSimulation={()=>navigate("Simulation")} onBreakoutChange={setBreakout} recommendation={adaptiveRecommendation} interests={profile.interests||[]} contextMode={profile.contextMode||"balanced"} />}
        {active === "Progress" && <><ProgressView stats={stats} diagnostic={diagnostic} onReview={()=>navigate("Practice")} /><SkillInsights stats={stats} onHistory={()=>navigate("History")}/><ContextInsights stats={stats} interests={profile.interests||[]}/><GrowthReport stats={stats} diagnostic={diagnostic}/><GoalCenter stats={stats} studyDays={profile.studyDays}/></>}
        {active === "History" && <AttemptHistoryView stats={stats} onBack={()=>navigate("Progress")}/>} 
        {active === "Explore paths" && <CareerExplorerView interests={profile.interests||[]} onPractice={()=>navigate("Practice")}/>} 
        {active === "Study circle" && <StudyCircleView />}
        {active === "Profile" && <ProfileSettings profile={profile} onSave={value=>{setProfile(value);localStorage.setItem("orbit-profile",JSON.stringify(value));notify("Profile saved")}}/>}
        {active === "Settings" && <><SettingsView theme={theme} onTheme={changeTheme} sceneMode={sceneMode} sceneIndex={fixedScene} onSceneMode={(value)=>{setSceneMode(value);localStorage.setItem("orbit-scene-mode",value)}} onScene={(value)=>{setFixedScene(value);setSceneMode("fixed");localStorage.setItem("orbit-fixed-scene",String(value));localStorage.setItem("orbit-scene-mode","fixed")}} appearance={appearance} appearanceSource={appearanceSource} onAppearance={changeAppearance} customThemeName={customThemeName} onCreateTheme={createTheme} dailyGoal={dailyGoal} onGoal={(goal)=>{setDailyGoal(goal);window.localStorage.setItem("orbit-goal",String(goal))}} focusMode={focusMode} onFocus={(value)=>{setFocusMode(value);window.localStorage.setItem("orbit-focus",String(value))}} /><AccessibilityControls textSize={textSize} highContrast={highContrast} reduceMotion={reduceMotion} onTextSize={value=>{setTextSize(value);localStorage.setItem("orbit-text-size",value)}} onContrast={value=>{setHighContrast(value);localStorage.setItem("orbit-contrast",String(value))}} onMotion={value=>{setReduceMotion(value);localStorage.setItem("orbit-reduce-motion",String(value))}}/><AccountControls profile={profile} onSignOut={()=>{localStorage.removeItem("orbit-entry-complete");setEntryComplete(false);navigate("Dashboard",true)}}/><QualityEntry/><DataControls profile={profile} stats={stats} diagnostic={diagnostic} onReset={()=>{setStats(emptyStats);localStorage.setItem("orbit-stats",JSON.stringify(emptyStats))}} /></>}
        {active === "Diagnostic" && <DiagnosticView saved={diagnostic} onExit={()=>navigate("Dashboard")} onComplete={(profile)=>{setDiagnostic(profile);window.localStorage.setItem("orbit-diagnostic",JSON.stringify(profile))}} />}
        {active === "My plan" && <StudyPlanView diagnostic={diagnostic} stats={stats} dailyGoal={dailyGoal} profile={profile} onNavigate={navigate} />}
        {active === "Simulation" && <SimulationView onExit={()=>navigate("Practice")} onComplete={(correct,total,attempts,misses)=>completePractice(correct,total,misses,[],"Prototype SAT simulation",attempts)} />}
        {active === "Dashboard" && <div className="dashboard-grid">
          <section className="hero-card">
            <div className="hero-copy">
              <p className="eyebrow">{dateLabel}</p>
              <h1>{greeting}, {profile.name}.</h1>
              <p>{todayQuestions?`You’ve completed ${todayQuestions} question${todayQuestions===1?"":"s"} today. ${Math.max(0,dailyGoal-todayQuestions)} remain in your daily goal.`:streak?`One focused session today keeps your ${streak}-day streak alive.`:"A short focused session is enough to start today’s momentum."}</p>
              <div className="hero-actions">
                <button className="primary" onClick={() => navigate("Learn")}><Icon name="play" size={17} /> Continue learning</button>
                <button className="hero-link" onClick={()=>navigate("Diagnostic")}>{diagnostic?"View diagnostic":"Take diagnostic"}</button>
                <span><Icon name="clock" size={17} /> {minutesLeft} min planned</span>
              </div>
            </div>
            <div className="readiness"><ProgressRing value={readiness} /><span>{readiness?"Practice readiness":"Set a baseline"}</span><strong>Target {profile.targetScore}</strong></div>
          </section>

          <section className="continue-card card">
            <div className="card-label"><span>UP NEXT</span></div>
            <div className="lesson-art"><span>x²</span><i>+ bx + c</i><b>04</b></div>
            <div className="lesson-copy"><span>ADVANCED MATH · LESSON 3 OF 5</span><h2>Quadratic equations</h2><p>Complete the square and reveal the vertex.</p></div>
            <div className="lesson-progress"><i><em /></i><span>62%</span></div>
            <button className="secondary" onClick={() => navigate("Learn")}>Resume lesson <span>→</span></button>
          </section>

          <section className="stats card">
            <div className="section-heading"><div><span>YOUR MOMENTUM</span><h2>Small steps, real progress.</h2></div><button onClick={() => navigate("Progress")}>View details →</button></div>
            <div className="stat-grid">
              <div><span>QUESTIONS</span><strong>{stats.completed}</strong><small><b>{weekQuestions}</b> this week</small></div>
              <div><span>ACCURACY</span><strong>{accuracy===null?"—":`${accuracy}%`}</strong><small><b>{stats.sessions}</b> completed sessions</small></div>
              <div><span>STUDY STREAK</span><strong>{streak} <small>days</small></strong><small>{streak?"Keep showing up":"Complete a session to begin"}</small></div>
            </div>
          </section>

          <section className="path card">
            <div className="section-heading"><div><span>YOUR STUDY PATH</span><h2>Focus where it counts.</h2></div><button onClick={() => navigate("Learn")}>Explore all modules →</button></div>
            <div className="module-list">
              {modules.map((module, index) => <button key={module.title} onClick={() => navigate("Learn")} className={index === 2 ? "recommended" : ""}>
                <span className="module-icon">{index === 0 ? <Icon name="check" /> : String(index + 1).padStart(2, "0")}</span>
                <span className="module-name"><small>{module.domain}</small><strong>{module.title}</strong></span>
                <span className="bar"><i style={{ width: `${stats.mastery?.[module.domain]?.attempts ? Math.round(stats.mastery[module.domain].correct/stats.mastery[module.domain].attempts*100) : module.progress}%` }} /></span>
                <span className="module-state">{module.state}<Icon name="chevron" size={17} /></span>
              </button>)}
            </div>
          </section>

          <section className="coach card">
            <div className="coach-mark">✦</div>
            <div><span>ORBIT COACH</span><h2>Your best next move</h2><p>{adaptiveRecommendation.reason}</p></div>
            <button onClick={() => navigate("Practice")}>Practice {adaptiveRecommendation.skill} <span>→</span></button>
          </section>
        </div>}
      </section>
      {toast && <div className="toast" role="status">{toast}</div>}
    </main>
  );
}
