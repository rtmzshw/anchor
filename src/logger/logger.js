const logInfo = (msg, additionalInfo) => console.log(msg, additionalInfo);

const logError = (error, msg, additionalInfo) => console.error(error, msg, additionalInfo);

module.exports = { logInfo , logError};