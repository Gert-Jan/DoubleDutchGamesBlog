import datetime
import logging
import os

from google.appengine.ext import deferred
from google.appengine.ext import webapp
from google.appengine.api import users

import config
import markup
import models
import post_deploy
import utils

from django import forms

class ModelFormOptions(object):
  """A simple class to hold internal options for a ModelForm class.
  
  Instance attributes:
    model: a db.Model class, or None
    fields: list of field names to be defined, or None
    exclude: list of field names to be skipped, or None

  These instance attributes are copied from the 'Meta' class that is
  usually present in a ModelForm class, and all default to None.
  """

  def __init__(self, options=None):
    self.model = getattr(options, 'model', None)
    self.fields = getattr(options, 'fields', None)
    self.exclude = getattr(options, 'exclude', None)

class InitialDataForm(object):
  def __init__(self, instance=None, initial=None, *args, **kwargs):
    opts = ModelFormOptions(getattr(self, 'meta', None))
    object_data = {}
    if instance is not None:
      for name, prop in instance.properties().iteritems():
        if opts.fields and name not in opts.fields:
          continue
        if opts.exclude and name in opts.exclude:
          continue
        if hasattr(prop, 'get_value_for_form'):
          object_data[name] = prop.get_value_for_form(instance)
        else:
          object_data[name] = getattr(instance, name)
    if initial is not None:
      object_data.update(initial)

    kwargs['initial'] = object_data
    super(InitialDataForm, self).__init__(*args, **kwargs)

class PostForm(InitialDataForm, forms.Form):
  title = forms.CharField(widget=forms.TextInput(attrs={'id':'name'}))
  author = forms.ChoiceField(
    choices=[(k, v) for k, v in config.authors.iteritems()])
  body = forms.CharField(widget=forms.Textarea(attrs={
      'id':'message',
      'rows': 10,
      'cols': 20}))
  body_markup = forms.ChoiceField(
    choices=[(k, v[0]) for k, v in markup.MARKUP_MAP.iteritems()])
  tags = forms.CharField(widget=forms.Textarea(attrs={'rows': 5, 'cols': 20}))
  draft = forms.BooleanField(required=False)
  class Meta:
    model = models.BlogPost
    fields = [ 'title', 'author', 'body', 'tags' ]


def with_post(fun):
  def decorate(self, post_id=None):
    post = None
    if post_id:
      post = models.BlogPost.get_by_id(int(post_id))
      if not post:
        self.error(404)
        return
    fun(self, post)
  return decorate


class BaseHandler(webapp.RequestHandler):
  def render_to_response(self, template_name, template_vals=None, theme=None):
    if not template_vals:
      template_vals = {}
    template_vals.update({
        'path': self.request.path,
        'handler_class': self.__class__.__name__,
        'is_admin': True,
    })
    template_name = os.path.join("admin", template_name)
    self.response.out.write(utils.render_template(template_name, template_vals,
                                                  theme))


class AdminHandler(BaseHandler):
  def get(self):
    from generators import generator_list
    offset = int(self.request.get('start', 0))
    count = int(self.request.get('count', 20))
    posts = models.BlogPost.all().order('-published').fetch(count, offset)
    template_vals = {
        'offset': offset,
        'count': count,
        'last_post': offset + len(posts) - 1,
        'prev_offset': max(0, offset - count),
        'next_offset': offset + count,
        'posts': posts,
        'generators': [cls.__name__ for cls in generator_list],
    }
    self.render_to_response("index.html", template_vals)


class PostHandler(BaseHandler):
  def render_form(self, form):
    self.render_to_response("edit.html", {'form': form})

  @with_post
  def get(self, post):
    current_user = users.get_current_user().nickname()
    self.render_form(PostForm(
        instance=post,
        initial={
          'author': post and post.author or current_user in config.authors and current_user or config.default_author,
          'draft': post and not post.path,
          'body_markup': post and post.body_markup or config.default_markup,
        }))

  @with_post
  def post(self, post):
    current_user = users.get_current_user().nickname()
    form = PostForm(data=self.request.POST, instance=post,
                    initial={
                      'draft': post and post.published is None,
                      'author': current_user in config.authors and current_user or config.default_author})
    if form.is_valid():
      data = {
        'title': form.cleaned_data['title'],
        'author': form.cleaned_data['author'],
        'body': form.cleaned_data['body'],
        'body_markup': form.cleaned_data['body_markup'],
      }
      if post is None:
        post = models.BlogPost(**data)
      else:
        for name, value in data.iteritems():
          setattr(post, name, value)
      
      post.tags = post.properties()['tags'].make_value_from_form(form.cleaned_data['tags'])
      
      if form.cleaned_data['draft']:# Draft post
        post.published = datetime.datetime.max
        post.put()
      else:
        if not post.path: # Publish post
          post.updated = post.published = datetime.datetime.now()
        else:# Edit post
          post.updated = datetime.datetime.now()
        post.publish()
      self.render_to_response("published.html", {
          'post': post,
          'draft': form.cleaned_data['draft']})
    else:
      self.render_form(form)

