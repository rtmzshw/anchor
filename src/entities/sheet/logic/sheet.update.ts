import { Request, Response } from 'express'
import { StatusCodes } from "http-status-codes"
import { getColumn, getSheetById, updateColumnValue } from "../sheet.db"
import { Column, ColumnType, Sheet } from "../sheet.type"
import { isLookup, validateValueByType } from "../sheet.utils"

export const updateRow = async (req: Request, res: Response) => {
    const { sheetId } = req.params
    const { columnId, row, value } = req.body

    //TODO error handler
    const result = await getColumn(sheetId, columnId)
    if (!result) {
        res.sendStatus(StatusCodes.NOT_FOUND)
        return
    }
    const columnToInsertTo = result.columns[0]

    if (isLookup(value) && !validateLookup(sheetId, columnId, value, columnToInsertTo)) {
        res.sendStatus(StatusCodes.BAD_REQUEST)
        return
    }

    const { type } = columnToInsertTo
    if (!validateValueByType[type as ColumnType](value)) {
        res.sendStatus(StatusCodes.BAD_REQUEST)
        return
    }

    await updateColumnValue(sheetId, columnId, row, value)
    res.sendStatus(StatusCodes.OK)

}

const validateLookup = async (sheetId: string, columnId: string, value: string, columnToInsertTo: Column) => {
    const sheet: Sheet = (await getSheetById(sheetId))!
    const [lookupColId, lookupRow] = getColIdAndRowFromLookup(value)
    const lookupCol = sheet.columns.find(column => lookupColId === column._id.toString())

    if (!lookupCol || lookupCol.type != columnToInsertTo.type) {
        return false
    }

    const circularitySet = new Set<String>([signCollIdAndRow(columnId, lookupRow)])
    if (isCircular(circularitySet, lookupColId, lookupRow, sheet!)) {
        return false
    }

    return true
}

const isCircular = (set: Set<String>, nextCellColId: string, nextCellRow: number, sheet: Sheet): boolean => {

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