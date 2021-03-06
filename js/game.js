/**
 * WCLN.ca
 * Vocab Matchup
 * @author Shaun Agostinho (shaunagostinho@gmail.com)
 * Febuary 2020 (Whoops, this shouldn't have taken so long, darn college is so busy.)
 */

let FPS = 24;
let gameStarted = false;
let STAGE_WIDTH, STAGE_HEIGHT;
let stage = new createjs.Stage("gameCanvas"); // canvas id is gameCanvas

// bitmap letiables
let background;
let startScreen, winScreen;

let backgroundImage = 'img/background_800x600.png';

let passLevel, failLevel;

//mute
let muted;
let mute, unmute;

let paused = false;

/*
 * Called by body onload
 */
function init() {
    STAGE_WIDTH = parseInt(document.getElementById("gameCanvas").getAttribute("width"));
    STAGE_HEIGHT = parseInt(document.getElementById("gameCanvas").getAttribute("height"));

    // init state object
    stage.mouseEventsEnabled = true;
    stage.enableMouseOver(); // Default, checks the mouse 20 times/second for hovering cursor changes

    setupManifest(); // preloadJS
    startPreload();

    gameStarted = false;

    stage.update();
}

function playSound(id) {
    if (muted == false) {
        createjs.Sound.play(id);
    }
}

function toggleMute() {

    if (muted == true) {
        muted = false;
    } else {
        muted = true;
    }

    if (muted == true) {
        stage.addChild(unmute);
        stage.removeChild(mute);
    } else {
        stage.addChild(mute);
        stage.removeChild(unmute);
    }
}

function initMuteUnMute() {
    var hitArea = new createjs.Shape();
    hitArea.graphics.beginFill("#000").drawRect(0, 0, mute.image.width, mute.image.height);
    mute.hitArea = unmute.hitArea = hitArea;

    mute.x = unmute.x = STAGE_WIDTH - (mute.image.width * 1.5);
    mute.y = unmute.y = STAGE_HEIGHT - (mute.image.height * 1.5);

    mute.cursor = "pointer";
    unmute.cursor = "pointer";

    mute.on("click", toggleMute);
    unmute.on("click", toggleMute);

    stage.addChild(mute);
}

function startPreload() {
    let preload = new createjs.LoadQueue(true);
    preload.installPlugin(createjs.Sound);
    preload.on("fileload", handleFileLoad);
    preload.on("progress", handleFileProgress);
    preload.on("complete", loadComplete);
    preload.on("error", loadError);
    preload.loadManifest(manifest);
}

// not currently used as load time is short
function handleFileProgress(event) {
    /*progressText.text = (preload.progress*100|0) + " % Loaded";
    progressText.x = STAGE_WIDTH/2 - progressText.getMeasuredWidth() / 2;
    stage.update();*/
}

/**
 * Update the stage. (Tween Ticker)
 *
 * @param event
 */

function update(event) {
    stage.update(event);
}

function setupManifest() {
    manifest = [
        {
            src: backgroundImage,
            id: "background"
        },
        {
            src: "img/startscreen.png",
            id: "startscreen"
        },
        {

            src: "img/unmute.png",
            id: "mute"
        },
        {
            src: "img/mute.png",
            id: "unmute"
        },
        {
            src: "img/win.png",
            id: "winScreen"
        },
        {
            src: "sound/click.mp3",
            id: "clickSound"
        },
        {
            src: "sound/win.mp3",
            id: "winSound"
        },
        {
            src: "sound/incorrect.mp3",
            id: "incorrectSound"
        },
        {
            src: "sound/correct.mp3",
            id: "correctSound"
        },
        {
            src: "img/faillevel.png",
            id: "failLevel"
        },
        {
            src: "img/passlevel.png",
            id: "passLevel"
        }
    ];
}

