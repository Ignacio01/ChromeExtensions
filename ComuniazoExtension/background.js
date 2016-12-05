var matchesPlayed = [];
var matchesPunctuated = [];
var matchesPlaying = [];
var firstExecution = true, finished = false, punctuated = false;
// In this function we are going to read the screen and anlyze to see if there are any changes.
// If there are changes with the scores send a notification.

//Class that defines a game.
function Game(home, out, result, end, punctuation, url){
	this.home = home;
	this.out = out;
	this.result = result;
	this.end = end;
	this.punctuation = punctuation;
	this.url = url;
}

//Creates a timer that calls the main function every 10 seconds.
$(function() {
    main()
    setInterval(main, 10000); // every 10 seconds
});

//Creates the pop up message to the user, it receives the title and the message as parameters.
// The url will change depending on the pop up. If it is a goal, the page will we directed to the game, if is 
//General punctuation, it will be sent to the main page.
function createAlert(title,message, url){
	if(title == "Punctuation Available"){
		var myNotification = {
		    type: "basic",
		    title: title,
		    message: message,
		    contextMessage: "Comuniazo Notifier",
		    buttons:[{
		        title: "Check Punctuation",
		    }],
		    iconUrl: "comuniazo.png"
		};
		chrome.notifications.onButtonClicked.addListener(function() { // fired when button "Open Link"is clicked
		    window.open(url);
		});
	}else{
		var myNotification = {
		    type: "basic",
		    title: title,
		    message: message,
		    contextMessage: "Comuniazo Notifier",
		    iconUrl: "comuniazo.png"
		};
	}
	chrome.notifications.create(myNotification);
	
}


function main(){

	// Get from the comuniazo webpage the html code.
	$.get("http://www.comuniazo.com", function(data){
		
		var time;

		// time will allow us to obtain the journey it is being playe
		time= $(data).find(".box-jornada").eq(0).find(".gameweek").children().eq(1).text().replace("Jornada ",".partidos-");

		// The time variable, allows us to obtain the information of a div.
		$data = $(data).find(time);

		// We add the important information from the div with the information of the matches.
		$("body").append($data);

		//For every match is being played.
		for(i = 0; i < $data.find(".partido").length;i++){
			//Declaration variables for every match.
			var home, out, result, end, punctuation, url;

			// Name Team that plays at home
			home = $data.find(".casa").eq(i).children().attr('class').split("-");
			// Name Team that plays outside
			out = $data.find(".fuera").eq(i).children().attr('class').split("-");

			//Names can be composed by two words, if there are two words add them together.
			if(home.length >2){
				home = home[1][0].toUpperCase() + home[1].slice(1) + " " + home[2][0].toUpperCase() + home[2].slice(1);
			}else{
				home = home[1][0].toUpperCase() + home[1].slice(1);
			}
			
			//Same with the teams that play ouside.
			if(out.length>2){
				out = out[1][0].toUpperCase() + out[1].slice(1) + " " + out[2][0].toUpperCase() + out[2].slice(1);
			}else{
				out = out[1][0].toUpperCase() + out[1].slice(1);
			}

			//Find if the match has finished
			if($data.find(".fecha").eq(i).text()=== "Fin"){
				end = true;
				finished = true;
			}else{
				end = false;
			}

			url = $data.find(".partido-otro").eq(i).attr("href");

			//Find if the punctuation of the players is on
			if($data.find(".bubble-puntos").eq(i).length>0){
				punctuation = true;
				punctuated = true;
			}else{
				punctuation = false;
			}

			//Result of the match.
			if($data.eq(i).find(".score")){
				result = $data.find(".score").eq(i).text();
			}

			//Instanciate a game with the values obtained
			thisGame = new Game(home, out, result, end, punctuation, url);

			//If the match has finished.
			if(end){
				//If the match has finished and it is not in the array matchesPlayed, and it is not the first time
				// you open the web browser
				if(matchesPlayed[i] == undefined && !firstExecution){
					createAlert("End Match","The match " + thisGame.home + "-" + thisGame.out +" has finished! \n" 
						+"Result: " + thisGame.result,url);
				}
				//Add the game to the array matches that have finished
				matchesPlayed[i] = thisGame;
			}

			//If the punctuation of the match is on
			if(punctuation){
				//If the match wasn't punctuated and it is not the first time opening the web browser
				if(matchesPunctuated[i] == undefined && !firstExecution){
					//SEND ALERT
					createAlert("Punctuation Available","The points for the match "
						+thisGame.home + " - " + thisGame.out + ", are available.",url);
				}
				//Add the punctuated game to the array with punctuated games.
				matchesPunctuated[i] = thisGame;
			}

			// Validate the game is now playing, the match doesn't have to have ended
			// And also the results are posted.
			if($data.find(".score").eq(i).text().trim() != "" && !thisGame.end){
				//If it is the first execution, let the user know there is a game going on.
				/*if(firstExecution){
					createAlert(thisGame.home + "-" + thisGame.out + " is ON!" , "");
				}*/
				//create a variable game that contains if the match was already playing
				var game = matchesPlaying[i];
				// If there is a value in game.
				if(game != null){
					//If the results change in comparison with the value stored in the array
					//it means a team scored a goal.
					console.log(game.result == thisGame.result);
					if(game.result != thisGame.result && thisGame.result != " " && !firstExecution){
						//WHEN GOAL PASS LINK OF THE PAGE SO THEY CAN OPEN THE PAGE.
						createAlert("Goal!! ", "New Result: " +thisGame.home + "-" + thisGame.out + "\n" + thisGame.result,url);
					}
				}else{
					//If the game is not in the array, then indicate the game just began
					createAlert(thisGame.home + "-" + thisGame.out,"The match is ON!",url);
				}
				//Add to the array matches that are playing now.
				matchesPlaying[i] = thisGame;
			}

		}

		//This messages will appear when the browser will open to let the user know there are punctuations available.
		if(firstExecution && finished){
			createAlert("Finished Games", "There are games that already finished!", "http://www.comuniazo.com");
		}
		if(firstExecution && punctuated){
			createAlert("Punctuation Available", "New punctuations posted", "http://www.comuniazo.com");
		}
		firstExecution = false;
	});

};