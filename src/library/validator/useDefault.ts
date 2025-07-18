function useFormat(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function initializeDate(type: "first" | "last" | "current"): string {
    const now: Date = new Date();

    if (type === "last") {
        const lastDate: Date = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return useFormat(lastDate);
    }

    if (type === "first") {
        const firstDate: Date = new Date(now.getFullYear(), now.getMonth(), 1);
        return useFormat(firstDate);
    }

    return useFormat(now); // Return the current date when type is "current"
}

export { initializeDate };