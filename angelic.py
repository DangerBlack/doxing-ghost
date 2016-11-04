# _*_ coding:utf-8 _*_
'''
/*
	Copyright (c) 2016 DangerBlack

	Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files
	(the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge,
	publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished
	to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH
	THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


'''
import time
from pylab import *
import requests
from unicodedata import normalize

def requestQuery(query):
	header = {'user-agent': 'contnent-Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:43.0) Gecko/20100101 Firefox/43.0'}
	res = requests.get('https://www.google.it/search?q='+query+'&gws_rd=cr,ssl&ei=odOnVsHMBcKke7jerogD',
		headers=header
	)
	#print(res.encoding);
	text=res.text.encode('utf-8')
	idx=text.find('<div id="resultStats">')+len('<div id="resultStats">')
	fidx=text.find('<nobr>',idx)
	textfound=text[idx:fidx]
	print(textfound)
	field=textfound.split(' ')
	if(len(field)>2):
		results=field[1]
	else:
		results=field[0]
	results=str.replace(results,'.','')
	print(results)
	#print(results)
	return int(results)
