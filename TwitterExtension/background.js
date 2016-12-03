var messages = [];
var ids = [];
var latestID;

$(function() {
    main()
    setInterval(main, 10000); // every 10 seconds
});

function main(){
	$.get("https://twitter.com/i/notifications", function(data){

		// Cleaning the data to only keep the tweets information.
		$data = $(data).find('#stream-items-id').eq(0);
		$data.find('.activity-truncated-tweet').remove();
		$data.find('.activity-suplement').remove();

		$("body").append($data);

		for(i = 0; i < $data.find('li.stream-item').length;i++){
			ids[i] = $data.find('li.stream-item').eq(i).attr('data-item-id');
			messages[i] = $($data).find('li.stream-item').eq(i).find('div.stream-item-activity-line').text().replace(/\n/g, '').trim();
		}

		console.log(ids);
		console.log(messages);

		var newNotifications = [];

		// if the lastID is the same as the last id in the array, there are no new notifications.
		if(latestID == ids[0]){

		}else if(latestID === undefined){
			latestID = ids[0];
			// first run browser session
			// creating a diccionary is passed to the function of the chrome notifications
		    var firstRun = {
		        type: "basic",
		        title: "Twitter Notifier",
		        message: "Check your Twitter account for new Notifications",
		        iconUrl: "icon.png"
		    };

		    chrome.notifications.create(firstRun); //create google chrome notification object out of this dictionary    latestID = ids[0];
		
		}else if(latestID != ids[0]){ // if the there is a new notification
			for(j = 0; j < ids.length; j++){// We are going to verify the id is not in the ids array.
                if (latestID == ids[j]) {// End of the new notifications.
                    break;
                } else {// if it is a new notification.
                    if(messages[j] != "") {
                    	//we add the message to the array of the new notification
                        newNotifications.push(messages[j]);
                        // twitter combines different messages 
                        if ((messages[j+1] !== undefined) && (latestID !== messages[j+1])) {
                            break; 
                        }
                    }
                }
            }
            latestID = ids[0];
		}

		if (newNotifications.length == 0) {
            // nothing
        } else {
            for(i = 0; i < newNotifications.length; i++) {
	            var myNotification = {
				    type: "basic",
				    title: "New Twitter Notification - Twitter Notifier",
				    message: newNotifications[i],
				    contextMessage: "Twitter Notifier",
				    buttons:[{
				        title: "Open Link",
				    }],
				    iconUrl: "icon.png"
				};
				chrome.notifications.onButtonClicked.addListener(function() { // fired when button "Open Link"is clicked
				    window.open('https://twitter.com/i/notifications');
				});
				chrome.notifications.create(myNotification)
            }
        }

	})
	console.log(latestID);
};








