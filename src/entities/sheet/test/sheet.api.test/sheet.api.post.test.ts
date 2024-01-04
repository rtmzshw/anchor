import { describe, test, expect } from "@jest/globals";
import request from 'supertest';
import assert from 'assert';
import express from 'express'
import { NextFunction, Request, Response } from 'express'
import { routeDecorator, validateBody } from "../../../../utils";
import { sheetSchema } from "../../sheet.validation";
import { createSheet } from "../../logic/sheet.logic";
import bodyParser from "body-parser";
import { sheetMock } from "../mocks";
import { connectDb, disconnectDb } from "../../../../db/connection";
import { SheetModel, getSheetById } from "../../sheet.db";
import { StatusCodes } from "http-status-codes";

const app = express();
beforeAll(async () => {
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    await connectDb()
    app.post('/sheet', validateBody(sheetSchema), routeDecorator(createSheet));


});
afterAll(async () => {
    await SheetModel.deleteMany({})
    await disconnectDb()
});

describe('POST /sheet', () => {

    it('responds id and adds DB', function (done) {
        request(app)
            .post('/sheet')
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .send(sheetMock)
            .end(async (err: any, res: any) => {
                const { _id } = res.body
                expect(_id).toBeTruthy();
                const doc = await getSheetById(_id)
                expect(doc).toMatchObject(sheetMock)
                done()
            })

    });

    it('fails because invalid type', function (done) {
        const badSheet = {...sheetMock}
        badSheet.columns.push({name: "asdsa", type: "asdasd"})
        request(app)
            .post('/sheet')
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .send(badSheet)
            .expect(StatusCodes.BAD_REQUEST)
            .end(done);

    });

    it('fails because no body attached', function (done) {
        request(app)
            .post('/sheet')
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .expect(StatusCodes.BAD_REQUEST)
            .end(done);

    });

});
