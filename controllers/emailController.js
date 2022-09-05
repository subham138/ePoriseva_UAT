const nodemailer = require('nodemailer');
const db = require('../core/database');

var btn_url = 'https://eporiseva.com/new_register?id=';

// FOR LOCAL
// var transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: 'synergicbbps@gmail.com',
//         pass: 'Signature@123'
//     }
// });

// FOR SERVER
var transporter = nodemailer.createTransport({
    //pool: true,
    host: 'webmail.eporiseva.com',
    port: 25,
    secure: false,
    auth: {
        user: 'admin@eporiseva.com',
        pass: 'ePori!2021Seva'
    },
    tls: {
        // do not fail on invalid certs
        rejectUnauthorized: false
    }
});

const GetUserDtls = (id) => {
    let sql = `SELECT username, email FROM users WHERE id = ${id}`;
    return new Promise((resolve, reject) => {
        db.query(sql, (err, result) => {
            if (err) {
                console.log(err);
                resolve(false)
            } else {
                resolve(result);
            }
        })
    })
}

const ChangePassMail = async (id, pass) => {
    var user = await GetUserDtls(id);
    var email = user[0].email,
        user_name = user[0].username;

    return new Promise(async (resolve, reject) => {
        var mailOptions = {
            from: 'admin@eporiseva.com',
            to: email,//'samantasubham9804@gmail.com',
            subject: 'Password Change',
            html: '<!DOCTYPE html>'
                + '<html>'
                + '<head>'
                + '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />'
                + '<title>ePoriseva</title>'
                + '<style type="text/css">'
                + 'body{margin:0; padding:0; font-family:14px; font-family:Arial, Helvetica, sans-serif;}'
                + '</style>'
                + '</head>'
                + '<body>'
                + '<div class="sectionArea" style="max-width:750px; width:100%; margin:2% auto 2% auto; padding:15px; background:#faf9f9; border-radius:15px;border: #ececec solid 1px;">'
                + '<table width="100%" border="0" cellspacing="0" cellpadding="0">'
                + '<tr>'
                + '<td align="left" valign="top" class="logoArea" style="padding:0 0 25px 0; text-align:center;"><img src="https://eporiseva.com/dist/img/logoLogin.png" width="402" height="300" alt="" style="max-width:190px; width:100%; height:auto; margin:0 auto;"></td>'
                + '</tr>'
                + '<tr>'
                + '<td align="left" valign="top">'
                + '<h2 style="font-size:18px; font-weight:700; font-family:Arial, Helvetica, sans-serif;">Dear ' + user_name + ',</h2>'
                // + '<h2 style="font-size:18px; font-weight:700; font-family:Arial, Helvetica, sans-serif;">Congratulations</h2>'
                // + '<p style="font-family:Arial, Helvetica, sans-serif; font-size:13px; font-weight:400; line-height:22px; padding-bottom:15px; margin:0;">We are happy to have you as a part of the Shop Local Laguna family!</p>'
                // + '<p style="font-family:Arial, Helvetica, sans-serif; font-size:13px; font-weight:400; line-height:22px; padding-bottom:15px; margin:0;">Your payment has been done successfully.</p>'
                + '<p style="font-family:Arial, Helvetica, sans-serif; font-size:13px; font-weight:400; line-height:22px; padding-bottom:15px; margin:0;">Password for ' + email + ' has been successfully changed to ' + pass + '</p>'
                // + '<p style="font-family:Arial, Helvetica, sans-serif; font-size:13px; font-weight:400; line-height:22px; padding-bottom:15px; margin:0;">Your login credentials are as follow</p>'
                // + '<p style="font-family:Arial, Helvetica, sans-serif; font-size:13px; font-weight:400; line-height:22px; padding-bottom:15px; margin:0;"><b>UserName:</b> ' + email_id + '<br><b>Password:</b> ' + password + '</p>'
                // + '<p style="font-family:Arial, Helvetica, sans-serif; font-size:13px; font-weight:400; line-height:22px; padding-bottom:15px; margin:0;">Please click on the link bellow to login.</p>'
                + '<p style="font-family:Arial, Helvetica, sans-serif; font-size:13px; font-weight:400; line-height:19px; padding-bottom:15px; margin:0;"><strong>Thanks & Regards</strong>,<br>'
                + 'Team ePoriseva<br></p>'
                // + '<p style="font-family:Arial, Helvetica, sans-serif; padding-top:20px; padding-bottom:20px; margin:0;">'
                // + '<a href="' + client_url + '" style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; font-weight: 600;'
                // + 'padding: 8px 15px; margin: 0; background: #3fb048; text-decoration: none; color: #fff; border-radius: 34px; width: 100%; display: inline-block; text-align: center; box-sizing: border-box;">Login</a>'
                // + '</p>'
                + '</td>'
                + '</tr>'
                + '</table>'
                + '</div>'
                + '</body>'
                + '</html>'
        };
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
                data = { suc: 0, msg: JSON.stringify(error) };
            } else {
                console.log('Email sent: ' + info.response);
                data = { suc: 1, msg: 'Email sent: ' + info.response };
            }
            resolve(data);
        });

    })
}

