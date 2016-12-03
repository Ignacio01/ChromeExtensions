var matchesPlayed = [];
var matchesPunctuated = [];
var matchesPlaying = [];
var firstExecution = true;
// In this function we are going to read the screen and anlyze to see if there are any changes.
// If there are changes with the scores send a notification.

function Game(home, out, result, end, punctuation){
	this.home = home;
	this.out = out;
	this.result = result;
	this.end = end;
	this.punctuation = punctuation;
}

$(function() {
    main()
    setInterval(main, 10000); // every 10 seconds
});

function createAlert(title,message){
	var myNotification = {
	    type: "basic",
	    title: title,
	    message: message,
	    contextMessage: "Comuniazo Notifier",
	    buttons:[{
	        title: "Open Link",
	    }],
	    iconUrl: "comuniazo.png"
	};
	chrome.notifications.create(myNotification);
}

function main(){

	$.get("http://www.comuniazo.com", function(data){
		
		var time;

		time= $(data).find(".box-jornada").eq(0).find(".gameweek").children().eq(1).text().replace("Jornada ",".partidos-");

		$data = $(data).find(time);

		$("body").append($data);

		for(i = 0; i < $data.find(".partido").length;i++){
			var home, out, result, end, punctuation;
			home = $data.find(".casa").eq(i).children().attr('class').split("-");
			out = $data.find(".fuera").eq(i).children().attr('class').split("-");

			if(home.length >2){
				home = home[1][0].toUpperCase() + home[1].slice(1) + " " + home[2][0].toUpperCase() + home[2].slice(1);
			}else{
				home = home[1][0].toUpperCase() + home[1].slice(1);
			}
			
			if(out.length>2){
				out = out[1][0].toUpperCase() + out[1].slice(1) + " " + out[2][0].toUpperCase() + out[2].slice(1);
			}else{
				out = out[1][0].toUpperCase() + out[1].slice(1);
			}
			

			if($data.eq(i).find(".bubble-puntos")){
				punctuation = true;
			}else{
				punctuation = false;
			}

			if($data.find(".fecha").eq(i).text()=== "Fin"){
				end = true;
			}else{
				end = false;
			}
			if($data.eq(i).find(".score")){
				result = $data.find(".score").eq(i).text();
			}


			thisGame = new Game(home, out, result, end, punctuation);

			if(end){
				if(matchesPlayed[i] == undefined && !firstExecution){
					//SEND ALERT
					createAlert("End Match","The match " + thisGame.home + "-" + thisGame.out +" has finished! \n" 
						+"Result: " + thisGame.result);
				}
				matchesPlayed[i] = thisGame;
			}

			if(punctuation){
				if(matchesPunctuated[i] == undefined && !firstExecution){
					//SEND ALERT
					createAlert("Punctiation Available","The points for the match " + thisGame.home + "-" + thisGame.out +" are on!");
				}
				matchesPunctuated[i] = thisGame;
			}

			if($data.eq(i).find(".score").text() != "" && !end && !firstExecution){
				if(matchesPlaying[i] == undefined){
					//SEND ALERT
					createAlert("Playing Match","The match " + thisGame.home + "-" + thisGame.out +" is On!");
				}
				if(matchesPlaying[i].result != thisGame.result){
					createAlert("Goal "+ thisGame.home + "-" + thisGame.out, "New result " + thisGame.result);
				}
				matchesPlaying[i] = thisGame;
			}

		}
		firstExecution = false;
	});

};