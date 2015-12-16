:- consult('game-logic.pl').
:- use_module(library(random)).
:- dynamic level/2.

% Avaliação de tabuleiro para jogador da frota dourada
rateBoard(Board,2,Rating) :-
        countFlagshipCanBeCaptured(Board,FlagshipCapture),
        findall(_, flagshipExit(Board,_), Ns),
        length(Ns, Num_exits),
        countPieces(Board,2,Escorts_silver),
        countGoldWins(Board,GoldWins),
        Rating is 
                50*(1-FlagshipCapture)*Num_exits
                - 250*FlagshipCapture
                - Escorts_silver
                + 1000*GoldWins.

% Avaliação de tabuleiro para jogador da frota prateada
rateBoard(Board,1,Rating) :-
        findall(_, flagshipExit(Board,_), Ns),
        length(Ns, Num_exits),
        countFlagshipCanBeCaptured(Board,FlagshipCapture),
        countPieces(Board,2,Escorts_silver),
        countFlagship(Board,FlagshipCount),
        Rating is 
                -200*Num_exits-10*FlagshipCapture
                + Escorts_silver
                - 1000*FlagshipCount.

% Conta o número de navios almirantes (0 ou 1)
countFlagship(Board,1) :- getFlagship(Board,_,_).
countFlagship(Board,0) :- \+ getFlagship(Board,_,_).

% Vê se a frota dourada ganhou ou não (1 ou 0)
countGoldWins(Board,1) :- goldWins(Board).
countGoldWins(Board,0) :- \+ goldWins(Board).

% Vê se o navio almirante pode ser imediatamente capturado (1 ou 0)
countFlagshipCanBeCaptured(Board,1) :- flagshipCanBeCaptured(Board).
countFlagshipCanBeCaptured(Board,0) :- \+ flagshipCanBeCaptured(Board).

% Obter uma jogada possível e respetiva avaliação
getPlayAndRating(Board,Player,X,Y,DeltaX,DeltaY,N,Rating) :-
        validPlay(Board,Player,X,Y,DeltaX,DeltaY),
        play(Board,Player,X,Y,DeltaX,DeltaY,N,_,Board2),
        rateBoard(Board2,Player,Rating).

% Jogada de computador, nível 2
playAI(Board,_,2,_,Board).
playAI(Board,Player,N,N2,NewBoard) :-
        findall(((X,Y,DeltaX,DeltaY),Rating),
                getPlayAndRating(Board,Player,X,Y,DeltaX,DeltaY,N,Rating),
                Moves),
        once(pickBestRating(Moves,Rating)),
        getBestMoves(Moves,Rating,BestMoves),
        choose(BestMoves,(X,Y,DeltaX,DeltaY)),
        play(Board,Player,X,Y,DeltaX,DeltaY,N,N2,NewBoard).

% Obter o melhor valor de avaliação a partir de uma lista das várias jogadas possíveis e respetivas avaliações
pickBestRating([],Rating,Rating).
pickBestRating([(_,H)|T],M,Rating) :- H >= M, pickBestRating(T,H,Rating).
pickBestRating([(_,H)|T],M,Rating) :- M > H, pickBestRating(T,M,Rating).
pickBestRating([(_,H)|T],Rating) :- pickBestRating(T,H,Rating).

% Obter as melhores jogadas a partir de uma lista de todas as jogadas possíveis e respetivas avaliações 
% e o valor da melhor avaliação
getBestMoves([],_,_) :- !.
getBestMoves([((X,Y,DeltaX,DeltaY),BestRating)|T],BestRating,[(X,Y,DeltaX,DeltaY)|More]) :-
        getBestMoves(T,BestRating,More).
getBestMoves([(_,Rating)|T],BestRating,More) :-
        Rating =\= BestRating,
        getBestMoves(T,BestRating,More).

% Ronda de jogo para o computador
gameRoundAI(Board,Player,NewBoard) :-
        level(Player,2),
        once(playAI(Board,Player,0,N1,Board2)),
        once(playAI(Board2,Player,N1,_,NewBoard)).

gameRoundAI(Board,Player,NewBoard) :-
        level(Player,1),
        once(playRandomly(Board,Player,0,N1, Board2)),
        once(playRandomly(Board2,Player,N1,_,NewBoard)).
		
% Obter a posição do navio almirante
getFlagship([H|_],X,1) :-
        nth1(X,H,4).
getFlagship([H|T],X,Y) :-
        \+ nth1(X,H,4),
        getFlagship(T,X,Y1),
        Y is Y1+1.

% Obter tabuleiro onde o navio almirante vai para a saida (se possível)
flagshipExit(Board,NewBoard) :-
        getFlagship(Board,X,Y),
        flagshipExit(Board,X,Y,NewBoard).
flagshipExit(Board,X,Y,NewBoard) :-
        DeltaX is 1-X,
        play(Board,2,X,Y,DeltaX,0,0,_,NewBoard).
flagshipExit(Board,X,Y,NewBoard) :-
        DeltaX is 11-X,
        play(Board,2,X,Y,DeltaX,0,0,_,NewBoard).
flagshipExit(Board,X,Y,NewBoard) :-
        DeltaY is 1-Y,
        play(Board,2,X,Y,0,DeltaY,0,_,NewBoard).
flagshipExit(Board,X,Y,NewBoard) :-
        DeltaY is 11-Y,
        play(Board,2,X,Y,0,DeltaY,0,_,NewBoard).

% Verifica se o navio almirante pode ser imediatamente capturado
flagshipCanBeCaptured(Board) :-
        getFlagship(Board,X,Y),
        getCapturePoint(X,Y,X2,Y2,_,_),
        getCellAt(Board,X2,Y2,1).

% Fazer jogada aleatória
playRandomly(Board,Player,N1,N2,NewBoard) :-
        findall((X,Y,DeltaX,DeltaY),validPlay(Board,Player,X,Y,DeltaX,DeltaY),Moves),
        choose(Moves,(X,Y,DeltaX,DeltaY)),
        play(Board,Player,X,Y,DeltaX,DeltaY,N1,N2,NewBoard).
playRandomly(Board,_,_,_,Board).

% Escolher um elemento de uma lista aleatoriamente
choose(List, Result) :-
        length(List, Length),
        random(0, Length, Index),
        nth0(Index, List, Result).
        