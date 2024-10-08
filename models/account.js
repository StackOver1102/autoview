
const mongoose = require('mongoose');

const AccountSchema = new mongoose.Schema({
    name: {
        type: String
    },
    apiKey:{
        type: String
    }
});

const Account = mongoose.model('Account', AccountSchema);


module.exports = Account;