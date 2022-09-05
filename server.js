const path = require('path');
const express = require('express');
const ejs = require('ejs');
const fs = require('fs');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const app = express();
const session = require('express-session');
const http = require('http');
var port = process.env.PORT || 3001;

const multer = require("multer")

const db = require('./core/database');
const bcrypt = require('bcrypt');

///////////////////// INCLUDE ROUTERS ///////////////////////////////
const loginRouter = require('./routes/loginRoute');
const payRouter = require('./routes/payRouter');
const tnxRouter = require('./routes/tnxRoute');
const complnRoute = require('./routes/cmplnRoute');
const UserRouter = require('./routes/userRouter')
const { CreateNewUserMail } = require('./controllers/emailController');
////////////////////////////////////////////////////////////////////

// DEFINE VIEW FILES
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(__dirname + '/assets'));
// app.use('/*', express.static('views/template/header.ejs'));

// SET VIEW ENGINE
app.set('view engine', 'ejs');
app.locals.basePATH = __dirname;
// app.engine('html', require('ejs').renderFile);
// app.engine('css', require('ejs').renderFile);
app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));

// SET SESSION
app.use(session({
    secret: 'BBPS COU HUB',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 3600000
    }
}));
// Use Session in all view pages
app.use((req, res, next) => {
    res.locals.user = req.session.user;
    res.locals.active = req.path.split('/')[1];
    res.locals.message = req.session.message;
    delete req.session.message;
    next();
})

// INDEX PAGE
app.get('/', (req, res) => {
    let user = req.session.user;
    //console.log(user);
    if (user) {
        res.redirect('/dashboard');
    } else {
        res.redirect('/login');
    }
});

// LOGIN PAGE
app.use(loginRouter);

// PAYMENT SAMPLE PAGE
app.use(payRouter);

// SEARCH TRANSACTION STATUS
app.use(tnxRouter);

// REGISTER COMPLAINT
app.use(complnRoute);

app.use(UserRouter);

// SAMPLE PAGE
app.get('/sample', (req, res) => {
    res.render('pages/sample');
});

// LANDING PAGE
app.get('/dashboard', (req, res) => {
    let user = req.session.user;
    //console.log(user);
    if (user) {
        res.render('dashboard/view');
    } else {
        res.redirect('/login');
    }
    //res.render('dashboard/view');
})

app.post('/reg', (req, res) => {
    let input = {
        name: req.body.name,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 10)
    };
    let sql = `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`;
    db.query(sql, [input.name, input.email, input.password], (err, lastId) => {
        //if (err) throw err;
        res.redirect('/login');
    });
    //res.end(input.password);
})

// FETCH DATA AND BIND IN TABLE
app.get('/fetch', (req, res, next) => {
    let sql = `SELECT * FROM users`;
    db.query(sql, function (err, data, fields) {
        if (err) throw err;
        res.render('login/fetch', {
            userdata: data
        });
    });
});
app.get('/update/:id', (req, res, next) => {
    const editId = req.params.id;
    res.end(editId);
})

app.get('/test', (req, res) => {
    res.render('test');
})

app.get('/new_register', async (req, res) => {
    var client_id = req.query.id;
    var dt = await GetClientDtls(client_id);
    if (dt) {
        var chk_user = await UserCount(client_id);
        if (chk_user) {
            res.render('login/register', { agent_id: dt.agent_id, client_id, client_name: dt.client_name })
            // res.send(dt.agent_id);
        } else {
            res.send('User Length Exceeded..');
        }
    } else {
        res.send('No data found.. Please Contact with admin')
    }
})

app.post('/new_register', (req, res) => {
    var data = req.body,
        pass = bcrypt.hashSync(req.body.pass, 10);
    var sql = `INSERT INTO users (client_id, username, designation, email, password, pin) VALUES 
    ("${data.client_id}", "${data.name}", "${data.designation}", "${data.email}", "${pass}", "${data.pin.split('-').join('')}")`;
    db.query(sql, (err, lastId) => {
        if (err) {
            console.log(err);
            res.redirect('/register?id=' + client_id);
        } else {
            res.redirect('/login');
        }
    })
    // console.log(data.pin.split('-').join(''));
})

const GetClientDtls = (client_id) => {
    var res_dt = false;
    var sql = `SELECT client_name, agent_id FROM md_client WHERE client_id = "${client_id}"`;
    return new Promise((resolve, reject) => {
        db.query(sql, (err, result) => {
            if (err) {
                console.log(err);
                res_dt = false;
            } else {
                if (result.length > 0) {
                    res_dt = result[0];
                } else {
                    res_dt = false;
                }
            }
            resolve(res_dt);
        })
    })
}

