import { describe, expect } from "@jest/globals";
import { sheetMock } from "../../../test/mocks";
import { SheetModel, getSheetById, updateColumnValue } from "../../../sheet.db";
import { connectDb, disconnectDb } from "../../../../../db/connection";
import { Lookup } from "../lookup";


let sheetId: string;
beforeAll(async () => {
    await connectDb()
});

beforeEach(async () => {
    const { _id } = await new SheetModel(sheetMock).save()
    sheetId = _id
});

afterEach(async () => {
    await SheetModel.deleteMany({})
});

afterAll(async () => {
    await disconnectDb()
});

describe('Fail- validate lookup assertion', () => {

    it('fails because single circularity', async () => {
        const sheet = (await getSheetById(sheetId))!
        await updateColumnValue(sheetId, sheet.columns[0]._id, 1, true)

        const result = await new Lookup().validate(sheet._id, sheet.columns[0]._id.toString(), 1, `lookup(${sheet.columns[0]._id},1)`)

        expect(result).toBe(false)
    });

    it('fails because multiple circularity', async () => {
        const sheet = (await getSheetById(sheetId))!
        await updateColumnValue(sheetId, sheet.columns[0]._id, 1, true)
        await updateColumnValue(sheetId, sheet.columns[4]._id, 5, `lookup(${sheet.columns[5]._id},80)`)
        await updateColumnValue(sheetId, sheet.columns[5]._id, 80, `lookup(${sheet.columns[6]._id},4)`)
        await updateColumnValue(sheetId, sheet.columns[6]._id, 4, `lookup(${sheet.columns[0]._id},1)`)

        const result = await new Lookup().validate(sheet._id, sheet.columns[0]._id.toString(), 1, `lookup(${sheet.columns[4]._id},5)`)

        expect(result).toBe(false)
    });


    it('fails because wrong type assertion', async () => {
        const sheet = (await getSheetById(sheetId))!
        await updateColumnValue(sheetId, sheet.columns[0]._id, 1, true)

        const result = await new Lookup().validate(sheet._id, sheet.columns[0]._id.toString(), 1, `lookup(${sheet.columns[1]._id},5)`)

        expect(result).toBe(false)
    });

});

describe('Success- validate lookup assertion', () => {

    it('success type assertion', async () => {
        const sheet = (await getSheetById(sheetId))!
        await updateColumnValue(sheetId, sheet.columns[0]._id, 1, true)
        await updateColumnValue(sheetId, sheet.columns[5]._id, 5, `lookup(${sheet.columns[5]._id},80)`)
        await updateColumnValue(sheetId, sheet.columns[5]._id, 80, `lookup(${sheet.columns[6]._id},4)`)

        const result = await new Lookup().validate(sheet._id, sheet.columns[6]._id.toString(), 4, `lookup(${sheet.columns[0]._id},1)`)

        expect(result).toBe(true)
    });

});


