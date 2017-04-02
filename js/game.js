(function () {
    "use strict";

    /*=================Declarações Globais==================*/

    // 1 - namespace que contem todas as bibliotecas utilizadas no jogo

    var gameLibs = {
        MovColis: new MovColis(), //biblioteca de movimento e colisão
        LayoutResolver: new LayoutResolver() //biblioteca que ajusta o layout
    }

    // 2 - objeto que contém propriedades do jogo

    var gameProperties = {
        //Definindo tamanho (e consequentemente proporção) do layout. Utilizado no onresize
        layoutWidth: 1024,
        layoutHeight: 768,
        //variáveis do jogo
        playing: true,
        qtdeBolinhas: 5,
        velocidadeBolinhas: 250,
        qtdeNiveis: 100,
        velocidadePlayer: 600,
        nivelAtual: 1,
        pontos: 0,
        ballPoints: [50, 120, 210, 320, 500], //a quinta bolinha (utilizado primeiramente) vale mais pontos
        spreadYPercentage: 2, //porcentagem de margem entre o topo do layout e as bolinhas
        spreadWithinPercentage: 45 //porcentagem de uso do layout ao espalhar as bolinhas
    }

    // 3 - Define o recorde (maxscore) Caso já não exista

    var setMaxScore = function(score) {

        //define o maxscore caso não tenha sido definido
        if (localStorage["maxscore"] == undefined) {
            localStorage["maxscore"] = score;
        } else { //redefine o maxscore caso seja maior que o score anterior
            if (score > localStorage["maxscore"])
                localStorage["maxscore"] = score;
        }
    }
    setMaxScore(0);

    // 4 - Exibe ou esconde o player conforme o dispositivo (apenas verifica o tamanho da tela)
    var exibeEscondePlayer = function() {
        if ((window.innerWidth < 1024)) {
            gameLibs.MovColis.deleteObject(player1.id, "board1");
        } else {
            criaPlayer(1);
        }
    }

    /*=============Carregamento do Audio================*/

    // verifica formatos suportados
    function supportsOgg() {
        var a = document.createElement('audio');
        return !!(a.canPlayType && a.canPlayType('audio/ogg;').replace(/no/, ''));
    }

    function supportsM4a() {
        var a = document.createElement('audio');
        return !!(a.canPlayType && a.canPlayType('audio/mp4;').replace(/no/, ''));
    }

    var canPlayOgg = supportsOgg(),
        canPlayM4a = supportsM4a();

    //dando preferencia a reprodução do formato ogg
    if (canPlayOgg) {
        var startSound = new Audio("sound/start.ogg"),
            ballLaunch = new Audio("sound/ball_launch.ogg"),
            getBall = new Audio("sound/get_ball.ogg"),
            pyramidHit = new Audio("sound/pyramid_hit.ogg"),
            gameOver = new Audio("sound/game_over.ogg"),
            beatGame = new Audio("sound/beat_game.ogg");
    } else if (canPlayM4a) {
        var startSound = new Audio("sound/start.m4a"),
            ballLaunch = new Audio("sound/ball_launch.m4a"),
            getBall = new Audio("sound/get_ball.m4a"),
            pyramidHit = new Audio("sound/pyramid_hit.m4a"),
            gameOver = new Audio("sound/game_over.m4a"),
            beatGame = new Audio("sound/beat_game.m4a");
    }
    //ajuste no vole dos objetos de audio
    if (canPlayOgg || canPlayM4a) {
        startSound.volume = 0.2;
        ballLaunch.volume = 0.2;
        getBall.volume = 0.2;
        pyramidHit.volume = 0.2;
        gameOver.volume = 0.2;
        beatGame.volume = 0.2;
    }

    //cria o player - no caso iremos trabalhar apenas com player 1 e o índice entra apenas como uma ideia de upgrade
    var criaPlayer = function(indice) {
        if (gameLibs.MovColis.gameObjects.player1 != undefined) {
            return false;
        }
        //cria o player
        gameLibs.MovColis.createDOMElements(1, "div", "player", "objeto players", "none", "none", "board1", indice);
        //definindo posição inicial e comportamento do PLAYER
        player1.xPercentage = 50; //fara com que o objeto inicie no meio da tela
        player1.yPercentage = 90; //fara com que o objeto inicie na parte inferior da tela
        gameLibs.MovColis.positionByPercentage("player1", "board1", "none");
        player1.movement = gameLibs.MovColis.arrowMove; //MÁGICA: Injeta Função/Comportamento de movimentação no player
        player1.moveLimit = gameLibs.MovColis.boundToLayout; //injeta detecção de limites
    }

    //define tamanho da div - todos os elementos da classe BOLINHA terão 8% de largura e serão quadrados.
    //na versão mobile(onde não existe o player), as bolinhas serão maiores.
    var defineBolinhas = function() {
        if (gameLibs.MovColis.gameObjects.player1 !== undefined) {
            gameLibs.MovColis.defineSquareByClass("bolinhas", 8);
            gameProperties.velocidadeBolinhas += 7;
        } else {
            gameLibs.MovColis.defineSquareByClass("bolinhas", 22);
            gameProperties.velocidadeBolinhas += 4;
        }
    }

    /*========Funções Principais - Após o Carregamento do DOM========*/

    document.addEventListener("DOMContentLoaded", function(event) {

        //----- 1 - Inicialização do Layout -----

        var layoutObject = document.getElementById("layout"),
            board1 = document.getElementById("board1"),
            board2 = document.getElementById("board2"),
            levels = document.getElementById("levels"),
            score = document.getElementById("score"),
            menutext = document.getElementById("menutext");

        //Ajusta o Layout com medidas absolutas
        layoutObject.style.width = gameProperties.layoutWidth + "px";
        layoutObject.style.height = gameProperties.layoutHeight + "px";
        //resolve o layout proporcionalmente, baseando em suas medidas absolutas
        gameLibs.LayoutResolver.adjust("layout", gameProperties.layoutWidth, gameProperties.layoutHeight);
        //definindo a borda
        gameLibs.MovColis.paintBorders("board", "red", 1);

        levels.innerHTML = "Fase " + gameProperties.nivelAtual + "/" + gameProperties.qtdeNiveis;
        score.innerHTML = "Pontuação: " + gameProperties.pontos;

        menutext.onclick = function() {
            window.location.href = "index.html";
        }

        //cria o player 1 - Se for mobile, será destruído imediatamente
        criaPlayer(1);
        exibeEscondePlayer();

        //---- 2 - Inicialização de Objetos -----

        // 2.a - Cria Cada objeto

        //cria bolinhas dinamicamente (qtde, tipo, nome raiz, classe(s), direcao, sentido, layout)
        gameLibs.MovColis.createDOMElements(gameProperties.qtdeBolinhas, "div", "bolinha", "objeto bolinhas", "vertical", "down", "board1", 1);

        //pyramid - utiliza uma função arbritária pra pintar um objeto através de propriedades css
        gameLibs.MovColis.createDOMElements(1, "div", "pyramid", "objeto pyramids", "none", "none", "board2", 1);
        gameLibs.MovColis.paintPyramid("pyramid1", "yellow", "blue", "red", "gray", 3);
        pyramid1.xPercentage = 50; //fara com que o objeto inicie no meio da tela
        pyramid1.yPercentage = 80; //fara com que o objeto inicie na parte inferior da tela
        gameLibs.MovColis.positionByPercentage("pyramid1", "board2", "left"); //ajusta conforme porcentagens(propriedades do objeto)

        //2.b - define posição e comportamento dos objetos

        pyramid1.moveLimit = gameLibs.MovColis.boundToLayout; //garante que o objeto nunca sairá do layout

        //define inicialmente as bolinhas
        defineBolinhas();

        //espalhando bolinhas no topo do layout
        //parâmetros: classe dos elementos que serão espalhados, porcentagem no topo, layout, porcentagem de uso
        gameLibs.MovColis.spreadInX("bolinhas", gameProperties.spreadYPercentage, "board1", gameProperties.spreadWithinPercentage);

        //faz com que a primeira bolinha(na verdade a quinta) comece caindo

        /*----Operaçoes com o Objeto----*/
        //var numberOfObjects = mc.countObjects(); - conta a quantidade de objetos no jogo
        //console.log(mc.listAllObjects()); - Listar Todos os Objetos
        //console.log(mc.gameObjects.bolinha2); - Obter um Objeto em específico
        //for (var i=1;i<=qtdeBolinhas;i++) console.log(mc.gameObjects["bolinha"+String(i)].xPercentage); - pega props de um tipo de objeto
        /*-----------------------------*/

        //variáveis que auxiliam no controle das bolinhas
        var totalBalls = gameProperties.qtdeBolinhas,
            ballIndex = totalBalls,
            playingBall = document.getElementById("bolinha" + ballIndex);
        //obtem o tempo após o ultimo update
        var lastUpdate;

        //getting the delta time value (difference in time between the last update and now - miliseconds)
        var t, dt;

        //variável que controla a colisão da paleta com as bolinhas, ou do clique nelas
        var colidiu1 = false;


        ballLaunch.play(); //som da primeira bolinha sendo disparada (antes do gameloop)

        playingBall.onclick = function() {
            colidiu1 = true;
        }

        var gameLoop = function() {

            //atualiza o game enquanto se está jogando
            if (gameProperties.playing) {

                //encerra o jogo caso as bolinhas tenham se esgotado
                if (totalBalls <= 0) {
                    gameProperties.playing = false;
                    endGame();
                }

                t = new Date().getTime(),
                    dt = t - lastUpdate;

                playingBall.movement = gameLibs.MovColis.keepMoving;

                //processamento de entradas (funções do player)
                //chamando funções injetadas anteriormente - Aqui é hora de passar os
                //parametros já que a função será executada em cima do próprio player considerando o layout
                player1.movement("board1", dt, gameProperties.velocidadePlayer); //considera uma velocidade padrão que se mantém fixa com ajuda do dt
                player1.moveLimit("board1");

                //Dá movimento a primeira bolinha (a quinta) conforme sua direção e sentido.
                playingBall.movement(dt, gameProperties.velocidadeBolinhas);

                //processa o movimento de todas as bolinhas que estão no board 2
                //o comportamento é injetado durante outras ocasiões [colisão com player ou ao sair do layout], porém é processado sempre pelo gameloop)
                for (var i = 1; i <= gameProperties.qtdeBolinhas; i++) {
                    var someBallInBoard2 = document.getElementById("bolinha" + i);
                    if (someBallInBoard2 != null) { //verifica se há uma bolinha com esse indice provavel
                        if (someBallInBoard2.parentNode.id == "board2") {
                            someBallInBoard2.movement(dt, gameProperties.velocidadeBolinhas)
                        }
                    }
                }

                //detecta colisão com a paleta. Essa detecção ocorre no board 1 e somente se a paleta existir
                if (gameLibs.MovColis.gameObjects.player1 !== undefined) {
                    colidiu1 = gameLibs.MovColis.detectCollision(player1, playingBall, 0, 0);
                }

                //enquanto houverem bolinhas suspensas iremos destruir a que está caindo e chamar a próxima
                if (ballIndex >= 1) {
                    if ((parseInt(playingBall.style.top) > window.innerHeight) || colidiu1) {
                        if (parseInt(playingBall.style.top) > window.innerHeight) totalBalls--; //caso o player não pegue a bolinha

                        //pega o top (será utilizado caso a bolinha seja transferida)
                        var transferTop = parseInt(playingBall.style.top);

                        //destroi bolinha atual e pega a próxima(que no caso é a anterior)
                        gameLibs.MovColis.deleteObject(playingBall.id, "board1");
                        ballIndex--; //de qualquer forma o board1 terá uma bolinha a menos
                        if (ballIndex >= 1) {
                            playingBall = document.getElementById("bolinha" + ballIndex);
                            playingBall.onclick = function() {
                                colidiu1 = true;
                            }
                        }

                        //caso tenha sido uma colisão entra player e bolinha, uma bolinha é criada no board2 e se moverá na horizontal
                        if (colidiu1) {
                            getBall.play();
                            //se estamos jogando a bolinha 5, o ballIndex foi decrementado. logo, uma bolinha com indice 5 será criada do outro lado com ballIndex+1
                            gameLibs.MovColis.createDOMElements(1, "div", "bolinha", "objeto bolinhas", "horizontal", "left", "board2", ballIndex + 1);

                            //define a bolinha que foi criada do outro lado e ajusta sua posição
                            var ballInTheOtherSide = document.getElementById("bolinha" + parseInt(ballIndex + 1));
                            defineBolinhas();

                            //ajusta percentualmente a posição da nova bolinha
                            ballInTheOtherSide.xPercentage = 100; //encostada no final do board2
                            var board2Height = parseInt(window.getComputedStyle(board2, null).getPropertyValue("height"));
                            transferTop = (transferTop / board2Height) * 100;
                            ballInTheOtherSide.yPercentage = transferTop + 3; //posição percentual, relativa ao momento da colisão(considera um ajuste)
                            gameLibs.MovColis.positionByPercentage(ballInTheOtherSide.id, "board2", "none");

                            //injeta o movimento continuo na bolinha que passou pro outro lado
                            ballInTheOtherSide.movement = gameLibs.MovColis.keepMoving;

                            colidiu1 = false;

                        } // se colidiu1


                        if (totalBalls >= 1) ballLaunch.play(); //executa som ao chamar a próxima bolinha

                    } //se a bolinha saiu ou colidiu1

                } // se ballIndex >= 1

                //enquanto houverem bolinhas no jogo
                if (totalBalls >= 1) {

                    //verifica se alguma bola saiu do board2 ou se colidiu com a piramide
                    for (var i = 1; i <= gameProperties.qtdeBolinhas; i++) {
                        var someBallInBoard2 = document.getElementById("bolinha" + i);
                        if (someBallInBoard2 != null) {

                            //--Verifica se o player acertou a piramide
                            var colidiu2 = gameLibs.MovColis.detectCollision(someBallInBoard2, pyramid1, 0, 0); //detecta colisão com um offset
                            if (colidiu2) {

                                pyramidHit.play();

                                //aproveita o loop pra pegar os pontos conforme o índice da bolinha
                                gameProperties.pontos += gameProperties.ballPoints[i - 1];

                                //envia a pontuação atual para verificação de recorde, que será salvo caso supere a máxima pontuação anterior
                                setMaxScore(gameProperties.pontos);

                                //atualiza a interface e vai pro próximo nível
                                score.innerHTML = "Pontuação: " + gameProperties.pontos;
                                proximoNivel();

                            } //se colidiu com a pirâmide

                            //--Verifica se a bolinha saiu do layout 2
                            var ballLeft = parseInt(someBallInBoard2.style.left);
                            ballLeft += parseInt(someBallInBoard2.style.width) * 4; //ajuste pra que a bola saia por completo(porque sim)

                            try {

                              //se esta no board 2 e saiu

                                if ((someBallInBoard2.parentNode.id == "board2") && (ballLeft < 0)) {
                                    gameLibs.MovColis.deleteObject(someBallInBoard2.id, "board2");
                                    totalBalls--;
                                }

                            } catch (err) {}

                        } //fim: se o objeto obtido nao é nulo

                    } //fim: for que passa pelos números possiveis de bolinhas

                } //fim: verifica se existem bolinhas

                lastUpdate = new Date().getTime();
                requestAnimationFrame(gameLoop); // chama o loop novamente (cria a recursividade do gameloop)

            } //fim: playing


        } //fim: game loop

        //Chama o gameloop pela primeira vez
        gameLoop();

        /*-----------Próximo Nivel----------*/

        var proximoNivel = function() {
            //considera que o player passou de fase
            gameProperties.nivelAtual++;

            if (gameProperties.nivelAtual <= gameProperties.qtdeNiveis) {

                //muda a pirâmide de posição (porcentagem randômica)
                var max = 95,
                    min = 5,
                    intInterval = Math.floor(Math.random() * (max - min + 1) + min);
                pyramid1.xPercentage = intInterval;
                max = 95, min = 45;
                intInterval = Math.floor(Math.random() * (max - min + 1) + min);
                pyramid1.yPercentage = intInterval;
                gameLibs.MovColis.positionByPercentage("pyramid1", "board2", "left");

                //exclui todas as bolinhas
                for (var i = 1; i <= gameProperties.qtdeBolinhas; i++) {
                    var someBall = document.getElementById("bolinha" + i);
                    if (someBall != null) {
                        if (someBall.parentNode.id == "board1") gameLibs.MovColis.deleteObject(someBall.id, "board1")
                        else gameLibs.MovColis.deleteObject(someBall.id, "board2");
                    }
                } //fim do for que exclui todas as bolinhas
                //recria bolinhas - aproveita a 'verificação mobile' e dá um incremento de velocidade de acordo
                gameLibs.MovColis.createDOMElements(gameProperties.qtdeBolinhas, "div", "bolinha", "objeto bolinhas", "vertical", "down", "board1", 1);
                defineBolinhas();
                gameLibs.MovColis.spreadInX("bolinhas", gameProperties.spreadYPercentage, "board1", gameProperties.spreadWithinPercentage);

                //dá um reset nas variáveis que controlam as bolinhas
                totalBalls = gameProperties.qtdeBolinhas;
                ballIndex = totalBalls;
                playingBall = document.getElementById("bolinha" + ballIndex);
                playingBall.movement = gameLibs.MovColis.keepMoving;

                //aumenta a velocidade do player pra acompanhar as bolinhas que estarão cada vez mais rápidas
                gameProperties.velocidadePlayer += 7;

                //atualiza a interface
                levels.innerHTML = "Fase " + gameProperties.nivelAtual + "/" + gameProperties.qtdeNiveis;

                playingBall.onclick = function() {
                    colidiu1 = true;
                }

                gameLoop();


            } else { //caso o player tenha percorrido por todas as fases

                //vence o jogo
                beatGame.play();
                gameProperties.playing = false;
                setTimeout(function() {
                    window.location.href = "gamecomplete.html";
                }, 400); //chama depois de uma tempo pro som tocar

            }

        }

    });


    /*-----------End Game Function----------*/

    var endGame = function() {
        gameOver.play();
        levels.innerHTML += " - FIM DE JOGO";
        score.innerHTML = "Reiniciar (F5)";
        score.onclick = function() {
            location.reload();
        }

    }

    /*--------Redimensionamento da tela-------*/

    //recalcula como objetos serão desenhados
    var reDrawObjects = function() {

        //redefinindo a largura da borda
        gameLibs.MovColis.paintBorders("board", "red", 1);
        //redefinindo bolinhas
        defineBolinhas();
        //redefinindo o tamanho da pyramid
        gameLibs.MovColis.paintPyramid("pyramid1", "yellow", "blue", "red", "gray", 5);
        //reajusta posições relativas
        gameLibs.MovColis.positionByPercentage("player1", "board1", "none");
        gameLibs.MovColis.positionByPercentage("pyramid1", "board2", "left");
        //reespalhando bolinhas conforme definição inicial
        gameLibs.MovColis.spreadInX("bolinhas", gameProperties.spreadYPercentage, "board1", gameProperties.spreadWithinPercentage);

    }

    window.onresize = function() {

        //resolvendo o tamanho do layout com uma outra lib
        gameLibs.LayoutResolver.adjust("layout", gameProperties.layoutWidth, gameProperties.layoutHeight);

        //redesenhando objetos - precisa redesenhar com delay porque ao maximizar e minimizar no botão, o resize ocorre muito rapido
        setTimeout(reDrawObjects, 10);

        exibeEscondePlayer();

    }

})();
