export const localDateKey=(value:Date|string|number=new Date())=>{
  const date=value instanceof Date?value:new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
};

export const startOfLocalWeek=(value:Date=new Date())=>{
  const date=new Date(value);
  date.setHours(0,0,0,0);
  date.setDate(date.getDate()-((date.getDay()+6)%7));
  return date;
};

export const currentWeekKey=(value:Date=new Date())=>localDateKey(startOfLocalWeek(value));
