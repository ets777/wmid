export class DatabaseHelper {
  static getSqlInsert(tableName: string, data: object): string {
    const columnNames = Object.keys(data).join(',');
    const columnValues = Object.values(data)
      .map((value) => {
        switch (typeof value) {
          case 'string':
            return `'${value}'`;
          case 'boolean':
            return `${Number(value)}`;
          default:
            return `${value}`;
        }
      })
      .join(',');

    return `insert into ${tableName} (
      ${columnNames}
    ) values (
      ${columnValues}
    )`;
  }

  static getSqlUpdate(
    tableName: string,
    data: object,
    where: object,
    updateDate = false,
  ): string {
    const sqlSets = Object.entries(data)
      .map(([key, value]) => {
        switch (typeof value) {
          case 'string':
            return `${key} = '${value}'`;
          case 'boolean':
            return `${key} = ${Number(value)}`;
          default:
            return `${key} = ${value}`;
        }
      })
      .join(',');

    const [whereCondition] = Object.entries(where).map(([key, value]) => {
      switch (typeof value) {
        case 'string':
          return `${key} = '${value}'`;
        case 'boolean':
          return `${key} = ${Number(value)}`;
        default:
          return `${key} = ${value}`;
      }
    });

    const updateDateSet = updateDate ? ', updatedAt = now()' : '';

    return `update ${tableName}
      set ${sqlSets}${updateDateSet}
      where ${whereCondition}`;
  }
}
