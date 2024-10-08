
const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    url_api: {
        type: String,
        required: true,
    },
    path: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    package: [
        {
            name: {
                type: String,
                required: true,
            },
            package_name: {
                type: String,
                required: true,
            },
            price: {
                type: String,
                required: true,
            }
        }
    ]
});

const Service = mongoose.model('Service', serviceSchema);


module.exports = Service;