const UserCount = (client_id) => {
    var res_dt = false;
    var sql = `SELECT COUNT(id) cunt_dt FROM users WHERE client_id = "${client_id}"`;
    return new Promise((resolve, reject) => {
        db.query(sql, (err, result) => {
            if (err) {
                console.log(err);
                res_dt = false;
            } else {
                if (result.length >= 2) {
                    res_dt = false;
                } else {
                    res_dt = true;
                }
            }
            resolve(res_dt);
        })
    })
}

// MULTER //
var storage = multer.diskStorage({
    destination: function (req, file, cb) {

        // Uploads is the Upload_folder_name
        cb(null, "assets/uploads")
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + "-" + Date.now() + ".jpg")
    }
})

// Define the maximum size for uploading
// picture i.e. 1 MB. it is optional
const maxSize = 1 * 1000 * 1000;

var upload = multer({
    storage: storage,
    limits: { fileSize: maxSize },
    fileFilter: function (req, file, cb) {

        // Set the filetypes, it is optional
        var filetypes = /jpeg|jpg|png/;
        var mimetype = filetypes.test(file.mimetype);

        var extname = filetypes.test(path.extname(
            file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }

        cb("Error: File upload only supports the "
            + "following filetypes - " + filetypes);
    }

    // mypic is the name of file attribute
}).single("img");

app.post('/profile', (req, res) => {
    var filename = '';
    // console.log({ before: req.session.user });
    upload(req, res, function (err) {
        var data = req.body;
        filename = req.file ? req.file.filename : null;
        var img_up = filename ? `, img = "${filename}"` : '';
        if (err) {
            res.send(err)
        }
        else {
            var sql = `UPDATE users SET username = "${data.name}", designation = "${data.designation}" ${img_up} WHERE id = '${req.body.id}'`;
            db.query(sql, (err, result) => {
                if (err) {
                    console.log(err);
                    req.session.message = { type: 'danger', message: 'Profile Not Updated!! Something Went Wrong' };
                    res.redirect('/profile');
                } else {
                    // console.log({ result });
                    //var user_sql = `SELECT * FROM users WHERE id = "${data.id}"`;
                    var user_sql = `SELECT a.*, b.client_name, b.lat, b.longt, b.mobile_no, b.email, b.address_1 as address FROM users a, md_client b WHERE a.client_id=b.id AND a.id = "${data.id}"`;
                    db.query(user_sql, (err, result) => {
                        if (err) {
                            req.session.message = { type: 'danger', message: 'Profile Not Updated!! Something Went Wrong' };
                            res.redirect('/profile');
                            console.log(err);
                        } else {
                            req.session.user = result;
                            // console.log({ after: req.session.user });
                            req.session.reload((err) => { if (err) { console.error(err); } });
                            req.session.message = { type: 'success', message: 'Profile Updated Successfully' };
                            res.redirect('/profile');
                        }
                    })
                }
            })
            // SUCCESS, image successfully uploaded
            // res.send("Success, Image uploaded!")
        }
    })
    // console.log({ body: req.body, files: req.files, req });
})

app.get('/send_register_email', async (req, res) => {
    var id = req.query.id,
        email = req.query.email;
    if (await CreateNewUserMail(id, email)) {
        res.send('Email Successfully Sent')
    } else {
        res.send('Failed');
    }
})

/*var requestIp = require('request-ip');
app.set('trust proxy', true);
app.get('/ip', async (req, res) => {
    var clientIp = await requestIp.getClientIp(req);
        var idAddress = req.header('x-forwarded-for') || req.connection.remoteAddress;
    const ip = req.headers['x-forwarded-for'] ||
     req.socket.remoteAddress ||
     req.ip || 'HI';
    res.send({clientIp, idAddress, e: req.ip, f: req.socket.remoteAddress, ip})
})

const address = require('address')
app.get('/e', (req, res) => {
    var ip = address.ip();
    var lo = address.ip('lo')
    address.mac(function (err, addr) {
        console.log({ addr }); // '78:ca:39:b0:e6:7d'
        res.send(addr)
    });
    console.log({ ip });
    //res.send({ip, lo})
})*/

///IP Test


// Server Listening
app.listen(port, () => {
    console.log(`Server is Listning at PORT 3000`);
});