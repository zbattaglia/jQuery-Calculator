$( document ).ready( ready );

let operator = null;
let number = '';
let num1;
let num2;
let complete = false;

function ready() {
    console.log( 'jQuery Ready on the client.');

    // $( '#display' ).empty();
    appendCalculationsToDom();

    $( '#add-btn, #subtract-btn, #multiply-btn, #divide-btn' ).on( 'click', getOperator );
    $( '#equals-btn' ).on( 'click', calculate );
    $( '#clear-btn' ).on( 'click', clearInputs );
    $( '#reset-btn' ).on( 'click', clearHistory );
    $( '.number-in' ).on( 'click', updateDisplay );

};

function updateDisplay( event ) {
    event.preventDefault();
    if ( complete === true ) {
        $( '#display' ).empty();
        complete = false;
    }
    console.log( 'Getting number input', this.id );
    $( '#display' ).append( this.id );
    number += this.id;
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
};

function getOperator( event ) {
    event.preventDefault();
    operator = this.id;
    num1 = Number( number );
    number = '';
    console.log( 'Setting operator to:', $(this).data() );
    console.log( 'num1 is', num1);
    complete = false;
    $( '#display' ).append(` ${$(this).data().operator} `)
};

function calculate( event ) {
    event.preventDefault();

    num2 = Number( number );
    number = '';

    if ( validateInputs() ) {

        let equation = {
            num1,
            num2,
            operator
        };

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
    }
    else {
        alert( 'Please input all parts of the equation.' );
    }
    complete = true;
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
        if ( result != undefined ) {
            console.log( 'Got result from server', result );
            let currentResult = result[0].result;
            for ( let i = 0; i < result.length; i++ ) {
                history.append(`<li>${result[i].num1} ${result[i].operator} ${result[i].num2} = ${result[i].result}</li>`)
            }
            $( '#display' ).empty();
            $( '#display' ).append( `<p style="text-align:center">${currentResult}</p>` );
        }
    })
    
}