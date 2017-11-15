# -*- coding: utf-8 -*-
import argparse
from tornado.web import Application, StaticFileHandler
from tornado.ioloop import IOLoop


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--port', '-p', type=int, default=8888, help='Port number')
    args = parser.parse_args()
    httpd = Application([
        (r"/(.*)", StaticFileHandler, {'path': './', 'default_filename': 'index.html'})
    ])
    httpd.listen(args.port)
    print('unittest serving at', ':', args.port)
    IOLoop.instance().start()


if __name__ == '__main__':
    main()
