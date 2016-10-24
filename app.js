var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var app = express();
var stripe_secret_key = process.env.STRIPE_SECRET_KEY || "sk_test_VQhRBtzD9LhBtvkIIpcrPm7x";

app.use(express.static(path.join(__dirname, '/public')));
app.use(bodyParser.urlencoded({ extended: false }));

var port = process.env.PORT || 6565;
app.listen(port, function () {
  console.log('Dev server listening on port ' + port + '!');
});

app.post('/charge', function(req, res) {
  var stripe = require('stripe')(stripe_secret_key);
  console.log(req.body);
  var token = req.body.stripeToken;
  var amountUSD = req.body.amount_usd;
  var memo = req.body.memo;
  console.log('/charge: amountUSD=' + amountUSD + ', memo=' + memo + ', token=' + token);

  //var charge = stripe.charges.create({
    //amount:
  //});
});

