// Initialize Firebase
var config = {
    apiKey: "AIzaSyBnc7aQ2z7KgsSLz_MzNE9ZbtnPJAedNDw",
    authDomain: "rps-2114.firebaseapp.com",
    databaseURL: "https://rps-2114.firebaseio.com",
    projectId: "rps-2114",
    storageBucket: "rps-2114.appspot.com",
    messagingSenderId: "880826161567"
};
firebase.initializeApp(config);

// contains the firebase database
var database = firebase.database();

// contains the game object reference string
var currentGame;

// contains each player's randomly generated key
var me;
var opponent;

// hold the username of the user
var username;

// hold guesses
var me_guess;
var opponent_guess;

// hold record
var record = {
    wins: 0,
    ties: 0,
    losses: 0
}

var images = {
    r: 'assets/images/rock.jpg',
    p: 'assets/images/paper.jpg',
    s: 'assets/images/scissors.jpg'
}

// holds all of the games so users can connect to it via the game key
var gamesRef = database.ref();

// '.info/connected' is a special location provided by Firebase that is updated
// every time the client's connection state changes.
// '.info/connected' is a boolean value, true if the client is connected and false if they are not.
var connectedRef = database.ref(".info/connected");

// When the client's connection state changes...
// connectedRef.on("value", function (snap) {

//     // If they are connected..
//     if (snap.val()) {

//         // Add user to the connections list.
//         var con = connectionsRef.push(true);
//         // Remove user from the connection list when they disconnect.
//         con.onDisconnect().remove();
//     }
// });

// When first loaded or when the connections list changes...
// connectionsRef.on("value", function (snap) {

//     // Display the viewer count in the html.
//     // The number of online users is the number of children in the connections list.
//     $("#connected-viewers").text(snap.numChildren());
// });

// --------------------------------------------------------------
// At the page load and subsequent value changes, get a snapshot of the local data.
// This function allows you to update your page in real-time when the values within the firebase node bidderData changes
// database.ref("/bidderData").on("value", function (snapshot) {

//     // If Firebase has a highPrice and highBidder stored (first case)
//     if (snapshot.child("highBidder").exists() && snapshot.child("highPrice").exists()) {


//     }

//     // Else Firebase doesn't have a highPrice/highBidder, so use the initial local values.
//     else {

//     }

//     // If any errors are experienced, log them to console.
// }, function (errorObject) {
//     console.log("The read failed: " + errorObject.code);
// });

// database.ref().on('value', function (snap) {
//     console.log(snap.val());
// })

var setGameListener = function () {
    database.ref(currentGame).on('value', function (snap) {
        let info = snap.val();
        // console.log(info);

        // get the opponents reference ID
        if (!opponent) {
            if (info.creator != me && info.joiner == me) {
                opponent = info.creator;
                setOpponentListener(); // create new listeners with the new opponent variable
                $('#game-board').show();
                $('#message').text('You are now connected.  Please select your choice below');
            } else if (info.creator == me && info.joiner != me && info.joiner != undefined) {
                opponent = info.joiner;
                setOpponentListener(); // create new listeners with the new opponent variable
                $('#game-board').show();
                $('#message').text('You are now connected.  Please select your choice below');
            }
        }

        // check if the game is ready to start
        if (info.gameStarted) {

            // get the opponent's guess if it is available

        }
    })

    // get the last message and append it to the chat
    database.ref(currentGame + '/chat').orderByChild('timeAdded').limitToLast(1).on('child_added', function(snap) {
        var info = snap.val();
        console.log(info);

        var color;
        if (info.username == username) 
            color = 'blue;';
        else
            color = 'red';

        $('#messages').append(
            '<p class="chat-message"> <span class="" style="color:' + color + '">'  + info.username + ': </span>' + info.message + '</p>'
        )
    })
}

var setMeListener = function () {
    database.ref(currentGame + '/' + me).on('value', function (snap) {
        // console.log(currentGame + '/' + me);
        // console.log(snap.val());
    })
}

var setOpponentListener = function () {
    database.ref(currentGame + '/' + opponent).on('value', function (snap) {
        // console.log(currentGame + '/' + opponent);
        // console.log(snap.val());

        // get the guess if it is available (it gets reset after each guess)
        if (snap.val().guess != "") {
            opponent_guess = snap.val().guess;
            // var numLosses = snap.val().losses;
            // var numTies = snap.val().ties;
            // var numWins = snap.val().wins;

            if (me_guess)
                determineWinner();

        }
document.get
    })
}

var getRecord = function() {
    database.ref(currentGame + '/' + me).once('value', function(snap) {
        var info = snap.val();
        record.wins = info.wins;
        record.ties = info.ties;
        record.losses = info.losses;
    })
}

