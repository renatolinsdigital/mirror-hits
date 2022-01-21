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
var playAgain = document.getElementById("play-again");
playAgain.onclick = function(){
startSound.play();
setTimeout(function(){window.location.href = "game.html";}, 400); 
	
}

//getting saved max score
var maxScore = localStorage["max_score"],
    maxScoreText = document.getElementById("max-score-text");
maxScoreText.innerHTML = "Max score: " + maxScore;

//responsive layout
    var layoutObject = document.getElementById("layout-complete "),
largura = 1024,
altura = 768;
layoutObject.style.width = largura + "px";
layoutObject.style.height = altura + "px";
var lr = new LayoutResolver();
    lr.adjust("layout-complete ", 1024, 768);

window.onresize = function(){

    lr.adjust("layout-complete ", largura, altura);

}

})();