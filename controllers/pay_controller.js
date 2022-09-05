const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const request = require('request');
const xml2js = require('xml2js');
const nodemailer = require('nodemailer');
const dateformat = require('dateformat');
const db = require('../core/database');
var agntId = "IN01IN03AGT000000002";
var keyword = "AIAGT$20170704",
    client_id = "3b67954e-0045-4455-9a94-2b98a82c07d7",
    client_secret = "uQ1cQ3qB0jG6rP0qY1pF2wB8eQ1lO6oJ0eJ7pK1eG2bB0iD3kV",
    end_point = "https://ibluatapig.indusind.com/app/uat/HubComfort/COUHubComfort/";
// const payModule = require('../models/pay_model');
// const pay_model = new payModule();

// DEFINE BODYPARSER
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// LOGIN INDEX
const index = (req, res, next) => {
    let user = req.session.user;
    // console.log(user);
    if (user) {
        res.render('pay/biller_select');
    } else {
        res.redirect('/login');
    }
};

// GENERATE AGENTREFNO
const AgentRefNo = (min, max) => {
    return new Promise((resolve, reject) => {
        resolve(Math.floor(
            Math.random() * (max - min + 1) + min
        ));
    })
}

const get_biller = (cat_id, coverage, data, type) => {
    try {
        return new Promise((resolve, reject) => {
            var states = '';
            var body_data = type == '1' ?
                ((cat_id == '1' || cat_id == '3') ? '<root><AgntId>' + agntId + '</AgntId><Keyword>' + keyword + '</Keyword><CatId>' + cat_id + '</CatId><Coverage>' + coverage + '</Coverage></root>' : '<root><AgntId>' + agntId + '</AgntId><Keyword>' + keyword + '</Keyword><CatId>' + cat_id + '</CatId></root>') :
                (type == '3' ? '<root><AgntId>' + agntId + '</AgntId><Keyword>' + keyword + '</Keyword><BlrName>' + data + '</BlrName></root>' :
                    (type == '4' ? '<root><AgntId>' + agntId + '</AgntId><Keyword>' + keyword + '</Keyword><BlrId>' + data + '</BlrId></root>' : ''));
            // console.log(body_data);
            var options = {
                'method': 'POST',
                'url': end_point + 'GetBillers',
                'headers': {
                    'X-IBM-Client-Secret': client_secret,
                    'X-IBM-Client-Id': client_id,
                    'Content-Type': 'application/xml',
                    'Cookie': 'ASP.NET_SessionId=eprlnvyulnga5rpjvsbqovt1'
                },
                body: body_data

            };
            request(options, function (error, response) {
                if (error) throw new Error(error);
                const xml = response.body;
                xml2js.parseString(xml, (err, result) => {
                    if (err) {
                        throw err;
                    }
                    const data = JSON.stringify(result);
                    states = JSON.stringify(result.Response.Msg[0].Billers[0].Biller);
                    // console.log(data);
                });
                resolve(states);
            });
        });

    } catch (err) {
        console.log({ "msg": err });
    }
}

const params = (biller_id, accpt_type) => {
    try {
        return new Promise((resolve, reject) => {
            var params_data = accpt_type == '1' ? '<ReqTypes><Req>BR</Req></ReqTypes><ReqTypes><Req>PR</Req></ReqTypes>' : '<ReqTypes><Req>BR</Req></ReqTypes>';
            var options = {
                'method': 'POST',
                'url': end_point + 'GetParameters',
                'headers': {
                    'X-IBM-Client-Secret': client_secret,
                    'X-IBM-Client-Id': client_id,
                    'Content-Type': 'application/xml',
                    'Cookie': 'ASP.NET_SessionId=eprlnvyulnga5rpjvsbqovt1'
                },
                body: '<Params><Param>' + params_data + '<AgntId>' + agntId + '</AgntId><Keyword>' + keyword + '</Keyword><BlrId>' + biller_id + '</BlrId><PayChannel>INT</PayChannel><PayMode>Internet Banking</PayMode><QuickPay>0</QuickPay></Param></Params>'

            };
            request(options, function (error, response) {
                if (error) throw new Error(error);
                const xml = response.body;
                xml2js.parseString(xml, (err, result) => {
                    if (err) {
                        throw err;
                    }
                    const data = JSON.stringify(result);
                    params_data = JSON.stringify(result.Response.Msg[0].Params[0].Param);
                    // console.log(data);
                });
                resolve(params_data);
            });
        });

    } catch (err) {
        console.log({ "msg": err });
    }
}

