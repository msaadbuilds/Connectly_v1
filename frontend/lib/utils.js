export function formatMessageTime(date) {
    return new Date(date).toLocaleTimeString("en-US",{
        hour:"2-digit",
        minute:"2-digit",
        hour12: true
    })

}

// WhatsApp-style date separator label: "Today" / "Yesterday" / weekday name
// (within the last week) / full date for anything older.
export function getDateLabel(date) {
    const msgDate = new Date(date);
    const now = new Date();
    const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const diffDays = Math.round((startOfDay(now) - startOfDay(msgDate)) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays > 1 && diffDays < 7) {
        return msgDate.toLocaleDateString("en-US", { weekday: "long" });
    }
    return msgDate.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
}

// A key that's identical for two timestamps on the same calendar day, used
// to detect when a date separator needs to be inserted between messages.
export function getDateKey(date) {
    const d = new Date(date);
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export function formatFileSize(bytes) {
    if (!bytes && bytes !== 0) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}