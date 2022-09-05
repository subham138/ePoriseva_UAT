const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const request = require('request');
const xml2js = require('xml2js');
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

const get_biller = (cat_id, coverage) => {
    try {
        return new Promise((resolve, reject) => {
            var states = '';
            var body_data = (cat_id == '1' || cat_id == '3') ? '<root><AgntId>IN01IN03AGT000000002</AgntId><Keyword>AIAGT$20170704</Keyword><CatId>' + cat_id + '</CatId><Coverage>' + coverage + '</Coverage></root>' : '<root><AgntId>IN01IN03AGT000000002</AgntId><Keyword>AIAGT$20170704</Keyword><CatId>' + cat_id + '</CatId></root>';
            var options = {
                'method': 'POST',
                'url': 'https://ibluatapig.indusind.com/app/uat/HubComfort/COUHubComfort/GetBillers',
                'headers': {
                    'X-IBM-Client-Secret': 'uQ1cQ3qB0jG6rP0qY1pF2wB8eQ1lO6oJ0eJ7pK1eG2bB0iD3kV',
                    'X-IBM-Client-Id': '3b67954e-0045-4455-9a94-2b98a82c07d7',
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
                    const data = JSON.stringify(result, null, 4);
                    states = JSON.stringify(result.Response.Msg[0].Billers[0].Biller);
                });
                resolve(states);
            });
        });
        
    } catch (err) {
        console.log({ "msg": err });
    }
}