const pay_mode = (blr_id) => {
    try {
        return new Promise((resolve, reject) => {
            // var params_data = '<bills><bill><AgntId>'+ agntId +'</AgntId><Keyword>'+ keyword +'</Keyword><AgntRefId>' + agent_ref_id + '</AgntRefId><PayChannel>AGT</PayChannel><Field16>1234568</Field16><Field17>9450945011</Field17><Field18>12.9580,77.7440</Field18><Field19>400013</Field19>' + body_data + '</bill></bills>';
            // console.log(params_data);
            var bill_mode = {
                'method': 'POST',
                'url': end_point + 'GetPayModes',
                'headers': {
                    'X-IBM-Client-Secret': client_secret,
                    'X-IBM-Client-Id': client_id,
                    'Content-Type': 'application/xml',
                    'Cookie': 'ASP.NET_SessionId=eprlnvyulnga5rpjvsbqovt1'
                },
                body: '<root><AgntId>' + agntId + '</AgntId><Keyword>' + keyword + '</Keyword><BlrId>' + blr_id + '</BlrId></root>'

            };
            request(bill_mode, function (error, response) {
                if (error) throw new Error(error);
                const xml = response.body;
                xml2js.parseString(xml, (err, result) => {
                    if (err) {
                        throw err;
                    }
                    // ref_id = JSON.stringify(result.Response.RefId[0]);
                    mode_data = JSON.stringify(result.Response.Msg[0].Root[0].PayMode);
                    // console.log(mode_data);
                });
                resolve(mode_data);
            });
        });

    } catch (err) {
        console.log({ "msg": err });
    }
}

const get_bill = (agent_ref_id, body_data) => {
    try {
        return new Promise((resolve, reject) => {
            var bill_options = {
                'method': 'POST',
                'url': end_point + 'FetchBill',
                'headers': {
                    'X-IBM-Client-Secret': client_secret,
                    'X-IBM-Client-Id': client_id,
                    'Content-Type': 'application/xml',
                    'Cookie': 'ASP.NET_SessionId=eprlnvyulnga5rpjvsbqovt1'
                },
                body: '<bills><bill><AgntId>' + agntId + '</AgntId><Keyword>' + keyword + '</Keyword><AgntRefId>' + agent_ref_id + '</AgntRefId><PayChannel>INT</PayChannel><Field16>103.27.86.49</Field16><Field17>00-50-56-B7-C7-8A</Field17><Field18>22.5779,88.0167</Field18><Field19>711401</Field19>' + body_data + '</bill></bills>'

            };
            request(bill_options, function (error, response) {
                if (error) throw new Error(error);
                const xml = response.body;
                xml2js.parseString(xml, (err, result) => {
                    if (err) {
                        throw err;
                    }
                    ref_id = JSON.stringify(result.Response.RefId[0]);
                    bill_data = result.Response.BillerResponse[0] ? JSON.stringify(result.Response.BillerResponse[0].Row) : '';
                    msg = result.Response.Msg[0];
                    suc = result.Response.Code[0];
                    //console.log({ res: JSON.stringify(result), req: bill_options.body });
                    resolve({ ref_id, bill_data, msg, suc });
                });
                //resolve({ bill_data, ref_id });
            });
        });

    } catch (err) {
        console.log({ "msg": err });
    }
}

