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

//RUN USING casperjs fb_casper.js

var PATH='certainty/'
var FILE_NAME='fb_info.json'

var TARGET= "zuck";

var blob={};
function addInfo(tag,info){
    blob[tag]=info;
}
function saveInfo(){
    var fs = require('fs');
    fs.write(PATH+FILE_NAME, JSON.stringify(blob), 'w');
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
casper.start().thenOpen("https://facebook.com", function() {
    console.log("Facebook website opened");
});


//Now we have to populate username and password, and submit the form
casper.then(function(){
    console.log("Login using username and password");
    this.evaluate(function(USER,PASSWORD){
        document.getElementById("email").value="username";
		document.getElementById("pass").value="password";
		document.getElementById("loginbutton").children[0].click();
    });
});

//Wait to be redirected to the Home page, and then make a screenshot
casper.then(function(){
    /*console.log("Make a screenshot and save it as AfterLogin.png");
	this.wait(6000);//Wait a bit so page loads (there are a lot of ajax calls and that is why we are waiting 6 seconds)
    this.capture('picture/AfterLogin.png');*/
});


//SEZIONE DOWNLOAD INFO BASE
casper.thenOpen("https://facebook.com/"+TARGET, function() {
    console.log("Facebook "+TARGET+" website opened");
});

casper.then(function(){
    var info=this.evaluate(function(){
        var obj=[];
        $("#pagelet_timeline_recent").find('li[data-profile-intro-card=1]').each(function(index,e){
            obj.push({
                        'name':$(e).find('a').text(),
                        'url':$(e).find('a').attr('href'),
                        'action':$(e).text()
                    });
        });
        return obj;
    });
    var full_name = this.evaluate(function(){
        return $("#fb-timeline-cover-name").text();
    });

    var img_path= this.evaluate(function(){
        return $("img.profilePic").attr("src");
    });

    core={'name':full_name,'img':img_path};
    console.log("Trovate Info");
    for(var i=0;i<info.length;i++){
        console.log(info[i].action);
    }
    addInfo('core',core);
    addInfo('base',info);
});


casper.thenOpen("https://www.facebook.com/"+TARGET+"/likes_all",function(){
    console.log("Facebook "+TARGET+" LIKE website opened");
    this.scrollToBottom();
    this.scrollTo(1000,1000);
    window.document.body.scrollTop = 1000;
});

function scrollaMerda(successo){
    casper.waitFor(function() {
        this.page.scrollPosition = { top: this.page.scrollPosition["top"] + 1000, left: 0 };
        return true;
      },
      function() {
            //this.capture('picture/After"+TARGET+"Like_tail.png');
            var asy=casper.evaluate(function(){
                return $('img.async_saving').attr('id');
            });
            console.log('trovato? id: '+asy);
            if(asy===null){
                console.log('NO more');
                successo();
            }else{
                scrollaMerda(successo);
            }
        });
}

casper.then(function(){
    console.log("Make a screenshot and save it as After"+TARGET+".png");
	this.wait(5000);//Wait a bit so page loads (there are a lot of ajax calls and that is why we are waiting 6 seconds)
    this.capture("picture/After"+TARGET+"Like.png");

    var i=0;
    var asy= this.evaluate(function(){
        return $('img.async_saving').attr('id');
    });
    console.log('id: '+asy);
    scrollaMerda(function(){
        console.log('Sono nel successo');
        //this.capture("picture/After"+TARGET+"Like_endig.png");

        var info=casper.evaluate(function(){
            var obj=[];
            $('#timeline-medley').find("button").each(function(index,e){
                var t=$(e).parent().parent().prev().prev().text();
                if($(e).parent().parent().prev().prev().length){
                    obj.push({
                                'name':$(e).parent().parent().prev().prev().text(),
                                'url':$(e).parent().parent().prev().prev().attr('href'),
                                'kind':$(e).parent().parent().prev().text()
                            });
                }
            });
            return obj;
        });

        console.log("Trovate Info");
        for(var i=0;i<info.length;i++){
            console.log(info[i].name+" : "+info[i].kind);
        }
        addInfo('likes',info);

    });
});

function scrollaMerda2(counter,successo){
    casper.waitFor(function() {
        this.page.scrollPosition = { top: this.page.scrollPosition["top"] + 1000, left: 0 };
        return true;
      },
      function() {
            //this.wait(6000);
            //this.capture("picture/After"+TARGET+"Friends_tail.png");
            //this.wait(6000);
            var asy=casper.evaluate(function(){
                //return $('img[src="https://www.facebook.com/rsrc.php/v3/y_/r/o2mtzbxKtid.gif"]').attr('id');
                return $('div.uiProfileBlockContent').length;
            });
            console.log('trovato? id: '+asy+' '+counter);
            if(asy<=counter){
                console.log('NO more');
                successo();
            }else{
                scrollaMerda2(asy,successo);
            }
        });
}


//SEZIONE DOWNLOAD AMICI
casper.thenOpen("https://www.facebook.com/"+TARGET+"/friends?source_ref=pb_friends_tl",function(){
    console.log("Facebook "+TARGET+" LIKE website opened");
    this.scrollToBottom();
    this.scrollTo(1000,1000);
    window.document.body.scrollTop = 1000;
});


casper.then(function(){
    console.log("Make a screenshot and save it as "+TARGET+"Friends.png");
	this.wait(6000);//Wait a bit so page loads (there are a lot of ajax calls and that is why we are waiting 6 seconds)
    this.capture("picture/"+TARGET+"Friends_tail.png");

    var i=0;
    var asy= this.evaluate(function(){
        //return $('img[height=32]').attr('id');
        return $('div.uiProfileBlockContent').length;
    });
    console.log('id: '+asy);
    scrollaMerda2((asy-5),function(){
        console.log('Sono nel successo *.*');
        //this.capture('picture/After"+TARGET+"Like_endig.png');

        var info=casper.evaluate(function(){
            var obj=[];
            $('#timeline-medley').find("div.uiProfileBlockContent").each(function(index,e){
                var t=$(e).text();
                //if($(e).parent().parent().prev().prev().length){
                    obj.push({
                                'name':$(e).children().children().next().children('div').text(),
                                'friends':$(e).children().children().next().children('a').text(),
                                'href':$(e).children().children().next().children('div').find('a').attr('href')
                            });
                //}
            });
            return obj;
        });

        console.log("Trovate Info");
        for(var i=0;i<info.length;i++){
            console.log(info[i].name+" : "+info[i].friends+" : "+info[i].href);
        }
        addInfo('friends',info);
        saveInfo();
    });
});

casper.run();



/*   STAMPA IL SORGENTE
 var js = this.evaluate(function() {
    		return document;
    	});
    this.echo(js.all[0].outerHTML);*/
