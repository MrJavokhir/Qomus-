// Timezone utility for Asia/Tashkent (UTC+5)
// Used for event status computation and deadline checking

const TASHKENT_OFFSET_HOURS = 5;

/**
 * Get current time in Asia/Tashkent timezone
 */
export function nowInTashkent(): Date {
    const now = new Date();
    // Create a date that represents the current time in Tashkent
    const utcMs = now.getTime() + (now.getTimezoneOffset() * 60 * 1000);
    return new Date(utcMs + (TASHKENT_OFFSET_HOURS * 60 * 60 * 1000));
}

/**
 * Check if a date is in the past (relative to Tashkent time)
 */
export function isPastInTashkent(date: Date): boolean {
    const tashkentNow = nowInTashkent();
    return date < tashkentNow;
}

/**
 * Compute event status based on Asia/Tashkent timezone
 */
export function computeEventStatus(eventDate: Date | string, eventTime?: string): 'UPCOMING' | 'PAST' {
    let dateObj: Date;

    if (typeof eventDate === 'string') {
        dateObj = new Date(eventDate);
    } else {
        dateObj = eventDate;
    }

    // If time is provided, combine date and time
    if (eventTime) {
        const [hours, minutes] = eventTime.split(':').map(Number);
        dateObj.setHours(hours || 0, minutes || 0, 0, 0);
    }

    return isPastInTashkent(dateObj) ? 'PAST' : 'UPCOMING';
}

/**
 * Check if registration deadline has passed
 */
export function isDeadlinePassed(deadline: Date | null | undefined): boolean {
    if (!deadline) return false;
    return isPastInTashkent(new Date(deadline));
}

/**
 * Format date for display in Tashkent timezone
 */
export function formatDateTashkent(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('uz-UZ', {
        timeZone: 'Asia/Tashkent',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

/**
 * Format time for display in Tashkent timezone
 */
export function formatTimeTashkent(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleTimeString('uz-UZ', {
        timeZone: 'Asia/Tashkent',
        hour: '2-digit',
        minute: '2-digit',
    });
}
