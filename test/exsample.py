# -*- coding: utf-8 -*-
from kivy.app import App
from kivy.uix.button import Button


class TestApp(App):
    def build(self):
        # return a Button() as a root widget
        return Button(text='hello world')


if __name__ == '__main__':
    TestApp().run()
