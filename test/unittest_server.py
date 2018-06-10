"""
    unittest server
"""
# -*- coding: utf8 -*-
from functools import wraps
from os import chdir
from glob import glob
from argparse import ArgumentParser
from http import HTTPStatus
from http.server import HTTPServer, SimpleHTTPRequestHandler
from socketserver import ThreadingMixIn
from ipaddress import ip_address
from pathlib import Path
from html import escape

BASE_DIR = Path(__file__).parent


def html_tag(tag: str, attr: str = "", sub_element: str = ""):
    def _html_tag(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            """
                tag:html
                <html></html>
            """
            content = f'<{tag}'
            if attr != "":
                content += f' {attr}'
            content += '>\n'
            if sub_element != "":
                content += f'{sub_element}\n'

            content += f'{func(*args, **kwargs)}</{tag}>\n'
            return content
        return wrapper
    return _html_tag


class MyHandler(SimpleHTTPRequestHandler):
    """
        MyHandler
    """
    def do_GET(self):
        req_ip = ip_address(self.client_address[0])
        # IPアドレスによる簡易的なアクセス制限
        # ループバック,ローカルアドレス以外はステータスコード:403を返す
        is_accepted = any([req_ip.is_loopback, req_ip.is_private])
        if not is_accepted:
            self.send_response(HTTPStatus.FORBIDDEN)
            self.end_headers()
            return
        if self.path != "/":
            # ルートパス以外は要求コンテンツをレスポンスとして返す
            super().do_GET()
            return

        self.send_response(HTTPStatus.OK)
        self.end_headers()
        @html_tag('html', sub_element='<head><meta charset="utf-8" /></head>')
        @html_tag('body')
        @html_tag('main', 'role="main"')
        def html_body():
            """
                html
            """
            body = ""
            for item in map(escape, glob('**/*.html', recursive=True)):
                body += f'<li><a href="{item}" target="_top" rel="noopener">{item}</a></li>'
            body += f"\n<hr><span>{escape(self.date_time_string())}</span>\n"
            return body

        self.wfile.write(f"<!DOCTYPE html>\n{html_body()}".encode('utf-8'))



class ThreadingHTTPServer(ThreadingMixIn, HTTPServer):
    """
        ThreadingHTTPServer
    """
    daemon_threads = True


def main() ->None:
    """
        main
    """
    parser = ArgumentParser()
    parser.add_argument('--port', '-p', type=int, default=8000, help='Port number')
    args = parser.parse_args()
    # SimpleHTTPRequestHandlerが現在のディレクトリを元にマッピングするため、作業ディレクトリを変更する。
    chdir(BASE_DIR)
    with ThreadingHTTPServer(("", args.port), MyHandler) as httpd:
        print("serving at port:", args.port)
        print(f"http://127.0.0.1:{args.port}/")
        httpd.serve_forever()


if __name__ == '__main__':
    main()
