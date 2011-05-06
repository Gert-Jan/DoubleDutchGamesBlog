// vars
var mousePosX = 0;
var xPosition = 0;
var acceleration = 0;
var desiredPosX = 0;

var velocity = 0;
var active = false;
var interactive = false;
var hoverLevel = null;
var selectedLevel = null;

var DEADZONE = 100;
var ACCELERATION_MULTIPLIER = 0.000005;
var MAX_VELOCITY = 0.02;
var EASE_OUT = 1.2;

var levels = 
{
	"level": 
	[
        {"key": 0, "id": 1, "idtext": "0", "text": "Prologue", "startX": 0, "endX": 150, "posX": 0, "gold": 2000, "silver": 1500},
        {"key": 1, "id": 2, "idtext": "1", "text": "Another Bomb", "startX": 151, "endX": 300, "posX": 150, "gold": 3200, "silver": 3000},
        {"key": 2, "id": 3, "idtext": "2", "text": "Save the Scientists!", "startX": 301, "endX": 450, "posX": 300, "gold": 4000, "silver": 3000},
		{"key": 3, "id": 5, "idtext": "3", "text": "In the City", "startX": 451, "endX": 600, "posX": 450, "gold": 3000, "silver": 2000},
		{"key": 4, "id": 6, "idtext": "4", "text": "Across the Rooftops", "startX": 601, "endX": 750, "posX": 600, "gold": 4000, "silver": 2000},
		{"key": 5, "id": 7, "idtext": "5", "text": "Up the Towers", "startX": 751, "endX": 900, "posX": 750, "gold": 2500, "silver": 1500},
		{"key": 6, "id": 9, "idtext": "6", "text": "Hiding Out", "startX": 901, "endX": 1050, "posX": 900, "gold": 3000, "silver": 1500},
		{"key": 7, "id": 10, "idtext": "7", "text": "Finding the Bomber", "startX": 1051, "endX": 1200, "posX": 1050, "gold": 3000, "silver": 2500},
		{"key": 8, "id": 11, "idtext": "8", "text": "Almost There", "startX": 1201, "endX": 1350, "posX": 1200, "gold": 3500, "silver": 2000},
		{"key": 9, "id": 13, "idtext": "I", "text": "Bonus Level", "startX": 1375, "endX": 1500, "posX": 1375, "gold": 2500, "silver": 1500},
		{"key": 10, "id": 14, "idtext": "II", "text": "Bonus Level", "startX": 1501, "endX": 1625, "posX": 1500, "gold": 2500, "silver": 1500},
		{"key": 11, "id": 15, "idtext": "III", "text": "Bonus Level", "startX": 1626, "endX": 1750, "posX": 1625, "gold": 3000, "silver": 2000},
		{"key": 12, "id": 16, "idtext": "X", "text": "The Challenge", "startX": 1750, "endX": 2000, "posX": 1750, "gold": 2500, "silver": 1500},
    ]
};

// event
jQuery(document).ready(init);

// functions
function init()
{
	var levelsHTML = "";
	$.each(levels.level, function(key, val) {
		if (val != null)
		{
			var x = val.posX - 240 * 0.2588190448135646;
			levelsHTML += "\t\t\t<div class=\"level-selection\" id=\"level" + key + "\" style=\"left: " + x + "px\; top: 200px\;\" onselectstart=\"selectLevel();\">\n";
			levelsHTML += "\t\t\t\t<div class=\"level-number\">" + val.idtext + "</div>\n";
			levelsHTML += "\t\t\t\t<div class=\"level-name\">" + val.text + "</div>\n";
			levelsHTML += "\t\t\t</div>";
		}
	});
	$('div#city-levels').html(levelsHTML);

	selectedLevel = getLevelById(level);
	slideInLevel(selectedLevel);
	desiredPosX = getDesiredPosX();
	// udpate look
	updateInterval = setInterval (update, 40);
	// mouse move
	$('#level-select').mousemove(function(e){
		mouseMove(e.pageX - $('#level-select').offset().left, this.offsetWidth);
	});
	// mouse click
	$('#level-select').click(selectLevel);
}

function mouseOver()
{
	active = true;
	interactive = true;
}

function mouseOut()
{
	active = false;
	interactive = false;
}

