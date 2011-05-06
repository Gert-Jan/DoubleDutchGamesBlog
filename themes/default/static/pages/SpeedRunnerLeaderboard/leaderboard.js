var level = 1;
var mode = 0;
var page = 1;
var user = null;
var score = null;
var rank = null;

var tableIsDirty = true;
var currentHash = "";
var hashUpdateInterval = null;
var currentXML = null;

var totalRuleCount = 0;
var RULES_PER_PAGE = 25;

var domain = "http://leaderboard.progamestudios.com/speedrunner/";

jQuery(document).ready(function(){
	initUI();
	updateHash();
	hashUpdateInterval = setInterval (updateHash, 100);
});

function initUI()
{
	currentHash = getHash(level, mode, page, user, score);
	$('#modeAllTime').addClass('selected');
	$('#mode-panel h2').html('Leaderboard of All Time');
}

function updateHash()
{
	if (window.location.hash != currentHash)
	{
		var params = getQueryParams(window.location.hash);
		setLevel(params['level']);
		setMode(params['mode']);
		setPage(params['page']);
		setHighLight(params['user'], params['score']);
		currentHash = getHash(level, mode, page, user, score);
		window.location.hash = currentHash;
	}
	if (tableIsDirty)
	{
		preTableRefresh();
		var board_url = "proxy.php?level=" + level + "&mode=" + mode + "&page=" + page;
		requestBoard(board_url);
		tableIsDirty = false;
	}
}

function preTableRefresh()
{
	// remove page status
	$('#page-numbers').css('display', 'none');
	// add loading gizmo
	$('#loading').css('display', 'block');
	$('#loading').html('Loading...');
}

function postTableRefresh()
{
	// set page control buttons
	if (page <= 1)
		$('#previousPage').css('display', 'none');
	else
		$('#previousPage').css('display', 'inline');
	if (totalRuleCount < page * RULES_PER_PAGE)
		$('#nextPage').css('display', 'none');
	else
		$('#nextPage').css('display', 'inline');
	// remove loading gizmo
	$('#loading').css('display', 'none');
	// add page status
	if (totalRuleCount > 0)
		$('#page-numbers').html('Rank ' + (page * RULES_PER_PAGE - RULES_PER_PAGE + 1) + ' to ' + Math.min(totalRuleCount, (page * RULES_PER_PAGE)));
	else
		$('#page-numbers').html('There are no scores submitted in this leaderboard.');
	$('#page-numbers').css('display', 'inline');
	document.title = getTitle();
}

function getHash(level, mode, page, user, score)
{
	var hash = "#level=" + level + "&mode=" + mode + "&page=" + page;
	if (user != null)
		hash += "&user=" + user;
	if (score != null)
		hash += "&score=" + score;
	return hash;
}

function getTitle()
{
	return 'SpeedRunner: ' + $('#mode-panel h2').html() + ' of level "' + selectedLevel.idtext + ": " + selectedLevel.text + '"';
}

function getRankString(aRank)
{
	if (aRank == 1)
		return 1 + "st";
	else if (aRank == 3)
		return 3 + "rd";
	else
		return aRank + "th";
}

