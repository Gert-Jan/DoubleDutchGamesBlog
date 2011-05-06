from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app
from google.appengine.api import urlfetch

modenames = ["alltime", "last30days", "last7days", "today"]

class ProxyHandler(webapp.RequestHandler):
    
    def get(self):
        guid = "" # fill your playtomic guid herer
        swfid = 0 # setup the right playtomic swfid
        table = self.request.get("level") or 1
        try:
            mode = int(self.request.get("mode")) or 0
            mode %= len(modenames)
        except ValueError:
            mode = 0
        page = self.request.get("page") or 1
        modename = modenames[mode]
        url = "http://g%s.api.playtomic.com/leaderboards/list.aspx?swfid=%s&table=%s&mode=%s&highest=y&page=%s&perpage=25" % (guid, swfid, table, modename, page)
        result = urlfetch.fetch(url)
        if result.status_code == 200:
            self.response.out.write(result.content)
        else:
            self.response.out.write("error %s" % result.status_code)

application = webapp.WSGIApplication([('.*', ProxyHandler)])

def main():
    run_wsgi_app(application)

if __name__ == "__main__":
    main()