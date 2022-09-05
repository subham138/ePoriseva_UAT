// use = util.promisify for async/await "npm i util.promisify"
const util = require('util');
const mysql = require('mysql');

/* 
* CONNECTION TO THE DATABSE
*/

const db = mysql.createPool({
    connectionLimit: 10,
    // host: 'localhost',
    // user: 'eporiseva_bbps',
    // password: 'H9yx4^t6',
    // database: 'admin_eporiseva_bbps'
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'admin_eporiseva_bbps'
});

db.getConnection((err, connection) => {
    if (err)
        console.log('Something Went Wrong To Connect Database..');
    if (connection)
        connection.release();
    return;
});

db.query = util.promisify(db.query);

module.exports = db;