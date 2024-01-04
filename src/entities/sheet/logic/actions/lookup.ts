import { getSheetById } from "../../sheet.db"
import { Sheet } from "../../sheet.type"
import { isLookup } from "../../sheet.utils"
import { Action } from './action'

export class Lookup implements Action {
    calcValue = (sheet: Sheet, value: any): any => {
        const [lookupColId, lookupRow] = getColIdAndRowFromLookup(value)

        const nextCell = getNextCell(sheet, lookupColId, lookupRow)
        if (isLookup(nextCell)) {
            return this.calcValue(sheet, nextCell)
        }

        //TODO optimize it to change sheet value here
        return nextCell ?? null
    }

    validate = async (sheetId: string, columnId: string,row:number, value: any): Promise<boolean> => {
        const sheet: Sheet = (await getSheetById(sheetId))!
        const columnToInsertTo = sheet.columns.find(column => column._id.toString() === columnId)!

        const [lookupColId, lookupRow] = getColIdAndRowFromLookup(value)
        const lookupCol = sheet.columns.find(column => lookupColId === column._id.toString())

        if (!lookupCol || lookupCol.type != columnToInsertTo.type) {
            return false
        }

        const circularitySet = new Set<String>([signCollIdAndRow(columnId, row)])
        if (isCircular(circularitySet, lookupColId, lookupRow, sheet!)) {
            return false
        }

        return true
    }
}

const isCircular = (set: Set<String>, nextCellColId: string, nextCellRow: number, sheet: Sheet): boolean => {
console.log(set);

    if (isCicular(set, nextCellColId, nextCellRow))
        return true

    set.add(signCollIdAndRow(nextCellColId, nextCellRow))

    const nextCell = getNextCell(sheet, nextCellColId, nextCellRow)

    if (isLookup(nextCell)) {
        const [lookupColId, lookupRow] = getColIdAndRowFromLookup(nextCell)
        return isCircular(set, lookupColId, lookupRow, sheet)
    }

    return false
}

const getColIdAndRowFromLookup = (value: string): [string, number] => {
    const regex = /\(([^)]+)\)/;
    const valueBetweenParentheses = value.match(regex)![0]
    const [lookupColId, lookupRow] = valueBetweenParentheses.replace(/[()]/g, '').split(",")
    return [lookupColId, parseInt(lookupRow)]
}

const signCollIdAndRow = (columnId: string, row: number) => `${columnId},${row}`

const getNextCell = (sheet: Sheet, nextCellColId: string, nextCellRow: number) => {
    const column = sheet.columns.find(column => nextCellColId === column._id.toString())
    const nextValue = column!.values[nextCellRow]
    return nextValue
}

const isCicular = (set: Set<String>, nextCellColId: string, nextCellRow: number) => {
    const setLength = set.size
    set.add(signCollIdAndRow(nextCellColId, nextCellRow))
    return setLength === set.size
}
