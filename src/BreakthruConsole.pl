:- use_module(library(clpfd)).
:- expects_dialect(sicstus).
:- encoding(utf8).
:- consult('game-logic.pl').
:- consult('ai.pl').

% Ler string do utilizador
readString(String) :-
    get_code(Ch),
    readAll(Ch, Codes),
    !,
    atom_codes(String, Codes).

% Ler número do utilizador
readInteger(Numero) :-
    readString(String),
    atom_chars(String, Chars), 
    catch(number_chars(Numero, Chars),_,fail).

% Predicado para ler os caracteres passados pelo utilizador até encontrar um newline
readAll(13, []).
readAll(10, []).
readAll(Ch, [Ch|Mais]) :-
    get_code(NewCh),
    readAll(NewCh, Mais).

% Devolve os predicados de jogo para cada opção de jogo possível
processStartOption(1,gameRoundPlayer,gameRoundPlayer).
processStartOption(2,gameRoundPlayer,gameRoundAI).
processStartOption(3,gameRoundAI,gameRoundPlayer).
processStartOption(4,gameRoundAI,gameRoundAI).

% Predicado principal
start :-
        repeat,
                write('Select an option:'),nl,
                write('1. Player vs Player'), nl,
                write('2. Player vs gold bot'), nl,
                write('3. Player vs silver bot'), nl,
                write('4. Bot vs bot'), nl,
                readInteger(Option),
                Option >= 1, Option =< 4,
        !,
        processStartOption(Option,Function1,Function2),
        select_difficulty(1,Function1),
        select_difficulty(2,Function2),
        askBoard(Board),
        select_first_player(Player),
        start(Board,Player,Function1,Function2).

% Pergunta que tabuleiro usar
askBoard(Board) :-
        askUseDefaultBoard, !,
        defaultBoard(Board).
askBoard(Board) :- 
        askFirstToFillBoard(PlayerNumber),
        emptyBoard(EmptyBoard),
        place_pieces(EmptyBoard,PlayerNumber,1,Board2),
        nextPlayer(PlayerNumber,NextPlayer),
        place_pieces(Board2,NextPlayer,1,Board).

% Pergunta se é para usar o tabuleiro por defeito
askUseDefaultBoard :-
        repeat,
           write('Do you want to use the default board (y/n)? '),
           readString(Answer),
           \+ (Answer \== 'n', Answer \== 'y'),
        !,
        Answer == 'y'.       

% Pergunta quem é o primeiro a colocar as peças no tabuleiro (caso tenha sido escolhida a opção para definir uma tabuleiro personalizado)
askFirstToFillBoard(PlayerNumber) :-
        repeat,
           write('Which player starts filling the board, gold or silver? : '),
           readString(Player),
           player(PlayerNumber,Player),
        !.

% Pergunta onde colocar cada peça
place_pieces(Board,Player,NumPiece,NewBoard):-
        player(Player,Name),
        player_pieces(Player,NumPieces),
        NumPiece =< NumPieces,
        once(drawBoard(Board)),
        write('Choose the position of the '), write(Name), write(' piece '),write(NumPiece), write('/'), write(NumPieces), nl,
        write('X: '),readInteger(X),
        write('Y: '),readInteger(Y),
        integer(X), integer(Y),
        validInitialPosition(Player,X,Y),
        getCellAt(Board,X,Y,Piece),
        emptyCell(Piece),
        setCellAt(Board,X,Y,Player,Board2),
        NumPiece1 is NumPiece +1,
        !,
        place_pieces(Board2,Player,NumPiece1,NewBoard).
place_pieces(Board,Player,NumPiece,NewBoard) :- 
        player_pieces(Player,NumPieces), 
        NumPiece =< NumPieces, 
        write('Invalid choice'), nl, 
        place_pieces(Board,Player,NumPiece,NewBoard).
place_pieces(Board,Player,NumPiece,Board) :-
        player_pieces(Player,NumPieces), 
        NumPiece > NumPieces.

% Pergunta quem é o primeiro a jogar
select_first_player(PlayerNumber) :-
        repeat,
           write('Who plays first, gold or silver? : '),
           readString(Player),
           player(PlayerNumber,Player),
        !.

% Pergunta dificuldade
select_difficulty(Player,Function) :-
        Function == gameRoundAI,
        repeat,
                player(Player,Name),
                write('Select '), write(Name), write(' difficulty:'),nl,
                write('1. Random'),nl,
                write('2. Greedy'), nl,
                readInteger(Difficulty),
                \+ (Difficulty =\= 1, Difficulty =\= 2),
        !,
        retractall(level(Player,_)),
        assert(level(Player,Difficulty)).
select_difficulty(_,_).

