import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { SheetModel, getColumn, getSheetById, updateColumnValue } from '../sheet.db'
import { ColumnType, Sheet } from '../sheet.type'
import { isLookup, validateValueByType } from '../sheet.utils'

export const createSheet = async (req: Request, res: Response) => {
    const sheet: Sheet = req.body
    try {
        const { _id } = await new SheetModel(sheet).save()
        res.send(_id)
    } catch (error) {
        res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR)
    }
}

export const getSheet = async (req: Request, res: Response) => {

}