var updateResults = function() {
    $('#wins').text(record.wins);
    $('#ties').text(record.ties);
    $('#losses').text(record.losses);
}

var determineWinner = function() {
    var update = {
        guess: "",
    }

    $('#opponent-guess-img').html(
        '<img class="move-selected" src=' + images[opponent_guess] + '>'
    );

    if (opponent_guess == me_guess) {
        // it's a tie

        record.ties++;
        update.ties = record.ties;
    }

    if ((opponent_guess == 'r' && me_guess == 's') ||
        (opponent_guess == 'p' && me_guess == 'r') ||
        (opponent_guess == 's' && me_guess == 'p')) {
        // opponent wins

        record.losses++;
        update.losses = record.losses;
    }

    if ((opponent_guess == 'r' && me_guess == 'p') ||
        (opponent_guess == 's' && me_guess == 'r') ||
        (opponent_guess == 'p' && me_guess == 's')) {
        // I win

        record.wins++;
        update.wins = record.wins;
    }

    // send the new update to the database
    database.ref(currentGame + '/' + me).update(update);
    me_guess = null;
    opponent_guess = null;

    updateResults();
}

var setErrors = function() {
    $('#game-key').addClass('input-error');
    $('#username').addClass('input-error');
}

var clearErrors = function() {
    $('#game-key').removeClass('input-error');
    $('#username').removeClass('input-error');
}


// click handler for 'add-message' (when a user submits a new chat repsonse)
$('#add-message').on('click', function(evt) {
    evt.preventDefault();

    let response = $('#new-message').val(); 
    $('#new-message').val(''); 

    database.ref(currentGame + '/chat').push({
        username: username,
        message: response,
        timeAdded: firebase.database.ServerValue.TIMESTAMP
    })
})

$('.guess-buttons').on('click', '.btn-guess', function() {
    me_guess = $(this).data('name')[0].toLowerCase();

    clearErrors();

    if (!currentGame) {
        setErrors();
        return;
    }

    database.ref(currentGame + '/' + me).update({
        guess: me_guess
    })

    // clear the borders from any previously selected one
    $('.btn-guess').removeClass('guess-selected');

    // set the border on the selected guess
    $(this).addClass('guess-selected');

    $('#opponent-guess-img').text('Waiting for opponent...')
    $('#my-guess-img').html(
        '<img class="move-selected" src=' + images[me_guess] + '>'
    )
    // disable inputs until the opponent has responded

    // check if the opponent has guessed yet
    if (me_guess && opponent_guess)
        determineWinner();
})


$('#join-game').on('click', function () {
    var input = $('#game-key').val();
    username = $('#username').val();

    clearErrors();

    if (!input || !username) {
        setErrors();
        return;
    }

    // var gamesRef = database.ref();
    // console.log(input);

    var playerObj = {
        guess: "",
        losses: 0,
        ties: 0,
        wins: 0
    }

    gamesRef.once('value', function (snap) {
        var info = snap.val();


        if (snap.hasChild(input)) {
            // console.log(snap.val()[input].creator);

            if (info[input].joiner != undefined && info[input].joiner != "") {
                console.log("There are already two players... You cannot join");
                return;
            }

            database.ref(input)
                .push(playerObj)
                .then((snapshot) => {
                    var key = snapshot.key;
                    database.ref(input + '/joiner').set(key);
                    me = key;

                    opponent = info[input].creator;
                    currentGame = input;

                    // set the gameStart to true
                    database.ref(input).update({
                        gameStarted: true
                    })

                    setMeListener();
                    setOpponentListener();
                    setGameListener();
                    $('#game-board').show();

                    $('#message').text('You are now connected.  Please select your choice below');
                })
            // database.ref(input + '/player2').set(input);

            // alert('the child exists');
        } else
            alert('DNE');


    })


});

$('#create-game').on('click', function () {
    var input = $('#game-key').val();
    username = $('#username').val();
    
    clearErrors();

    if (!input || !username) {
        setErrors();
        return;
    }

    gamesRef.once('value', function (snap) {
        if (snap.hasChild(input)) {
            alert('Game id already exists');
        } else {
            // create new game and add all variables here
            // database.ref(input + '/users/user2').set(input);
            // alert('DNE: creating new game');
            var gameObj = {
                messages: [],
                creator: null,
                joiner: null,
                gameStarted: false
            }

            var playerObj = {
                guess: "",
                losses: 0,
                ties: 0,
                wins: 0
            }

            database.ref(input).set(gameObj);
            database.ref(input)
                .push(playerObj)
                .then((snap) => {
                    var key = snap.key;
                    database.ref(input + '/creator').set(key);
                    me = key;
                    currentGame = input;
                    setMeListener();
                    setGameListener();
                })

        }

    })

})