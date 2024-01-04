import * as mongoose from 'mongoose';


export const connectDb = async () => {
    //env
    const connectionString = 'mongodb://localhost:27017';
    await mongoose.connect(connectionString);

}

export const disconnectDb = () => mongoose.disconnect();
