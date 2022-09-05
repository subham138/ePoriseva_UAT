const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const request = require('request');
const xml2js = require('xml2js');
const db = require('../core/database');
var agntId = "IN01IN20INTU00000001";
var keyword = "21835678617541456491",
    client_id = "ec9370b4-dd3b-4f58-8c33-6f6e104ab642",
    client_secret = "oQ7iX8fN3hA0jQ6vI5sO2bE3hU4dR5iJ6bA5cM6kK6oA2bM0rM";

// DEFINE BODYPARSER
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// GENERATE AGENTREFNO
const AgentRefNo = (min, max) => {
    return new Promise((resolve, reject) => {
        resolve(Math.floor(
            Math.random() * (max - min + 1) + min
        ));
    })
}

const RegisterComplaint = (data, ref_id) => {
    try {
        return new Promise((resolve, reject) => {
            var { ComplaintType, TxnReferenceId, Disposition, Description } = data;
            var type = ComplaintType == '1' ? 'Transaction' : 'Service';
            var options = {
                'method': 'POST',
                'url': 'https://apig.indusind.com/ibl/prod/COUHubAPI/RegisterComplaint',
                'headers': {
                    'X-IBM-Client-Secret': client_secret,
                    'X-IBM-Client-Id': client_id,
                    'Content-Type': 'application/xml',
                    'Cookie': 'ASP.NET_SessionId=eprlnvyulnga5rpjvsbqovt1'
                },
                body: '<Complaints><Complaint><AgntId>' + agntId + '</AgntId><Keyword>' + keyword + '</Keyword><AgntRefId>' + ref_id + '</AgntRefId><TxnReferenceId>' + TxnReferenceId + '</TxnReferenceId><Description>' + Description + '</Description><XchangeId>501</XchangeId><ComplaintType>' + type + '</ComplaintType><Disposition>' + Disposition + '</Disposition></Complaint></Complaints>'

            };
            request(options, function (error, response) {
                if (error) throw new Error(error);
                const xml = response.body;
                xml2js.parseString(xml, (err, result) => {
                    if (err) {
                        throw err;
                    }
                    const data = JSON.stringify(result);
                    if (result.Response.Code == 'SUCX001') {
                        params_data = JSON.stringify(result.Response.ComplaintsResponse[0].Row);
                    } else {
                        params_data = '';
                    }

                    console.log({ req: options.body, result });
                });
                resolve(params_data);
            });
        })
    } catch (err) {
        console.log(err);
    }

}

const GetComplaintStatus = (data, ref_id) => {
    try {
        return new Promise((resolve, reject) => {
            var { ComplaintId, ComplaintType } = data;
            var options = {
                'method': 'POST',
                'url': 'https://apig.indusind.com/ibl/prod/COUHubAPI/GetComplaintStatus',
                'headers': {
                    'X-IBM-Client-Secret': client_secret,
                    'X-IBM-Client-Id': client_id,
                    'Content-Type': 'application/xml',
                    'Cookie': 'ASP.NET_SessionId=eprlnvyulnga5rpjvsbqovt1'
                },
                body: '<ComplaintsStatus><ComplaintStatus><AgntId>' + agntId + '</AgntId><Keyword>' + keyword + '</Keyword><AgntRefId>' + ref_id + '</AgntRefId><ComplaintType>' + ComplaintType + '</ComplaintType><XchangeId>506</XchangeId><ComplaintId>' + ComplaintId + '</ComplaintId></ComplaintStatus></ComplaintsStatus>'

            };
            request(options, function (error, response) {
                if (error) throw new Error(error);
                const xml = response.body;
                xml2js.parseString(xml, (err, result) => {
                    if (err) {
                        throw err;
                    }
                    const data = JSON.stringify(result);
                    if (result.Response.Code == 'SUCX001') {
                        params_data = JSON.stringify(result.Response.ComplaintStatusResponse[0].Row);
                    } else {
                        params_data = '';
                    }
                });
                resolve(params_data);
            });
        })
    } catch (err) {
        console.log(err);
    }

}

const complaint = (req, res) => {
    let user = req.session.user;
    // console.log(user);
    if (user) {
        var tnx_id = req.query.id;
        res.render('cmpln/entry', { tnx_id });
    } else {
        res.redirect('/login');
    }
}

const get_disposition = (req, res) => {
    var id = req.query.id;
    var sql = `SELECT * FROM md_disposition WHERE cmpln_type_id="${id}"`;
    try {
        db.query(sql, (err, result) => {
            if (err) console.log(err);
            // console.log(result);
            res.send(JSON.stringify(result));
        })
    } catch (err) {
        console.log(err);
    }
}

const submit_complaint = async (req, res) => {
    const ref_id = await AgentRefNo(111111111111111, 999999999999999);
    // console.log(ref_id);
    var result = await RegisterComplaint(req.body, ref_id);
    var trns_dt = new Date().toLocaleString('en-IN');
    var compl_type = req.body.ComplaintType == '1' ? 'Transaction' : 'Service';
    // if (result.length() > 0) {
    res.render('cmpln/slip', { result, tnx_id: req.body.TxnReferenceId, trns_dt, compl_type });
    // }
    console.log({ ress: result });
    // console.log(req.body);
}

const search_complain_in = (req, res) => {
    let user = req.session.user;
    // console.log(user);
    if (user) {
        res.render('cmpln/cmpln_view_in');
    } else {
        res.redirect('/login');
    }
}

const search_complain_out = async (req, res) => {
    const ref_id = await AgentRefNo(111111111111111, 999999999999999);
    var result = await GetComplaintStatus(req.body, ref_id);
    res.render('cmpln/cmpln_view_out', { result });
}

module.exports = { get_disposition, complaint, submit_complaint, search_complain_in, search_complain_out };