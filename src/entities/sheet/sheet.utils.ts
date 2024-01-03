import { ColumnType } from "./sheet.type";

//Choose it over OOP
export const validateValueByType: Record<keyof typeof ColumnType, (value: any) => boolean> = {
    
    boolean: (v) => typeof v === 'boolean',

    int: (v) => Number.isInteger(v),

    double: (v) => typeof v === 'number' && !Number.isInteger(v),

    string: (v) => typeof v === 'string',

    lookup: (v) => typeof v === 'string',
}

export const isLookup =(value:string) => /^lookup\(\w+,\d+\)$/.test(value)