const bill_pay = (ag_ref_id, ref_id, blr_id, mode, amt, type, req_body, f_st, s_nd, t_rd) => {
    var tot_amt = amt * 100;
    var tag = '';
    if (blr_id == 'WEST00000WBL75') {
        if (f_st > 0 && s_nd == 0 && t_rd == 0) {
            tag = `<Field36>${tot_amt}</Field36>`
        } else if (f_st > 0 && s_nd > 0 && t_rd == 0) {
            tag = `<Field37>${tot_amt}</Field37>`
        } else if (f_st > 0 && s_nd > 0 && t_rd > 0) {
            tag = `<Field38>${tot_amt}</Field38>`
        }
    }
    var field = blr_id == 'WEST00000WBL75' ? tag : '<Field37>' + tot_amt + '</Field37>'
    return new Promise((resolve, reject) => {
        var params_data = type > 0 ? req_body : '<Payments><Payment><AgntId>' + agntId + '</AgntId><Keyword>' + keyword + '</Keyword><AgntRefId>' + ag_ref_id + '</AgntRefId><RefId>' + ref_id + '</RefId><BlrId>' + blr_id + '</BlrId><PayMode>' + mode + '</PayMode><DebitBranch>INDB0000262</DebitBranch><DebitAcNo>IN0000010445100880</DebitAcNo><BillAmt>' + tot_amt + '</BillAmt><DebitNar1>No Remarks</DebitNar1><PayChannel>INT</PayChannel><SplitAmt>0</SplitAmt><SplitPay>No</SplitPay><CCF>0</CCF><TotalAmt>' + tot_amt + '</TotalAmt>' + field + '<QuickPay>0</QuickPay></Payment></Payments>';
        // // console.log(params_data);

        var pay_req = {
            'method': 'POST',
            'url': end_point + 'PayBill',
            'headers': {
                'X-IBM-Client-Secret': client_secret,
                'X-IBM-Client-Id': client_id,
                'Content-Type': 'application/xml',
                'Cookie': 'ASP.NET_SessionId=eprlnvyulnga5rpjvsbqovt1'
            },
            body: params_data

        };
        request(pay_req, function (error, response) {
            if (error) throw new Error(error);
            const xml = response.body;
            xml2js.parseString(xml, (err, result) => {
                if (err) {
                    throw err;
                }
                const data = JSON.stringify(result);
                txnref_no = JSON.stringify(result.Response.TxnRefId[0]);
                msg = JSON.stringify(result.Response.Msg[0]);
                pay_data = JSON.stringify(result.Response.BillerResponse[0].Row);
                code = result.Response.Code[0];
            });
            resolve({ pay_data, txnref_no, msg, code });
        });

    });
}

const send_text_msg = (phone_no, amount, biller_name, consumer_no, tnx_id, date, mode) => {
    var to = phone_no;
    var text = 'Thank%20you%20for%20the%20bill%20'
        + 'payment%20of%20' + amount + '%20'
        + 'against%20' + biller_name + '%20,%20'
        + 'Consumer%20No.%20' + consumer_no + '%20,'
        + 'Transaction%20ref%20ID%20' + tnx_id + '%20'
        + 'received%20on%20' + date + '%20'
        + 'vide%20' + mode
        + '.-SYNERGIC%20SOFTEK%20SOLUTIONS%20PVT.%20LTD.';
    console.log(text);
    return new Promise((resolve, reject) => {
        var options = {
            'method': 'GET',
            'url': 'https://bulksms.sssplsales.in/api/api_http.php?username=SYNERGIC&password=api@2021&senderid=SYNRGC&to=' + to + '&text=' + text + '&route=Informative&type=text',
            'headers': {
            }
        };
        request(options, function (error, response) {
            if (error) throw new Error(error);
            console.log(response.body);
            resolve(true);
        });
    })
}

const send_email = (amount, biller_name, consumer_no, tnx_id, date, mode) => {
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'synergicbbps@gmail.com',
            pass: 'Signature@123'
        }
    });

    var mailOptions = {
        from: 'synergicbbps@gmail.com',
        to: 'samantasubham9804@gmail.com',
        subject: 'ePoriseva',
        text: `
         Thank you for the bill payment of
         ${amount} against ${biller_name} , Consumer No.
         ${consumer_no} ,Transaction ref ID ${tnx_id} received on
         ${date} vide
         ${mode}.`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) console.log(error);
        console.log('Email sent: ' + info.response);
    })
}

const conf_biller = async (req, res, next) => {
    var type = req.body.radio;
    var cat_id = type == '1' ? req.body.CatId : '';
    var coverage = type == '1' ? req.body.StName : '';
    var cat_name = type == '1' ? req.body.cat_name : '';
    var biller_id = type == '1' ? req.body.Coverage : '';
    var biller_name = type == '1' ? req.body.blr_name : ''
    var data = type == '3' ? req.body.BlrName : (type == '4 ' ? req.body.BlrId : '');
    // var biller_data = await get_biller(cat_id, coverage, data, type);
    // console.log(biller_data);
    res.render('pay/conf_biller', { cat_name, cat_id, coverage, biller_id, biller_name });
}