const params = (biller_id) => {
     try {
        return new Promise((resolve, reject) => {
            var params_data = '';
            var options = {
                'method': 'POST',
                'url': 'https://ibluatapig.indusind.com/app/uat/HubComfort/COUHubComfort/GetParameters',
                'headers': {
                    'X-IBM-Client-Secret': 'uQ1cQ3qB0jG6rP0qY1pF2wB8eQ1lO6oJ0eJ7pK1eG2bB0iD3kV',
                    'X-IBM-Client-Id': '3b67954e-0045-4455-9a94-2b98a82c07d7',
                    'Content-Type': 'application/xml',
                    'Cookie': 'ASP.NET_SessionId=eprlnvyulnga5rpjvsbqovt1'
                },
                body: '<Params><Param><ReqTypes><Req>BR</Req></ReqTypes><AgntId>IN01IN03AGT000000002</AgntId><Keyword>AIAGT$20170704</Keyword><BlrId>'+ biller_id +'</BlrId><PayChannel>INT</PayChannel><PayMode>Internet Banking</PayMode><QuickPay>0</QuickPay></Param></Params>'

            };
            request(options, function (error, response) {
                if (error) throw new Error(error);
                const xml = response.body;
                xml2js.parseString(xml, (err, result) => {
                    if (err) {
                        throw err;
                    }
                    const data = JSON.stringify(result, null, 4);
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
            // var params_data = '<bills><bill><AgntId>IN01IN03AGT000000002</AgntId><Keyword>AIAGT$20170704</Keyword><AgntRefId>' + agent_ref_id + '</AgntRefId><PayChannel>AGT</PayChannel><Field16>1234568</Field16><Field17>9450945011</Field17><Field18>12.9580,77.7440</Field18><Field19>400013</Field19>' + body_data + '</bill></bills>';
            // console.log(params_data);
            var bill_mode = {
                'method': 'POST',
                'url': 'https://ibluatapig.indusind.com/app/uat/HubComfort/COUHubComfort/GetPayModes',
                'headers': {
                    'X-IBM-Client-Secret': 'uQ1cQ3qB0jG6rP0qY1pF2wB8eQ1lO6oJ0eJ7pK1eG2bB0iD3kV',
                    'X-IBM-Client-Id': '3b67954e-0045-4455-9a94-2b98a82c07d7',
                    'Content-Type': 'application/xml',
                    'Cookie': 'ASP.NET_SessionId=eprlnvyulnga5rpjvsbqovt1'
                },
                body: '<root><AgntId>IN01IN03AGT000000002</AgntId><Keyword>AIAGT$20170704</Keyword><BlrId>' + blr_id + '</BlrId></root>'

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
            // var params_data = '<bills><bill><AgntId>IN01IN03AGT000000002</AgntId><Keyword>AIAGT$20170704</Keyword><AgntRefId>' + agent_ref_id + '</AgntRefId><PayChannel>AGT</PayChannel><Field16>1234568</Field16><Field17>9450945011</Field17><Field18>12.9580,77.7440</Field18><Field19>400013</Field19>' + body_data + '</bill></bills>';
            // console.log(params_data);
            var bill_options = {
                'method': 'POST',
                'url': 'https://ibluatapig.indusind.com/app/uat/HubComfort/COUHubComfort/FetchBill',
                'headers': {
                    'X-IBM-Client-Secret': 'uQ1cQ3qB0jG6rP0qY1pF2wB8eQ1lO6oJ0eJ7pK1eG2bB0iD3kV',
                    'X-IBM-Client-Id': '3b67954e-0045-4455-9a94-2b98a82c07d7',
                    'Content-Type': 'application/xml',
                    'Cookie': 'ASP.NET_SessionId=eprlnvyulnga5rpjvsbqovt1'
                },
                body: '<bills><bill><AgntId>IN01IN03AGT000000002</AgntId><Keyword>AIAGT$20170704</Keyword><AgntRefId>' + agent_ref_id + '</AgntRefId><PayChannel>AGT</PayChannel><Field16>1234568</Field16><Field17>9450945011</Field17><Field18>12.9580,77.7440</Field18><Field19>400013</Field19>' + body_data + '</bill></bills>'

            };
            request(bill_options, function (error, response) {
                if (error) throw new Error(error);
                const xml = response.body;
                xml2js.parseString(xml, (err, result) => {
                    if (err) {
                        throw err;
                    }
                    ref_id = JSON.stringify(result.Response.RefId[0]);
                    bill_data = JSON.stringify(result.Response.BillerResponse[0].Row);
                    // console.log(data);
                });
                resolve({bill_data, ref_id});
            });
        });
        
    } catch (err) {
        console.log({ "msg": err });
    }
}

const bill_pay = (ag_ref_id, ref_id, blr_id, mode, amt) => {
    try {
        return new Promise((resolve, reject) => {
             //var params_data = '<Payments><Payment><AgntId>IN01IN03AGT000000002</AgntId><Keyword>AIAGT$20170704</Keyword><AgntRefId>'+ ag_ref_id +'</AgntRefId><RefId>'+ ref_id +'</RefId><BlrId>'+ blr_id +'</BlrId><PayMode>'+ mode +'</PayMode><DebitBranch>INDB000018</DebitBranch><DebitAcNo>AIAGTAC001</DebitAcNo><BillAmt>'+ amt +'</BillAmt><DebitNar1>test</DebitNar1><PayChannel>AGT</PayChannel><SplitAmt>0</SplitAmt><SplitPay>No</SplitPay><CCF>0</CCF><TotalAmt>'+ amt +'</TotalAmt><Field37>'+ amt +'</Field37><QuickPay>0</QuickPay></Payment></Payments>';
            // console.log(params_data);
            var pay_req = {
                'method': 'POST',
                'url': 'https://ibluatapig.indusind.com/app/uat/HubComfort/COUHubComfort/PayBill',
                'headers': {
                    'X-IBM-Client-Secret': 'uQ1cQ3qB0jG6rP0qY1pF2wB8eQ1lO6oJ0eJ7pK1eG2bB0iD3kV',
                    'X-IBM-Client-Id': '3b67954e-0045-4455-9a94-2b98a82c07d7',
                    'Content-Type': 'application/xml',
                    'Cookie': 'ASP.NET_SessionId=eprlnvyulnga5rpjvsbqovt1'
                },
                body: '<Payments><Payment><AgntId>IN01IN03AGT000000002</AgntId><Keyword>AIAGT$20170704</Keyword><AgntRefId>'+ ag_ref_id +'</AgntRefId><RefId>'+ ref_id +'</RefId><BlrId>'+ blr_id +'</BlrId><PayMode>'+ mode +'</PayMode><DebitBranch>INDB000018</DebitBranch><DebitAcNo>AIAGTAC001</DebitAcNo><BillAmt>'+ amt +'</BillAmt><DebitNar1>test</DebitNar1><PayChannel>AGT</PayChannel><SplitAmt>0</SplitAmt><SplitPay>No</SplitPay><CCF>0</CCF><TotalAmt>'+ amt +'</TotalAmt><Field37>'+ amt +'</Field37><QuickPay>0</QuickPay></Payment></Payments>'

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
                    // console.log(data);
                    // console.log(pay_data);
                });
                resolve({pay_data, txnref_no, msg});
            });
        });
        
    } catch (err) {
        console.log({ "msg": err });
    }
}

const conf_biller = async (req, res, next) => {
    // console.log(req.body);
    var cat_id = req.body.CatId;
    var coverage = req.body.StName;
    var cat_name = req.body.cat_name;
    var biller_data = await get_biller(cat_id, coverage);
    // console.log(biller_data);
    res.render('pay/conf_biller', {biller_data, cat_name, cat_id, coverage});
}

const get_params = async (req, res, next) => {
    // console.log(req.body);
    const biller_id = req.body.BlrId;
    var biller_params = await params(biller_id);
    res.render('pay/get_biller', {biller_params, biller_id, cat_id: req.body.cat_id, coverage: req.body.coverage, blr_name: req.body.biller_name, cat_name: req.body.CatId});
    // console.log(await params(biller_id));
}

const fetch_bill = async (req, res, next) => {
    // console.log(req.body);
    const ref_id = await AgentRefNo(111111111111111, 999999999999999);
    const agent_ref_id = 'INTB' + ref_id;
    // console.log('INTB' + agent_ref_id);
    const data = JSON.parse(JSON.stringify(req.body));
    var keys = Object.keys(data);
    var values = Object.keys(data).map(key => data[key]);
    var obj = '';
    var prev_val = '';
    var body_str = '';
    for (var i = 2; i < (keys.length - 2); i++){
        obj = '<' + keys[i] + '>' + values[i] + '</' + keys[i] + '>';
        body_str = prev_val + obj;
        prev_val = body_str;
        // obj[keys[i]] = values[i];
    }
    const mode = await pay_mode(req.body.BlrId);
    // console.log(mode);
    const bill_details = await get_bill(agent_ref_id, body_str);
    // console.log(bill_details.ref_id);
    res.render('pay/get_bill', {bill_dtls : bill_details.bill_data, ref_id : bill_details.ref_id, mode, blr_name: req.body.blr_name, BlrId: req.body.BlrId});
}

const conf_bill = (req, res, next) => {
    const data = req.body;
    res.render('pay/consf_bill', {data})
    // console.log(data);
}

const pay_bill = async (req, res, next) => {
    // console.log(req.body);
    const ref_id = await AgentRefNo(111111111111111, 999999999999999);
    const agent_ref_id = 'INTB' + ref_id;
    const RefId = String(String(req.body.RefId).replace('"', '')).replace('"', '');
    const pay_details = await bill_pay(agent_ref_id, RefId, req.body.BlrId, req.body.PayMode, req.body.BASE_BILL_AMOUNT);
    const pay = pay_details.pay_data;
    var trns_dt = new Date().toLocaleString('en-IN');
	//res.send({'Data': JSON.stringify(pay_details)});
    res.render('pay/conf_pay', {pay, blr_name: req.body.BillarName, ref_no: pay_details.txnref_no, msg: pay_details.msg, trns_dt});
}

// EXPORT MODULES
module.exports = {
    index,
    conf_biller,
    get_params,
    fetch_bill,
    conf_bill,
    pay_bill
}