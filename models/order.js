
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    url: String,
    quantity: Number,
    nameService: String,
    package_name: String
});

const Order = mongoose.model('Order', orderSchema);


module.exports = Order;