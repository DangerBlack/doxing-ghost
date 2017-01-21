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
*/
var PATH='certainty/';
var ORIGIN_LINK='google_link.json';
var OUTPUT_FILE='google_link_info.json';
var ORIGIN_FB='fb_info.json';
var ORIGIN_UNUSED='unused_word_ita.yaml';
var ORIGIN_WILDCARD='wildcard_ita.yaml';

var TRACKED_SITE=["facebook","tumblr","deviantart","twitter","youtube","forumfree","google","wordpress",'alfemminile'];

var CUTPOINT = 50;

var TARGET= "unkown";
var fs = require('fs');


function readTarget(){
    var fs = require('fs');
    //var text = fs.readFileSync(PATH+ORIGIN_FB,'utf8');
    var utils = require('utils');
    var text = fs.read(PATH+ORIGIN_TARGET);
    TARGET = text;
    return text;
}

function readLink(){
    var fs = require('fs');
    console.log("problem");
//    var text = fs.readFileSync(PATH+ORIGIN_LINK,'utf8');

    var fs = require('fs');
    var utils = require('utils');
    var text = fs.read(PATH+ORIGIN_LINK);
    console.log("fatto");
    return JSON.parse(text);
}
function readFb(){
    var fs = require('fs');
    //var text = fs.readFileSync(PATH+ORIGIN_FB,'utf8');
    var fs = require('fs');
    var utils = require('utils');
    var text = fs.read(PATH+ORIGIN_FB);
    return JSON.parse(text);
}

function readUnusedWord(){
    var fs = require('fs');
    var utils = require('utils');
    var text = fs.read(ORIGIN_UNUSED);
    var line = text.split("\n");
    console.log(text);
    var word = line[0].split(':')[1].split(',')+line[1].split(':')[1].split(',');
    console.log(word);
    return word;
}

function getNickFromFb(fb){
    if(fb.core.name.indexOf("(")!=-1){
        var nick=fb.core.name;
        nick = nick.substring(nick.indexOf("("),nick.indexOf(")"));
        return nick;
    }else {
        return "";
    }
}
function readWildCard(fb){
    console.log("leggo WILD");

    var fs = require('fs');
    var utils = require('utils');
    var text = fs.read(ORIGIN_WILDCARD);
    console.log("lette WILD");

    text = text.replace(/\[nome cognome\]/g,fb.core.name);
    text = text.replace(/\[nome\]/g,fb.core.name.split(' ')[0]);
    text = text.replace(/\[username\]/g,TARGET);
    text = text.replace(/\[nick\]/g,getNickFromFb(fb));
    console.log(text);
    var line = text.split('\n');
    console.log(line);
    return line;
}

function saveInfo(info){
    var fs = require('fs');
    console.log("inizio conversione");
    var string = JSON.stringify(info);
    console.log("conversione fatta!");
    console.log(string);
    fs.write(PATH+OUTPUT_FILE, string, 'w');
}





Array.prototype.diff = function(a) {
    return this.filter(function(i) {return ((a.indexOf(i) > 0) && (a.length>3) && (i.length>3) && a!='' && i!='');});
};

function orderWebSite(link,fb){
    for(var i=0;i<link.length;i++){
        var l=link[i];
        var l_list= l.name.split(/,| /);
        var point=0;
        var meaning = [];
        for(var j=0;j<fb.likes.length;j++){
            var f= fb.likes[j];
            var f_list = f.name.split(/,| /);
            //console.log(f_list);
            var res = l_list.diff(f_list);
            //console.log(res);
            if(res.length>=1){
                point++;
                meaning.push(res);
            }
        }
        for(var j=0;j<TRACKED_SITE.length;j++){
            if(l.url.indexOf(TRACKED_SITE[j])!=-1){
                point+=50;
            }
        }
        link[i].point = point;
        console.log(l.url+" punteggio "+point+" -> "+meaning);
        //break;
    }
    return link;
}
/*
for(var i=0;i<link.length;i++){
    var l=link[i];
    if(l.point>=CUTPOINT){
        //COMINCIA CERCANDO DA QUESTI SITI.


    }else{
        //METTI IN CODA QUESTI SITI MA CERCALI COMUNQUE NELLA SECONDA MANCHE!

    }
}*/


var casper = require('casper').create({
    verbose: true,
    //logLevel: "debug",
    pageSettings: {
        loadImages: false,//The script is much faster when this field is set to false
        loadPlugins: false,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.157 Safari/537.36'
    },
    clientScripts: ["jquery.js"]
});

function createWordList(fb,unused_word){
    var word=[]
    for(var j=0;j<fb.likes.length;j++){
        var f= fb.likes[j];
        var f_list = f.name.split(/,| /);
        for(var i=0;i<f_list.length;i++){
            if((f_list[i].length>3)&&(unused_word.indexOf(f_list[i])==-1))
                word.push(f_list[i]);
        }
    }
    return word;
}

function indexInScrape(scrape,fact){
    for(var i=0;i<scrape.length;i++){
        if(scrape.text==fact.text){
            return i;
        }
    }
    return -1;
}
function openAndScrape(casper,i,link,wildcard,fb_word){
    casper.thenOpen(link[i].url,function(){
        link[i].scrape=[];
        this.scrollToBottom();
        this.scrollTo(1000,1000);
        window.document.body.scrollTop = 1000;
        //console.log(this.getHTML());
        //console.log(wildcard);
        console.log("Open web site: "+link[i].url);
        this.wait(3000);
        this.capture('picture/disagio.png');
        var info=this.evaluate(function(wildcard){
            var obj=[];
            for(var j=0;j<wildcard.length;j++){
                $("p:contains(\""+wildcard[j]+"\")").each(function(index,e){
                    obj.push({
                                'wildcard':wildcard[j],
                                'text':$(e).parent().text()
                            });
                });
            }
            return obj;
        },wildcard);
        for(var j=0;j<info.length;j++){
            if(indexInScrape(link[i].scrape,info[j])==-1){
                link[i].scrape.push(info[j]);
                //console.log(info[j].wildcard+": *** "+info[j].text+" ***");
            }
        }

        var info=this.evaluate(function(fb_word){
            var obj=[];
            for(var j=0;j<fb_word.length;j++){
                $("p:contains(\""+fb_word[j]+"\")").each(function(index,e){
                    obj.push({
                                'wildcard':fb_word[j],
                                'text':$(e).parent().text()
                            });
                });
            }
            return obj;
        },fb_word);
        for(var j=0;j<info.length;j++){
            if(indexInScrape(link[i].scrape,info[j])==-1){
                link[i].scrape.push(info[j]);
            }
            //console.log(info[j].word+": *** "+info[j].text+" ***");
        }
        if((i+1)>=link.length){
            saveInfo(link);
        }else{
            openAndScrape(casper,i+1,link,wildcard,fb_word)
        }
    });

}
casper.start().then(function() {
    console.log("Inizio lavoro");
    readTarget();
    var link = readLink();
    var fb = readFb();
    var unused_word = readUnusedWord();
    var fb_word = createWordList(fb,unused_word);
    var wildcard = readWildCard(fb);//['ciao','ciao io sono','io sono','trasferito','http'];
    console.log(wildcard);
    link = orderWebSite(link,fb);
    console.log("inizio conti");
    try{
        link = openAndScrape(casper,0,link,wildcard,fb_word);
    }catch(e){
        console.log(e);
    }
});

casper.run();
