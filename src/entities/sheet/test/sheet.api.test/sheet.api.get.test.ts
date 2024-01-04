import { describe, test, expect } from "@jest/globals";
import request from 'supertest';
import assert from 'assert';
import express from 'express'
import { NextFunction, Request, Response } from 'express'
import { routeDecorator, validateBody } from "../../../../utils";
import { sheetSchema } from "../../sheet.validation";
import { createSheet, getSheet, getSheetExistence } from "../../logic/sheet.logic";
import bodyParser from "body-parser";
import { sheetMock } from "../mocks";
import { connectDb, disconnectDb } from "../../../../db/connection";
import { SheetModel, getSheetById, updateColumnValue } from "../../sheet.db";
import { StatusCodes } from "http-status-codes";

const app = express();
let sheetId: string;
beforeAll(async () => {
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    await connectDb()
    app.get('/sheet/:sheetId', getSheetExistence, routeDecorator(getSheet));
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

describe('GET /sheet/:sheetId', () => {
    it('responds with a basic sheet', async function () {
        const sheet = (await getSheetById(sheetId))!

        await updateColumnValue(sheetId, sheet.columns[0]._id, 1, true)
        await updateColumnValue(sheetId, sheet.columns[1]._id, 5, 7)
        await updateColumnValue(sheetId, sheet.columns[2]._id, 80, 12.4)
        await updateColumnValue(sheetId, sheet.columns[3]._id, 4, "text")

        const res = await request(app)
            .get(`/sheet/${sheetId}`)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')

        const expectedResult = sheetMock.columns.map((c : any) => ({ name: c.name, values: [] as any[] }))
        expectedResult[0].values.push({ "1": true })
        expectedResult[1].values.push({ "5": 7 })
        expectedResult[2].values.push({ "80": 12.4 })
        expectedResult[3].values.push({ "4": "text" })

        expect(res.body).toMatchObject(expectedResult)

    });

    it('responds with a complex sheet', async function () {
        const sheet = (await getSheetById(sheetId))!
        await updateColumnValue(sheetId, sheet.columns[0]._id, 1, true)
        await updateColumnValue(sheetId, sheet.columns[4]._id, 5, `lookup(${sheet.columns[5]._id},80)`)
        await updateColumnValue(sheetId, sheet.columns[5]._id, 80, `lookup(${sheet.columns[6]._id},4)`)
        await updateColumnValue(sheetId, sheet.columns[6]._id, 4, `lookup(${sheet.columns[0]._id},1)`)
        await updateColumnValue(sheetId, sheet.columns[1]._id, 5, 7)
        await updateColumnValue(sheetId, sheet.columns[2]._id, 80, 12.4)

        const res = await request(app)
            .get(`/sheet/${sheetId}`)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')

        const expectedResult = sheetMock.columns.map((c : any) => ({ name: c.name, values: [] as any[] }))
        expectedResult[0].values.push({ "1": true })
        expectedResult[4].values.push({ "5": true })
        expectedResult[5].values.push({ "80": true })
        expectedResult[6].values.push({ "4": true })
        expectedResult[1].values.push({ "5": 7 })
        expectedResult[2].values.push({ "80": 12.4 })

        expect(res.body).toMatchObject(expectedResult)
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


