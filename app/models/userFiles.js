var mongoose = require('mongoose');


var userFiles = mongoose.Schema({
        id         : String,
        name       : String,
        size       : String,
        date       : String,
        isFolder   : Boolean,
        directory  : String,
        path       : String
});

module.exports = mongoose.model('UserFiles', userFiles);
