export function readLocalJson<T>(key:string,fallback:T):T{
  if(typeof window==="undefined")return fallback;
  const raw=window.localStorage.getItem(key);
  if(!raw)return fallback;
  try{return JSON.parse(raw) as T}catch{window.localStorage.setItem(`${key}-recovery`,raw);window.localStorage.removeItem(key);return fallback}
}