function mouseMove(mouseX, width)
{
	mousePosX = mouseX;
	center = width / 2;
	if (mouseX > center + DEADZONE)
	{
		active = true;
		acceleration = (mouseX - center - DEADZONE) * ACCELERATION_MULTIPLIER;
	}
	else if (mouseX < center - DEADZONE)
	{
		active = true;
		acceleration = (mouseX - (center - DEADZONE)) * ACCELERATION_MULTIPLIER;
	}
	else
		active = false;
}

function selectLevel()
{
	var aLevel = getHoverLevel();
	if (aLevel != null)
		window.location.hash = getHash(aLevel.id, mode, 1);
	return false;
}

function getMouseX()
{
	if (!e) var e = window.event;
	if (e.pageX || e.pageY)
		return e.pageX;
	else if (e.clientX || e.clientY)
		return e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
}

function update()
{
	updateScrolling();
	updateLevelPanels();
}

function updateLevelPanels()
{
	var prevHoverLevel = hoverLevel;
	hoverLevel = getHoverLevel();

	// hover level
	if (hoverLevel != prevHoverLevel)
	{
		if (prevHoverLevel != null && prevHoverLevel.id != selectedLevel.id)
			slideOutLevel(prevHoverLevel);
		if (hoverLevel != null && hoverLevel.id != selectedLevel.id)
			slideInLevel(hoverLevel);
	}
	
	// selected level
	if (level != selectedLevel.id)
	{
		if (hoverLevel == null || selectedLevel.id != hoverLevel.id)
			slideOutLevel(selectedLevel);
		selectedLevel = getLevelById(level);
		if (hoverLevel == null || selectedLevel.id != hoverLevel.id)
			slideInLevel(selectedLevel);
		desiredPosX = getDesiredPosX();
	}
}

function slideInLevel(aLevel)
{
	var x = aLevel.posX;
	$('div#level' + aLevel.key).clearQueue();
	$('div#level' + aLevel.key).animate({'top': -40, 'left': x}, 200, null);
}

function slideOutLevel(aLevel)
{
	var x = aLevel.posX - 240 * 0.2588190448135646;
	$('div#level' + aLevel.key).clearQueue();
	$('div#level' + aLevel.key).animate({'top': 200, 'left': x}, 200, null);
}

function updateScrolling()
{
	if (active)
	{
		velocity += acceleration;
		velocity = clamp(velocity, -MAX_VELOCITY, MAX_VELOCITY);
		xPosition += velocity;
		xPosition = clamp(xPosition, 0, 1);
		if (xPosition == 0 || xPosition == 1)
			velocity = 0;
	}
	else if (!interactive)
	{
		velocity = (desiredPosX - xPosition) * Math.max(10, Math.abs(desiredPosX - xPosition) * 10) * 0.025;
		xPosition += velocity;
		xPosition = clamp(xPosition, 0, 1);
		if (xPosition == 0 || xPosition == 1)
			velocity = 0;
	}
	else
	{
		velocity /= EASE_OUT;
		xPosition += velocity;
		xPosition = clamp(xPosition, 0, 1);
		if (xPosition == 0 || xPosition == 1)
			velocity = 0;
	}
	
	$('div#city-sky').css('left', Math.round(xPosition * -400) + 'px');
	$('div#city-background').css('left', Math.round(xPosition * -625) + 'px');
	$('div#city-foreground').css('left', Math.round(xPosition * -1100) + 'px');
	$('div#city-levels').css('left', Math.round(xPosition * -1100) + 'px');
}

function getHoverLevel()
{
	if (!interactive)
		return null;
	var worldX = xPosition * 1100 + mousePosX;
	var levelObj = null;
	$.each(levels.level, function(key, val) {
		if (val != null && worldX > val.startX && worldX < val.endX)
		{
			levelObj = val;
			// break each by returning false
			return false;
		}
	});
	return levelObj;
}

function getLevelById(levelId)
{
	var levelObj = null;
	$.each(levels.level, function(key, val) {
		if (val.id == levelId)
		{
			levelObj = val;
			// break each by returning false
			return false;
		}
	});
	return levelObj;
}

function getDesiredPosX()
{
	return (selectedLevel.posX - 300) / 1100;
}

function clamp(value, min, max)
{
    return Math.max(min, Math.min(max, value))
}