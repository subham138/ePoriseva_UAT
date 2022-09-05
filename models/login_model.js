const db = require('../core/database');
const bcrypt = require('bcrypt');

function User() { };

User.prototype = {
    find: (email, callback) => {
        // if (user) {
        //     var field = Number.isInteger(user) ? 'id' : 'username';
        // }

        // let sql = 'SELECT * FROM users WHERE email = "?"';
        // email = '"' + email + '"';
        let sql = 'SELECT * FROM users WHERE email = "' + email + '"';

        db.query(sql, (err, result) => {
            // console.log(email)
            if (err) throw err;
            callback(result);
        });
    },

    create: (body, callback) => {
        let psw = body.password;
        body.password = bcrypt.hashSync(psw, 10);

        var bind = [];
        for (prop in body) {
            bind.push(body[prop]);
        }

        let sql = `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`;

        db.query(sql, bind, (err, lastId) => {
            if (err) throw err;
            callback(lastId);
        });
    },

    login: (email, password, callback) => {

        let sql = 'SELECT * FROM users WHERE email = "' + email + '"';

        db.query(sql, (err, result) => {
            if (err) throw err;
            if (result) {
                if (bcrypt.compare(password, result[0].password)) {
                    callback(result);
                    return;
                }
            }
            callback(null);
        });

        // console.log();
        // this.find(email, (result) => {
        //     if (result) {
        //         if (bcrypt.compareSync(password, result.password)) {
        //             callback(result);
        //             return;
        //         }
        //     }
        //     callback(null);
        // })
    }
}

module.exports = User;