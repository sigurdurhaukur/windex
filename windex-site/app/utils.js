// Function to convert timestamp to H:M:S format
export default function formatTimestamp(ts) {
  const date = new Date(ts * 1000); // Assuming timestamps are in seconds
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}
