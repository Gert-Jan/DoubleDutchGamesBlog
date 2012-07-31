# Name of the blog
blog_name = 'DoubleDutch Games'
blog_name_header = 'DoubleDutch Games'

# Your name (used for copyright info)
author_name = 'DoubleDutch Games'

# Default author key
default_author = 'doubledutchgames'

# List of authors
authors = {
	'doubledutchgames': 'DoubleDutch Games',
	'caspervanest': 'Cas',
	'Stolk.GJ': 'GJ',
}

# (Optional) slogan
slogan = 'Stories about Game Design and Game Technology'

# The hostname this site will primarially serve off (used for Atom feeds)
host = 'www.doubledutchgames.com'

# Selects the theme to use. Theme names correspond to directories under
# the 'themes' directory, containing templates and static content.
theme = 'default'

# List of page templates
page_templates = {
	'Theme.html': 'Theme',
	'Simple.html': 'Simple',
	'Empty.html': 'Empty',
	'SpeedRunner.html': 'SpeedRunner',
	'SpeedRunnerLeaderboard.html': 'SpeedRunner Leaderboard',
}

# Defines the URL organization to use for blog postings. Valid substitutions:
#   slug - the identifier for the post, derived from the title
#   year - the year the post was published in
#   month - the month the post was published in
#   day - the day the post was published in
post_path_format = '/%(year)d/%(month)02d/%(slug)s'

# A nested list of sidebar menus, for convenience. If this isn't versatile
# enough, you can edit themes/default/base.html instead.
sidebars = [
  ('DoubleDutch On', [
    '<a href="http://www.twitter.com/dd_games" alt="Twitter" target="_blank"><img src="/static/default/images/twitter_icon.gif" class="icon"></a><a href="http://www.facebook.com/pages/DoubleDutch-Games/171363252897944" alt="Facebook" target="_blank"><img src="/static/default/images/facebook_icon.gif" class="icon"></a><a href="/feeds/atom.xml" alt="RSS"  target="_blank"><img src="/static/default/images/rss_icon.gif" class="icon"></a>',
    '<a href="http://www.doubledutchgames.com/contact/">Contact us</a>',
  ]),
  ('Friends', [
    '<a href="http://www.musicbyjonathan.com/" target="_blank">MusicByJonathan</a>',
    '<a href="http://wwww.gerritwillemse.com/" target="_blank">Gerrit Willemse</a>',
    '<a href="http://www.robinkeijzer.com/" target="_blank">Robin Keijzer</a>',
    '<a href="http://glow.inque.org/wp/" target="_blank">Thijs Kruithof</a>',
    '<a href="http://www.jaywalkersinteractive.com/" target="_blank">Jaywalkers Interactive</a>',
    '<a href="https://www.facebook.com/pages/Ultimo-Indie-Games/162579680465185" target="_blank">Timo Visser</a>',
  ]),
  ('Blogroll', [
    '<a href="http://www.tigsource.com/" target="_blank">TIGSource</a>',
    '<a href="http://www.indiegames.com/" target="_blank">Indie Games</a>',
    '<a href="http://www.wolfire.com/" target="_blank">Wolfire</a>',
  ]),
  ('Presskit', [
    '<a href="http://press.doubledutchgames.com">DoubleDutch Games</a>',
    '<a href="http://press.doubledutchgames.com/sheet.php?p=Speedrunner_HD">Speedrunner HD</a>',
    '<a href="http://press.doubledutchgames.com/sheet.php?p=Chaos_Battle">Chaos Battle</a>',
   ]),
]

# Number of entries per page in indexes.
posts_per_page = 10

# The mime type to serve HTML files as.
html_mime_type = "text/html; charset=utf-8"

# To use disqus for comments, set this to the 'short name' of the disqus forum
# created for the purpose.
disqus_forum = 'doubledutchgamesblog'

# Length (in words) of summaries, by default
summary_length = 200

# If you want to use Google Analytics, enter your 'web property id' here
analytics_id = 'UA-18419693-1'

# If you want to use PubSubHubbub, supply the hub URL to use here.
hubbub_hub_url = 'http://pubsubhubbub.appspot.com/'

# If you want to ping Google Sitemap when your sitemap is generated change this to True, else False
# see: http://www.google.com/support/webmasters/bin/answer.py?hl=en&answer=34609 for more information
google_sitemap_ping = True

# If you want to use Google Site verification, go to
# https://www.google.com/webmasters/tools/ , add your site, choose the 'upload
# an html file' method, then set the NAME of the file below.
# Note that you do not need to download the file provided - just enter its name
# here.
google_site_verification = None

# Default markup language for entry bodies (defaults to html).
default_markup = 'html'

# Syntax highlighting style for RestructuredText and Markdown,
# one of 'manni', 'perldoc', 'borland', 'colorful', 'default', 'murphy',
# 'vs', 'trac', 'tango', 'fruity', 'autumn', 'bw', 'emacs', 'pastie',
# 'friendly', 'native'.
highlighting_style = 'friendly'

# Absolute url of the blog application use '/blog' for host/blog/
# and '' for host/.Also remember to change app.yaml accordingly
url_prefix = ''

# Defines where the user is defined in the rel="me" of your pages.
# This allows you to expand on your social graph.
rel_me = None

# For use a feed proxy like feedburne.google.com
feed_proxy = None

# To use Google Friends Connect.                                          
# If you want use Google Friends Connect, go to http://www.google.com/friendconnect/ 
# and register your domain for get a Google Friends connect ID.
google_friends_id = None
google_friends_comments = True # For comments.
google_friends_members  = True # For a members container.

# To format the date of your post.
# http://docs.djangoproject.com/en/1.1/ref/templates/builtins/#now
date_format = "d F, Y"
