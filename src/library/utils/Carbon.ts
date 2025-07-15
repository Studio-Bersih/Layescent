function getCurrentTime() {
    const time = new Date();

    const dayNames = [
        'Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'
    ];
    const monthPrefixes = [
        '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'
    ];

    return {
        day: time.getDate(),
        dayName: dayNames[time.getDay()],
        month: monthPrefixes[time.getMonth()],
        year: time.getFullYear(),
        hours: time.getHours(),
        minutes: time.getMinutes(),
        seconds: time.getSeconds()
    };
}

function Carbon(date: string | Date, type: "date" | "date-short" | "timestamp" | "time" | "age" | "year" | "day" | "detailed-age" | "date-short-with-time" | "predict"): string {
    if (date === undefined || date === null || date === "") {
        return "-";
    }

    let dateFormat: Intl.DateTimeFormatOptions = {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    };

    let dateObj: Date;

    if (typeof date === 'string' && /^\d{2}:\d{2}:\d{2}$/.test(date)) {
        const [hours, minutes, seconds] = date.split(':').map(Number);
        dateObj = new Date();
        dateObj.setHours(hours, minutes, seconds);
    } else {
        dateObj = typeof date === 'string' ? new Date(date) : date;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(dateObj);
    compareDate.setHours(0, 0, 0, 0);

    if (type === "predict") {
        const diffTime = compareDate.getTime() - today.getTime();
        const daysDiff = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (daysDiff > 0) {
            return `${daysDiff} Hari Lagi`;
        } else if (daysDiff === 0) {
            return `Hari Ini`;
        } else {
            return `Sudah Lewat`;
        }
    }

    if (type === "date") {
        return dateObj.toLocaleDateString('id-ID', dateFormat);
    }

    if (type === "date-short") {
        const day = String(dateObj.getDate()).padStart(2, '0');
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const year = dateObj.getFullYear();
        return `${day}/${month}/${year}`;
    }

    if (type === "date-short-with-time") {
        const day = String(dateObj.getDate()).padStart(2, '0');
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const year = dateObj.getFullYear();
        const hours = String(dateObj.getHours()).padStart(2, '0');
        const minutes = String(dateObj.getMinutes()).padStart(2, '0');
        return `${day}/${month}/${year} ${hours}:${minutes}`;
    }

    if (type === "timestamp") {
        let formattedDate = dateObj.toLocaleDateString('id-ID', dateFormat);
        let timeFormat: Intl.DateTimeFormatOptions = {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        };
        let formattedTime = dateObj.toLocaleTimeString('id-ID', timeFormat);
        return `${formattedDate} ${formattedTime}`;
    }

    if (type === "time") {
        let timeFormat: Intl.DateTimeFormatOptions = {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        };
        return dateObj.toLocaleTimeString('id-ID', timeFormat);
    }

    if (type === "age") {
        const age = today.getFullYear() - dateObj.getFullYear();
        const monthDiff = today.getMonth() - dateObj.getMonth();
        const dayDiff = today.getDate() - dateObj.getDate();

        let finalAge = age;
        if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
            finalAge--;
        }

        return `${finalAge} tahun`;
    }

    if (type === "year") {
        const yearsSince = today.getFullYear() - dateObj.getFullYear();
        return `${yearsSince} tahun`;
    }

    if (type === "day") {
        const diffTime = Math.abs(today.getTime() - dateObj.getTime());
        const daysPassed = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        return `${daysPassed} hari`;
    }

    if (type === "detailed-age") {
        let years = today.getFullYear() - dateObj.getFullYear();
        let months = today.getMonth() - dateObj.getMonth();
        let days = today.getDate() - dateObj.getDate();

        if (days < 0) {
            months--;
            const previousMonth = new Date(today.getFullYear(), today.getMonth(), 0).getDate();
            days += previousMonth;
        }

        if (months < 0) {
            years--;
            months += 12;
        }

        return `${years} tahun, ${months} bulan, ${days} hari`;
    }

    return '';
}

export { getCurrentTime, Carbon };