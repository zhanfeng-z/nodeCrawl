let http =require('http');
let fs = require('fs');
var Promise = require('bluebird');
var async = require('async');
let request = require('request');
let cheerio = require('cheerio');
let i = 0;
let index  = 1; //第几页
let concurrencyCount = 0;
let text = 0;
let error_url = [];
let url = 'http://www.cjlu.edu.cn/do.jsp?dotype=newsmm&columnsid=13&currentPage=1';

async function crawl(url){
    console.log('爬取第'+index+'页');
    index++;
    let urlList = await getArticle(url);
    async.mapLimit(urlList, 5, function (url, callback) {
        fetchPage(url, callback);
    }, function (err,result) {
        url = 'http://www.cjlu.edu.cn/do.jsp?dotype=newsmm&columnsid=13&currentPage='+index;
        if(index < 62){
            crawl(url);
        }
        //   console.log(result);
    });
}

crawl(url);

function getArticle(url){
    return new Promise((resolve,reject) =>{
        http.get(url,res =>{
            let html = '';
            res.on('data',chunk =>{
                html += chunk;
            })
            res.on('end',() =>{
                let $ = cheerio.load(html);
                let urlList = [];
                let length = $('.new-main-list li').length;
                $('.new-main-list li').each((index) =>{
                    let link = 'http://www.cjlu.edu.cn'+$('.new-main-list li a').eq(index).attr('href');
                    urlList.push(link);
                })
                resolve(urlList);
            })
        })
    })
}

function fetchPage(url,callback){
    concurrencyCount++;
    console.log('现在的并发数是', concurrencyCount, '，正在抓取的是', url);
    http.get(url,res =>{
        let html = '';
        res.setEncoding('utf-8');

        res.on('data',chunk =>{
            html+=chunk;
        })

        res.on('end',() => {
            let $ = cheerio.load(html);

            let news_item = {
                title: $('.new-mian-right h4').text(),
                time: $('.main_box_ner span').eq(2).text().substring(5),
                link: url,
                author: $('.main_box_ner span').eq(0).text().substring(3).trim(),
                i: i = i+1
            }

            // console.log(news_item);

            savedContent($,news_item.title);

            savedImg($,news_item.title);
            concurrencyCount--;
            setTimeout(function() {
                callback(null, url + ' html content');
            }, Math.random()*1000);
            

            // if(i < 5){
            //     fetchPage(str);
            // }
        })
    }).on('error',function(err){
        console.log('获取数据出错')
    })
}

function savedContent($, news_title) {
    text++;
    let fileName = `data/${i}_${news_title}.txt`;
    fs.createWriteStream(fileName);
    console.log('写入第'+text+'篇文章');
    $('.main_box').next().find('p').each(function (index, item) {
        var x = $(this).text(); 
    
        if (x != '') {
            x = x + '\n';   
    //将新闻文本内容一段一段添加到/data文件夹下，并用新闻的标题来命名文件
            fs.appendFileSync(fileName, x, { encoding: 'utf8'});
        }
    })
}

function savedImg($, news_title){
    $('.main_box').next().find('img').each(function (index, item) {
        let img_url = $(this).prop('src');
        let suffix = img_url.substr(-4,4);
        console.log('图片原地址：'+img_url);
        let url = '';
        if(img_url.indexOf('://') > -1){
            url = img_url;
        }else{
            url = 'http://www.cjlu.edu.cn'+img_url;
        }
        console.log('图片地址：'+url);
        let img_title = news_title+index+suffix;
        request
            .get(url)
            .on('error', err => {
                console.error(err)
                error_url.push(url);
            })
            .pipe(fs.createWriteStream('image/'+img_title));
    })
}


