export class CommonHelper {
  static filterObjectProperties(obj: object, properties: string[]): object {
    return Object.keys(obj)
      .filter((key) => properties.includes(key))
      .reduce((cur, key) => Object.assign(cur, { [key]: obj[key] }), {});
  }

  static isEmptyArray(array: any[]): boolean {
    return !Array.isArray(array) || !array.length;
  }

  static getFilteredData<T>(originalData: T, newData: T, fields: string[]): T {
    const filteredData = {};

    fields.forEach((field) => {
      if (
        newData[field] !== undefined &&
        newData[field] !== originalData[field]
      ) {
        filteredData[field] = newData[field];
      }
    });

    return filteredData as T;
  }

  static convertToBooleanProperties<T>(obj: T, fields: string[]): T {
    const clone = JSON.parse(JSON.stringify(obj));

    fields.forEach((field) => {
      clone[field] = Boolean(clone[field]);
    });

    return clone as T;
  }

  static async asyncFilter<T>(arr: T[], predicate: (a: any) => Promise<boolean>): Promise<T[]> {
    const results = await Promise.all(arr.map(predicate));
  
    return arr.filter((_v, index) => results[index]);
  }
}