function getQueryParams(qs)
{
	qs = qs.split("+").join(" ");
	var params = {},
		tokens,
		re = /[?&#]?([^=]+)=([^&]*)/g;

	while (tokens = re.exec(qs))
	{
		params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
    }

    return params;
}

function refreshTable()
{
	tableIsDirty = true;
}

function clearBoard()
{
	$('#score-table').find('tr:gt(0)').remove();
}

function requestBoard(url)
{
	$.ajax({
	  url: url,
	  dataType: "xml",
	  success: boardReceived
	});
}

function isValidData(xml)
{
	return $(xml).find('status').text() == '1' &&
		$(xml).find('errorcode').text() == '0';
}

function boardReceived(xml)
{
	if (isValidData(xml))
	{
		currentXML = xml;
		// remove all rules
		clearBoard();
		// build new table
		totalRuleCount = parseInt($(xml).find('numscores').text());
		buildTable(xml);
		postTableRefresh();
	}
	else
	{
		$('#loading').html('Error: bad values!');
	}
}

function buildTable(xml)
{
	if (isValidData(xml))
	{		
		// add new row insert delays
		var rank = (Math.max(1, page) - 1) * RULES_PER_PAGE;
		$(xml).find('score').each(function()
		{
			var rowData = $(this);
			addRow(rowData, ++rank);
		});
	}
}

function addRow(xml, aRank)
{
	var color = "odd";
	if (aRank % 2 == 0)
		color = "even";
	tempUser = xml.find('name').text();
	tempScore = xml.find('points').text();
	if (tempUser == user &&
		tempScore == score)
	{
		color = "selected";
		rank = aRank;
	}
	var row = '<tr class="' + color + '"><td class="rank">' + aRank + '</td>';
	row += '<td class="name">' + tempUser + '</td>';
	row += '<td class="date">' + xml.find('rdate').text() + '</td>';
	var medal = "bronze";
	if (tempScore > selectedLevel.gold)
		medal = "gold";
	else if (tempScore > selectedLevel.silver)
		medal = "silver";
	row += '<td class="medal"><img src="' + statics_url + '/img/' + medal + '.png"></td>';
	row += '<td class="score">' + tempScore + '</td>';
	var url = domain + getHash(level, mode, page, tempUser, tempScore);
	row += '<td class="share">' + 
		'<a href="' + url + '"><img src="' + statics_url + '/img/link.png" alt="Direct link to this score highlight"></a>' + 
		'<script>function fbs_click() {u=location.href;t=document.title;window.open("http://www.facebook.com/sharer.php?u="+encodeURIComponent(u)+"&t="+encodeURIComponent(t),"sharer","toolbar=0,status=0,width=626,height=436");return false;}</script><a href="http://www.facebook.com/share.php?u=' + url + '" onclick="return fbs_click()" target="_blank"><img src="' + statics_url + '/img/fb-share.png" alt="Share score on Facebook" /></a>' + 
		'<a href="http://twitter.com/home?status=Check out my %23SpeedRunner score! ' + escape(url) + '" title="Tweet this score" target="_blank"><img src="' + statics_url + '/img/twitter.png" alt="Share score on Twitter"></a>' + 
		'</td></tr>';
	$('#score-table tr:last').after(row);
}

function setLevel(newLevel)
{
	if (newLevel != level &&
		isValidLevel(newLevel))
	{
		level = parseInt(newLevel);
		refreshTable();
	}
}

function setMode(newMode)
{
	if (newMode != mode &&
		isValidMode(newMode))
	{
		mode = parseInt(newMode);
		
		clearModes();
		switch(mode)
		{
			default:
			case 0:
				$('#modeAllTime').addClass('selected');
				$('#mode-panel h2').html('Leaderboard of All Time');
				break;
			case 1:
				$('#mode30Days').addClass('selected');
				$('#mode-panel h2').html('Leaderboard of the last 30 Days');
				break;
			case 2:
				$('#mode7Days').addClass('selected');
				$('#mode-panel h2').html('Leaderboard of the last 7 Days');
				break;
			case 3:
				$('#modeToday').addClass('selected');
				$('#mode-panel h2').html('Leaderboard of Today');
				break;
		}
		
		refreshTable();
	}
}

function setPage(newPage)
{
	if (newPage != page && 
		isValidPage(newPage))
	{
		page = parseInt(newPage);
		refreshTable();
	}
}

function setHighLight(newUser, newScore)
{
	if (user != newUser || score != newScore)
	{
		user = newUser;
		score = newScore;
		boardReceived(currentXML);
	}
}

function isValidLevel(aLevel)
{
	var result = false;
	$.each(levels.level, function(key, val) {
		if (val != null && val.id == parseInt(aLevel))
		{
			result = true;
			// break each by returning false
			return false;
		}
	});
	return result;
}

function isValidMode(aMode)
{
	var modeInt = parseInt(aMode);
	if (isInt(aMode) && modeInt > -1 && modeInt < 4)
		return true;
	return false;
}

function isValidPage(aPage)
{
	var pageInt = parseInt(aPage);
	return isInt(aPage) && pageInt > 0;
}

function isInt(n)
{ 
	var m = parseInt(n); 
	if (isNaN(m)) return false; 
	return n==m && n.toString()==m.toString(); 
}

function modeToday()
{
	window.location.hash = getHash(level, 3, 1, user, score);
}

function mode7Days()
{
	window.location.hash = getHash(level, 2, 1, user, score);
}

function mode30Days()
{
	window.location.hash = getHash(level, 1, 1, user, score);
}

function modeAllTime()
{
	window.location.hash = getHash(level, 0, 1, user, score);
}

function nextPage()
{
	window.location.hash = getHash(level, mode, page + 1, user, score);
}

function previousPage()
{
	window.location.hash = getHash(level, mode, page - 1, user, score);
}

function clearModes()
{
	$('#modeToday').removeClass('selected');
	$('#mode7Days').removeClass('selected');
	$('#mode30Days').removeClass('selected');
	$('#modeAllTime').removeClass('selected');
}