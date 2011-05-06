var formHTML;
var cookie;
window.onload = function()
{
	// save form
	formHTML = document.getElementById('rewards').innerHTML;
	// check cookie for secret
	cookie = getCookie("reward_secret");
	if (cookie != null && cookie != "")
		submitform(cookie);
}

// http://www.w3schools.com/JS/js_cookies.asp
function setCookie(c_name,value,exdays)
{
	var exdate=new Date();
	exdate.setDate(exdate.getDate() + exdays);
	var c_value=escape(value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());
	document.cookie=c_name + "=" + c_value;
}

// http://www.w3schools.com/JS/js_cookies.asp
function getCookie(c_name)
{
	var i,x,y,ARRcookies=document.cookie.split(";");
	for (i=0;i<ARRcookies.length;i++)
	{
		x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
		y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
		x=x.replace(/^\s+|\s+$/g,"");
		if (x==c_name)
		{
			return unescape(y);
		}
	}
}

function submitform(secret)
{
	var request = false;
	if (window.XMLHttpRequest)
	{ // browsers
		request = new XMLHttpRequest();
	}
	else if (window.ActiveXObject)
	{ // IE
		try
		{
			request = new ActiveXObject("Msxml2.XMLHTTP");
		} 
		catch (e)
		{ // MS Fail
			try
			{
				request = new ActiveXObject("Microsoft.XMLHTTP");
			}
			catch (e){}
		}
	}
	
	request.onreadystatechange = function()
	{
		if (request.readyState == 4)
		{
			if (request.status == 200)
			{
				if (cookie == null || cookie == "")
					_gaq.push(['_trackEvent', 'SpeedRunner', 'RewardSubmit', 'CorrectPassword']);
				document.getElementById('rewards').innerHTML = request.responseText;
				setCookie("reward_secret", secret, 3650);
			}
			else
			{
				_gaq.push(['_trackEvent', 'SpeedRunner', 'RewardSubmit', 'WrongPassword']);
				alert("Wrong password.\nWin a gold medal in every level of SpeedRunner to recieve the code.");
				document.getElementById('rewards').innerHTML = formHTML
			}
		}
	}
	request.open('GET', '/speedrunner/reward/' + secret.toLowerCase(), true);
	request.send(null);
	document.getElementById('rewards').innerHTML = 'loading...';
}

function disableEnterKey(e)
{
	var key;
	if(window.event)
		key = window.event.keyCode; //IE
	else
		key = e.which; //browsers
	if(key == 13)
	{
		submitform(document.forms['reward_form'].elements['secret'].value);
		return false;
	}
	else
		return true;
}