const express = require( 'express' );
const bodyParser = require( 'body-parser' );
const app = express();
const PORT = 5000;

app.use( bodyParser.urlencoded ({ extended:true } ));
app.use( express.static( 'server/public'));

// requires the modules containing the mathematical functions
const add = require( './modules/add');
const subtract = require( './modules/subtract');
const multiply = require( './modules/mulitply');
const divide = require( './modules/divide');

// creates an empty array to store calculation
let calculationsArray = [];

// receives a post requres from the client
app.post( '/calculate', ( req, res ) => {
    console.log( 'Got equation on server:', req.body );

    // sets num1 and num2 to Number value of their variable passed in the request
    let num1 = Number ( req.body.num1 );
    let num2 = Number( req.body.num2 );
    let result;

    // based on the operator included in the request, calls the appropriate mathematical function
    // and sets the result accordingly
    switch ( req.body.operator ) {
        case '+':
            result = add( num1, num2 );
            break;
        case '-':
            result = subtract( num1, num2 );
            break;
        case '*':
            result = multiply( num1, num2 );
            break;
        case '/':
            result = divide( num1, num2 );
            break;
    };

    // adds the result to the calculation object and pushes into the calculationsArray
    req.body.result = result;
    calculationsArray.unshift( req.body );

    console.log( 'Stored calculation on server', calculationsArray );

    res.sendStatus( 200 );
});

// receives a GET request from the client and sends the current calculationsArray
app.get( '/history', ( req, res ) => {
    console.log( 'Getting calculations from server', req.body );
    res.send( calculationsArray );
});

// receives a DELETE request from the client and resets the calculationsArray to an empty array
app.delete( '/delete', ( req, res ) => {
    console.log( 'Deleting history on server' );
    calculationsArray = [];
    res.sendStatus( 204 );
});

app.listen( PORT, () => {
    console.log( 'Server is listening on port:', PORT );
});