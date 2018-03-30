//爬取淘宝买家秀
var Nightmare = require('nightmare');		
var nightmare = Nightmare({ show: true,width: 1200, height: 600 });
let http =require('http');
const https = require('https');
let fs = require('fs');
let Promise = require('bluebird');
let cheerio = require('cheerio');
const async = require('async');
const request = require('request');

let img = [];
let imgIndex = 0;
let page = 1;
let concurrencyCount = 0;

nightmare
    .goto('https://detail.tmall.com/item.htm?spm=a220m.1000858.1000725.70.d811797SOxc34&id=547056282592&skuId=3310340893851&areaId=330100&user_id=2076417916&cat_id=50025135&is_b=1&rn=55a9bb24b237cb234490635b637954a4')
    // .wait(2000)
    // .type('.search-combobox-input','T恤')
    // .wait(2000)
    // .click('.btn-search')
    // .wait('#J_Itemlist_TLink_543874491045')
    // .click('#J_Itemlist_TLink_543874491045')

    //天猫
    .wait('#J_TabBar li:nth-of-type(2) a')
    .click('#J_TabBar li:nth-of-type(2) a')
    .wait('.rate-filter input:nth-of-type(3)')
    .click('.rate-filter input:nth-of-type(3)')  

    //淘宝
    // .wait('#J_TabBar li:nth-of-type(2) a')
    // .click('#J_TabBar li:nth-of-type(2) a')
    // .wait('#reviews-t-val3')
    // .click('#reviews-t-val3')  
    .wait(3000)
    .evaluate( img =>{
        let i = 1;
        while(i > 0){
            if(document.querySelector(`.rate-grid tr:nth-of-type(${i}`)){
                let imgIndex = 1;
                while(imgIndex > 0){
                    if(document.querySelector(`.rate-grid tr:nth-of-type(${i}) .tm-rate-append`)){
                        if(document.querySelector(`.rate-grid tr:nth-of-type(${i}) .tm-rate-premiere .tm-m-photos-thumb li:nth-of-type(${imgIndex}) img`)){
                            let url = document.querySelector(`.rate-grid tr:nth-of-type(${i}) .tm-rate-premiere .tm-m-photos-thumb li:nth-of-type(${imgIndex}) img`).getAttribute('src');
                            url = 'https:'+url.substring(0,url.length-10);
                            img.push(url);
                            imgIndex++;
                        }else{
                            let imgMoreIndex = 1;
                            while(imgMoreIndex > 0){
                                if(document.querySelector(`.rate-grid tr:nth-of-type(${i}) .tm-rate-append .tm-m-photos-thumb li:nth-of-type(${imgMoreIndex}) img`)){
                                    let url = document.querySelector(`.rate-grid tr:nth-of-type(${i}) .tm-rate-append .tm-m-photos-thumb li:nth-of-type(${imgMoreIndex}) img`).getAttribute('src');
                                    url = 'https:'+url.substring(0,url.length-10);
                                    img.push(url);
                                    imgMoreIndex++;
                                }else{
                                    break;
                                }
                            }
                            break;
                        }
                    }else{
                        if(document.querySelector(`.rate-grid tr:nth-of-type(${i}) .tm-rate-content .tm-m-photos-thumb li:nth-of-type(${imgIndex}) img`)){
                            let url = document.querySelector(`.rate-grid tr:nth-of-type(${i}) .tm-rate-content .tm-m-photos-thumb li:nth-of-type(${imgIndex}) img`).getAttribute('src');
                            url = 'https:'+url.substring(0,url.length-10);
                            img.push(url);
                            imgIndex++;
                        }else{
                            break;
                        }
                    }
                }
                i++;
            }else{
                break;
            }
        }
        let hasNext = document.querySelector('.rate-page-next') ? false : true;
        return {hasNext:hasNext,img:img};
    },img)
    .then(result =>{
        console.log(result.img);
        if(result.hasNext){
            console.log(`第${page}页采集完成`)
            next(result.img);
        }else{
            console.log(`共${page}页`)
            download(result.img);
        }
    })
    .catch(function (error) {
        console.error('Search failed:', error);
    });

function next(img){
    page++;
    nightmare
        .click('.rate-page .rate-paginator a:last-child')
        .wait(1000)
        .evaluate( img =>{
            let i = 1;
            while(i > 0){
                if(document.querySelector(`.rate-grid tr:nth-of-type(${i}`)){
                    let imgIndex = 1;
                    while(imgIndex > 0){
                    if(document.querySelector(`.rate-grid tr:nth-of-type(${i}) .tm-rate-append`)){
                        if(document.querySelector(`.rate-grid tr:nth-of-type(${i}) .tm-rate-premiere .tm-m-photos-thumb li:nth-of-type(${imgIndex}) img`)){
                            let url = document.querySelector(`.rate-grid tr:nth-of-type(${i}) .tm-rate-premiere .tm-m-photos-thumb li:nth-of-type(${imgIndex}) img`).getAttribute('src');
                            url = 'https:'+url.substring(0,url.length-10);
                            img.push(url);
                            imgIndex++;
                        }else{
                            let imgMoreIndex = 1;
                            while(imgMoreIndex > 0){
                                if(document.querySelector(`.rate-grid tr:nth-of-type(${i}) .tm-rate-append .tm-m-photos-thumb li:nth-of-type(${imgMoreIndex}) img`)){
                                    let url = document.querySelector(`.rate-grid tr:nth-of-type(${i}) .tm-rate-append .tm-m-photos-thumb li:nth-of-type(${imgMoreIndex}) img`).getAttribute('src');
                                    url = 'https:'+url.substring(0,url.length-10);
                                    img.push(url);
                                    imgMoreIndex++;
                                }else{
                                    break;
                                }
                            }
                            break;
                        }
                    }else{
                        if(document.querySelector(`.rate-grid tr:nth-of-type(${i}) .tm-rate-content .tm-m-photos-thumb li:nth-of-type(${imgIndex}) img`)){
                            let url = document.querySelector(`.rate-grid tr:nth-of-type(${i}) .tm-rate-content .tm-m-photos-thumb li:nth-of-type(${imgIndex}) img`).getAttribute('src');
                            url = 'https:'+url.substring(0,url.length-10);
                            img.push(url);
                            imgIndex++;
                        }else{
                            break;
                        }
                    }
                }
                    i++;
                }else{
                    break;
                }
            }
            let hasNext = document.querySelector('.rate-page-next') ? false : true;
            return {hasNext:hasNext,img:img};
        },img)
        .then(result =>{
            console.log(result.img);
            if(result.hasNext){
                console.log(`第${page}页采集完成`)
                next(result.img);
            }else{
                console.log(`共${page}页`)
                download(result.img);
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
        async.mapLimit(img, 5, function (url, callback) {
            imgLoad(url,callback);
        }, function (err,result) {
            console.log(result);
        });
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

 