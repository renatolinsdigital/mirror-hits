/*Moving and Collision Library by Renato Lins*/

/*
- Names considered for scope:
var: defines private stuf
prototype: define public static stuff
this: define public and instance stuff
*/

var MovColis = function() { //library starts with a standard constructor ( in this case a named function)
    "use strict";

    var keys = []; //empty array to hold key values

    //once the library is instantiated, it will attach listeners to body for dealing with keys
    document.body.addEventListener("keydown", function(e) {
        keys[e.keyCode] = true; //array has named indexes(same as key codes)
    });
    document.body.addEventListener("keyup", function(e) {
        keys[e.keyCode] = false;
    });

    //namespace to hold all objects created in-game
    MovColis.prototype.gameObjects = {}; //written with prototype('static-like') instead of this.gameObjects because this must be static

    //Getters and Setters to be used within the Lybrary (private)
    var getY = function(obj) {
            return (obj.style.top)
        },
        getX = function(obj) {
            return (obj.style.left)
        },
        setY = function(obj, y) {
            obj.style.top = y + "px";
        },
        setX = function(obj, x) {
            obj.style.left = x + "px";
        },
        getWidth = function(obj) {
            return (obj.width || obj.clientWidth)
        },
        getHeight = function(obj) {
            return (obj.height || obj.clientHeight)
        };

    //redefine positions percentage. will happen ONLY when objects move for repositioning purposes
    //This is also a private method
    var redefinePositionPercentage = function(obj, layout) {

        var layoutWidth = parseInt(window.getComputedStyle(layout, null).getPropertyValue("width")),
            layoutHeight = parseInt(window.getComputedStyle(layout, null).getPropertyValue("height")),
            elementLeft = parseInt(window.getComputedStyle(obj, null).getPropertyValue("left")),
            elementTop = parseInt(window.getComputedStyle(obj, null).getPropertyValue("top")),
            elementWidth = parseInt(window.getComputedStyle(obj, null).getPropertyValue("width")),
            elementHeight = parseInt(window.getComputedStyle(obj, null).getPropertyValue("height"));
        obj.xPercentage = (elementLeft / layoutWidth) * 100;
        obj.yPercentage = (elementTop / layoutHeight) * 100;

        //adjustment
        obj.yPercentage = obj.yPercentage + (elementHeight / 5.68); //somehow this is the proportion :D
        obj.xPercentage = obj.xPercentage + (elementWidth / 7.77);

    }

    //basic movement function (Will be an instance function, thats why we use this)
    this.arrowMove = function(layoutName, deltaTime, pixelsPerSecond) {

        var moveDistance = ((deltaTime * pixelsPerSecond) / 1000);

        var layout = document.getElementById(layoutName);

        if (keys[38]) { //up
            setY(this, parseInt(this.style.top) - moveDistance);
            redefinePositionPercentage(this, layout);
        } //right
        if (keys[39]) {
            setX(this, parseInt(this.style.left) + moveDistance);
            redefinePositionPercentage(this, layout);
        } //down
        if (keys[40]) {
            setY(this, parseInt(this.style.top) + moveDistance);
            redefinePositionPercentage(this, layout);
        } //left
        if (keys[37]) {
            setX(this, parseInt(this.style.left) - moveDistance);
            redefinePositionPercentage(this, layout);
        }

    }

    //creates a continuous moving according to object's direction and orientations
    this.keepMoving = function(deltaTime, pixelsPerSecond) {

        var moveDistance = ((deltaTime * pixelsPerSecond) / 1000);

        var direction = this.direction,
            orientation = this.orientation;

        if ((direction == "vertical") && (orientation == "down")) {
            setY(this, parseInt(this.style.top) + moveDistance);
        }

        if ((direction == "horizontal") && (orientation == "left")) {
            setX(this, parseInt(this.style.left) - moveDistance);
        }

    }

    //a behavior that makes objects to stay inside a given layout
    this.boundToLayout = function(layoutName) {

        var layout = document.getElementById(layoutName),
            objLeft = parseInt(this.style.left),
            objTop = parseInt(this.style.top),
            objWidth = parseInt(window.getComputedStyle(this, null).getPropertyValue("width")),
            objHeight = parseInt(window.getComputedStyle(this, null).getPropertyValue("height")),
            layoutWidth = parseInt(window.getComputedStyle(layout, null).getPropertyValue("width")),
            layoutHeight = parseInt(window.getComputedStyle(layout, null).getPropertyValue("height")),
            xLimit1 = 0 - (objWidth / 2),
            xLimit2 = parseInt(window.getComputedStyle(layout, null).getPropertyValue("left")) + layoutWidth - (objWidth / 2),
            yLimit1 = 0 - (objHeight / 2),
            yLimit2 = parseInt(window.getComputedStyle(layout, null).getPropertyValue("top")) + layoutHeight - (objHeight * 2);

        if (objLeft < xLimit1) this.style.left = xLimit1 + "px";
        if (objLeft > xLimit2) this.style.left = xLimit2 + "px";
        if (objTop < yLimit1) this.style.top = yLimit1 + "px";
        if (objTop > yLimit2) this.style.top = yLimit2 + "px";

    }


    //defines squares - will create elements appearance based on a class
    //this is a function that will be always available
    MovColis.prototype.defineSquareByClass = function(className, widthPercentage) {

        var collection = document.getElementsByClassName(className);
        for (var i = 0; i < collection.length; i++) {
            collection[i].style.width = String(widthPercentage) + "%";
            var elemWidth = parseInt(window.getComputedStyle(collection[i], null).getPropertyValue("width"));
            collection[i].style.height = elemWidth + "px"; //object height will follow its width
        }
    }

    //defines an object's position
    this.positionByPercentage = function(objId, layoutId, typeOfAdjustment) {
        var obj = document.getElementById(objId);
        if (obj == null) {
            return false;
        }
        var layout = document.getElementById(layoutId),
            xPercentage = obj.xPercentage,
            yPercentage = obj.yPercentage,
            maxWidth = getWidth(layout),
            maxHeight = getHeight(layout),
            objWidth = getWidth(obj),
            objHeight = getHeight(obj);

        //setting object according to percentage in relation to layout. => It considers sprite middle point
        var newObjectX = ((maxWidth / 100) * xPercentage - (objWidth / 2)),
            newObjectY = ((maxHeight / 100) * yPercentage - (objHeight / 2));

        setX(obj, newObjectX);
        setY(obj, newObjectY);

        //left adjustment created for the pyramid object. You may Change to obj.style.width for other kinds of objects
        if (typeOfAdjustment === "left") {
            obj.style.left = parseInt(obj.style.left) - (parseInt(obj.style.borderBottom) / 2) + "px";
        }
    }

    //a class function to create DOM elements according to some params
    MovColis.prototype.createDOMElements = function(numberOfElements, elemType, rootName, objClasses, objDirection, objOrientation, layoutName, namingIndex) {

        var layout = document.getElementById(layoutName);
        //starts creating and naming elements acording to the naming index + number of elements.
        // eg: 3 elements with naming index of 5 would create elements 5,6,7.
        for (var i = namingIndex; i < (namingIndex + numberOfElements); i++) {
            window[rootName + i] = document.createElement(elemType); //cria variável com window[name] (permite uso global)
            window[rootName + i].id = rootName + i;
            window[rootName + i].className = objClasses;
            layout.appendChild(window[rootName + i]);
            this.gameObjects[rootName + String(i)] = window[rootName + i];

            //extend Object's properties to enhance future control of it

            //direction and orientation properties
            window[rootName + i].direction = objDirection;
            window[rootName + i].orientation = objOrientation;

            //relative position properties(starting with 0% - top left corner)
            window[rootName + i].xPercentage = 0;
            window[rootName + i].yPercentage = 0;
        }

    }

    //paint elements borders by class with a color in a given percentage
    MovColis.prototype.paintBorders = function(className, color, percentage) {
        var myElement = document.getElementsByClassName(className);
        for (var i = 0; i < myElement.length; i++) {
            //takes 1% of the given layout width
            var widthPercentage = (parseInt(window.getComputedStyle(myElement[i], null).getPropertyValue("width")) / 100) * percentage;
            myElement[i].style.border = String(widthPercentage) + "px solid " + color; //border width
            myElement[i].style.borderRadius = String(widthPercentage * 4) + "px"; //rounded corners
        }

    }

    //The pyramid drawing
    MovColis.prototype.paintPyramid = function(pyramidID, color1, color2, color3, color4, percentage) {

        var widthPercentage = (parseInt(window.getComputedStyle(board2, null).getPropertyValue("width")) / 100) * percentage, //<-5% of board2 size
            pyramid = document.getElementById(pyramidID);

        //this is a percentage but can also be used to measure element's as it is css created and wont have clientWidth or clientHeight properties
        pyramid.width = widthPercentage * 2;
        pyramid.height = widthPercentage * 2;

        //borders will define object's fill
        pyramid.style.borderTop = String(widthPercentage) + "px solid " + color1;
        pyramid.style.borderBottom = String(widthPercentage) + "px solid " + color1;
        pyramid.style.borderLeft = String(widthPercentage) + "px solid " + color2;
        pyramid.style.borderRight = String(widthPercentage) + "px solid " + color3;

        //glow
        pyramid.style.boxShadow = "0 0 " + String(widthPercentage) + "px " + color4;
        //rounded corners
        pyramid.style.borderRadius = String(widthPercentage * .2) + "px";

    }

    //spread objects among the layout consider an equal distance and a total percentage of usage
    MovColis.prototype.spreadInX = function(className, initialYPercentage, layoutName, usagePercentage) {

        //and yes, it's a bit messy but kinda works :D
        var layout = document.getElementById(layoutName),
            totalWidth = parseInt(window.getComputedStyle(layout, null).getPropertyValue("width")),
            totalHeight = parseInt(window.getComputedStyle(layout, null).getPropertyValue("height")),
            unityOfMeasure = 0,
            reducedWidth = (totalWidth / 100) * usagePercentage,
            collection = document.getElementsByClassName(className);

        //wont proceed if first element is in board2 (GAME SPECIFIC ADJUSTMENT)
        if (collection[0].parentNode.id == "board2") return false;


        //will start in 5% if usagePercentage is 90% (10% space taken by both sides)
        var initialX = (totalWidth - reducedWidth) / 2;
        collection[0].style.left = initialX + "px";
        collection[0].style.top = String((totalHeight / 100) * initialYPercentage) + "px";
        redefinePositionPercentage(collection[0], layout);

        //loop from object 1 on and spread them among layout based on an unity of measure
        for (var i = 1; i < collection.length; i++) {
            //wont proceed if [i] element is in board2 (GAME SPECIFIC ADJUSTMENT)
            if (collection[i].parentNode.id == "board2") return false;

            collection[i].style.top = String((totalHeight / 100) * initialYPercentage) + "px";
            var elemWidth = parseInt(window.getComputedStyle(collection[i], null).getPropertyValue("width"));
            unityOfMeasure = (reducedWidth / collection.length);
            collection[i].style.left = String((i * unityOfMeasure) + initialX) + "px";
            redefinePositionPercentage(collection[i], layout);
        }

    }


    //Deleting Objects
    MovColis.prototype.deleteObject = function(objId, layoutId) {
        var obj = document.getElementById(objId);
        if (obj == null) {
            return false;
        }

        var layout = document.getElementById(layoutId);
        delete this.gameObjects[obj.id]; //removes from game objects namespace
        layout.removeChild(obj); //removes from the DOM tree
    }

    //Listing all objects
    MovColis.prototype.listAllObjects = function() {
        var result = null;
        for (var i in this.gameObjects) {
            if (this.gameObjects.hasOwnProperty(i)) result += "gameObjects." + i + " = " + this.gameObjects[i] + "\n";
        }
        return result;
    }

    //counting all objects
    MovColis.prototype.countObjects = function() {
        var count = 0;
        for (var i in this.gameObjects) count++;
        return count;
    }


    MovColis.prototype.detectCollision = function(obj1, obj2, offsetX, offsetY) {

        //will detect collision only for objects within the same board
        try {
            if (obj1.parentNode.id != obj2.parentNode.id) {
                return false
            }
        } catch (err) {}

        //getting first object's coordinates
        var x1obj1 = parseInt(getX(obj1)),
            y1obj1 = parseInt(getY(obj1)),
            x2obj1 = x1obj1 + getWidth(obj1),
            y2obj1 = y1obj1 + getHeight(obj1);

        //getting second object's coordinates (receives the offset in x and y)
        var x1obj2 = parseInt(getX(obj2)) + offsetX,
            y1obj2 = parseInt(getY(obj2)) + offsetY,
            x2obj2 = x1obj2 + getWidth(obj2) + offsetX,
            y2obj2 = y1obj2 + getHeight(obj2) + offsetY;

        //box collision - considering that obj2 (ball) is smaller than player
        if ((x2obj2 >= x1obj1) && (x1obj2 <= x2obj1) && (y2obj2 >= y1obj1) && (y1obj2 <= y2obj1))

            return true;
        else
            return false;

    }




} //end of MovColis
