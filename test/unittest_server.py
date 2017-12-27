# -*- coding: utf-8 -*-
import os
import glob
from datetime import datetime
import argparse
from tornado.web import Application, StaticFileHandler, RequestHandler
from tornado.ioloop import IOLoop

base_dir = os.path.dirname(__file__)


class MainHandler(RequestHandler):
    def get(self):
        creation_date = datetime.now().strftime('%Y/%m/%d %X')
        items = []
        for name in glob.iglob(os.path.join(base_dir, '*.html')):
            items.append(os.path.basename(name))
        self.render("index.html", title=self.request.uri, creation_date=creation_date, items=items)


class NoCacheStaticFileHandler(StaticFileHandler):

    def get_cache_time(self,path,modified,mime_type):
        return 0


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--port', '-p', type=int, default=8888, help='Port number')
    args = parser.parse_args()
    httpd = Application([
        (r"/", MainHandler),
        (r"/(.*)", StaticFileHandler, {'path': './', 'default_filename': 'index.html'})],
        template_path=os.path.join(base_dir, 'templates'),
    )
    httpd.listen(args.port)
    print('unittest serving at', ':', args.port)
    IOLoop.instance().start()


if __name__ == '__main__':
    main()
