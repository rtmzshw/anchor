import { describe, test, expect } from "@jest/globals";
import request from 'supertest';
import assert from 'assert';
import express from 'express'
import { NextFunction, Request, Response } from 'express'
import { routeDecorator, validateBody } from "../../../../utils";
import { sheetSchema } from "../../sheet.validation";
import { createSheet, getSheet, getSheetExistence, updateRow } from "../../logic/sheet.logic";
import bodyParser from "body-parser";
import { sheetMock } from "../mocks";
import { connectDb, disconnectDb } from "../../../../db/connection";
import { SheetModel, getSheetById, updateColumnValue } from "../../sheet.db";
import { StatusCodes } from "http-status-codes";
import { Sheet } from "../../sheet.type";

const app = express();
let sheetId: string;
beforeAll(async () => {
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    await connectDb()
    app.put('/sheet/:sheetId', getSheetExistence, routeDecorator(updateRow));
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

describe.skip('Success - PUT /sheet/:sheetId', () => {
    it('basic update', async function () {
        const sheet = (await getSheetById(sheetId))!

        await sendPutRequest(sheet, { columnId: sheet.columns[0]._id, row: 1, value: true });

        const updatedSheet = (await getSheetById(sheetId))!
        const sheetMockCopy = { ...sheetMock }
        sheetMockCopy.columns[0].values = { "1": true }
        expect(updatedSheet.columns).toMatchObject(sheetMockCopy.columns)

    });

    it('multiple basic updates', async function () {
        const sheet = (await getSheetById(sheetId))!

        await sendPutRequest(sheet, { columnId: sheet.columns[0]._id, row: 1, value: true });
        await sendPutRequest(sheet, { columnId: sheet.columns[0]._id, row: 2, value: false });
        await sendPutRequest(sheet, { columnId: sheet.columns[1]._id, row: 5, value: 7 });
        await sendPutRequest(sheet, { columnId: sheet.columns[2]._id, row: 80, value: 12.4 });

        const updatedSheet = (await getSheetById(sheetId))!
        const sheetMockCopy = { ...sheetMock }
        sheetMockCopy.columns[0].values = { "1": true, "2": false }
        sheetMockCopy.columns[1].values = { "5": 7 }
        sheetMockCopy.columns[2].values = { "80": 12.4 }
        expect(updatedSheet.columns).toMatchObject(sheetMockCopy.columns)

    });

    it('multiple Lookup updates', async function () {
        const sheet = (await getSheetById(sheetId))!

        await sendPutRequest(sheet, { columnId: sheet.columns[0]._id, row: 1, value: true });
        await sendPutRequest(sheet, { columnId: sheet.columns[4]._id, row: 5, value: `lookup(${sheet.columns[5]._id},80)` });
        await sendPutRequest(sheet, { columnId: sheet.columns[5]._id, row: 80, value: `lookup(${sheet.columns[6]._id},4)` });
        await sendPutRequest(sheet, { columnId: sheet.columns[6]._id, row: 4, value: `lookup(${sheet.columns[0]._id},1)` });

        const updatedSheet = (await getSheetById(sheetId))!
        const sheetMockCopy = { ...sheetMock }
        sheetMockCopy.columns[0].values = { "1": true }
        sheetMockCopy.columns[4].values = { "5": `lookup(${sheet.columns[5]._id},80)` }
        sheetMockCopy.columns[5].values = { "80": `lookup(${sheet.columns[6]._id},4)` }
        sheetMockCopy.columns[6].values = { "4": `lookup(${sheet.columns[0]._id},1)` }
        expect(updatedSheet.columns).toMatchObject(sheetMockCopy.columns)

    });

});


describe('Fails - PUT /sheet/:sheetId', () => {
    it('wrong type assertion', async function () {
        const sheet = (await getSheetById(sheetId))!
        await request(app)
            .put(`/sheet/${sheetId}`)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .send({ columnId: sheet.columns[0]._id, row: 1, value: "text" })
            .expect(StatusCodes.BAD_REQUEST)

    });

    it('circular lookup', async function () {
        const sheet = (await getSheetById(sheetId))!
        await sendPutRequest(sheet, { columnId: sheet.columns[0]._id, row: 1, value: true });
        await sendPutRequest(sheet, { columnId: sheet.columns[4]._id, row: 5, value: `lookup(${sheet.columns[5]._id},80)` });
        await sendPutRequest(sheet, { columnId: sheet.columns[5]._id, row: 80, value: `lookup(${sheet.columns[6]._id},4)` });
        await sendPutRequest(sheet, { columnId: sheet.columns[6]._id, row: 4, value: `lookup(${sheet.columns[0]._id},1)` });

        await request(app)
            .put(`/sheet/${sheetId}`)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .send({ columnId: sheet.columns[0]._id, row: 1, value: `lookup(${sheet.columns[4]._id},5)` })
            .expect(StatusCodes.BAD_REQUEST)

    });

    it('Fails because sheet dosent exists', function (done) {
        request(app)
            .get(`/sheet/${"badId"}`)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .expect(StatusCodes.NOT_FOUND)
            .end(done)
    });


});


async function sendPutRequest(sheet: Sheet, update: { columnId: string, row: number, value: any }) {
    await request(app)
        .put(`/sheet/${sheetId}`)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .send(update);
}

