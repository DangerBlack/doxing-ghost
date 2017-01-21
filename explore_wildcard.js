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
var PATH='certainty/'
var ORIGIN_TARGET='target.yaml';
var ORIGIN_LINK='google_link.json';
var OUTPUT_FILE='google_link_info.json';
var ORIGIN_FB='fb_info.json';
var ORIGIN_UNUSED='unused_word_ita.yaml';
var ORIGIN_WILDCARD='wildcard_ita.yaml';

var FILE_NAME='google_link.json'

var TARGET= "unkown";

var NUMBER_OF_PAGE_TO_CHECK = 4;

var blob=[];
var pages=[];
var idx = 0;


function readTarget(){
    var fs = require('fs');
    //var text = fs.readFileSync(PATH+ORIGIN_FB,'utf8');
    var utils = require('utils');
    var text = fs.read(PATH+ORIGIN_TARGET);
    TARGET = text;
    return text;
}

function readFb(){
    var fs = require('fs');
    //var text = fs.readFileSync(PATH+ORIGIN_FB,'utf8');
    var fs = require('fs');
    var utils = require('utils');
    var text = fs.read(PATH+ORIGIN_FB);
    return JSON.parse(text);
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


function addInfo(tag,info){
    blob.push({"name":tag,"url":info});
}
function saveInfo(){
    var fs = require('fs');
    fs.write(PATH+FILE_NAME, JSON.stringify(blob), 'w');
}

function randTime(){
    return parseInt(Math.random()*1000);
}

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


//First step is to open Facebook
casper.start().thenOpen("https://www.google.it", function() {
    console.log("Google website opened");
    readTarget();
    var fb = readFb();
    var wildcard = readWildCard(fb);
    var idx = 0;
    seachNext(casper,wildcard,idx);
});



function seachNext(casper,wildcard, idx){
    if(idx<wildcard.length){
        console.log("iniziamo la ricerca "+idx);
        casper.thenOpen("https://www.google.it/search?q=\""+wildcard[idx]+"\"&gws_rd=cr&ei=EetnWKiTJcfLgAaTtJDACw", function() {
            console.log("Google "+wildcard[idx]+" website opened");
            this.wait(6000+randTime());
            console.log("Google waited");

        });

        casper.then(function(){
            console.log("Search in page");
            var spell_orig=this.evaluate(function(){
                var obj=$("a.spell_orig").attr('href');
                return obj;
            });
            console.log("Esiste uno spelling corretto: "+spell_orig);
            if (typeof spell_orig != 'undefined'){
                casper.thenOpen("https://www.google.it"+spell_orig, function() {
                    console.log("Google "+wildcard[idx]+" FORCED website opened");
                    this.wait(6000+randTime());
                    console.log("Google waited");
                    collectInfo(casper);
                });
            }else{
                collectInfo(casper);
            }
        });

        casper.then(function(){
            var info=this.evaluate(function(){
                var obj=[];
                $("#foot").find('td').each(function(index,e){
                    obj.push({
                                'url':$(e).find('a').attr('href')
                            });
                });
                return obj;
            });
            console.log("nex page");
            for(var i=0;i<info.length;i++){
                console.log(i+" : "+info[i].url);
            }
            info.splice(0,2);
            info.splice(NUMBER_OF_PAGE_TO_CHECK,10);
            pages=info;
            for(var i=0;i<pages.length;i++){
                console.log(i+" : "+pages[i].url);
            }
            openNext(casper,wildcard,idx);
        });

    }else{
        saveInfo();
        console.log("FINE DELLA RICERCA!");
    }
}




function collectInfo(casper){
    casper.then(function(){
        console.log("Search in page");
        var info=this.evaluate(function(){
            var obj=[];
            $("#search").find('.r').each(function(index,e){
                obj.push({
                            'name':$(e).find('a').text(),
                            'url':$(e).find('a').attr('href')
                        });
            });
            return obj;
        });
        for(var i=0;i<info.length;i++){
            console.log(info[i].name+" : "+info[i].url);
            addInfo(info[i].name,info[i].url);
        }
        console.log(info);
        console.log("sono qui e non so che nerchia fare!");
    });
}


function openNext(casper,wildcard,idx){
    if(pages.length>0){
        casper.thenOpen("https://www.google.it"+pages[0].url,function(){
            console.log("Google "+wildcard[idx]+" next page: "+pages[0].url);

            pages.splice(0,1);
            this.wait(6000+randTime());
            collectInfo(casper);
            this.wait(6000+randTime());
            openNext(casper,wildcard,idx);
        });
    }else{
        console.log("Finded everything for this criteria next criteria asked");
        seachNext(casper,wildcard,idx+1);
    }
}






casper.run();
