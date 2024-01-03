const express = require('express')
const bodyParser = require('body-parser');
import { connectDb } from "./db/connection";
import sheetsRouter from "./entities/sheet/sheet.api";
const app = express()
const port = 3000

app.listen(port, async () => {
    app.use(bodyParser.json())
    app.use('/sheet', sheetsRouter)
    await connectDb()
    console.log(`app listening on port ${port}`)
})