const ChangePinMail = async (id, pin) => {
    var user = await GetUserDtls(id);
    var email = user[0].email,
        user_name = user[0].username;

    return new Promise(async (resolve, reject) => {
        var mailOptions = {
            from: 'admin@eporiseva.com',
            to: email,//'samantasubham9804@gmail.com',
            subject: 'PIN Change',
            html: '<!DOCTYPE html>'
                + '<html>'
                + '<head>'
                + '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />'
                + '<title>ePoriseva</title>'
                + '<style type="text/css">'
                + 'body{margin:0; padding:0; font-family:14px; font-family:Arial, Helvetica, sans-serif;}'
                + '</style>'
                + '</head>'
                + '<body>'
                + '<div class="sectionArea" style="max-width:750px; width:100%; margin:2% auto 2% auto; padding:15px; background:#faf9f9; border-radius:15px;border: #ececec solid 1px;">'
                + '<table width="100%" border="0" cellspacing="0" cellpadding="0">'
                + '<tr>'
                + '<td align="left" valign="top" class="logoArea" style="padding:0 0 25px 0; text-align:center;"><img src="https://eporiseva.com/dist/img/logoLogin.png" width="402" height="300" alt="" style="max-width:190px; width:100%; height:auto; margin:0 auto;"></td>'
                + '</tr>'
                + '<tr>'
                + '<td align="left" valign="top">'
                + '<h2 style="font-size:18px; font-weight:700; font-family:Arial, Helvetica, sans-serif;">Dear ' + user_name + ',</h2>'
                // + '<h2 style="font-size:18px; font-weight:700; font-family:Arial, Helvetica, sans-serif;">Congratulations</h2>'
                // + '<p style="font-family:Arial, Helvetica, sans-serif; font-size:13px; font-weight:400; line-height:22px; padding-bottom:15px; margin:0;">We are happy to have you as a part of the Shop Local Laguna family!</p>'
                // + '<p style="font-family:Arial, Helvetica, sans-serif; font-size:13px; font-weight:400; line-height:22px; padding-bottom:15px; margin:0;">Your payment has been done successfully.</p>'
                + '<p style="font-family:Arial, Helvetica, sans-serif; font-size:13px; font-weight:400; line-height:22px; padding-bottom:15px; margin:0;">PIN for ' + email + ' has been successfully changed to ' + pin + '</p>'
                // + '<p style="font-family:Arial, Helvetica, sans-serif; font-size:13px; font-weight:400; line-height:22px; padding-bottom:15px; margin:0;">Your login credentials are as follow</p>'
                // + '<p style="font-family:Arial, Helvetica, sans-serif; font-size:13px; font-weight:400; line-height:22px; padding-bottom:15px; margin:0;"><b>UserName:</b> ' + email_id + '<br><b>Password:</b> ' + password + '</p>'
                // + '<p style="font-family:Arial, Helvetica, sans-serif; font-size:13px; font-weight:400; line-height:22px; padding-bottom:15px; margin:0;">Please click on the link bellow to login.</p>'
                + '<p style="font-family:Arial, Helvetica, sans-serif; font-size:13px; font-weight:400; line-height:19px; padding-bottom:15px; margin:0;"><strong>Thanks & Regards</strong>,<br>'
                + 'Team ePoriseva<br></p>'
                // + '<p style="font-family:Arial, Helvetica, sans-serif; padding-top:20px; padding-bottom:20px; margin:0;">'
                // + '<a href="' + client_url + '" style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; font-weight: 600;'
                // + 'padding: 8px 15px; margin: 0; background: #3fb048; text-decoration: none; color: #fff; border-radius: 34px; width: 100%; display: inline-block; text-align: center; box-sizing: border-box;">Login</a>'
                // + '</p>'
                + '</td>'
                + '</tr>'
                + '</table>'
                + '</div>'
                + '</body>'
                + '</html>'
        };
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
                data = { suc: 0, msg: JSON.stringify(error) };
            } else {
                console.log('Email sent: ' + info.response);
                data = { suc: 1, msg: 'Email sent: ' + info.response };
            }
            resolve(data);
        });

    })
}

