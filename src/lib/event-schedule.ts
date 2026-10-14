export const SCHOOL_TIME_ZONE = "Asia/Kolkata";

export type EventPhase = "today" | "upcoming" | "past";

type Schedulable = { eventDate: Date | null; status: "UPCOMING" | "PAST" };

// Calendar day in the school's time zone, as YYYY-MM-DD (sortable and comparable as a string).
export function schoolDayKey(date: Date): string {
  return date.toLocaleDateString("en-CA", { timeZone: SCHOOL_TIME_ZONE });
}

export function eventPhase(event: Schedulable, now: Date = new Date()): EventPhase {
  if (!event.eventDate) return event.status === "PAST" ? "past" : "upcoming";
  const day = schoolDayKey(event.eventDate);
  const today = schoolDayKey(now);
  if (day === today) return "today";
  return day > today ? "upcoming" : "past";
}

export type EventGroups<T> = { today: T[]; upcoming: T[]; past: T[] };

// Today and upcoming sort nearest first, past sorts most recent first. Undated events go last in their group.
export function groupEventsBySchedule<T extends Schedulable>(events: T[], now: Date = new Date()): EventGroups<T> {
  const groups: EventGroups<T> = { today: [], upcoming: [], past: [] };
  for (const event of events) groups[eventPhase(event, now)].push(event);
  const asc = (a: T, b: T) => (a.eventDate && b.eventDate ? a.eventDate.getTime() - b.eventDate.getTime() : Number(!a.eventDate) - Number(!b.eventDate));
  groups.today.sort(asc);
  groups.upcoming.sort(asc);
  groups.past.sort((a, b) => (a.eventDate && b.eventDate ? b.eventDate.getTime() - a.eventDate.getTime() : Number(!a.eventDate) - Number(!b.eventDate)));
  return groups;
}

// Nearest dated event that is today or in the future; undated events are never featured.
// Dated events happening today or later, nearest first; the first entry is the featured event.
export function listUpcomingEvents<T extends Schedulable>(groups: EventGroups<T>): T[] {
  return [...groups.today, ...groups.upcoming].filter((event) => event.eventDate);
}

export function pickFeaturedEvent<T extends Schedulable>(groups: EventGroups<T>): T | undefined {
  return listUpcomingEvents(groups)[0];
}
