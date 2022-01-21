(function () {
    "use strict"; // [THIS CODE REQUIRED INTENSE REVISION AS IT WAS CREATED MANY YEARS AGO]

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

    // 3 - Define o recorde (max score) Caso já não exista

    var setMaxScore = function(score) {

        //define o maxscore caso não tenha sido definido
        if (localStorage["max_score"] == undefined) {
            localStorage["max_score"] = score;
        } else { //redefine o max score caso seja maior que o score anterior
            if (score > localStorage["max_score"])
                localStorage["max_score"] = score;
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
            menuText = document.getElementById("menu-text");


        layoutObject.style.width = gameProperties.layoutWidth + "px";
        layoutObject.style.height = gameProperties.layoutHeight + "px";
        gameLibs.LayoutResolver.adjust("layout", gameProperties.layoutWidth, gameProperties.layoutHeight);
        gameLibs.MovColis.paintBorders("board", "red", 1);
        levels.innerHTML = "Level " + gameProperties.nivelAtual + "/" + gameProperties.qtdeNiveis;
        score.innerHTML = "Score: " + gameProperties.pontos;

        menuText.onclick = function() {
            window.location.href = "index.html";
        }


        criaPlayer(1);
        exibeEscondePlayer();

        gameLibs.MovColis.createDOMElements(gameProperties.qtdeBolinhas, "div", "bolinha", "objeto bolinhas", "vertical", "down", "board1", 1);
        gameLibs.MovColis.createDOMElements(1, "div", "pyramid", "objeto pyramids", "none", "none", "board2", 1);
        gameLibs.MovColis.paintPyramid("pyramid1", "yellow", "blue", "red", "gray", 3);
        pyramid1.xPercentage = 50;
        pyramid1.yPercentage = 80; 
        gameLibs.MovColis.positionByPercentage("pyramid1", "board2", "left"); 

        pyramid1.moveLimit = gameLibs.MovColis.boundToLayout; 

        defineBolinhas();

        gameLibs.MovColis.spreadInX("bolinhas", gameProperties.spreadYPercentage, "board1", gameProperties.spreadWithinPercentage);

        var totalBalls = gameProperties.qtdeBolinhas,
            ballIndex = totalBalls,
            playingBall = document.getElementById("bolinha" + ballIndex);
        var lastUpdate;
        var t, dt;

        var colidiu1 = false;


        ballLaunch.play();

        playingBall.onclick = function() {
            colidiu1 = true;
        }

        var gameLoop = function() {

            if (gameProperties.playing) {

                if (totalBalls <= 0) {
                    gameProperties.playing = false;
                    endGame();
                }

                t = new Date().getTime(),
                    dt = t - lastUpdate;

                playingBall.movement = gameLibs.MovColis.keepMoving;
                player1.movement("board1", dt, gameProperties.velocidadePlayer); 
                player1.moveLimit("board1");

                playingBall.movement(dt, gameProperties.velocidadeBolinhas);

                for (var i = 1; i <= gameProperties.qtdeBolinhas; i++) {
                    var someBallInBoard2 = document.getElementById("bolinha" + i);
                    if (someBallInBoard2 != null) { 
                        if (someBallInBoard2.parentNode.id == "board2") {
                            someBallInBoard2.movement(dt, gameProperties.velocidadeBolinhas)
                        }
                    }
                }

                if (gameLibs.MovColis.gameObjects.player1 !== undefined) {
                    colidiu1 = gameLibs.MovColis.detectCollision(player1, playingBall, 0, 0);
                }


                if (ballIndex >= 1) {
                    if ((parseInt(playingBall.style.top) > window.innerHeight) || colidiu1) {
                        if (parseInt(playingBall.style.top) > window.innerHeight) totalBalls--; 

        
                        var transferTop = parseInt(playingBall.style.top);

                        gameLibs.MovColis.deleteObject(playingBall.id, "board1");
                        ballIndex--; 
                        if (ballIndex >= 1) {
                            playingBall = document.getElementById("bolinha" + ballIndex);
                            playingBall.onclick = function() {
                                colidiu1 = true;
                            }
                        }

                        if (colidiu1) {
                            getBall.play();
                            gameLibs.MovColis.createDOMElements(1, "div", "bolinha", "objeto bolinhas", "horizontal", "left", "board2", ballIndex + 1);
                            var ballInTheOtherSide = document.getElementById("bolinha" + parseInt(ballIndex + 1));
                            defineBolinhas();
                            ballInTheOtherSide.xPercentage = 100; 
                            var board2Height = parseInt(window.getComputedStyle(board2, null).getPropertyValue("height"));
                            transferTop = (transferTop / board2Height) * 100;
                            ballInTheOtherSide.yPercentage = transferTop + 3; 
                            gameLibs.MovColis.positionByPercentage(ballInTheOtherSide.id, "board2", "none");

                       
                            ballInTheOtherSide.movement = gameLibs.MovColis.keepMoving;

                            colidiu1 = false;

                        }


                        if (totalBalls >= 1) ballLaunch.play();

                    }

                } 

                if (totalBalls >= 1) {

                    for (var i = 1; i <= gameProperties.qtdeBolinhas; i++) {
                        var someBallInBoard2 = document.getElementById("bolinha" + i);
                        if (someBallInBoard2 != null) {

                            var colidiu2 = gameLibs.MovColis.detectCollision(someBallInBoard2, pyramid1, 0, 0); 
                            if (colidiu2) {
                                pyramidHit.play();
                                gameProperties.pontos += gameProperties.ballPoints[i - 1];
                                setMaxScore(gameProperties.pontos);
                                score.innerHTML = "Score: " + gameProperties.pontos;
                                proximoNivel();
                            } 

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

                        } 

                    } 

                }

                lastUpdate = new Date().getTime();
                requestAnimationFrame(gameLoop); 

            } 

        } 


        gameLoop();

        /*-----------Próximo Nivel----------*/

        var proximoNivel = function() {

            gameProperties.nivelAtual++;

            if (gameProperties.nivelAtual <= gameProperties.qtdeNiveis) {

                var max = 95,
                    min = 5,
                    intInterval = Math.floor(Math.random() * (max - min + 1) + min);
                pyramid1.xPercentage = intInterval;
                max = 95, min = 45;
                intInterval = Math.floor(Math.random() * (max - min + 1) + min);
                pyramid1.yPercentage = intInterval;
                gameLibs.MovColis.positionByPercentage("pyramid1", "board2", "left");

   
                for (var i = 1; i <= gameProperties.qtdeBolinhas; i++) {
                    var someBall = document.getElementById("bolinha" + i);
                    if (someBall != null) {
                        if (someBall.parentNode.id == "board1") gameLibs.MovColis.deleteObject(someBall.id, "board1")
                        else gameLibs.MovColis.deleteObject(someBall.id, "board2");
                    }
                } 

                gameLibs.MovColis.createDOMElements(gameProperties.qtdeBolinhas, "div", "bolinha", "objeto bolinhas", "vertical", "down", "board1", 1);
                defineBolinhas();
                gameLibs.MovColis.spreadInX("bolinhas", gameProperties.spreadYPercentage, "board1", gameProperties.spreadWithinPercentage);


                totalBalls = gameProperties.qtdeBolinhas;
                ballIndex = totalBalls;
                playingBall = document.getElementById("bolinha" + ballIndex);
                playingBall.movement = gameLibs.MovColis.keepMoving;


                gameProperties.velocidadePlayer += 7;

 
                levels.innerHTML = "Level " + gameProperties.nivelAtual + "/" + gameProperties.qtdeNiveis;

                playingBall.onclick = function() {
                    colidiu1 = true;
                }

                gameLoop();


            } else { 


                beatGame.play();
                gameProperties.playing = false;
                setTimeout(function() {
                    window.location.href = "gamecomplete.html";
                }, 400); 

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


    var reDrawObjects = function() {

        gameLibs.MovColis.paintBorders("board", "red", 1);
        defineBolinhas();
        gameLibs.MovColis.paintPyramid("pyramid1", "yellow", "blue", "red", "gray", 5);
        gameLibs.MovColis.positionByPercentage("player1", "board1", "none");
        gameLibs.MovColis.positionByPercentage("pyramid1", "board2", "left");
        gameLibs.MovColis.spreadInX("bolinhas", gameProperties.spreadYPercentage, "board1", gameProperties.spreadWithinPercentage);

    }

    window.onresize = function() {
        gameLibs.LayoutResolver.adjust("layout", gameProperties.layoutWidth, gameProperties.layoutHeight);
        setTimeout(reDrawObjects, 10);
        exibeEscondePlayer();
    }

})();
