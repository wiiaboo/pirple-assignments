/**
 * Library for storing and editing data
 */

// Dependencies
const fs = require('fs'),
    path = require('path');

// Container for the module (to be exported)
const lib = {};

// Base directory of the data folder
lib.baseDir = path.join(__dirname, '../.data');

/**
 * Create a data file.
 * 
 * @param {String} [dir='.'] - directory/table where the file will be stored
 * @param {String} fn - file/row where the data will be stored
 * @param {JSON} [data={}]
 * @callback errorCallback
 * @param {string|boolean} error
 */
lib.create = function(dir, fn, data, callback) {
    dir = dir || '.';
    data = data || {};
    callback = callback || ((_) => {});

    // Open file for writing
    fs.open(path.join(this.baseDir, dir, fn + '.json'), 'wx', (err, fd) => {
        if (err || !fd) {
            callback('Could not create new file, it may already exist.');
            return;
        }
        // convert data to string
        var stringData = JSON.stringify(data);

        // write to file and close it
        fs.writeFile(fd, stringData, (err) => {
            if (err) {
                callback('Error writing to new file.');
                return;
            }
            fs.close(fd, (err) => {
                if (err)
                    callback('Error closing new file.');
                else
                    callback(false);
            });
        });
    });
};

/**
 * Read a data file.
 * 
 * @param {String} [dir='.'] - directory/table where the file will be read from
 * @param {String} fn - file/row where the data will be read from
 * @callback dataCallback
 * @param {string|boolean} error
 * @param {string} data
 */
lib.read = function(dir, fn, callback) {
    fs.readFile(path.join(this.baseDir, dir, fn + '.json'), 'utf-8', (err, data) => {
        if (err)
            callback('Could not open requested file.', {});
        else
            callback(false, data);
    });
};

/**
 * Update a data file.
 * 
 * @param {String} [dir='.'] - directory/table where the file will be stored
 * @param {String} fn - file/row where the data will be stored
 * @param {JSON} [data={}]
 * @callback errorCallback
 * @param {string|boolean} error
 */
lib.update = function(dir, fn, data, callback) {
    fs.open(path.join(this.baseDir, dir, fn + '.json'), 'w+', (err, fd) => {
        if (err || !fd) {
            callback('Could not update file.');
            return;
        }
        var stringData = JSON.stringify(data);
        fs.writeFile(fd, stringData, (err) => {
            if (err)
                callback('Could not update existing file.');
            else
                fs.close(fd, (err) => {
                    if (err)
                        callback('Could not close file.');
                    else
                        callback(false);
                });
        });
    });
};

/**
 * Delete a data file.
 * 
 * @param {String} [dir='.'] - directory/table where the file will be deleted from
 * @param {String} fn - file/row which will be deleted
 * @callback errorCallback
 * @param {string|boolean} error
 */
lib.delete = function(dir, fn, callback) {
    fs.unlink(path.join(this.baseDir, dir, fn + '.json'), (err) => {
        if (err)
            callback('Could not delete file.');
        else
            callback(false);
    })
};

// Export the module
module.exports = lib;
