const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const request = require('request');
const xml2js = require('xml2js');
var agntId = "IN01IN20INTU00000001";
var keyword = "21835678617541456491",
    client_id = "ec9370b4-dd3b-4f58-8c33-6f6e104ab642",
    client_secret = "oQ7iX8fN3hA0jQ6vI5sO2bE3hU4dR5iJ6bA5cM6kK6oA2bM0rM";

// DEFINE BODYPARSER
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const get_tnx_dtls = (req_body, type) => {
    try {
        return new Promise((resolve, reject) => {
            // var params_data = accpt_type == '1' ? '<ReqTypes><Req>BR</Req></ReqTypes><ReqTypes><Req>PR</Req></ReqTypes>' : '<ReqTypes><Req>BR</Req></ReqTypes>';
            // var a = '<TxnsStatus><TxnStatus><AgntId>'+ agntId +'</AgntId><Keyword>'+ keyword +'</Keyword><AgntRefId>INTB337531415657945</AgntRefId><XchangeId>401</XchangeId><ComplaintType>Transaction</ComplaintType>' + req_body + '</TxnStatus></TxnsStatus>';
            // console.log(a);
            var mob_no = '';
			var msg = '';
            var options = {
                'method': 'POST',
                'url': 'https://apig.indusind.com/ibl/prod/COUHubAPI/GetTransactionStatus',
                'headers': {
                    'X-IBM-Client-Secret': client_secret,
                    'X-IBM-Client-Id': client_id,
                    'Content-Type': 'application/xml',
                    'Cookie': 'ASP.NET_SessionId=eprlnvyulnga5rpjvsbqovt1'
                },
                body: '<TxnsStatus><TxnStatus><AgntId>' + agntId + '</AgntId><Keyword>' + keyword + '</Keyword><AgntRefId>INTB337531415657945</AgntRefId><XchangeId>401</XchangeId><ComplaintType>Transaction</ComplaintType>' + req_body + '</TxnStatus></TxnsStatus>'

            };
            request(options, function (error, response) {
                if (error) throw new Error(error);
                const xml = response.body;
                xml2js.parseString(xml, (err, result) => {
                    if (err) {
                        throw err;
                    }
                    const data = JSON.stringify(result);
                    params_data = result.Response.Code == 'SUCX001' ? JSON.stringify(result.Response.ComplaintStatusResponse[0].TxnList[0].TxnDetail) : null;
                    if (type == '1') {
                        mob_no = result.Response.Code == 'SUCX001' ? JSON.stringify(result.Response.ComplaintStatusResponse[0].CustomerDetails[0].$.mobile) : null;
                    }
					msg = result.Response.Msg;
                    //console.log({ req: options.body, data });
                });
                resolve({ params_data, mob_no, msg });
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
	if(tnx_dtls.params_data){
    res.render('tnx_srch/tnx_search_out', { dtls: tnx_dtls.params_data, mob_no: tnx_dtls.mob_no, type });
	}else{
		req.session.message = { type: 'warning', message: tnx_dtls.msg };
		res.redirect('/tnx_srch')
	}
}


// EXPORT MODULES
module.exports = {
    tnx_search_in,
    tnx_search_out
}