const { db } = require("./connection")
const getShortUrl = async (sourceUrl) => {
    const dbConnection = await db()
    const res = await dbConnection.collection('urls').find({ sourceUrl }).toArray()
    return res[0]
}

const createNewShortUrl = async (sourceUrl, shortUrl) => {
    const dbConnection = await db()
    await dbConnection.collection('urls').insertMany([{ sourceUrl, shortUrl }])
}

module.exports = { getShortUrl, createNewShortUrl };