const get_params = async (req, res, next) => {
    // console.log(req.body);
    const biller_id = req.body.BlrId;
    var type = '4';
    var cat_id = '';
    var coverage = '';
    var biller_data = await get_biller(cat_id, coverage, biller_id, type);
    var accpt_type = JSON.parse(biller_data)[0].BillAcceptanceType[0];
    var biller_params = await params(biller_id, accpt_type);
    // console.log(accpt_type);
    res.render('pay/get_biller', { biller_params, biller_id, cat_id: req.body.cat_id, coverage: req.body.coverage, blr_name: req.body.biller_name, cat_name: req.body.CatId, blr_acpt_type: accpt_type });
    // console.log(await params(biller_id));
}

const fetch_bill = async (req, res, next) => {
    // console.log({ fetch_bill: req.body });
    const ref_id = await AgentRefNo(111111111111111, 999999999999999);
    const agent_ref_id = 'INTB' + ref_id;
    // console.log('INTB' + agent_ref_id);
    const data = JSON.parse(JSON.stringify(req.body));

    const consumerId = data.BlrId == 'WEST00000WBL75' ? data.Field26 : ''

    var keys = Object.keys(data);
    var values = Object.keys(data).map(key => data[key]);
    var obj = '';
    var prev_val = '';
    var body_str = '';
    for (var i = 2; i < (keys.length - 3); i++) {
        obj = '<' + keys[i] + '>' + values[i] + '</' + keys[i] + '>';
        body_str = prev_val + obj;
        prev_val = body_str;
        // obj[keys[i]] = values[i];
    }
    const mode = await pay_mode(req.body.BlrId);
    // console.log(mode);
    const bill_details = await get_bill(agent_ref_id, body_str);
    if (bill_details.suc != 'SUCX001') {
        req.session.message = { type: 'warning', message: msg };
        res.redirect('/fetch_bill')
    } else {
        res.render('pay/get_bill', { bill_dtls: bill_details.bill_data, ref_id: bill_details.ref_id, mode, blr_name: req.body.blr_name, BlrId: req.body.BlrId, PhNo: req.body.Field1, consumerId });
    }
}

const conf_bill = (req, res, next) => {
    const data = req.body;
    var chk_sec = req.session.user ? true : false;
    var sec_user = chk_sec ? req.session.user[0] : '';
    var pin = '';
    if (chk_sec) {
        pin = sec_user.pin;
    } else {
        res.redirect('/');
    }
    res.render('pay/consf_bill', { data, pin });
    // console.log(data);
}

const conf_quick_pay = async (req, res, next) => {
    const data = JSON.parse(JSON.stringify(req.body));
    const biller_id = req.body.BlrId;
    const accpt_type = req.body.BillAcceptanceType;
    var biller_params = await params(biller_id, accpt_type);

    // GET PIN FROM SESSION //
    var chk_sec = req.session.user ? true : false;
    var sec_user = chk_sec ? req.session.user[0] : '';
    var pin = '';
    if (chk_sec) {
        pin = sec_user.pin;
    } else {
        res.redirect('/');
    }
    // END //

    res.render('pay/conf_quick_pay', { data, biller_params, pin })

    // var values = Object.keys(data).map(key => data[key]);
}

