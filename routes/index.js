//var Data = require('../models/data.js');
//var buf = new Buffer(1024000);
var braintree = require('braintree')
var myAccessToken = 'access_token$sandbox$rkv944fmzdcpv7zm$6270afab6623d0b1c29179c588924196'


var express = require('express'),
    router = express.Router(),
    TITLE = 'PayPal Checkout Demo Page - Joey'

function generateOrderID(){
    var now = new Date();
    var timestamp = now.getFullYear().toString();
    timestamp += (now.getMonth() < 9 ? '0' : '') + (now.getMonth() + 1).toString();
    timestamp += ((now.getDate() < 10) ? '0' : '') + now.getDate().toString();
    timestamp += ((now.getHours() < 10) ? '0' : '') + now.getHours().toString();
    timestamp += ((now.getMinutes() < 10) ? '0' : '') + now.getMinutes().toString();
    timestamp += ((now.getSeconds() < 10) ? '0' : '') + now.getSeconds().toString();
    timestamp += ((now.getMilliseconds() < 10) ? '00' : (now.getMilliseconds() < 100 ? '0' : '')) + now.getMilliseconds().toString();
    var randomNumber = Math.floor(Math.random()*1000000).toString();
    return timestamp + randomNumber;
}


/* GET home page. */
router.get('/', function (req, res) {
    res.render('index', { title: TITLE });
});

/* Generate client token */
router.get('/client_token', function (req, res) {
    var gateway = braintree.connect({
        accessToken: myAccessToken
    })

    gateway.clientToken.generate({}, function (err, response) {
        res.send(response.clientToken);
    });
});

/* Receive payment method nonce */
router.post("/checkout", function (req, res) {
    var nonce = req.body.nonce;

    console.log(nonce);
    //res.send("payment received");

    var gateway = braintree.connect({
        accessToken: myAccessToken
    });

    var saleRequest = {
        amount: req.body.amount,
        merchantAccountId: req.body.currency,
        paymentMethodNonce: req.body.nonce,
        orderId: generateOrderID(),
        /*descriptor: {
            name: "companyproduct name"
        },*/
        shipping: {
            firstName: "Jen",
            lastName: "Smith",
            company: "Braintree",
            streetAddress: "1 E 1st St",
            extendedAddress: "5th Floor",
            locality: "Bartlett",
            region: "IL",
            postalCode: "60103",
            countryCodeAlpha2: "US"
        },
        options: {
            paypal: {
                customField: "PayPal custom field",
                description: "Description for PayPal email receipt"
            },
            submitForSettlement: true
        }
    };

    gateway.transaction.sale(saleRequest, function (err, result) {
        if (err) {
            res.send("Error:  " + err);
        } else if (result.success) {
            res.send("Success! Transaction ID: " + result.transaction.id);
        } else {
            res.send("Error:  " + result.message);
        }
    });

});


module.exports = router;