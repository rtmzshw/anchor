import { Router } from 'express'
import { routeDecorator, validateBody } from '../../utils'
import { createSheet, getSheet, getSheetExistence, updateRow } from './logic/sheet.logic'
import { sheetSchema, updateRowRequest } from './sheet.validation'
import { getSheetById } from './sheet.db'

const sheetsRouter = Router()


sheetsRouter.post('/', validateBody(sheetSchema), routeDecorator(createSheet))

//TODO check if sheet exists
sheetsRouter.get('/:sheetId', getSheetExistence, routeDecorator(getSheet))

sheetsRouter.put('/:sheetId', validateBody(updateRowRequest), getSheetExistence, routeDecorator(updateRow))


export default sheetsRouter