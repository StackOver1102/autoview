const express = require("express");
const connectDb = require("./util/db")
const app = express();
const Service = require('./models/services');
const TaskQueue = require('./models/taskQueue');
const Order = require('./models/order');
const Account = require('./models/account');

const dotenv = require("dotenv")
const methodOverride = require('method-override');

dotenv.config()
const { initializeTaskQueue, scheduleTask, stopCronJob, handleTaskUpdate } = require('./services/taskScheduler');

app.set("view engine", "ejs");

app.use(express.static('public'));
app.use(methodOverride('_method'));

app.use(express.urlencoded({ extended: true }));

app.use(express.json());

// ------view-----
app.get("/", async (req, res) => {
    try {
        const services = await Service.find({});
        res.render("index", { services, query: "" });
    } catch (err) {
        res.status(500).send("Error fetching services.");
    }
});
app.get("/task", async (req, res) => {
    try {
        const tasks = await TaskQueue.find({});
        res.render("task", { tasks });
    } catch (err) {
        res.status(500).send("Error fetching tasks.");
    }
});
app.get("/order", async (req, res) => {
    try {
        const orders = await Order.find({});
        res.render("order", { orders });
    } catch (err) {
        res.status(500).send("Error fetching orders.");
    }
});
app.get("/user", async (req, res) => {
    try {
        res.render("account");
    } catch (err) {
        res.status(500).send("Error fetching account.");
    }
});
app.post('/submit', async (req, res) => {
    const { name, package, time_range, link, max_quantity, min_quantity, end_time, start_time, user } = req.body;

    if (!user) {
        return res.render('index', { query: { message: 'Vui long chon user!' } });
    }
    const links = link.split('\n').map(l => l.trim()).filter(Boolean)

    try {
        const account = await Account.findById(user)
        // Create a new task in the task queue
        const newTask = new TaskQueue({
            serviceName: name,
            package: package,
            link: links,
            max_quantity,
            min_quantity,
            range: time_range,
            isRun: 0,
            isAvailable: true,
            start_time,
            end_time,
            user: account._id
        });

        // Save the task to the database
        await newTask.save();

        await scheduleTask(newTask);

        console.log('New task added to the queue:', newTask);

        res.render('index', { query: { message: 'Task added to the queue successfully!' } });
    } catch (error) {
        console.error('Error adding task to the queue:', error);
        res.status(500).send('Failed to add task to the queue.');
    }
});
// ------end view-----


// ------------api-------------
app.get('/api/services', async (req, res) => {
    try {
        const services = await Service.find({});  // Fetch services from MongoDB
        res.json(services);  // Respond with JSON data
    } catch (err) {
        res.status(500).json({ error: 'Error fetching services.' });
    }
});
app.get('/api/task/:id', async (req, res) => {
    try {
        const task = await TaskQueue.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.json(task);
    } catch (error) {
        console.error('Error fetching task:', error);
        res.status(500).json({ message: 'Failed to fetch task details' });
    }
});
app.get("/api/user", async (req, res) => {
    try {
        const account = await Account.find({});
        return res.json(account);
    } catch (error) {
        console.log("🚀 ~ app.get ~ error:", error)

    }
})
app.post('/api/user', async (req, res) => {
    try {
        const { name, apiKey } = req.body;
        const newUser = new Account({ name, apiKey });
        await newUser.save();
        return res.status(201).json(newUser);
    } catch (error) {
        console.error('Error adding user:', error);
        return res.status(500).json({ message: 'Failed to add user.' });
    }
});
app.delete('/api/user/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const deletedUser = await Account.findByIdAndDelete(userId);
        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found.' });
        }
        return res.status(200).json({ message: 'User deleted successfully.' });
    } catch (error) {
        console.error('Error deleting user:', error);
        return res.status(500).json({ message: 'Failed to delete user.' });
    }
});

app.post('/task/:id/edit', async (req, res) => {
    try {
        const taskId = req.params.id;
        let updatedTaskData = req.body;

        if (updatedTaskData.link) {
            updatedTaskData.link = updatedTaskData.link.split('\n').map(l => l.trim()).filter(Boolean);
        }
        if (updatedTaskData.isAvailable == 'false') {
            await stopCronJob(taskId)
        } else if (updatedTaskData.isAvailable == "true") {
            await handleTaskUpdate(taskId)
        }

        const updatedTask = await TaskQueue.findByIdAndUpdate(taskId, updatedTaskData, { new: true });

        if (!updatedTask) {
            return res.status(404).json({ message: 'Task not found' });
        }

        res.redirect('/task'); // Redirect lại danh sách task sau khi chỉnh sửa
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).send('Failed to update task.');
    }
});
app.delete('/task/:id', async (req, res) => {
    try {
        const taskId = req.params.id;

        const updatedTask = await TaskQueue.findByIdAndDelete(taskId);

        if (!updatedTask) {
            return res.status(404).json({ message: 'Task not found' });
        }

        await stopCronJob(taskId)

        res.redirect('/task'); // Redirect back to the task list after editing
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).send('Failed to update task.');
    }
});

app.delete('/deleteService', async (req, res) => {
    try {
        // const { ids } = req.body; // Giả sử `ids` là một mảng các id được gửi trong body của request

        // console.log("🚀 ~ app.delete ~ ids:", ids)
        // if (!Array.isArray(ids) || ids.length === 0) {
        //     return res.status(400).json({ message: 'No ids provided or invalid format.' });
        // }

        // // Xóa các dịch vụ có `_id` nằm trong mảng `ids`
        // const result = await Service.deleteMany({ _id: { $in: ids } });

        // if (result.deletedCount === 0) {
        //     return res.status(404).json({ message: 'No services found to delete.' });
        // }
        await Service.deleteMany({});
        // Trả về thông báo thành công cùng với số lượng dịch vụ đã xóa
        res.status(200).json({ message: `${result.deletedCount} services deleted successfully.` });
    } catch (error) {
        console.error('Error deleting services:', error);
        res.status(500).json({ message: 'Failed to delete services.' });
    }
});
// ------------ end api-------------


const PORT = 3000;

async function startServer() {
    try {
        await connectDb();
        await initializeTaskQueue();

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (err) {
        console.error('Failed to start server:', err);
    }
}

startServer();