(function() {
"use strict";

// verifica formatos suportados
function supportsOgg(){
    var a = document.createElement('audio'); 
    return !!(a.canPlayType && a.canPlayType('audio/ogg;').replace(/no/, ''));
}
function supportsM4a(){
    var a = document.createElement('audio'); 
    return !!(a.canPlayType && a.canPlayType('audio/mp4;').replace(/no/, ''));
}

//som do play
var canPlayOgg = supportsOgg(),
    canPlayM4a = supportsM4a();

if (canPlayOgg){	
    var startSound = new Audio("sound/start.ogg");
}else if(canPlayM4a){	
    var startSound = new Audio("sound/start.m4a");
}

//começa o jogo ao clicar no play
var playAgain = document.getElementById("playagain");
playAgain.onclick = function(){
startSound.play();
setTimeout(function(){window.location.href = "game.html";}, 400); //chama o jogo após meio segundo
	
}

//getting saved max score
var maxScore = localStorage["maxscore"],
    maxScoreText = document.getElementById("maxscoretext");
maxScoreText.innerHTML = "Pontuação Máxima: " + maxScore;

//responsive layout
var layoutObject = document.getElementById("layoutcomplete"),
largura = 1024,
altura = 768;
layoutObject.style.width = largura + "px";
layoutObject.style.height = altura + "px";
var lr = new LayoutResolver();
lr.adjust("layoutcomplete", 1024, 768);

window.onresize = function(){

lr.adjust("layoutcomplete", largura, altura);

}

})();