const pay_bill = async (req, res, next) => {
    var data = req.body;
    var type = req.body.BillAcceptanceType;
    var blr_name = type == '1' ? req.body.blr_name : req.body.BillarName;
    const ref_id = await AgentRefNo(111111111111111, 999999999999999);
    const agent_ref_id = 'INTB' + ref_id;
    var req_body = '';
    if (type == '1') {
        const data = JSON.parse(JSON.stringify(req.body));
        var keys = Object.keys(data);
        var values = Object.keys(data).map(key => data[key]);
        var obj = '';
        var prev_val = '';
        var body_str = '';
        for (var i = 2; i < (keys.length - 3); i++) {
            if (keys[i] == 'BillAmt' || keys[i] == 'TotalAmt') {
                values[i] = values[i] * 100;
            }
            if (keys[i] == 'RefId') {
                values[i] = values[i].replace('\"', '').replace('\"', '');
            }
            obj = '<' + keys[i] + '>' + values[i] + '</' + keys[i] + '>';
            body_str = prev_val + obj;
            prev_val = body_str;
        }

        req_body = '<Payments><Payment><AgntId>' + agntId + '</AgntId><Keyword>' + keyword + '</Keyword><AgntRefId>' + agent_ref_id + '</AgntRefId><DebitAcNo>IN0000010445100880</DebitAcNo><DebitBranch>INDB000018</DebitBranch><PayChannel>INT</PayChannel><SplitAmt>0</SplitAmt><Field16>103.27.86.49</Field16><Field17>00-50-56-B7-C7-8A</Field17><Field18>22.5779,88.0167</Field18><Field19>711401</Field19>' + body_str + '<CCF>0</CCF><SplitPay>No</SplitPay><QuickPay>1</QuickPay></Payment></Payments>';
    }

    const RefId = String(String(req.body.RefId).replace('"', '')).replace('"', '');
    const pay_details = await bill_pay(agent_ref_id, RefId, req.body.BlrId, req.body.PayMode, req.body.TotalAmt, type, req_body, req.body['1_Month_Amount'], req.body['2_Months_Amount'], req.body['3_Months_Amount']);

    if (pay_details.code != 'SUCX001') {
        req.session.message = { type: 'warning', message: msg };
        res.redirect('/fetch_bill')
    } else {
        const pay = pay_details.pay_data;
        //if (pay_details.pay_data) {
        const pay_save = PaySaveData(pay, pay_details.txnref_no, pay_details.msg, blr_name, req.session.user, req.body.PayeePhoneNo)
        //}
        var trns_dt = new Date().toLocaleString('en-IN');
        // console.log({ id: pay_details});
        if (pay_details.code == 'SUCX001') {
            await send_text_msg(req.body.PayeePhoneNo, req.body.BillAmt, req.body.consumerId, JSON.parse(pay)[1].Value[0], pay_details.txnref_no, trns_dt, req.body.PayMode);
            // await send_email(req.body.BASE_BILL_AMOUNT, req.body.BillarName, JSON.parse(pay)[1].Value[0], pay_details.txnref_no, trns_dt, req.body.PayMode);
        }
        res.render('pay/conf_pay', { pay, blr_name, ref_no: pay_details.txnref_no, msg: pay_details.msg, trns_dt, PayeePhoneNo: req.body.PayeePhoneNo, BlrId: req.body.BlrId, PayMode: req.body.PayMode });
    }


}

const PaySaveData = (pay, tnx_id, status, blr_name, user_sec, cust_no) => {
    //console.log(blr_name);
    var data = JSON.parse(pay);
    // console.log(data);
    var user = user_sec ? user_sec[0].username : '',
        client_id = user_sec ? user_sec[0].client_id : '1',
        cust_name = '',
        bill_period = '',
        biller_name = blr_name,
        bill_number = '',
        bill_date,
        bill_amt,
        tnx_id = JSON.parse(tnx_id),
        date = dateformat(new Date(), 'yyyy-mm-dd HH:MM:ss'),
        approval_ref_no;
    for (let i = 0; i < data.length; i++) {
        if (data[i].Name[0] == 'CustomerName') cust_name = data[i].Value[0];
        if (data[i].Name[0] == 'BillPeriod') bill_period = data[i].Value[0];
        if (data[i].Name[0] == 'BillNumber') bill_number = data[i].Value[0];
        if (data[i].Name[0] == 'BillDate') bill_date = data[i].Value[0];
        if (data[i].Name[0] == 'BASE_BILL_AMOUNT') bill_amt = data[i].Value[0];
        if (data[i].Name[0] == 'AppRefNumber') approval_ref_no = data[i].Value[0];
    }

    var sql = `INSERT INTO td_tnx (date, client_id, biller_name, customer_name, customer_phone, bill_number, bill_period, bill_date, 
        bill_amt, approval_ref_no, tnx_id, status, created_by, created_at) VALUES
    ("${date}", "${client_id}", "${biller_name}", "${cust_name}", "${cust_no}", "${bill_number}", "${bill_period}", "${bill_date}", 
    "${bill_amt}", "${approval_ref_no}", "${tnx_id}", ${status}, "${user}", "${date}")`;
    console.log({ sql });
    return new Promise((resolve, reject) => {
        db.query(sql, (err, result) => {
            if (err) {
                console.log(err);
                resolve(err);
            }
            else {
                resolve(sql)
            };
        })
    })

}

// EXPORT MODULES
module.exports = {
    index,
    conf_biller,
    get_params,
    fetch_bill,
    conf_bill,
    conf_quick_pay,
    pay_bill
}