//var client_token

var shipping_addr = {
    recipientName: 'Joey Chen',
    line1: '1234 Main St.',
    line2: 'Unit 1',
    city: 'Chicago',
    countryCode: 'US',
    postalCode: '60652',
    state: 'IL',
    phone: '123.456.7890'
    /*
    firstName: "Joey",
    lastName: "Chen",
    company: "JC",
    streetAddress: "1 E 1st St",
    extendedAddress: "5th Floor",
    locality: "Bartlett",
    region: "IL",
    postalCode: "60103",
    countryCodeAlpha2: "US",
    phone: '123.456.7890'
    */
};

function loadingStart() {
    $('#loadingSection').show();
}

function loadingStop() {
    $('#loadingSection').hide();
}

function displayInfo(info) {
    $('#paymentInfo').html(info);
}

function displayConfirmation(paymentConfirmation){
    preparePaymentConfirmation(paymentConfirmation);
    $('#confirmationSection').show();
}

function hideConfirmation(){
    $('#confirmationSection').hide();
}

function displayResult(){
    $('#resultSection').show();
}

function hideResult(){
    $('#resultSection').hide();
}

function getOrderInfo() {
    var orderInfo = {};
    orderInfo['amount'] = $('#orderAmount').find(':selected').val();
    orderInfo['currency'] = $('#orderCurrency').find(':selected').val();
    orderInfo['shippingAddress'] = shipping_addr;
    return orderInfo;
}

function preparePaymentConfirmation(paymentConfirmation){
    var orderInfoHtml = 'Order ID: ' + paymentConfirmation.id + '<br>' 
                      + 'Payment Amount: ' + paymentConfirmation.amount 
                      + ' ' + paymentConfirmation.currency + '<br><br>'
                      + 'Please review your payment above, and confirm by clicking the button below.'
    $('#confirmationContent').html(orderInfoHtml);
}

//Send payment info and nonce to server
function executePayment(paymentConfirmation) {
    hideConfirmation();
    loadingStart();
    $.ajax({
        type: "POST",
        url: "./checkout",
        data: paymentConfirmation,
        //dataType: "json",
        //timeout: 30000,
        success: function (data, status, xhr) {
            if (data) {
                console.log(data);
                //displayInfo("Payment Result: " + data)
                var resultHtml = "Thanks for your purchase!<br><br>Here's the payment result:<br>" + data;
                $('#paymentResult').html(resultHtml);
                $('#continueButton').one('click',function(){
                    $(location).attr('href','./');
                })
                displayResult();
                loadingStop();
            } else {
                console.error("No data received from the server!");
                displayInfo("ERROR: No data received from the server!")
                loadingStop();
            }
        },
        error: function (xhr, errorType, error) {
            console.error(error);
            displayInfo(ERROR)
            loadingStop();
        }
    })
};

loadingStart();


$.ajax({
    type: "GET",
    url: "./client_token",
    timeout: 30000,
    success: function (data, status, xhr) {
        if (data) {
            console.log('client token received');
            console.log(status);
            console.log('token: ' + data);

            var buttonOptions = {
                token: data
            }

            renderPPButton(buttonOptions);
            loadingStop();
        } else {
            console.error("No data received from the server!");
            displayInfo("No data received from the server!");
            loadingStop();
        }
    },
    error: function (xhr, errorType, error) {
        console.error(error);
        displayInfo(error);
        loadingStop();
    }
})



function renderPPButton(options) {

    paypal.Button.render({
        braintree: braintree,

        client: {
            sandbox: options.token
        },
        env: 'sandbox', // Or 'sandbox',

        commit: true, // Show a 'Pay Now' button

        style: {
            color: 'blue',
            size: 'medium'
        },

        payment: function (data, actions) {
            /* 
             * Set up the payment here 
             */
            var orderInfo = getOrderInfo();
            console.log("payment button clicked");
            return actions.braintree.create({
                flow: 'checkout', // Required
                amount: orderInfo.amount, // Required
                currency: orderInfo.currency, // Required
                enableShippingAddress: true,
                shippingAddressEditable: false,
                shippingAddressOverride: orderInfo.shippingAddress
            });
        },

        onAuthorize: function (payload, actions) {
            /* 
             * Get payment details and wait for buyer's confirmation
             */
            loadingStart();
            console.log(payload);
            console.log("payment authorized by buyer");

            return actions.payment.get().then(function (paymentDetails) {
                console.log(paymentDetails);

                var paymentConfirmation = {
                    id: paymentDetails.id,
                    amount: paymentDetails.transactions[0].amount.total,
                    currency: paymentDetails.transactions[0].amount.currency,
                    //address: paymentDetails.payer.payer_info.shipping_address,
                    nonce: payload.nonce
                };

                /*paymentConfirmation['id'] = paymentDetails.id;
                paymentConfirmation['amount'] = paymentDetails.transactions[0].amount;
                paymentConfirmation['address'] = paymentDetails.payer.payer_info.shipping_address;
                paymentConfirmation['nonce'] = payload.nonce;
                */

                $('#confirmationButton').one('click', function () {
                    //Execute payment by sending nonce to server
                    executePayment(paymentConfirmation);
                })

                displayConfirmation(paymentConfirmation);
                loadingStop();
            });

        },

        onCancel: function (data, actions) {
            /* 
             * Buyer cancelled the payment 
             */
            console.log("payment cancelled");
        },

        onError: function (err) {
            /* 
             * An error occurred during the transaction 
             */
            console.error(err);
        }

    }, '#paypalButton');
}


