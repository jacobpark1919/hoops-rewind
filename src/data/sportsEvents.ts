export interface SportsEvent {
  id: string;
  title: string;
  year: number;
  sport: string;
  icon: string;
}

export const sportsEvents: SportsEvent[] = [
  { id: "1", title: "Michael Jordan wins his first NBA Championship", year: 1991, sport: "Basketball", icon: "🏀" },
  { id: "2", title: "Babe Ruth hits his 60th home run in a season", year: 1927, sport: "Baseball", icon: "⚾" },
  { id: "3", title: "Jesse Owens wins 4 gold medals at Berlin Olympics", year: 1936, sport: "Track & Field", icon: "🏃" },
  { id: "4", title: "Muhammad Ali defeats George Foreman in 'Rumble in the Jungle'", year: 1974, sport: "Boxing", icon: "🥊" },
  { id: "5", title: "USA Hockey 'Miracle on Ice' at Lake Placid", year: 1980, sport: "Hockey", icon: "🏒" },
  { id: "6", title: "Tiger Woods wins his first Masters Tournament", year: 1997, sport: "Golf", icon: "⛳" },
  { id: "7", title: "Tom Brady wins his first Super Bowl", year: 2002, sport: "Football", icon: "🏈" },
  { id: "8", title: "Usain Bolt sets 100m world record at Beijing Olympics", year: 2008, sport: "Track & Field", icon: "🏃" },
  { id: "9", title: "LeBron James drafted 1st overall by Cleveland", year: 2003, sport: "Basketball", icon: "🏀" },
  { id: "10", title: "Jackie Robinson breaks MLB color barrier", year: 1947, sport: "Baseball", icon: "⚾" },
  { id: "11", title: "Wayne Gretzky traded to LA Kings", year: 1988, sport: "Hockey", icon: "🏒" },
  { id: "12", title: "Serena Williams wins first Grand Slam", year: 1999, sport: "Tennis", icon: "🎾" },
  { id: "13", title: "USA wins first FIFA Women's World Cup", year: 1991, sport: "Soccer", icon: "⚽" },
  { id: "14", title: "Michael Phelps wins 8 gold medals in Beijing", year: 2008, sport: "Swimming", icon: "🏊" },
  { id: "15", title: "Secretariat wins Triple Crown", year: 1973, sport: "Horse Racing", icon: "🏇" },
  { id: "16", title: "Joe Namath guarantees Super Bowl III victory", year: 1969, sport: "Football", icon: "🏈" },
  { id: "17", title: "Derek Jeter makes 'The Flip' play in playoffs", year: 2001, sport: "Baseball", icon: "⚾" },
  { id: "18", title: "Kobe Bryant scores 81 points vs Toronto", year: 2006, sport: "Basketball", icon: "🏀" },
  { id: "19", title: "Lance Armstrong wins first Tour de France", year: 1999, sport: "Cycling", icon: "🚴" },
  { id: "20", title: "Wilt Chamberlain scores 100 points", year: 1962, sport: "Basketball", icon: "🏀" },
  { id: "21", title: "Red Sox end 86-year World Series drought", year: 2004, sport: "Baseball", icon: "⚾" },
  { id: "22", title: "Leicester City wins Premier League", year: 2016, sport: "Soccer", icon: "⚽" },
  { id: "23", title: "Hank Aaron breaks Babe Ruth's home run record", year: 1974, sport: "Baseball", icon: "⚾" },
  { id: "24", title: "Joe Louis becomes world heavyweight champion", year: 1937, sport: "Boxing", icon: "🥊" },
];

export function getRandomEvents(count: number = 8): SportsEvent[] {
  const shuffled = [...sportsEvents].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
