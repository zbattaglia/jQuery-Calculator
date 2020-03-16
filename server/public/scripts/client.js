$( document ).ready( ready );

let operator = null;
let num1;
let num2;
let complete = false;

function ready() {
    console.log( 'jQuery Ready on the client.');


    appendCalculationsToDom();

    $( '#add-btn, #subtract-btn, #multiply-btn, #divide-btn' ).on( 'click', getOperator );
    $( '#equals-btn' ).on( 'click', calculate );
    $( '#clear-btn' ).on( 'click', clearInputs );
    $( '#reset-btn' ).on( 'click', clearHistory );
    $( '.number-in' ).on( 'click', updateDisplay );
    $( '#calculationList' ).on( 'click', 'li', redoCalc );

};

function redoCalc( event ) {
    event.preventDefault();
    console.log( 'Removing event', $(this).closest( 'li' ).text() );
    let previousEquation = $(this).closest( 'li' ).text().trim().split( ' ' )
    console.log( 'The previous equation is', previousEquation );
    
    postToServer({
        num1 : Number( previousEquation[0] ),
        num2 : Number( previousEquation[2] ),
        operator : previousEquation[1]
    })
}

// updateDisplay appends any numbers clicked on the DOM to the display
function updateDisplay( event ) {
    event.preventDefault();
    // $(this).text() gives the text of each number and the decimal when clicked
    console.log( 'Updating display with:', $(this).text() );
    
    // complete will indicate if this is the start of a new equation or not
    if ( complete === true ) {
        $( '#display' ).empty();
        complete = false;
    }
    // a number can't have two decimals in it, so the decimal button is disabled ater the first click
    if ( this.id === 'decimal-btn' ) {
        $( '#decimal-btn' ).prop( 'disabled', true )
    }
    // appends the text value of the clicked button to the display
    $( '#display' ).append( $(this).text() );
}

// clearHistory to clear the array on the server
function clearHistory( event ) {
    event.preventDefault();
    console.log( 'Resetting History' );
    
    // clear inputs resets any current numbers and operators waiting to be sent to the server
    clearInputs( event );

    // makes a delete request of the server
    // upon a successful response, appendsCalc's to the DOM which is empty
    $.ajax({
        method: 'DELETE',
        url: '/delete'
    })
    .then( function( response ) {
        console.log( 'Deleting History', response );
        appendCalculationsToDom();
    })
    .catch( function( error ) {
        console.log( 'Error:', error );
    })
};

// cleats all inputs waiting to be sent to the server
function clearInputs( event ) {
    event.preventDefault();
    console.log( 'Clearing inputs' );
    // sets the two numbers and operator values to empty and null
    operator = null;
    num1 = '';
    num2 = '';
    // empties the display, enables the decimal button since a new equation can be started
    // enables all operator buttons for the new equation
    $( '#display' ).empty();
    $( '#decimal-btn' ).prop( 'disabled', false );
    $( '#add-btn, #subtract-btn, #multiply-btn, #divide-btn' ).prop( 'disabled', false );
};

// used to set the value of the operator to whichever operator was clicked
function getOperator( event ) {
    event.preventDefault();
    // $(this).text() get's the text value of +, -, *, or /
    operator = $(this).text();
    console.log( 'Setting operator to:', $(this).text() );
    // sets complete to false since this is only half of an equation we still need a second number
    complete = false;
    // appends the clicked operator text to the dispaly on the DOM
    // enables the decimal button for use with the second number
    // disables all operator buttons since the calcualator will only handle one operation at a time
    $( '#display' ).append(` ${$(this).data().operator} `)
    $( '#decimal-btn' ).prop( 'disabled', false );
    $( '#add-btn, #subtract-btn, #multiply-btn, #divide-btn' ).prop( 'disabled', true );
};

// 
function calculate( event ) {
    event.preventDefault();

    // gets the text currently being displayed on the DOM
    // trim() removes white space and then splits the two number and operator into distinct parts
    let numbers = $( '#display' ).text().trim().split( / \+ | \- | \/ | \* /);
    console.log( 'The numbers are', Number( numbers[0] ), Number( numbers[1] ) );
    
    // assigns num1 and num2 to the correct parts of the numbers array
    num1 = numbers[0];
    num2 = numbers[1];

    // calls validate inputs to confirm that two numbers and an operator are present
    // if true, creates an object to POST to the server, else alerts the user
    if ( validateInputs() ) {

        let equation = {
            num1,
            num2,
            operator
        }
        postToServer( equation )
    }
    else {
        alert( 'Please input all parts of the equation.' );
    }
};

// The function makes a POST on the server 
function postToServer( equation ) {
        $.ajax({
            method: 'POST',
            url: '/calculate',
            data: equation
        })
        .then( function( response ) {
            console.log( 'Got response from server in calculate', response );
        })
        .catch( function( error ) {
            console.log( 'Error', error );
        })

    console.log( 'Sending Equation to server', equation );
        // appends updated calculationArray to the DOM
    appendCalculationsToDom();

    // resets the operator to null, sets complete to true and enables the decimal and operator buttons
    // to prepare for a new calculation
    operator = null;

    complete = true;
    $( '#decimal-btn' ).prop( 'disabled', false );
    $( '#add-btn, #subtract-btn, #multiply-btn, #divide-btn' ).prop( 'disabled', false );
};

// validateInputs to confirm that two numbers and an operator have been entered
function validateInputs() {
    console.log( 'Validating inputs' );
    
    if ( num1 === undefined || num2 == undefined || operator === null ) {
        return false;
    }
    else {
        return true
    }
};

// makes a GET request to get the calculation history from the server to append to the DOM
function appendCalculationsToDom() {
    console.log( 'Appending history to DOM' );

    $.ajax({
        method: 'GET',
        url: '/history'
    })
    .then( function( result ) {
        // empties the list currently displayed on the DOM
        let history = $( '#calculationList');
        $( '#currentResult' ).empty()
        history.empty(); 
        console.log( 'Got result from server', result );
        // loops over the array received from the server and appends the appropriate information to the list on the DOM
        let currentResult = result[0].result;
        for ( let i = 0; i < result.length; i++ ) {
            history.append(`<li data-calculation="${ result[i] }">
                ${result[i].num1} ${result[i].operator} ${result[i].num2} = ${result[i].result}</li>`)
        }
        // empty the display and appends the current result to the display of the "calculator"
        $( '#display' ).empty();
        $( '#display' ).append( `<p style="text-align:center">${currentResult}</p>` );
    })
    
}