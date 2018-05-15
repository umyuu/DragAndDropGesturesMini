# -*- coding: utf-8 -*-
import os
import argparse
import webbrowser


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--url', '-u', type=str, default='http://127.0.0.1:8000/', help='URL')
    args = parser.parse_args()
    chrome_path = os.path.join(os.environ['ProgramFiles(x86)'], 'Google\Chrome\Application\chrome.exe')
    browser = webbrowser.get('"{0}" %s'.format(chrome_path))
    browser.open(args.url)


if __name__ == '__main__':
    main()
