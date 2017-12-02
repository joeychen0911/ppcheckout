//var client_token

var orderID;



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
        } else {
            console.error("No data received from the server!");
        }
    },
    error: function (xhr, errorType, error) {
        console.error("No response from the server!");
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
            color: 'gold',
            size: 'small'
        },

        payment: function (data, actions) {
            /* 
             * Set up the payment here 
             */
            console.log("payment button clicked");
            return actions.braintree.create({
                flow: 'checkout', // Required
                amount: 0.88, // Required
                currency: 'USD', // Required
                enableShippingAddress: true,
                shippingAddressEditable: false,
                shippingAddressOverride: {
                    recipientName: 'Scruff McGruff',
                    line1: '1234 Main St.',
                    line2: 'Unit 1',
                    city: 'Chicago',
                    countryCode: 'US',
                    postalCode: '60652',
                    state: 'IL',
                    phone: '123.456.7890'
                }
            });
        },

        onAuthorize: function (payload) {
            /* 
             * Send nonce to seller server
             */
            console.log(payload);
            console.log("payment authorized by buyer");
           
            var paymentInfo = {};

            paymentInfo["nonce"] = payload.nonce;
            paymentInfo["amount"] = 1.8;
            
            $.ajax({
                type: "POST",
                url: "/checkout",
                data: paymentInfo,
                //dataType: "json",
                //timeout: 30000,
                success: function (data, status, xhr) {
                    if (data) {
                        console.log(data);
                        $('#payment-result').html(data);
                    } else {
                        console.error("No data received from the server!");
                    }
                },
                error: function (xhr, errorType, error) {
                    console.error(error);
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

    }, '#paypal-btn');
}