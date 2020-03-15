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

function updateDisplay( event ) {
    event.preventDefault();
    console.log( 'Updating display with:', $(this).text() );
    
    if ( complete === true ) {
        $( '#display' ).empty();
        complete = false;
    }
    if ( this.id === 'decimal-btn' ) {
        $( '#decimal-btn' ).prop( 'disabled', true )
    }
    $( '#display' ).append( $(this).text() );
}

function clearHistory( event ) {
    event.preventDefault();
    console.log( 'Resetting History' );
    
    clearInputs( event );

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

function clearInputs( event ) {
    event.preventDefault();
    console.log( 'Clearing inputs' );
    operator = null;
    num1 = '';
    num2 = '';
    $( '#display' ).empty();
    $( '#decimal-btn' ).prop( 'disabled', false );
    $( '#add-btn, #subtract-btn, #multiply-btn, #divide-btn' ).prop( 'disabled', false );
};

function getOperator( event ) {
    event.preventDefault();
    operator = $(this).text();
    console.log( 'Setting operator to:', $(this).text() );
    complete = false;
    $( '#display' ).append(` ${$(this).data().operator} `)
    $( '#decimal-btn' ).prop( 'disabled', false );
    $( '#add-btn, #subtract-btn, #multiply-btn, #divide-btn' ).prop( 'disabled', true );
};

function calculate( event ) {
    event.preventDefault();

    let numbers = $( '#display' ).text().trim().split( / \+ | \- | \/ | \* /);
    console.log( 'The numbers are', Number( numbers[0] ), Number( numbers[1] ) );
    
    num1 = numbers[0];
    num2 = numbers[1];

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

    appendCalculationsToDom();

    operator = null;

    complete = true;
    $( '#decimal-btn' ).prop( 'disabled', false );
    $( '#add-btn, #subtract-btn, #multiply-btn, #divide-btn' ).prop( 'disabled', false );
};

function validateInputs() {
    console.log( 'Validating inputs' );
    
    if ( num1 === '' || num2 == '' || operator === null ) {
        return false;
    }
    else {
        return true
    }
};

function appendCalculationsToDom() {
    console.log( 'Appending history to DOM' );

    $.ajax({
        method: 'GET',
        url: '/history'
    })
    .then( function( result ) {
        let history = $( '#calculationList');
        $( '#currentResult' ).empty()
        history.empty(); 
        console.log( 'Got result from server', result );
        let currentResult = result[0].result;
        for ( let i = 0; i < result.length; i++ ) {
            history.append(`<li data-calculation="${ result[i] }">
                ${result[i].num1} ${result[i].operator} ${result[i].num2} = ${result[i].result}</li>`)
        }
        $( '#display' ).empty();
        $( '#display' ).append( `<p style="text-align:center">${currentResult}</p>` );
    })
    
}