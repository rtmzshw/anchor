import { NextFunction, Request, Response } from "express"
import { StatusCodes } from "http-status-codes"
import { ObjectSchema } from "joi"

const { logInfo } = require("./logger/logger")

// use it before every route, helps with investigating problems
export const routeDecorator = (routeFunction: (req: Request, res: Response, next: NextFunction) => any) => (req: Request, res: Response, next: NextFunction) => {
    try {
        logInfo("started handeling", routeFunction.name)
        routeFunction(req, res, next)
        logInfo("success handeling", routeFunction.name)
    } catch (error) {
        logInfo("failed handeling", routeFunction.name)
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