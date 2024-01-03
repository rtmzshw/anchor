import { Router, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { routeDecorator, validateBody } from '../../utils'
import { SheetModel, getColumn, updateColumnValue } from './sheet.db'
import { sheetSchema, updateRowRequest } from './sheet.validation'
import { Sheet, ColumnType } from './sheet.type'
import { validateValueByType } from './sheet.utils'
import { createSheet, getSheet, updateRow } from './logic/sheet.logic'

const sheetsRouter = Router()


sheetsRouter.post('/', validateBody(sheetSchema), routeDecorator(createSheet))

sheetsRouter.get('/:sheetId', routeDecorator(getSheet))

sheetsRouter.put('/:sheetId',validateBody(updateRowRequest), routeDecorator(updateRow))

export default sheetsRouter