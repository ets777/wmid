export function getClientTimezone(): string {
    const offset = new Date().getTimezoneOffset(); // Offset in minutes
    const hours = Math.floor(Math.abs(offset) / 60).toString().padStart(2, '0');
    const minutes = (Math.abs(offset) % 60).toString().padStart(2, '0');
    const sign = offset <= 0 ? '+' : '-';

    return `${sign}${hours}:${minutes}`;
}