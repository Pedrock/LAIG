function postGameRequest(requestObject, onSuccess, onError)
{
	var request = new XMLHttpRequest();
	request.open('POST', '../../game', true);

	request.onload = onSuccess || function(data){console.log("Request successful. Reply: " + data.target.response);};
	request.onerror = onError || function(){console.log("Error waiting for response");};

	request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
	
	request.send("requestString="+encodeURIComponent(JSON.stringify(requestObject).replace(/"/g, '')));			
}

function Game() {};

Game.play = function(board,player,x,y,deltax,deltay,counter, handler)
{	
	var request = (["play",board,player,x,y,deltax,deltay,counter]);
	postGameRequest(request,
		function handleReply(data){ // Handle reply
			response=JSON.parse(data.target.response);
			if (JSON.parse(response.valid))
			{
				for (var i in response)
				{
					response[i] = JSON.parse(response[i]);
				}
			}
			else response = false;
			handler(response);
		});
}

Game.getValidMoves = function(board,player,playCounter,handler)
{
	var request = (["getValidMoves",board,player,playCounter]);
	postGameRequest(request,
		function handleReply(data){ // Handle reply
			response=JSON.parse(data.target.response.replace(/\(/g,'[').replace(/\)/g,']'));
			for (var i in response)
			{
				response[i] = JSON.parse(response[i]);
			}
			var validMoves = {};
			for (var i in response.moves)
			{
				var move = response.moves[i];
				var coords = [move[0]-1,move[1]-1];
				if (!validMoves[coords])
					validMoves[coords] = {};
				validMoves[coords][[coords[0]+move[2],coords[1]+move[3]]] = true;
			}
			handler(validMoves);
		});
}