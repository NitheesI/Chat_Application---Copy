import { format, isToday, isYesterday } from "date-fns";

/**
 * Formats a timestamp to HH:mm (24-hour format)
 */
export function formatMessageTime(date) {
  const parsedDate = new Date(date);
  return parsedDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/**
 * Formats a date to "Today", "Yesterday", or "Month Day, Year"
 */
export function formatChatDate(date) {
  const parsedDate = new Date(date);

  if (isToday(parsedDate)) return "Today";
  if (isYesterday(parsedDate)) return "Yesterday";

  return format(parsedDate, "MMMM d, yyyy");
}
