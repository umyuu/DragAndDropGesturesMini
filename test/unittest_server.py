# -*- coding: utf8 -*-
"""
    unittest server
"""
from glob import glob
from html import escape
from http import HTTPStatus
from http.server import HTTPServer, SimpleHTTPRequestHandler
from ipaddress import ip_address
from os import chdir
from pathlib import Path
from socketserver import ThreadingMixIn
from string import Template


BASE_DIR = Path(__file__).parent


def index_html():
    """

    :return:
    """
    html = """<!DOCTYPE html>\n<html>\n<head>
    <meta charset="utf-8" />\n    <title>Unittest Server</title>
</head>
<body>
<main role="main">
$body
    <footer><hr><span>$creation_time</span></footer>
</main>
</body>\n</html>"""
    return Template(html)


def html_body():
    """
        html body
    """
    body = ""
    for item in map(escape, glob('**/*.html', recursive=True)):
        body += f'    <li><a href="{item}" target="_top" rel="noopener">{item}</a></li>\n'
    return body


class MyHandler(SimpleHTTPRequestHandler):
    """
        MyHandler
    """
    def do_GET(self):
        """

        :return:
        """
        if self.path != "/":
            # ルートパス以外は要求コンテンツをレスポンスとして返す
            super().do_GET()
            return
        self.send_response(HTTPStatus.OK)
        self.end_headers()

        s = index_html().substitute({"body": html_body(),
                                     "creation_time": escape(self.date_time_string())})
        self.wfile.write(s.encode('utf-8'))


class ThreadingHTTPServer(ThreadingMixIn, HTTPServer):
    """
        ThreadingHTTPServer
    """
    daemon_threads = True

    def verify_request(self, request, client_address):
        """
        IPアドレスによる簡易的なアクセス制限
        ループバック,ローカルアドレス以外は接続拒否
        :param request:
        :param client_address:
        :return:
        """
        req_ip = ip_address(client_address[0])
        return any([req_ip.is_loopback, req_ip.is_private])


def parse_args():
    """

    :return:
    """
    from argparse import ArgumentParser
    parser = ArgumentParser()
    parser.add_argument('--port', '-p', type=int, default=8000, help='Port number')
    return parser.parse_args()


def main() ->None:
    """
        EntryPoint
    """
    args = parse_args()
    # SimpleHTTPRequestHandlerが現在のディレクトリを元にマッピングするため、作業ディレクトリを変更する。
    chdir(BASE_DIR)
    with ThreadingHTTPServer(("", args.port), MyHandler) as httpd:
        print("serving at port:", args.port)
        print(f"http://127.0.0.1:{args.port}/")
        httpd.serve_forever()


if __name__ == '__main__':
    main()
