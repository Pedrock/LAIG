:- use_module(library(clpfd)).
:- expects_dialect(sicstus).
:- encoding(utf8).
:- consult('game-logic.pl').
:- consult('ai.pl').

%%%%%%%%%%%%%%%%%%%% 
	
validSecondMove(Board,Player,X,Y,DeltaX,DeltaY) :-
	validMove(Board,Player,X,Y,DeltaX,DeltaY,Cell),
	Cell == Player.

getValidMoves(Board, Player, 0, Moves) :-
	findall((X,Y,DeltaX,DeltaY),validPlay(Board,Player,X,Y,DeltaX,DeltaY),Moves).
getValidMoves(Board, Player, 1, Moves) :-
	findall((X,Y,DeltaX,DeltaY),validSecondMove(Board,Player,X,Y,DeltaX,DeltaY),Moves).
	
% play(Board,Player,X,Y,DeltaX,DeltaY,N1,N2,NewBoard)

computerPlay(Board,Player,1,X,Y,DeltaX,DeltaY,N1,N2,NewBoard) :-
	playRandomly(Board,Player,X,Y,DeltaX,DeltaY,N1,N2,NewBoard),
	\+ var(X).
computerPlay(Board,Player,2,X,Y,DeltaX,DeltaY,N1,N2,NewBoard) :-
	playAI(Board,Player,X,Y,DeltaX,DeltaY,N1,N2,NewBoard),
	\+ var(X).
	
