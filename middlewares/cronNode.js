import cron from 'node-cron';

const {events} = require("../models").models;

const checkEvents = async () => {
    const event = await events.find();
    console.log(event)
};

export default function cronNode(){
        const task = cron.schedule('*/1 * * * *', async () => {
            // await checkEvents();
            console.log('running on Sundays of January and September');
        },{scheduled:true});
        task.start();
}


