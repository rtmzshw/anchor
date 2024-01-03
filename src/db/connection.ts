import * as mongoose from 'mongoose';

let mongoClient: mongoose.Mongoose

export const connectDb = async () => {
    //env
    const connectionString = 'mongodb://localhost:27017';
    mongoClient = await mongoose.connect(connectionString);

}
