import { format } from 'date-fns';

export class ChainableDate {
    private date: Date;

    setCurrentDate(): ChainableDate {
        this.date = new Date();
        return this;
    }

    setDate(date: Date): ChainableDate {
        this.date = date;
        return this;
    }

    setMonth(month: number): ChainableDate {
        this.date.setMonth(month - 1);
        return this;
    }

    setDay(day: number): ChainableDate {
        this.date.setDate(day);
        return this;
    }

    setYear(year: number): ChainableDate {
        this.date.setFullYear(year);
        return this;
    }

    setHours(hours: number): ChainableDate {
        this.date.setHours(hours);
        return this;
    }

    addDays(days: number): ChainableDate {
        this.date = new Date(this.date.getTime() + days * 24 * 60 * 60 * 1000);
        return this;
    }

    minusDays(days: number): ChainableDate {
        this.date = new Date(this.date.getTime() - days * 24 * 60 * 60 * 1000);
        return this;
    }

    toDateTimeString(): string {
        return format(this.date, 'yyyy-MM-dd hh:mm:ss');
    }

    toDateString(): string {
        return format(this.date, 'yyyy-MM-dd');
    }
}