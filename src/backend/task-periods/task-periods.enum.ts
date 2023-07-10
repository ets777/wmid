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
    name: 'Ежедневно',
    id: TaskPeriodType.DAILY,
  },
  {
    code: 'WEEKLY',
    name: 'Еженедельно',
    id: TaskPeriodType.WEEKLY,
  },
  {
    code: 'MONTHLY',
    name: 'Ежемесячно',
    id: TaskPeriodType.MONTHLY,
  },
  {
    code: 'YEARLY',
    name: 'Ежегодно',
    id: TaskPeriodType.YEARLY,
  },
  {
    code: 'ONCE',
    name: 'Разово',
    id: TaskPeriodType.ONCE,
  },
];

export const weekdays = [
  {
    name: 'Понедельник',
    id: Weekday.MONDAY,
  },
  {
    name: 'Вторник',
    id: Weekday.TUESDAY,
  },
  {
    name: 'Среда',
    id: Weekday.WEDNESDAY,
  },
  {
    name: 'Четверг',
    id: Weekday.THURSDAY,
  },
  {
    name: 'Пятница',
    id: Weekday.FRIDAY,
  },
  {
    name: 'Суббота',
    id: Weekday.SATURDAY,
  },
  {
    name: 'Воскресенье',
    id: Weekday.SUNDAY,
  },
];

export const months = [
  {
    name: 'Январь',
    id: Month.JANUARY,
  },
  {
    name: 'Февраль',
    id: Month.FEBRUARY,
  },
  {
    name: 'Март',
    id: Month.MARCH,
  },
  {
    name: 'Апрель',
    id: Month.APRIL,
  },
  {
    name: 'Май',
    id: Month.MAY,
  },
  {
    name: 'Июнь',
    id: Month.JUNE,
  },
  {
    name: 'Июль',
    id: Month.JULY,
  },
  {
    name: 'Август',
    id: Month.AUGUST,
  },
  {
    name: 'Сентябрь',
    id: Month.SEPTEMBER,
  },
  {
    name: 'Октябрь',
    id: Month.OCTOBER,
  },
  {
    name: 'Ноябрь',
    id: Month.NOVEMBER,
  },
  {
    name: 'Декабрь',
    id: Month.DECEMBER,
  },
];
