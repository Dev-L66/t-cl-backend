import mongoose from 'mongoose';

const connectToDb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to database.');
    } catch (error) {
        console.log(`Error connectiong to database ${error.message}`);
        process.exit(1);
    }
}

export default connectToDb;