//var client_token

var shipping_address = {
    recipientName: 'Joey Chen',
    line1: '1234 Main St.',
    line2: 'Unit 1',
    city: 'Chicago',
    countryCode: 'US',
    postalCode: '60652',
    state: 'IL',
    phone: '123.456.7890'
};

function loadingStart() {
    $('#loadingSection').show();
}

function loadingStop() {
    $('#loadingSection').hide();
}

function displayInfo(info) {
    $('#paymentResult').html(info);
}

function getPaymentInfo() {
    var paymentInfo = {};
    paymentInfo['amount'] = $('#orderAmount').find(':selected').val();
    paymentInfo['currency'] = $('#orderCurrency').find(':selected').val();
    paymentInfo['shippingAddress'] = shipping_address;
    return paymentInfo;
}


loadingStart();


$.ajax({
    type: "GET",
    url: "/client_token",
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
            size: 'small'
        },

        payment: function (data, actions) {
            /* 
             * Set up the payment here 
             */
            var paymentInfo = getPaymentInfo();
            console.log("payment button clicked");
            return actions.braintree.create({
                flow: 'checkout', // Required
                amount: paymentInfo.amount, // Required
                currency: paymentInfo.currency, // Required
                enableShippingAddress: true,
                shippingAddressEditable: false,
                shippingAddressOverride: paymentInfo.shippingAddress
            });
        },

        onAuthorize: function (payload) {
            /* 
             * Send nonce to seller server
             */
            loadingStart();
            console.log(payload);
            console.log("payment authorized by buyer");
            var paymentInfo = getPaymentInfo();
            var authorizeInfo = {};
            authorizeInfo["nonce"] = payload.nonce;
            authorizeInfo["amount"] = paymentInfo.amount;
            authorizeInfo["currency"] = paymentInfo.currency;

            $.ajax({
                type: "POST",
                url: "/checkout",
                data: authorizeInfo,
                //dataType: "json",
                //timeout: 30000,
                success: function (data, status, xhr) {
                    if (data) {
                        console.log(data);
                        displayInfo("Payment Result: " + data)
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
            }
            )
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