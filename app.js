var _ = require('lodash');
var moment = require('moment');
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');

var stripe_secret_key = process.env.STRIPE_SECRET_KEY || 'sk_test_VQhRBtzD9LhBtvkIIpcrPm7x';

var app = express();
app.set('view engine', 'ejs');
app.locals.errors = [];
app.locals.stripe = {
  publishable_key: process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_eZxV6q80NOAWDuTgCR8tw6P5',
};

app.use(express.static(path.join(__dirname, '/public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

var port = process.env.PORT || 6565;
app.listen(port, function () {
  console.log('Dev server listening on port ' + port + '!');
});

// ------------------------

app.get('/', function(req, res) {
  res.render('pages/index');
});

app.get('/pay', function(req, res) {
  res.render('pages/pay');
});

app.post('/pay', function(req, res) {
  var stripe = require('stripe')(stripe_secret_key);
  console.log(req.body);
  var token = req.body.stripeToken;
  var amount_usd = req.body.amount_usd;
  var memo = req.body.memo;
  console.log('POST /pay: amount_usd=' + amount_usd + ', memo=' + memo + ', token=' + token);

  var errors = [];
  var amount_cents;
  try {
    if (amount_usd.match(/[^\d]/) == null) {
      amount_cents = parseFloat(amount_usd) * 100;
    }
  }
  catch (err) {}
  if (!amount_cents) {
    errors.push('The payment amount you entered is invalid.');
    return res.render('pages/pay', { errors: errors });
  }

  var charge = stripe.charges.create({
    amount: amount_cents,
    currency: 'usd',
    source: token,
    description: 'Online Payment to Ulf Magnetics, Inc.',
  }, function(err, charge) {
    if (err) {
      if (err.type == 'card_error') {
        errors.push('Your credit card was declined. More information from the payment processor: ' + err.message);
      }
      else{
        errors.push('There was an error processing your payment.');
      }
      res.render('pages/pay', { errors: errors });
    }
    else {
      var value = {
        amount: require('format-currency')(charge.amount / 100, { format: '%s%v', code: 'USD', symbol: '$' }),
        description: charge.description,
        time: moment.unix(charge.created).toString(),
        status: charge.status
      };
      console.log(value);
      res.cookie('receipt', JSON.stringify(value));
      res.redirect('/success');
    }
  });
});

app.get('/success', function(req, res) {
  if (req.cookies.receipt) {
    res.render('pages/success', { receipt: JSON.parse(req.cookies.receipt) });
  }
  else {
    res.redirect('/')
  }
});
