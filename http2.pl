:- use_module(library(http/thread_httpd)).
:- use_module(library(http/http_dispatch)).
:- use_module(library(http/http_path)).
:- use_module(library(http/http_client)).
:- use_module(library(http/http_server_files)).

:- use_module(library(lists)).

:- consult('src/Breakthru.pl').

:- http_handler(root(game), prepReplyStringToJSON, []).						% Predicate to handle requests on server/game (for Prolog Game Logic)
:- http_handler(pub(.), serve_files_in_directory(pub), [prefix]).			% Serve files in /pub as requested (for WebGL Game Interface)
http:location(pub, root(pub), []).											% Location of /pub alias on server
user:file_search_path(document_root, '.').									% Absolute location of HTTP server document root
user:file_search_path(pub, document_root(pub)).								% location of /pub in relation to document root

server(Port) :- http_server(http_dispatch, [port(Port)]).		% Start server on port Port

%Receive Request as String via POST
prepReplyStringToJSON(Request) :-
		member(method(post), Request), !,						% if POST
        http_read_data(Request, Data, []),						% Retrieve POST Data
		format('Content-type: application/json~n~n'),			% Reply will be JSON
		processString(Data).								% Call processing predicate


prepReplyStringToJSON(_Request) :-								% Fallback for non-POST Requests
		format('Content-type: text/plain~n~n'),					% Start preparing reply - reply type
		write('Can only handle POST Requests'),					% Standard Reply
		format('~n').											% End Reply

formatAsJSON(Reply, Fields):-
		write('{'),												% Start JSON Object
		writeJSON(Fields, Reply).								% Format content as JSON

writeJSON([Prop], [Val]):-
	write('"'), write(Prop),
	write('":"'), write(Val), write('"}').						% Last element
writeJSON([Prop|PT], [Val|VT]):-
	write('"'), write(Prop),
	write('":"'), write(Val), write('", '),						% Separator for next element
	writeJSON(PT, VT).

processString([_Par=Val]):-
        term_string(List, Val),									% Convert Parameter String to Prolog List
		Term =.. List,											% Create Term from ListR
		Term.													% Call the Term

%---------------------------------------------

play(Board,Player,X,Y,DeltaX,DeltaY,N1) :-
	play(Board,Player,X,Y,DeltaX,DeltaY,N1,N2,NewBoard),
	formatAsJSON([N2,NewBoard,true],[newCounter,newBoard,valid]).

play(_,_,_,_,_,_,_) :-
	formatAsJSON([_,_,false],[newCounter,newBoard,valid]).
	
getValidMoves(Board,Player,Counter) :-
	getValidMoves(Board,Player,Counter,Moves),
	formatAsJSON([Moves],[moves]).


:- server(8081).
