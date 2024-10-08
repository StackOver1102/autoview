const cron = require('node-cron');
const TaskQueue = require('../models/taskQueue');
const Service = require('../models/services');
const Order = require('../models/order');
const Account = require('../models/account');

const { sendReqBuy } = require('./request');

const apiKey = process.env.API_KEY || 'NDgwNQ==4f02624d4643b9c6ede9d39faMTYxNzk3OTc1Mg==';

const cronJobs = {};

function getRandomInRange(min, max) {
    if (min > max) {
        throw new Error("Min value should be less than max value.");
    }
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function scheduleTask(task) {
    const { serviceName, range, isRun, isAvailable, min_quantity, max_quantity, link, package, end_time, user } = task;

    // If the task is not available or is already running, don't schedule it
    if (!isAvailable || isRun) {
        console.log(`Task ${task._id} is not available or already running.`);
        return;
    }
    if (!user) {
        console.log(`user not found`)
        return;
    }
    const now = new Date();
    if (now >= end_time) {
        console.log(`Task ${task._id} has already reached its end time. It will not be scheduled.`);
        await TaskQueue.findByIdAndUpdate(task._id, { isAvailable: false });
        console.log(`Task ${task._id} has been marked as unavailable.`);
        return;
    }
    // Check if the task already has a cron job running
    if (cronJobs[task._id]) {
        console.log(`Task ${task._id} already has a cron job running.`);
        return;
    }

    // Ensure serviceName exists
    if (!serviceName) {
        console.log(`serviceName is required`);
        return;
    }

    const findService = await Service.findOne({ name: serviceName });

    const findUser = await Account.findById(user)
    // Define the cron expression based on the task's range
    let cronExpression;
    if (range < 60) {
        cronExpression = `*/${range} * * * *`;  // Runs every 'range' minutes
    } else {
        const hours = range / 60;
        cronExpression = `0 */${hours} * * *`;  // Runs every 'range' hours
    }

    // Create the cron job
    const cronJob = cron.schedule(cronExpression, async () => {
        const currentTime = new Date();

        // Stop the cron job if the current time is greater than the end_time
        if (currentTime >= end_time) {
            console.log(`Stopping task ${task._id} as the end time has been reached.`);
            cronJob.stop();
            delete cronJobs[task._id];  // Remove the cron job reference
            return;
        }

        if (!task.isAvailable) {
            console.log(`Stopping task ${task._id} as it's no longer available.`);
            cronJob.stop();
            delete cronJobs[task._id];  
            return;
        }

        const quantity = getRandomInRange(min_quantity, max_quantity);
        try {

            const linksArray = Array.isArray(link) ? link : [link];
            // Process each link in the array
            await Promise.all(linksArray.map(async (singleLink) => {
                console.log("🚀 ~ cronJob ~ quantity:", quantity, "for link:", singleLink);
                console.log("🚀 ~ scheduleTask ~ findUser:", findUser)

                // Uncomment below to send the request to each link
                const result = await sendReqBuy(findService.url_api, singleLink, quantity, package, findUser.apiKey);
                if (result) {
                    const newOrder = new Order({
                        url: singleLink,
                        quantity,
                        nameService: serviceName,
                        package_name: package
                    });
                    await newOrder.save();
                    console.log(`Task ${task._id} processed successfully for link: ${singleLink}`);
                } else {
                    console.log(`Task ${task._id} processing failed for link: ${singleLink}`);
                }
            }));
        } catch (error) {
            console.error(`Error processing task ${task._id}:`, error);
        }
    });

    // Store the cron job reference in the global map
    cronJobs[task._id] = cronJob;
    console.log(`Task ${task._id} scheduled.`);
}

async function initializeTaskQueue() {
    try {
        const tasks = await TaskQueue.find({ isAvailable: true });
        if (tasks && tasks.length > 0) {
            tasks.forEach(task => scheduleTask(task));
        } else {
            console.log("No tasks available.");
        }
    } catch (error) {
        console.error('Error initializing task queue:', error);
    }
}

async function stopCronJob(taskId) {
    if (cronJobs[taskId]) {
        cronJobs[taskId].stop();  
        delete cronJobs[taskId];   
        console.log(`Cron job for task ${taskId} has been stopped and removed.`);
    } else {
        console.log(`No active cron job found for task ${taskId}.`);
    }
}

async function handleTaskUpdate(taskId) {
    try {
        const task = await TaskQueue.findById(taskId);

        if (!task) {
            console.log(`Task ${taskId} not found.`);
            return;
        }

        if (task.isAvailable) {
            console.log(`Task ${taskId} is now available. Scheduling task.`);
            scheduleTask(task);
        } else {
            console.log(`Task ${taskId} is no longer available. Stopping cron job.`);
            stopCronJob(taskId);
        }
    } catch (error) {
        console.error(`Error handling task update for task ${taskId}:`, error);
    }
}

module.exports = { scheduleTask, initializeTaskQueue, stopCronJob, handleTaskUpdate };
