const express = require( 'express' );
const bodyParser = require( 'body-parser' );
const app = express();
const PORT = 5000;

app.use( bodyParser.urlencoded ({ extended:true } ));
app.use( express.static( 'server/public'));

const add = require( './modules/add');
const subtract = require( './modules/subtract');
const multiply = require( './modules/mulitply');
const divide = require( './modules/divide');

let calculationsArray = [];

app.post( '/calculate', ( req, res ) => {
    console.log( 'Got equation on server:', req.body );

    let num1 = Number ( req.body.num1 );
    let num2 = Number( req.body.num2 );
    let operator;
    let result;

    switch ( req.body.operator ) {
        case 'add-btn':
            result = add( num1, num2 );
            operator = '+';
            break;
        case 'subtract-btn':
            result = subtract( num1, num2 );
            operator = '-';
            break;
        case 'multiply-btn':
            result = multiply( num1, num2 );
            operator = '*';
            break;
        case 'divide-btn':
            result = divide( num1, num2 );
            operator = '/'
            break;
    };

    req.body.result = result;
    req.body.operator = operator;
    // calculationsArray.push( req.body );
    calculationsArray.unshift( req.body );

    console.log( 'Stored calculation on server', calculationsArray );

    res.sendStatus( 200 );
});

app.get( '/history', ( req, res ) => {
    console.log( 'Getting calculations from server', req.body );
    res.send( calculationsArray );
});

app.listen( PORT, () => {
    console.log( 'Server is listening on port:', PORT );
});