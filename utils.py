import os
import re
import unicodedata

from google.appengine.ext import webapp

import config

import django.conf
from django import template
from django.template import loader

def slugify(s):
  s = unicodedata.normalize('NFKD', s).encode('ascii', 'ignore')
  return re.sub('[^a-zA-Z0-9-]+', '-', s).strip('-')


def format_post_path(post, num):
  slug = slugify(post.title)
  if num > 0:
    slug += "-" + str(num)
  return config.post_path_format % {
      'slug': slug,
      'year': post.published.year,
      'month': post.published.month,
      'day': post.published.day,
  }


def get_template_vals_defaults(template_vals=None):
  if template_vals is None:
    template_vals = {}
  template_vals.update({
      'config': config,
      'devel': os.environ['SERVER_SOFTWARE'].startswith('Devel'),
  })
  return template_vals


def render_template(template_name, template_vals=None, theme=None):
  # side-step internal register mechanism
  if not template.libraries.get('bloggart_tags', None):
    import bloggart_tags as tag_lib
    template.libraries['bloggart_tags'] = tag_lib.register

  template_vals = get_template_vals_defaults(template_vals)
  template_vals.update({'template_name': template_name})
  tpl = loader.get_template(template_name)
  rendered = tpl.render(template.Context(template_vals))
  return rendered


def _get_all_paths():
  import static
  keys = []
  q = static.StaticContent.all(keys_only=True).filter('indexed', True)
  cur = q.fetch(1000)
  while len(cur) == 1000:
    keys.extend(cur)
    q = static.StaticContent.all(keys_only=True)
    q.filter('indexed', True)
    q.filter('__key__ >', cur[-1])
    cur = q.fetch(1000)
  keys.extend(cur)
  return [x.name() for x in keys]


def _regenerate_sitemap():
  import static
  import gzip
  from StringIO import StringIO
  paths = _get_all_paths()
  rendered = render_template('sitemap.xml', {'paths': paths})
  static.set('/sitemap.xml', rendered.encode('utf-8'), 'application/xml', False)
  s = StringIO()
  gzip.GzipFile(fileobj=s,mode='wb').write(rendered)
  s.seek(0)
  renderedgz = s.read()
  static.set('/sitemap.xml.gz',renderedgz, 'application/x-gzip', False)
  if config.google_sitemap_ping:
      ping_googlesitemap()     

def ping_googlesitemap():
  import urllib
  from google.appengine.api import urlfetch
  google_url = 'http://www.google.com/webmasters/tools/ping?sitemap=http://' + config.host + '/sitemap.xml.gz'
  response = urlfetch.fetch(google_url, '', urlfetch.GET)
  if response.status_code / 100 != 2:
    raise Warning("Google Sitemap ping failed", response.status_code, response.content)