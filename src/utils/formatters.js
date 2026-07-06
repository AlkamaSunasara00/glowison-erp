export const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Invalid Date";
  
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
};

export const formatTime = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Invalid Time";
  
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  });
};

export const formatDateTime = (dateString) => {
  if (!dateString) return "N/A";
  const d = formatDate(dateString);
  const t = formatTime(dateString);
  if (d === "Invalid Date") return "Invalid Date";
  return `${d}, ${t}`;
};
