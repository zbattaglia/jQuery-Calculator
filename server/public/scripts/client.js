$( document ).ready( ready );

let operator = null;

function ready() {
    console.log( 'jQuery Ready on the client.');

    appendCalculationsToDom();

    $( '#add-btn, #subtract-btn, #multiply-btn, #divide-btn' ).on( 'click', getOperator );
    $( '#equals-btn' ).on( 'click', calculate );
    $( '#clear-btn' ).on( 'click', clearInputs );
    $( '#reset-btn' ).on( 'click', clearHistory );

};

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
    $( '.operator' ).removeClass( 'selected' );
    $( '#num1-in' ).val('');
    $( '#num2-in' ).val('');
};

function getOperator( event ) {
    event.preventDefault();
    $( '.operator' ).removeClass( 'selected' );
    operator = this.id;
    $(this).addClass( 'selected' );
    console.log( 'Setting operator to:', operator );
};

function calculate( event ) {
    event.preventDefault();

    if ( validateInputs() ) {
        let num1 = $( '#num1-in' ).val();
        let num2 = $( '#num2-in' ).val();

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
};

function validateInputs() {
    console.log( 'Validating inputs' );
    
    if ( $( '#num1-in' ).val() === '' || $( '#num2-in' ).val() == '' || operator === null ) {
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
            for ( let i = result.length-1; i > 0; i-- ) {
                history.append(`<li>${result[i].num1} ${result[i].operator} ${result[i].num2} = ${result[i].result}</li>`)
            }
            $( '#currentResult' ).append( `<h2> ${currentResult} </h2>` );
        }
    })
    
}