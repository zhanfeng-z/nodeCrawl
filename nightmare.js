// 豆瓣Top250
let Nightmare = require('nightmare');		
let nightmare = Nightmare({ show: true,width: 1200, height: 600 });
let http =require('http');
let https = require('https');
let fs = require('fs');
let Promise = require('bluebird');
let cheerio = require('cheerio');
let async = require('async');

let url = [];
const file = 'data/';
let pageNum = 1;
let index = 1;

nightmare
  .goto('https://movie.douban.com/')
  .click('#db-nav-movie > div.nav-secondary > div > ul > li:nth-child(4) > a')
  .click('.douban-top250-hd a')
  .wait('#footer')
  .evaluate(function () {
    let i = 1;
    let urlList = [];
    while(i<26){
      console.log(i);
      urlList.push(document.querySelector('#content > div > div.article > ol > li:nth-child('+i+') > div > div.info > div.hd > a').getAttribute('href'))
      i++;
    }
    return urlList;
  })
  // .end()
  .then(async function (result) {
    console.log(result);
    for(let i=0;i<result.length;i++){
      await crawl(result[i]);
    }
    console.log(`第${pageNum}页完成`);
    next();
  })
  .catch(function (error) {
    console.error('Search failed:', error);
  });

function next(){
  nightmare
    .click('.next a')
    .wait('#footer')
    .evaluate(function () {
      let i = 1;
      let urlList = [];
      while(i<26){
        console.log(i);
        urlList.push(document.querySelector('#content > div > div.article > ol > li:nth-child('+i+') > div > div.info > div.hd > a').getAttribute('href'))
        i++;
      }
      return urlList;
    })
    // .end()
    .then(async function (result) {
      pageNum++;
      console.log(result);
      for(let i=0;i<result.length;i++){
        await crawl(result[i]);
      }
      console.log(`第${pageNum}页完成`);
      if(pageNum < 10){
        next();
      }
    })
    .catch(function (error) {
      console.error('Search failed:', error);
    });
}



function crawl(link){
  return new Promise((resolve,reject) =>{
    https.get(link, res => {
        let html = '';
        res.setEncoding('utf-8');
        res.on('data',function(data){
            html += data;
        })
        res.on('end',function(){
            let $ = cheerio.load(html);
            let fileName = file+index+'-'+$('h1 span').eq(0).text().replace(/\s/g,'').replace(/\//g,'')+'.txt';
            fs.createWriteStream(fileName);
            let num = '排名：'+$(".top250-no").text()+'\n';
            fsWrite(num,fileName);
            let text = '电影：'+$('h1 span').eq(0).text()+'\n';
            fsWrite(text,fileName);
            let score = '评分：'+$(".rating_num").text()+'\n';
            fsWrite(score,fileName);
            let time = '上映时间：'+$(".year").text().substring(1,5)+'\n';
            fsWrite(time,fileName);
            let intro = '剧情简介：'+$('#link-report span').eq(0).text().replace(/\s/g,'')+'\n';
            fsWrite(intro,fileName);
            console.log($('h1 span').eq(0).text()+'抓取完成');
            index++;
            resolve();
        })
    }).on('error',function(err){
        reject(err);
        console.log('获取数据出错')
    })
  })
}

function fsWrite(text,fileName){
  fs.appendFileSync(fileName, text, { encoding: 'utf8'});
}