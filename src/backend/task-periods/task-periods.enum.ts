export enum Weekday {
    MONDAY = 1,
    TUESDAY,
    WEDNESDAY,
    THURSDAY,
    FRIDAY,
    SATURDAY,
    SUNDAY,
}

export enum Month {
    JANUARY = 1,
    FEBRUARY,
    MARCH,
    APRIL,
    MAY,
    JUNE,
    JULY,
    AUGUST,
    SEPTEMBER,
    OCTOBER,
    NOVEMBER,
    DECEMBER,
}

export enum TaskPeriodType {
    DAILY = 1,
    WEEKLY,
    MONTHLY,
    YEARLY,
    ONCE,
}

export const taskPeriodTypes = [
    {
        code: 'DAILY',
        name: 'Daily',
        id: TaskPeriodType.DAILY,
    },
    {
        code: 'WEEKLY',
        name: 'Weekly',
        id: TaskPeriodType.WEEKLY,
    },
    {
        code: 'MONTHLY',
        name: 'Monthly',
        id: TaskPeriodType.MONTHLY,
    },
    {
        code: 'YEARLY',
        name: 'Yearly',
        id: TaskPeriodType.YEARLY,
    },
    {
        code: 'ONCE',
        name: 'Once',
        id: TaskPeriodType.ONCE,
    },
];

export const weekdays = [
    {
        name: 'Monday',
        id: Weekday.MONDAY,
    },
    {
        name: 'Tuesday',
        id: Weekday.TUESDAY,
    },
    {
        name: 'Wednesday',
        id: Weekday.WEDNESDAY,
    },
    {
        name: 'Thursday',
        id: Weekday.THURSDAY,
    },
    {
        name: 'Friday',
        id: Weekday.FRIDAY,
    },
    {
        name: 'Saturday',
        id: Weekday.SATURDAY,
    },
    {
        name: 'Sunday',
        id: Weekday.SUNDAY,
    },
];

export const months = [
    {
        name: 'January',
        id: Month.JANUARY,
    },
    {
        name: 'February',
        id: Month.FEBRUARY,
    },
    {
        name: 'March',
        id: Month.MARCH,
    },
    {
        name: 'April',
        id: Month.APRIL,
    },
    {
        name: 'May',
        id: Month.MAY,
    },
    {
        name: 'June',
        id: Month.JUNE,
    },
    {
        name: 'July',
        id: Month.JULY,
    },
    {
        name: 'August',
        id: Month.AUGUST,
    },
    {
        name: 'September',
        id: Month.SEPTEMBER,
    },
    {
        name: 'October',
        id: Month.OCTOBER,
    },
    {
        name: 'November',
        id: Month.NOVEMBER,
    },
    {
        name: 'December',
        id: Month.DECEMBER,
    },
];
