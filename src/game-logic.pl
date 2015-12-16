:- use_module(library(lists)).
:- consult('board.pl').

% Predicado para obter o proximo jogador
nextPlayer(1,2).
nextPlayer(2,1).

% Predicado para verificar se uma peça é válida e de determinado jogador
validPiece(Board,Player,X,Y,Piece) :-
        getCellAt(Board,X,Y,Piece),
        \+ emptyCell(Piece),
        Piece mod 2 =:= Player mod 2.

% Predicado para obter os 4 pontos de captura para uma peça (4 casas diagonais adjacentes)
getCapturePoint(X,Y,Xc,Yc,1,1) :- Xc is X+1, Yc is Y+1.
getCapturePoint(X,Y,Xc,Yc,-1,1) :- Xc is X-1, Yc is Y+1.
getCapturePoint(X,Y,Xc,Yc,1,-1) :- Xc is X+1, Yc is Y-1.
getCapturePoint(X,Y,Xc,Yc,-1,-1) :- Xc is X-1, Yc is Y-1.

% Predicado para verificar se uma captura é valida
validCapture(Board,Player,X,Y,DeltaX,DeltaY,Cell) :-
        getCellAt(Board,X,Y,Cell),
        \+ emptyCell(Cell),
        Cell mod 2 =:= Player mod 2,
        getCapturePoint(X,Y,X2,Y2,DeltaX,DeltaY),
        getCellAt(Board,X2,Y2,Cell2),
        \+ emptyCell(Cell2),
        Cell2 mod 2 =\= Player mod 2.

% Predicados para verificar se um movimento é válido
validMove(Board,Player,X,Y,DeltaX,DeltaY,Cell) :-
        getCellAt(Board,X,Y,Cell),
        \+ emptyCell(Cell),
        Cell mod 2 =:= Player mod 2,
        emptyLineBetween(Board,X,DeltaX,Y),
        DeltaX =\= 0, DeltaY = 0.
validMove(Board,Player,X,Y,DeltaX,DeltaY,Cell) :-
        getCellAt(Board,X,Y,Cell),
        \+ emptyCell(Cell),
        Cell mod 2 =:= Player mod 2,
        emptyColumnBetween(Board,X,Y,DeltaY),
        DeltaY =\= 0, DeltaX = 0.

% Predicado para verificar se uma jogada é válida
validPlay(Board,Player,X,Y,DeltaX,DeltaY) :- validCapture(Board,Player,X,Y,DeltaX,DeltaY,_).
validPlay(Board,Player,X,Y,DeltaX,DeltaY) :- validMove(Board,Player,X,Y,DeltaX,DeltaY,_).

% Verifica se o jogador da frota prateada ganhou
silverWins([Line|_]) :-
        member(4,Line), !, fail.
silverWins([Line|T]) :- 
        \+ member(4,Line), 
        silverWins(T).
silverWins([]).

% Verifica se o jogador da dourada prateada ganhou
goldWins(Board) :- goldWins(Board,1).
goldWins([H|_],Y) :-
        \+ (Y =\= 1, Y =\= 11),
        member(4,H).
goldWins([H|_],Y) :-
        Y > 1, Y < 11,
        nth1(X,H,4),
        \+ (X =\= 1, X =\= 11).
goldWins([_|T],Y) :-
        Y1 is Y+1,
        goldWins(T,Y1).

% Realização de uma jogada
play(Board,Player,X,Y,DeltaX,DeltaY,N1,N2,NewBoard) :-
      validCapture(Board,Player,X,Y,DeltaX,DeltaY,Piece),
      captureCost(Piece,Cost),
      N2 is N1 + Cost,
      N2 =< 2,
      X2 is X+DeltaX,
      Y2 is Y+DeltaY,
      emptyCell(Empty),
      setCellAt(Board,X,Y,Empty,Board1),
      setCellAt(Board1,X2,Y2,Piece,NewBoard).
play(Board,Player,X,Y,DeltaX,DeltaY,N1,N2,NewBoard) :-
      validMove(Board,Player,X,Y,DeltaX,DeltaY,Piece),
      moveCost(Piece,Cost),
      N2 is N1 + Cost,
      N2 =< 2,
      X2 is X+DeltaX,
      Y2 is Y+DeltaY,
      emptyCell(Empty),
      setCellAt(Board,X,Y,Empty,Board1),
      setCellAt(Board1,X2,Y2,Piece,NewBoard).

% Verifica se uma lista só tem zeros
zeros([]).
zeros([0|T]) :- zeros(T).

sublist(Whole, Part, Before, Length, After) :-
	Length #> 0,
	string_to_list(String, Whole),
	sub_string(String, Before, Length, After, SubString),
	string_to_list(SubString, Part).

% Verifica se uma linha não têm nenhuma peça entre X e X+DeltaX para determinado Y
emptyLineBetween(Board,X,DeltaX,Y) :-
        nth1(Y,Board,Line),
        emptyLineBetween(Line,X,DeltaX).
emptyLineBetween(Line,X,DeltaX) :-
        sublist(Line,Part,X,DeltaX,_),
        DeltaX > 0,
        maplist(=(0), Part).
emptyLineBetween(Line,X,DeltaX) :-
        length(Line,Length),
        reverse(Line,Line2),
        X1 is Length - X + 1,
        sublist(Line2,Part,X1,DeltaXn,_),
        DeltaXn > 0,
        maplist(=(0), Part),
        DeltaX is -DeltaXn.

% Verifica se uma coluna não têm nenhuma peça entre Y e Y+DeltaY para determinado X
emptyColumnBetween(Board,X,Y,DeltaY) :-
        transpose(Board,Transposed),
        emptyLineBetween(Transposed,Y,DeltaY,X).
