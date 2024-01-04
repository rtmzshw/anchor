import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { SheetModel, getColumn, getSheetById, updateColumnValue } from '../sheet.db'
import { Sheet } from '../sheet.type'
import { actionFactory, getActionType } from '../sheet.utils'

export const createSheet = async (req: Request, res: Response) => {
    const sheet: Sheet = req.body
    const { _id } = await new SheetModel(sheet).save()
    res.send({ _id })
}

export const getSheet = async (req: Request, res: Response) => {
    let sheet = (await getSheetById(req.params.sheetId))!
    const result = sheet.columns.map((column, index) => {
        const calculatedValues = Object.entries(column.values)?.map(([key, value]) => {
            const action = getActionType(value)
            const calculationAction = actionFactory[action].calcValue
            return { [key]: calculationAction(sheet!, value) }
        })
        return { id: column._id, name: column.name, values: calculatedValues }
    })

    res.json(result)
}

export const updateRow = async (req: Request, res: Response) => {
    const { sheetId } = req.params
    const { columnId, row, value } = req.body

    const result = await getColumn(sheetId, columnId)
    if (!result) {
        res.sendStatus(StatusCodes.NOT_FOUND)
        return
    }

    const action = getActionType(value)
    const validationFunction = actionFactory[action].validate

    if (!await validationFunction(sheetId, columnId, row, value)) {
        res.sendStatus(StatusCodes.BAD_REQUEST)
        return
    }

    await updateColumnValue(sheetId, columnId, row, value)
    res.sendStatus(StatusCodes.OK)

}

export const getSheetExistence = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const sheet = await getSheetById(req.params.sheetId, { _id: 1 })
        if (!sheet) throw new Error()
    } catch (error) {
        res.sendStatus(StatusCodes.NOT_FOUND)
        return
    }
    next()
}
//TODO edge case- lookup point to non existing cell


