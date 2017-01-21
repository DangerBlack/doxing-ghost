# doxing-ghost
A transversal tool for gaining information about people from web, like facebook and more over


## Usage

Edit *Target.yaml* file in certainty folder and write the target "name" end-url of facebook profile

Like:

https://www.facebook.com/zuck?fref=ts

**zuck**

Run the tool (you need to put username and password)
```
casperjs fb_casper.js
```

after this run you can run the second tool (search on google)

```
casperjs explore_wildcard.js
```

than you can enter each of those website to collect more info

```
casperjs open_web_site.js
```

can be really time consuming this task!


finally you can open with *firefox* the web page resulting (**show_results.html**) 
well done!

## Prerequisities

* nodejs
* phantomjs
* casperjs



