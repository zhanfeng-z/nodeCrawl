// 爬取知乎回答中的图片
var Nightmare = require('nightmare');		
var nightmare = Nightmare({ show: true,width: 1200, height: 600 });
let http =require('http');
const https = require('https');
let fs = require('fs');
var Promise = require('bluebird');
let cheerio = require('cheerio');
var async = require('async');
let request = require('request');

let img = [];
let concurrencyCount = 0;
let imgIndex = 0;
let index = 1;


nightmare
    .goto('https://www.zhihu.com/question/62630938')
    // .click('.QuestionMainAction')
    .wait('.QuestionMainAction')
    .evaluate( (index,img) =>{
        while(index>0){
            if(document.querySelector('#QuestionAnswers-answers .List div:nth-of-type(2) .List-item:nth-of-type('+index+')')){
                let i = 1;
                while(i>0){
                    if(document.querySelector('#QuestionAnswers-answers .List div:nth-of-type(2) .List-item:nth-of-type('+index+') .RichText noscript:nth-of-type('+i+')')){
                        let src = document.querySelector('#QuestionAnswers-answers .List div:nth-of-type(2) .List-item:nth-of-type('+index+') .RichText noscript:nth-of-type('+i+')').innerHTML.match(/src="(\S*)"/)[1];
                        img.push(src)
                        i++;
                    }else{
                        break;
                    }
                }
                index++;
            }else{
                break;
            }
        }
        let hasNext = document.querySelector('.QuestionMainAction') ? true : false;
        return {hasNext:hasNext,img:img,index:index};
    },index,img)
    .then( result =>{
        if(result.hasNext){
            console.log(result.index);
            next(result.img,result.index);
        }else{
            console.log('开始下载图片');
            download(img);
        }
    })
    .catch(function (error) {
        console.error('Search failed:', error);
    });

function next(img,index){
    nightmare
        .click('.QuestionMainAction')
        // .wait( (index) =>{
        //     if(document.querySelectorAll('#QuestionAnswers-answers .List-item').length > index){
        //         return true;
        //     }
        // },index)
        .wait(2000)
        .evaluate( (index,img) =>{
            while(index>0){
                if(document.querySelector('#QuestionAnswers-answers .List div:nth-of-type(2) .List-item:nth-of-type('+index+')')){
                    let i = 1;
                    while(i>0){
                        if(document.querySelector('#QuestionAnswers-answers .List div:nth-of-type(2) .List-item:nth-of-type('+index+') .RichText noscript:nth-of-type('+i+')')){
                            let src = document.querySelector('#QuestionAnswers-answers .List div:nth-of-type(2) .List-item:nth-of-type('+index+') .RichText noscript:nth-of-type('+i+')').innerHTML.match(/src="(\S*)"/)[1];
                            img.push(src)
                            i++;
                        }else{
                            break;
                        }
                    }
                    index++;
                }else{
                    break;
                }
            }
            let hasNext = document.querySelector('.QuestionMainAction') ? true : false;
            return {hasNext:hasNext,img:img,index:index};
        },index,img)
        .then( result =>{
            if(result.hasNext){
                console.log(result.index);
                next(result.img,result.index);
            }else{
                console.log('开始下载图片');
                download(img);
            }
        })
        .catch(function (error) {
            console.error('Search failed:', error);
        });
}

async function download(img){
    fs.mkdir("../node-resource/",function(err){
        if (err) {
            return console.error(err);
        }
        try{
            async.mapLimit(img, 5, function (url, callback) {
                imgLoad(url,callback);
            }, function (err,result) {
                console.log(result);
            });
        }catch(err){
            console.log(err);
        }
        
    });
}

function imgLoad(url,callback){
    concurrencyCount++;
    imgIndex++;
    console.log(`现在的并发数是${concurrencyCount}，正在抓取的是第${imgIndex}张，${url}`);
    var stream = request
        .get(url)
        .on('error', err => {
            console.error(err)
        })
        .pipe(fs.createWriteStream(`../node-resource/${imgIndex}.jpg`))
    stream.on('finish', ()=>{
        concurrencyCount--;
        callback(null, url);
    });    
}