class DeleteHandler(BaseHandler):
  @with_post
  def post(self, post):
    if post.path:# Published post
      post.remove()
    else:# Draft
      post.delete()
    self.render_to_response("deleted.html", None)


class PreviewHandler(BaseHandler):
  @with_post
  def get(self, post):
    # Temporary set a published date iff it's still
    # datetime.max. Django's date filter has a problem with
    # datetime.max and a "real" date looks better.
    if post.published == datetime.datetime.max:
      post.published = datetime.datetime.now()
    self.response.out.write(utils.render_template('post.html', {
        'post': post,
        'is_admin': True}))


class RegenerateHandler(BaseHandler):
  def post(self):
    deferred.defer(post_deploy.PostRegenerator().regenerate)
    deferred.defer(post_deploy.PageRegenerator().regenerate)
    deferred.defer(post_deploy.try_post_deploy, force=True)
    self.render_to_response("regenerating.html")


class PageForm(InitialDataForm, forms.Form):
  path = forms.RegexField(
    widget=forms.TextInput(attrs={'id':'path'}), 
    regex='(/[a-zA-Z0-9/]+)')
  title = forms.CharField(widget=forms.TextInput(attrs={'id':'name'}))
  template = forms.ChoiceField(choices=config.page_templates.items())
  body = forms.CharField(widget=forms.Textarea(attrs={
      'id':'body',
      'rows': 10,
      'cols': 20}))
  indexed = forms.BooleanField(required=False)
  class Meta:
    model = models.Page
    fields = [ 'path', 'title', 'template', 'body', 'indexed' ]

  def clean_path(self):
    data = self.cleaned_data['path']
    existing_page = models.Page.get_by_key_name(data)
    if not data and existing_page:
      raise forms.ValidationError("The given path already exists.")
    return data


class PageAdminHandler(BaseHandler):
  def get(self):
    offset = int(self.request.get('start', 0))
    count = int(self.request.get('count', 20))
    pages = models.Page.all().order('-updated').fetch(count, offset)
    template_vals = {
        'offset': offset,
        'count': count,
        'prev_offset': max(0, offset - count),
        'next_offset': offset + count,
        'last_page': offset + len(pages) - 1,
        'pages': pages,
    }
    self.render_to_response("indexpage.html", template_vals)


def with_page(fun):
  def decorate(self, page_key=None):
    page = None
    if page_key:
      page = models.Page.get_by_key_name(page_key)
      if not page:
        self.response.headers['Content-Type'] = 'text/plain'
        self.response.out.write('404 :(\n' + page_key)
        #self.error(404)
        return
    fun(self, page)
  return decorate


class PageHandler(BaseHandler):
  def render_form(self, form):
    self.render_to_response("editpage.html", {'form': form})

  @with_page
  def get(self, page):
    self.render_form(PageForm(
        instance=page,
        initial={
          'path': page and page.path or '/',
          'indexed': (page and page.indexed) or not page,
        }))

  @with_page
  def post(self, page):
    form = None
    # if the path has been changed, create a new page
    if page and page.path != self.request.POST['path']:
      form = PageForm(data=self.request.POST, instance=None, initial={})
    else:
      form = PageForm(data=self.request.POST, instance=page, initial={})
    if form.is_valid():
      oldpath = form.cleaned_data['path']
      if page:
        oldpath = page.path
      
      data = {
        'path': form.cleaned_data['path'],
        'title': form.cleaned_data['title'],
        'body': form.cleaned_data['body'].encode('utf-8'),
        'template': form.cleaned_data['template'],
        'indexed': form.cleaned_data['indexed'],
      }
      if page is None:
        page = models.Page(**data)
      else:
        for name, value in data.iteritems():
          setattr(page, name, value)

      page.updated = datetime.datetime.now()
      page.publish()
      # path edited, remove old stuff
      if page.path != oldpath:
        oldpage = models.Page.get_by_key_name(oldpath)
        oldpage.remove()
      self.render_to_response("publishedpage.html", {'page': page})
    else:
      self.render_form(form)


class PageDeleteHandler(BaseHandler):
  @with_page
  def post(self, page):
    page.remove()
    self.render_to_response("deletedpage.html", None)
