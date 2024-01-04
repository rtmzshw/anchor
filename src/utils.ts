import { NextFunction, Request, Response } from "express"
import { StatusCodes } from "http-status-codes"
import { ObjectSchema } from "joi"

const { logInfo } = require("./logger/logger")

export const routeDecorator = (routeFunction: (req: Request, res: Response, next: NextFunction) => any) => (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now()
    try {
        logInfo("started handeling", routeFunction.name,)
        routeFunction(req, res, next)
        logInfo("success handeling", { name: routeFunction.name, exectionDuration: Date.now() - startTime })
    } catch (error) {
        logInfo("failed handeling", { name: routeFunction.name, exectionDuration: Date.now() - startTime })
        res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR)
    }
}


export const validateBody = (schema: ObjectSchema<any>) => (req: Request, res: Response, next: NextFunction) => {
    const isNotValid = schema.validate(req.body).error;
    if (isNotValid) {
        res.sendStatus(StatusCodes.BAD_REQUEST)
        return
    }

    next()
}