function handleFileLoad(event) {
    console.log("A file has loaded of type: " + event.item.type);
    // create bitmaps of images
    if (event.item.id == "background") {
        background = new createjs.Bitmap(event.result);
    }
    if (event.item.id == "startscreen") {
        startScreen = new createjs.Bitmap(event.result);
    }
    if (event.item.id.startsWith("mute")) {
        mute = new createjs.Bitmap(event.result);
    }
    if (event.item.id.startsWith("unmute")) {
        unmute = new createjs.Bitmap(event.result);
    }
    if (event.item.id.startsWith("winScreen")) {
        winScreen = new createjs.Bitmap(event.result);
    }

    if (event.item.id.startsWith("passLevel")) {
        passLevel = new createjs.Bitmap(event.result);
    }
    if (event.item.id.startsWith("failLevel")) {
        failLevel = new createjs.Bitmap(event.result);
    }
}

function loadError(evt) {
    console.log("Error!", evt.text);
}

/*
 * Displays the start screen.
 */
function loadComplete(event) {
    console.log("Finished Loading Assets");

    createjs.Ticker.setFPS(FPS);
    createjs.Ticker.addEventListener("tick", update); // call update function

    muted = false;

    stage.addChild(background);
    stage.addChild(startScreen);
    startScreen.on("click", function (event) {
        startGame(event);
        stage.removeChild(startScreen);
        initMuteUnMute();
    });

    passLevel.on("click", function (event) {
        paused = false;
        checkBoxText.text = "Check!";
        stage.removeChild(passLevel)
    });
    failLevel.on("click", function (event) {
        paused = false;
        checkBoxText.text = "Check!";
        stage.removeChild(failLevel)
    });
}

let initialBoxCount;
let boxCount; // 6 fits perfectly so this will be the actual maximum

function startGame() {
    gameStarted = true;

    /** Below this is actual game code. **/

    // make dynamic
    initialBoxCount = calculateBoxCount();
    boxCount = initialBoxCount;


    shuffleLists();
    drawBoxes();
    drawCheckBox();
    drawResetBox();

}

function calculateBoxCount() {
    // if(json.vocabulary.length % 6 == 0){
    //     return 4
    // }else{
    //     let count = 6
    //     while(json.vocabulary.length % count >= 3){
    //         count--;
    //     }
    //
    //     return count;
    // }

    if (json.vocabulary.length < 6) {
        return json.vocabulary.length;
    } else if (json.vocabulary.length % 6 == 0) {
        return 6;
    } else {
        //console.log(json.vocabulary.length % 6)
        let count = 6;
        while (count >= 1) {
            count--;

            if (json.vocabulary.length % count >= 3) {
                console.log(json.vocabulary.length % count + " - Calculate Boxes");
                return count;
            }
        }
        return 6;
    }
}

/** START GAME CODE **/

let vocabBoxes = [];
let definitionBoxes = [];


// Box Settings
let length = 300;
let sideGap = 20;
let height = 55;
let verticalGap = 20;
// todo calculate box count so there's not like only 2 on one page
let vocabDefDifference = 60;

let vocabList = [];
let definitionsList = [];

let level = 0;

function shuffleLists() {
    vocabList = [];
    definitionsList = [];

    let max =
        (boxCount != initialBoxCount ? 1 * (level * initialBoxCount) + (boxCount) : 1 * ((level + 1) * initialBoxCount));

    for (let i = 1 * (level * initialBoxCount); i < max; i++) {
        console.log(i);
        vocabList.push(json.vocabulary[i].word);
        definitionsList.push(json.vocabulary[i].definition);
    }

    vocabList = shuffle(vocabList);
    definitionsList = shuffle(definitionsList);
}

