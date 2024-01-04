
export enum ColumnType {
    string = 'string',
    double = 'double',
    int = 'int',
    boolean = 'boolean',
}

export enum ActionType {
    basic = "basic",
    lookup = "lookup",
}
export interface Sheet {
    _id: string
    columns: Column[]
}

export interface Column {
    _id: string
    name: String;
    values: Record<number, any>
    type: keyof typeof ColumnType
}