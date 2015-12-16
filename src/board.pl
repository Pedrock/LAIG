/* -*- Mode:Prolog; coding:UTF-8; -*- */
:- encoding(utf8).
:- use_module(library(lists)).

% Tabuleiro por defeito
defaultBoard([
        [0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,1,1,1,1,1,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0],
        [0,1,0,0,2,2,2,0,0,1,0],
        [0,1,0,2,0,0,0,2,0,1,0],
        [0,1,0,2,0,4,0,2,0,1,0],
        [0,1,0,2,0,0,0,2,0,1,0],
        [0,1,0,0,2,2,2,0,0,1,0],
        [0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,1,1,1,1,1,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0]
      ]).

% Tabuleiro fazio
emptyBoard([
        [0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,4,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0]
      ]).

% Verifica se uma casa é valida (X e Y entre 1 e 11)
validCell(X,Y) :- X > 1, X =< 11, Y > 1, Y =< 11.

% Posição inicial válida para o jogador da frota prateada
validInitialPosition(1,X,Y) :- 
        \+ validInitialPosition(2,X,Y).

% Posição inicial válida para o jogador da frota dourada
validInitialPosition(2,X,Y) :-
        X >= 4, X =< 8,
        Y >= 4, Y =< 8.

% Obter casa na posição (X,Y)
getCellAt(Board,X,Y,Cell) :-
        nth1(Y,Board,Line),
        nth1(X,Line,Cell).

% Alterar o Nesimo elemento de uma lista
setNth([_|T],1,Char,[Char|T]).
setNth([H|T],N,Char,[H|Result]) :- 
        N > 1,
        N1 is N-1,
        setNth(T,N1,Char,Result).

% Definir casa na posição (X,Y)
setCellAt([H|T],X,1,Char,[Line|T]) :- 
        setNth(H,X,Char,Line).
setCellAt([H|T],X,Y,Char,[H|Result]) :-
        Y > 1,
        Y1 is Y-1,
        setCellAt(T,X,Y1,Char,Result).

% Contar o número de ocorrências de uma determinada peça no tabuleiro
countPieces([],_,0).
countPieces([H|T],Piece,Count) :-
        countPieces(T,Piece,N1),
        countPiecesLine(H,Piece,N),
        Count is N1+N.

% Contar o número de ocorrências de uma determinada peça numa linha
countPiecesLine([],_,0).
countPiecesLine([Piece|T],Piece,Count) :-
  countPiecesLine(T, Piece,N1),
  Count is N1 + 1.
countPiecesLine([H|T],Piece,Count) :-
  H =\= Piece,
  countPiecesLine(T, Piece,Count).

% Nome de cada jogador
player(1,silver).
player(2,gold).

% Número de peças por jogador
player_pieces(1,20).
player_pieces(2,12).

% Caracteres de cada peça
pieceChar(0,' ').
pieceChar(1,'o').
pieceChar(2,'+').
pieceChar(4,'X').

% Custo de movimento de cada peça
moveCost(1,1).
moveCost(2,1).
moveCost(4,2).

% Custo de captura
captureCost(_,2).

% Casa vazia
emptyCell(0).

% Desenha o tabuleiro
drawBoard([H|T]) :- 
        write('    1   2   3   4   5   6   7   8   9  10  11'),nl,
        once(drawBoard([H|T],1)).

drawBoard([H|T],Y) :-
        drawLineDiv(Y),
        Y1 is Y + 1,
        format('~|~` t~d~2+', [Y]),
        drawLine(H),nl,
        drawBoard(T,Y1).
drawBoard([],Y) :- drawLineDiv(Y).

% Desenha os separadores de linhas do tabuleiro
drawLineDiv(1)  :- write('  ┌───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┐'),nl.
drawLineDiv(12) :- write('  └───┴───┴───┴───┴───┴───┴───┴───┴───┴───┴───┘'),nl.
drawLineDiv(_)  :- write('  ├───┼───┼───┼───┼───┼───┼───┼───┼───┼───┼───┤'),nl.

% Desenha linha do tabuleiro
drawLine([Cell|T]) :-
        write('│ '),
        pieceChar(Cell, Char),
        put_char(Char),
        put_char(' '),
        drawLine(T).
drawLine([]) :- put_char('│').
        