function shuffle(array) {
    let currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

let checkBox;
let checkBoxText;

function drawCheckBox() {
    checkBox = new createjs.Shape();
    checkBox.graphics.beginFill("#FFF").drawRoundRectComplex(
        length - sideGap * 4, STAGE_HEIGHT - height - 5, STAGE_WIDTH - (sideGap * 2 + length * 2), height,
        10, 10, 10, 10);

    stage.addChild(checkBox);

    checkBox.on("click", function (event) {
        if (!paused) {
            paused = false;
            checkAnswers();
        }
    });

    checkBoxText = new createjs.Text("Check", "24px Comic Sans MS", "#000");
    checkBoxText.textBaseline = "alphabetic";
    checkBoxText.textAlign = 'center';
    checkBoxText.x = checkBox.graphics.command.x + (STAGE_WIDTH - (sideGap * 2 + length * 2)) / 2;
    checkBoxText.y = checkBox.graphics.command.y + height / 2 + checkBoxText.getMeasuredHeight() / 4;

    stage.addChild(checkBoxText);
}

let resetBox;
let resetBoxText;

function drawResetBox() {
    resetBox = new createjs.Shape();
    resetBox.graphics.beginFill("#FFF").drawRoundRectComplex(
        STAGE_WIDTH - length - sideGap * 4, STAGE_HEIGHT - height - 5, STAGE_WIDTH - (sideGap * 2 + length * 2), height,
        10, 10, 10, 10);

    stage.addChild(resetBox);

    resetBox.on("click", function (event) {
        if (!paused) {
            resetClear();
            drawBoxes();
            playSound("clickSound");
            paused = false;
        }
    });

    resetBoxText = new createjs.Text("Reset", "24px Comic Sans MS", "#000");
    resetBoxText.textBaseline = "alphabetic";
    resetBoxText.textAlign = 'center';
    resetBoxText.x = resetBox.graphics.command.x + (STAGE_WIDTH - (sideGap * 2 + length * 2)) / 2;
    resetBoxText.y = resetBox.graphics.command.y + height / 2 + checkBoxText.getMeasuredHeight() / 4;

    stage.addChild(resetBoxText);
}

function checkAnswers() {
    let correct = 0;
    if (matchedBoxes.matched.length != boxCount) {
        console.log("You have not finished the matching, weirdo.");
        checkBoxText.text = "Finish Matching!";
        checkBoxText.font = "20px Comic Sans MS";
        createjs.Tween.get(checkBoxText).to({text: "Check!", font: "24px Comic Sans MS"}, 1000);

    } else {
        for (let i = 0; i < matchedBoxes.matched.length; i++) {
            for (let v = 0; v < json.vocabulary.length; v++) {
                if (vocabBoxText[matchedBoxes.matched[i].vocab].text == json.vocabulary[v].word) {
                    if (definitionsList[matchedBoxes.matched[i].definition] == json.vocabulary[v].definition) {
                        console.log("Yay, Matched!");
                        correct++;
                        break;
                    }
                }
            }
        }

        if (correct == boxCount) {
            console.log("Correct!");
            checkBoxText.text = "Correct!";
            createjs.Tween.get(checkBoxText).to({text: "Correct!", font: "24px Comic Sans MS"}, 1000);

            playSound("correctSound");

            // Check if the box count is >= than 6 for the next level, if it is,
            // load next level
            if (json.vocabulary.length - (1 * ((level) * initialBoxCount) + initialBoxCount) >= initialBoxCount) {
                //load next level
                console.log(json.vocabulary.length - (1 * ((level) * initialBoxCount) + initialBoxCount));
                level++;

                shuffleLists();
                resetClear();

                drawBoxes();

                console.log("next level, more than 6");

                stage.addChild(passLevel);
            } else if (json.vocabulary.length - (1 * (level * initialBoxCount) + initialBoxCount) < initialBoxCount &&
                json.vocabulary.length - (1 * (level * initialBoxCount) + initialBoxCount) > 0) {
                console.log("More levelz");
                // change box count to less value of vocab questions
                // load next level
                boxCount = json.vocabulary.length - (1 * (level * initialBoxCount) + initialBoxCount);
                level++;

                console.log(initialBoxCount);

                shuffleLists();
                resetClear();

                drawBoxes();

                console.log("next level, less than 6");

                stage.addChild(passLevel);

            } else if (json.vocabulary.length - (1 * (level * initialBoxCount) + initialBoxCount) <= 0) {
                console.log("No more levels, winner winner chicken dinner");
                stage.addChild(winScreen);
                playSound("winSound");

                winScreen.on("click", function (event) {
                    stage.removeChild(winScreen);

                    level = 0;
                    boxCount = initialBoxCount;

                    paused = false;

                    shuffleLists();
                    resetClear();

                    startGame();
                });
            }
            paused = true;
        } else {
            console.log("Try Again!");
            checkBoxText.text = "Try Again!";
            createjs.Tween.get(checkBoxText).to({text: "Check!", font: "24px Comic Sans MS"}, 1000);

            playSound("incorrectSound");

            resetClear();

            drawBoxes();
            drawBoxText();

            stage.addChild(failLevel);
            paused = true;
        }
    }
}

/**
 * Clear the boxes, lines and text
 *
 */

function resetClear() {
    for (let i = 0; i < vocabDefinitionLines.length; i++) {
        stage.removeChild(vocabDefinitionLines[i]);
    }


    for (let i = 0; i < definitionBoxes.length; i++) {
        stage.removeChild(definitionBoxes[i]);
    }

    for (let i = 0; i < definitionBoxText.length; i++) {
        stage.removeChild(definitionBoxText[i]);
    }

    for (let i = 0; i < vocabBoxes.length; i++) {
        stage.removeChild(vocabBoxes[i]);
    }

    for (let i = 0; i < vocabBoxText.length; i++) {
        stage.removeChild(vocabBoxText[i]);
    }

    matchedBoxes = {matched: []};
}

/**
 * Draw the vocab boxes
 */

function drawBoxes() {

    if (json.vocabulary.length < 6) {
        boxCount = json.vocabulary.length;
    }

    //vocab boxes
    for (let i = 0; i < boxCount; i++) {
        vocabBoxes[i] = new createjs.Shape();

        vocabBoxes[i].graphics.setStrokeStyle(4);
        vocabBoxes[i].graphics.beginStroke("#FFF");

        vocabBoxes[i].graphics.beginFill("#FFF").drawRoundRectComplex(
            sideGap, 100 + (verticalGap * i) + (i * height), length - vocabDefDifference, height,
            10, 10, 10, 10);

        stage.addChild(vocabBoxes[i]);

        vocabBoxes[i].on("click", function (event) {
            clickVocabBox(event);
        });
    }

    //definition boxes
    for (let i = 0; i < boxCount; i++) {
        definitionBoxes[i] = new createjs.Shape();

        definitionBoxes[i].graphics.setStrokeStyle(4);
        definitionBoxes[i].graphics.beginStroke("#FFF");

        definitionBoxes[i].graphics.beginFill("#FFF").drawRoundRectComplex(
            STAGE_WIDTH - (length + sideGap) - vocabDefDifference,
            100 + (verticalGap * i) + (i * height), length + vocabDefDifference, height,
            10, 10, 10, 10);
        stage.addChild(definitionBoxes[i]);

        definitionBoxes[i].on("click", function (event) {
            clickDefinitionBox(event);
        });
    }

    drawBoxText();
}

let vocabBoxText = [];
let definitionBoxText = [];

function drawBoxText() {

    //vocab boxes
    for (let i = 0; i < boxCount; i++) {
        vocabBoxText[i] = textMaker(vocabList[i], 20, vocabBoxes[i], true);

        stage.addChild(vocabBoxText[i]);
    }

    //definition boxes
    for (let i = 0; i < boxCount; i++) {

        definitionBoxText[i] = textSizer(definitionsList[i], 16, definitionBoxes[i], false);
        stage.addChild(definitionBoxText[i]);
    }
}

function textSizer(text, size, box, vocab) {
    let sized = false;
    let sizer = size;

    while (!sized) {
        let boxText = textMaker(text, sizer, box, vocab);
        if (boxText.getMeasuredHeight() > height) {
            sizer--;
        } else {
            sized = true;
        }
    }

    return textMaker(text, sizer, box, vocab);

}

function textMaker(text, size, box, vocab) {
    let boxText = new createjs.Text(text, size + "px Comic Sans MS", "#000");
    boxText.textBaseline = "alphabetic";
    boxText.textAlign = 'center';
    var w = (boxText.getMeasuredWidth()) * boxText.scaleX;
    var h = (boxText.getMeasuredHeight()) * boxText.scaleY;
    boxText.regY = h / 2;
    boxText.lineWidth = (length + (vocab ? 0 - vocabDefDifference : 0 + vocabDefDifference)) - 10;
    boxText.x = box.graphics.command.x + (length + (vocab ? 0 - vocabDefDifference : 0 + vocabDefDifference)) / 2;
    boxText.y = box.graphics.command.y + height / 2 + (vocab ? boxText.getMeasuredHeight() / 4 : (-4));

    return boxText;
}

let matchedBoxes = {
    matched:
        []
};

/**
 * Check if a vocab and definition already are matched
 * To check one of them, set the other as null.
 * Only once can be checked, not compared.
 *
 * @param vocab
 * @param definition
 * @returns {boolean}
 */

function checkIfAlreadyMatched(vocab, definition) {
    if (vocab != null) {
        for (let v = 0; v < matchedBoxes.matched.length; v++) {
            if (matchedBoxes.matched[v].vocab === vocab) {
                return true;
            }
        }
    }

    if (definition != null) {
        for (let d = 0; d < matchedBoxes.matched.length; d++) {
            if (matchedBoxes.matched[d].definition === definition) {
                return true;
            }
        }
    }
}

/**
 * Match Box Outline Colors
 *
 * @type {*[]}
 */

let matchColorsSettings = [
    "#c56cf0", "#ffb8b8", "#e1b12c", "#ff9f1a",
    "#fff200", "#7158e2", "#17c0eb", "#e84393",
    "#ff3838", "#67e6dc"];

/**
 * Vocab & Definition Box Number to make the match
 *
 * @param vocab
 * @param definition
 */

function matchBoxes(vocab, definition) {
    if (!checkIfAlreadyMatched(vocab, null) && !checkIfAlreadyMatched(null, definition)) {
        matchedBoxes.matched.push({vocab: vocab, definition: definition});

        clickedDefinitionBox = undefined;
        clickedVocabBox = undefined;

        vocabBoxes[vocab].graphics.setStrokeStyle(4);
        vocabBoxes[vocab].graphics.beginStroke(matchColorsSettings[(matchedBoxes.matched.length - 1)]);

        vocabBoxes[vocab].graphics.beginFill("#FFF").drawRoundRectComplex(
            sideGap, 100 + (verticalGap * vocab) + (vocab * height), length - vocabDefDifference, height,
            10, 10, 10, 10);

        definitionBoxes[definition].graphics.setStrokeStyle(4);
        definitionBoxes[definition].graphics.beginStroke(matchColorsSettings[(matchedBoxes.matched.length - 1)]);

        definitionBoxes[definition].graphics.beginFill("#FFF").drawRoundRectComplex(
            STAGE_WIDTH - (length + sideGap) - vocabDefDifference,
            100 + (verticalGap * definition) + (definition * height), length + vocabDefDifference, height,
            10, 10, 10, 10);

        vocabDefinitionMatchLine(vocab, definition);
    } else {
        console.log("Oh no, an error has been spotted in the wild!")
    }
}

let vocabDefinitionLines = [];

/**
 * Draw the line between matched boxes
 *
 * @param vocab
 * @param definition
 */

function vocabDefinitionMatchLine(vocab, definition) {

    let vpoint = new createjs.Point(vocabBoxes[vocab].graphics.command.x, vocabBoxes[vocab].graphics.command.y);
    let dpoint = new createjs.Point(definitionBoxes[definition].graphics.command.x, definitionBoxes[definition].graphics.command.y);

    let shape = new createjs.Shape();
    let line = stage.addChild(shape);
    line.graphics.beginStroke(matchColorsSettings[(matchedBoxes.matched.length - 1)])
        .setStrokeStyle(4).moveTo(vpoint.x + length - vocabDefDifference, vpoint.y + (height / 2));
    let cmd = line.graphics.lineTo(vpoint.x + length - vocabDefDifference, vpoint.y + (height / 2)).command;

    createjs.Tween.get(cmd, {loop: false}).to({x: dpoint.x, y: dpoint.y + (height / 2)}, 750);

    vocabDefinitionLines.push(shape);
}


let clickedVocabBox;

/**
 * Click a vocab box
 *
 * @param event
 */

function clickVocabBox(event) {
    for (let i = 0; i < vocabBoxes.length; i++) {
        if (vocabBoxes[i] == event.target) {

            alreadyMatched = checkIfAlreadyMatched(i, null);

            if (!alreadyMatched) {

                vocabBoxes[i].graphics.setStrokeStyle(4);
                vocabBoxes[i].graphics.beginStroke("#000");

                vocabBoxes[i].graphics.beginFill("#FFF").drawRoundRectComplex(
                    sideGap, 100 + (verticalGap * i) + (i * height), length - vocabDefDifference, height,
                    10, 10, 10, 10);
            }

            if (clickedVocabBox != i) {
                if (typeof clickedVocabBox !== "undefined") {
                    unClickVocabBox(clickedVocabBox);
                }
                if (!alreadyMatched) {
                    clickedVocabBox = i;
                }
            }

            if (typeof clickedVocabBox !== "undefined" && typeof clickedDefinitionBox !== "undefined") {
                matchBoxes(clickedVocabBox, clickedDefinitionBox);
            }

            playSound("clickSound");
        }
    }
}

/**
 * Unclick a matched vocab box
 *
 * @param i
 */

function unClickVocabBox(i) {
    vocabBoxes[i].graphics.setStrokeStyle(0);
    vocabBoxes[i].graphics.beginStroke("#FFF");

    vocabBoxes[i].graphics.beginFill("#FFF").drawRoundRectComplex(
        sideGap, 100 + (verticalGap * i) + (i * height), length - vocabDefDifference, height,
        10, 10, 10, 10);
}

let clickedDefinitionBox;

/**
 * Click a definition box
 *
 * @param event
 */

function clickDefinitionBox(event) {
    for (let i = 0; i < definitionBoxes.length; i++) {
        if (definitionBoxes[i] == event.target) {

            alreadyMatched = checkIfAlreadyMatched(null, i);

            if (!alreadyMatched) {

                definitionBoxes[i].graphics.setStrokeStyle(4);
                definitionBoxes[i].graphics.beginStroke("#000");

                definitionBoxes[i].graphics.beginFill("#FFF").drawRoundRectComplex(
                    STAGE_WIDTH - (length + sideGap) - vocabDefDifference,
                    100 + (verticalGap * i) + (i * height), length + vocabDefDifference, height,
                    10, 10, 10, 10);
            }

            if (clickedDefinitionBox != i) {
                if (typeof clickedDefinitionBox !== "undefined") {
                    unClickDefinitionBox(clickedDefinitionBox);
                }
                if (!alreadyMatched) {
                    clickedDefinitionBox = i;
                }
            }

            if (typeof clickedVocabBox !== "undefined" && typeof clickedDefinitionBox !== "undefined") {
                matchBoxes(clickedVocabBox, clickedDefinitionBox);
            }

            playSound("clickSound");
        }
    }
}

/**
 * Unclick a definition box
 *
 * @param i
 */

function unClickDefinitionBox(i) {
    definitionBoxes[i].graphics.setStrokeStyle(0);
    definitionBoxes[i].graphics.beginStroke("#FFF");

    definitionBoxes[i].graphics.beginFill("#FFF").drawRoundRectComplex(
        STAGE_WIDTH - (length + sideGap) - vocabDefDifference,
        100 + (verticalGap * i) + (i * height), length + vocabDefDifference, height,
        10, 10, 10, 10);
}

/** END GAME CODE **/

function endGame() {
    gameStarted = false;

    /** Below this is actual game code. **/
}
