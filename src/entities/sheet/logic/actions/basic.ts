import { getColumn } from "../../sheet.db"
import { ColumnType, Sheet } from "../../sheet.type"
import { Action } from "./action"

export class BasicAction implements Action {

    calcValue = (sheet: Sheet, value: any) => {
        return value
    }

     validate = async (sheetId: string, columnId: string, value: any): Promise<boolean> => {
        const result = (await getColumn(sheetId, columnId))!
        const { type } = result.columns[0]
        return validateValueByType[type](value)
    }

}

const validateValueByType: Record<keyof typeof ColumnType, (value: any) => boolean> = {

    boolean: (v) => typeof v === 'boolean',

    int: (v) => Number.isInteger(v),

    double: (v) => typeof v === 'number' && !Number.isInteger(v),

    string: (v) => typeof v === 'string',
}