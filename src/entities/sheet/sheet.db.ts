import * as mongoose from 'mongoose';
import { ColumnType, Sheet } from './sheet.type';

const columnSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, enum: ColumnType, required: true },
    // TODO can be multiple types
    values: { type: Map, default: {} }
});

const SheetDbSchema = new mongoose.Schema({
    columns: { type: [columnSchema], required: true }
});


export const SheetModel = mongoose.model<Sheet>('sheets', SheetDbSchema);

export const getColumn = (sheetId: string, columnId: string) =>
    SheetModel.findOne({ _id: sheetId, "columns._id": columnId }, { [`columns.$`]: 1 }).lean()

export const getSheetById = (sheetId: string, projection?: {}) =>
    SheetModel.findOne({ _id: sheetId }, projection).lean()

//TODO improve any
export const updateColumnValue = (sheetId: string, columnId: string, row: number, value: any) =>
    SheetModel.updateOne({ _id: sheetId, "columns._id": columnId }, { [`columns.$.values.${row}`]: value }).lean()