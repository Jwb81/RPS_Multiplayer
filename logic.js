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

var database = firebase.database();

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



$('#join-game').on('click', function () {
    var input = $('#game-key').val();

    if (!input) 
        return;

    // var gamesRef = database.ref();
    console.log(input);
    
    gamesRef.once('value', function (snap) {
        if (snap.hasChild(input)) {
            database.ref(input + '/users/user2').set(input);
            alert('the child exists');
        }
        else
            alert('DNE');
    })

});