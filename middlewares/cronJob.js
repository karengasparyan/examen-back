const CronJob = require('cron').CronJob;
import {events} from "../models";


// const differenceDate = (date) => {
//     const currentDate = new Date();
//     const myDate = new Date(date);
//     return currentDate.getTime() === myDate.getTime()
// };

// export default function cronNode() {
//     let job = new CronJob('* 1 * * * *', function() {
//         console.log('You will see this message every second');
//     });
//     job.start();
// }
export default function cronNode() {
    const CRON_DURATION = '20';

    const getDuration = (minute, myDate, cronDuration) => {
        const currentDate = new Date();
        return currentDate.getTime() >= minute * 60 * 1000 + myDate.getTime() - +cronDuration * 60 * 1000
    };

    const checkEvents = async () => {
        try {
            const event = await events.find();
            event.forEach(e => {
                if (e.status === 'active' && getDuration(e.duration, e.updatedAt, CRON_DURATION)) {
                    updateEventStatus(e._id)
                }
            });
        } catch (e) {
        }
    };

    const updateEventStatus = async (_id) => {
        try {
            await events.findOneAndUpdate({_id}, {
                status: 'finished',
            }, {new: true});
        } catch (e) {
        }
    };

    const job = new CronJob(`*/${CRON_DURATION} * * * *`, async () => {
        await checkEvents()
    });
    job.start()
};