const CreateNewUserMail = async (id, email) => {
    var url = btn_url + id;
    return new Promise(async (resolve, reject) => {
        var mailOptions = {
            from: 'admin@eporiseva.com',
            to: email,
            subject: 'New User',
            html: '<!DOCTYPE html>'
                + '<html>'
                + '<head>'
                + '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />'
                + '<title>ePoriseva</title>'
                + '<style type="text/css">'
                + 'body{margin:0; padding:0; font-family:14px; font-family:Arial, Helvetica, sans-serif;}'
                + '</style>'
                + '</head>'
                + '<body>'
                + '<div class="sectionArea" style="max-width:750px; width:100%; margin:2% auto 2% auto; padding:15px; background:#faf9f9; border-radius:15px;border: #ececec solid 1px;">'
                + '<table width="100%" border="0" cellspacing="0" cellpadding="0">'
                + '<tr>'
                + '<td align="left" valign="top" class="logoArea" style="padding:0 0 25px 0; text-align:center;"><img src="https://eporiseva.com/dist/img/logoLogin.png" width="402" height="300" alt="" style="max-width:190px; width:100%; height:auto; margin:0 auto;"></td>'
                + '</tr>'
                + '<tr>'
                + '<td align="left" valign="top">'
                + '<h2 style="font-size:18px; font-weight:700; font-family:Arial, Helvetica, sans-serif;">Hi,</h2>'
                + '<p style="font-family:Arial, Helvetica, sans-serif; font-size:13px; font-weight:400; line-height:22px; padding-bottom:15px; margin:0;">Welcome to ePoriseva,you can now pay all your bills electronically through this portal.</p>'
                + '<p style="font-family:Arial, Helvetica, sans-serif; font-size:13px; font-weight:400; line-height:22px; padding-bottom:15px; margin:0;">To register please click on the below button.</p>'
                + '<p style="font-family:Arial, Helvetica, sans-serif; font-size:13px; font-weight:400; line-height:19px; padding-bottom:15px; margin:0;"><strong>Thanks & Regards</strong>,<br>'
                + 'Team ePoriseva<br></p>'
                + '<p style="font-family:Arial, Helvetica, sans-serif; padding-top:20px; padding-bottom:20px; margin:0;">'
                + '<a href="' + url + '" style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; font-weight: 600;'
                + 'padding: 8px 15px; margin: 0; background: #3fb048; text-decoration: none; color: #fff; border-radius: 34px; width: 100%; display: inline-block; text-align: center; box-sizing: border-box;">Register Now</a>'
                + '</p>'
                + '</td>'
                + '</tr>'
                + '</table>'
                + '</div>'
                + '</body>'
                + '</html>'
        };
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
                data = { suc: 0, msg: JSON.stringify(error) };
            } else {
                console.log('Email sent: ' + info.response);
                data = { suc: 1, msg: 'Email sent: ' + info.response };
            }
            resolve(data);
        });

    })
}

module.exports = { ChangePassMail, ChangePinMail, CreateNewUserMail }