% Predicado que chama o predicado de jogo e que garante que devolve sempre "yes"
start(Board, Player, Funtion1, Function2) :- 
        game(Board, Player, Funtion1, Function2).
start(_,_,_,_).

% Predicado de jogo que chama o predicado adequado para cada ronda
game(Board, Player, Function1, Function2) :-
        player(Player,Name),
        nl,nl, write('Current Player: '),write(Name),nl,
        !,
        gameRound(Board,Player,NewBoard, Function1, Function2),
        nextPlayer(Player,NextPlayer),
        !,
        game(NewBoard, NextPlayer, Function1, Function2).
gameRound(Board,Player,NewBoard, Function1, _) :-
        Player == 1,
        once(call(Function1,Board,Player,NewBoard)),
        drawBoard(NewBoard),
        testEnd(NewBoard).
gameRound(Board,Player,NewBoard,_, Function2) :-
        Player == 2,
        once(call(Function2,Board,Player,NewBoard)),
        drawBoard(NewBoard),
        testEnd(NewBoard).

% Pergunta ao utilizador que peça mover
askPieceToMove(Board,Player,X,Y) :-
        once(drawBoard(Board)),
        write('Choose a piece to move'),nl,
        write('X: '),readInteger(X),
        write('Y: '),readInteger(Y),
        integer(X), integer(Y),
        validPiece(Board,Player,X,Y,_).
askPieceToMove(Board,Player,X,Y) :- write('Invalid piece'), nl, askPieceToMove(Board,Player,X,Y).

% Pergunta ao utilizador o movimento a fazer para a peça escolhida
askDelta(DeltaX,DeltaY) :-
        write('Choose piece movement'),nl,
        write('Delta X: '),readInteger(DeltaX),
        write('Delta Y: '),readInteger(DeltaY),
        integer(DeltaX), integer(DeltaY).
askDelta(DeltaX,DeltaY) :- write('Invalid delta'), nl, askDelta(DeltaX,DeltaY).

% Pergunta ao utilizador se quer fazer nova jogada
askAnotherMove :- 
        repeat,
           write('Do you want to make another move (y/n)? '),
           readString(Answer),
           \+ (Answer \== 'n', Answer \== 'y'),
        !,
        Answer == 'y'.

% Verifica se algum dos jogadores ganhou, devolvendo fail caso se verifique de modo a terminar o ciclo de jogo
testEnd(Board) :-
        goldWins(Board), !,
        drawBoard(Board), nl,
        write('Gold player wins!'), nl, 
        fail.
testEnd(Board) :-
        silverWins(Board), !,
        drawBoard(Board), nl,
        write('Silver player wins!'), nl,
        fail.
testEnd(_).

% Predicado para fazer uma jogada e mostrar uma mensagem se não for possível fazer a mesma
makePlay(Board,Player,X,Y,DeltaX,DeltaY,N1,N2,NewBoard) :-
        play(Board,Player,X,Y,DeltaX,DeltaY,N1,N2,NewBoard).
makePlay(_,_,_,_,_,_,1,_,_) :- write('You can not make this move as a second move.'), nl, fail.

% Pergunta que jogada fazer e de seguida tenta fazer a mesma
askAndMakeMove(Board,Player,NewBoard,N1,N2) :-
        once(askPieceToMove(Board,Player,X,Y)),
        once(askDelta(DeltaX,DeltaY)),
        nl,nl,
        validPlay(Board,Player,X,Y,DeltaX,DeltaY),
        !,
        makePlay(Board,Player,X,Y,DeltaX,DeltaY,N1,N2,NewBoard).
askAndMakeMove(_,_,_,_,_) :- 
        write('Invalid move'), nl,
        fail.

% Predicado para o primeiro movimento da ronda
move1(Board,Player,NewBoard,N1,N2) :-
        repeat,
           askAndMakeMove(Board,Player,NewBoard,N1,N2),
        !.

% Predicado para o segundo movimento da ronda
move2(Board,_,Board,2,2).
move2(Board,Player,NewBoard,N1,N2) :-
        once(drawBoard(Board)),
        once(askAnotherMove),
        move2aux(Board,Player,NewBoard,N1,N2).
move2(Board,_,Board,N1,N1).
move2aux(Board,Player,NewBoard,N1,N2) :-
        askAndMakeMove(Board,Player,NewBoard,N1,N2).
move2aux(Board,Player,NewBoard,N1,N2) :- move2(Board,Player,NewBoard,N1,N2).     

% Ronda de utilizador
gameRoundPlayer(Board,Player,NewBoard) :-
        move1(Board,Player,Board2,0,N1),
        move2(Board2,Player,NewBoard,N1,_).
