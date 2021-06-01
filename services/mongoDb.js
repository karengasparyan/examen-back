import mongoose from 'mongoose';

class mongoDb {
    static connect = (DB_URL, option = null) => {
        mongoose.set('useNewUrlParser', true);
        mongoose.set('useFindAndModify', false);
        mongoose.set('useCreateIndex', true);
        mongoose.set('useUnifiedTopology', true);
        mongoose.connect(DB_URL, option);

        mongoose.connection.on('error', err => {
            console.error(err);
            console.log(
                'MongoDB connection failed: ' + DB_URL
            );
            process.exit();
        });
    }

    static close = () => {
        mongoose.connection.close();
    }
}

export default mongoDb;