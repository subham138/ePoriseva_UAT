const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const request = require('request');
const xml2js = require('xml2js');

// DEFINE BODYPARSER
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const get_tnx_dtls = (req_body, type) => {
    try {
        return new Promise((resolve, reject) => {
            // var params_data = accpt_type == '1' ? '<ReqTypes><Req>BR</Req></ReqTypes><ReqTypes><Req>PR</Req></ReqTypes>' : '<ReqTypes><Req>BR</Req></ReqTypes>';
            // var a = '<TxnsStatus><TxnStatus><AgntId>IN01IN03AGT000000002</AgntId><Keyword>AIAGT$20170704</Keyword><AgntRefId>INTB337531415657945</AgntRefId><XchangeId>401</XchangeId><ComplaintType>Transaction</ComplaintType>' + req_body + '</TxnStatus></TxnsStatus>';
            // console.log(a);
            var mob_no = '';
            var options = {
                'method': 'POST',
                'url': 'https://ibluatapig.indusind.com/app/uat/HubComfort/COUHubComfort/GetTransactionStatus',
                'headers': {
                    'X-IBM-Client-Secret': 'uQ1cQ3qB0jG6rP0qY1pF2wB8eQ1lO6oJ0eJ7pK1eG2bB0iD3kV',
                    'X-IBM-Client-Id': '3b67954e-0045-4455-9a94-2b98a82c07d7',
                    'Content-Type': 'application/xml',
                    'Cookie': 'ASP.NET_SessionId=eprlnvyulnga5rpjvsbqovt1'
                },
                body: '<TxnsStatus><TxnStatus><AgntId>IN01IN20INTU00000001</AgntId><Keyword>21835678617541456491</Keyword><AgntRefId>INTB337531415657945</AgntRefId><XchangeId>401</XchangeId><ComplaintType>Transaction</ComplaintType>' + req_body + '</TxnStatus></TxnsStatus>'

            };
            request(options, function (error, response) {
                if (error) throw new Error(error);
                const xml = response.body;
                xml2js.parseString(xml, (err, result) => {
                    if (err) {
                        throw err;
                    }
                    const data = JSON.stringify(result);
                    params_data = JSON.stringify(result.Response.ComplaintStatusResponse[0].TxnList[0].TxnDetail);
                    if (type == '1') {
                        mob_no = JSON.stringify(result.Response.ComplaintStatusResponse[0].CustomerDetails[0].$.mobile);
                    }
                    console.log({ req: options.body, data });
                });
                resolve({ params_data, mob_no });
            });
        });

    } catch (err) {
        console.log({ "msg": err });
    }
}

// LOGIN INDEX
const tnx_search_in = (req, res, next) => {
    let user = req.session.user;
    // console.log(user);
    if (user) {
        res.render('tnx_srch/tnx_search_in');
    } else {
        res.redirect('/login');
    }
};

const tnx_search_out = async (req, res, next) => {
    // console.log(req.body);
    var type = req.body.radio;
    var req_body = '';
    if (type == '1') {
        req_body = '<TxnReferenceId>' + req.body.TxnReferenceId + '</TxnReferenceId>';
    } else if (type == '2') {
        var frmdt = new Date(req.body.FromDate);
        var todt = new Date(req.body.ToDate);
        req_body = '<MobileNo>' + req.body.MobileNo + '</MobileNo><FromDate>' + (((frmdt.getMonth() + 1) >= 10 ? '' : '0') + (frmdt.getMonth() + 1)) + '-' + ((frmdt.getDate() >= 10 ? '' : '0') + frmdt.getDate()) + '-' + frmdt.getFullYear() + '</FromDate><ToDate>' + (((todt.getMonth() + 1) >= 10 ? '' : '0') + (todt.getMonth() + 1)) + '-' + ((todt.getDate() >= 10 ? '' : '0') + todt.getDate()) + '-' + todt.getFullYear() + '</ToDate>';
    }
    var tnx_dtls = await get_tnx_dtls(req_body, type);
    res.render('tnx_srch/tnx_search_out', { dtls: tnx_dtls.params_data, mob_no: tnx_dtls.mob_no, type });
}


// EXPORT MODULES
module.exports = {
    tnx_search_in,
    tnx_search_out
}