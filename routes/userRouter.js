const express = require('express');
const router = express.Router();
const db = require('../core/database');
const bcrypt = require('bcrypt');
const { ChangePassMail, ChangePinMail } = require('../controllers/emailController');
// const tnx_controller = require('../controllers/tnx_controller');

router.get('/profile', (req, res) => {
        var user = req.session.user;
        // console.log(user);
        if (user) {
            res.render('user/profile', { user })
        } else {
            res.redirect('/')
        }
});

// router.post('/profile', (req, res) => {
//     console.log(req);
// })

router.get('/change_pass', (req, res) => {
    var user = req.session.user;
    // console.log(user);
    if (user) {
        var id = user[0].id
        res.render('user/change_pass', { id })
    } else {
        res.redirect('/')
    }
});

router.post('/change_pass', async (req, res) => {
    console.log(req.body.old_pass);
    var user = req.session.user,
        password = user ? user[0].password : false;
    if (password && await bcrypt.compare(req.body.old_pass, password)) {
        var pass = bcrypt.hashSync(req.body.pass, 10);
        var sql = `UPDATE users SET password = "${pass}" WHERE id = "${req.body.id}"`;
        db.query(sql, async (err, lastId) => {
            if (err) {
                console.log(err);
				req.session.message = { type: 'danger', message: 'Password Not Updated!! Something Went Wrong' };
                res.redirect('/update_pass');
            } else {
                user[0].password = pass;
				var email = await ChangePassMail(req.body.id, req.body.pass)
				req.session.message = { type: 'success', message: 'Password Updated Successfully' };
                res.redirect('/profile')
            }
        })
    } else {
		req.session.message = { type: 'danger', message: 'You have entered wrong old password' };
        res.redirect('/change_pass')
    }
});

router.get('/change_pin', (req, res) => {
    var user = req.session.user;
    // console.log(user);
    if (user) {
        var id = user[0].id
        res.render('user/change_pin', { id })
    } else {
        res.redirect('/')
    }
});

router.post('/change_pin', (req, res) => {
    // console.log(req.body.pass);
    var user = req.session.user,
        password = user ? user[0].password : false,
        pin = req.body.pin.split('-').join('');
    if (password && bcrypt.compare(req.body.pass, password)) {
        var sql = `UPDATE users SET pin = "${pin}" WHERE id = "${req.body.id}"`;
        // console.log(sql);
        db.query(sql, async (err, lastId) => {
            if (err) {
                console.log(err);
				req.session.message = { type: 'danger', message: 'PIN Not Updated!! Something Went Wrong' };
                res.redirect('/update_pass');
            } else {
                user[0].pin = req.body.pin;
				var email = await ChangePinMail(req.body.id, pin)
				req.session.message = { type: 'success', message: 'PIN Updated Successfully' };
                res.redirect('/profile')
            }
        })
    } else {
        res.send('Not Saved')
    }
})
// router.post('/tnx_srch', tnx_controller.tnx_search_out);

// REPORT //
router.get('/report', (req, res) => {
    var user = req.session.user;
    // console.log(user);
    if (user) {
        res.render('report/report_in');
    } else {
        res.redirect('/login');
    }
})

router.post('/report', (req, res) => {
    var user = req.session.user;
    // console.log(user);
    if (user) {
        var frm_dt = req.body.frm_dt,
            to_dt = req.body.to_dt;
        var sql = `SELECT * FROM td_tnx WHERE DATE(date) >= "${frm_dt}" AND DATE(date) <= "${to_dt}"`;
        db.query(sql, (err, result) => {
            if (err) {
                console.log(err);
                res.redirect('/report')
            } else {
                res.render('report/report_out', { result })
            }
        })
    } else {
        res.redirect('/login')
    }
    // res.send({ frm_dt, to_dt, sql })
})

module.exports = router;