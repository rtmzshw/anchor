
import * as Joi from 'joi'
import { ColumnType } from './sheet.type'

export const sheetSchema = Joi.object({
    columns: Joi.array().items(
        Joi.object().keys({
            name: Joi.string().required(),
            type: Joi.string().valid(...Object.values(ColumnType)),
        })
    ).required()
}).required()

export const updateRowRequest = Joi.object({
    columnId: Joi.string().hex().length(24).required(),
    row: Joi.number().integer().required(),
    value: Joi.required()
}).required()