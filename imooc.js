/**
 * Created by zhanfeng on 2017/2/9.
 */
var http = require('http');
var Promise = require('bluebird');
var cheerio = require('cheerio');
var baseUrl = 'http://www.imooc.com/learn/';

var fetchCourseArray = [];
let videoIds = [728,637,348,259,197,134,75];
videoIds.forEach( id => {
    fetchCourseArray.push(getPageAsync(baseUrl + id));
})

Promise
    .all(fetchCourseArray)
    .then(pages =>{
        let coursesData = [];
        pages.forEach( html => {
            let courses = filterChapters(html);

            coursesData.push(courses);
        })

        coursesData.sort( (a,b) => {
            return a.num < b.num
        })

        printCourse(coursesData);
    })

function getPageAsync(url){
    return new Promise((resolve,reject) => {
        console.log('正在爬取 '+url);

        http.get(url, res => {
            var html = '';
            res.setEncoding('utf-8');
            res.on('data',function(data){
                html += data;
            })
            res.on('end',function(){
                resolve(html);
                // var coursData = filterChapters(html);
                // printCourse(coursData);
            })
        }).on('error',function(err){
            reject(err);
            console.log('获取数据出错')
        })
    })
}

function filterChapters(html){
    var $ = cheerio.load(html);
    var chapters = $(".chapter");

    let title = $(".hd .l").text().trim();
    let num = $(".js-learn-num").text();

    var courseData = {
        title: title,
        num: num,
        videos: []
    }

    chapters.each(function(item){
        var chapter = $(this);
        var obj = chapter.find('strong').clone();
        obj.find('.icon-info').remove();
        var chapterTitle = obj.text().trim();
        var chapterData = {
            title: chapterTitle,
            video:[]
        }
        $(this).find('.video li').each(function(index){
            var id = $(this).attr('data-media-id');
            $(this).find('a button').remove();
            var title = $(this).find('a').text().replace(/\s/g,'').replace(/[\r\n]/g,"");
            var videoData = {
                id: id,
                title: title
            }
            chapterData.video.push(videoData);
        })
        courseData.videos.push(chapterData);
    })
    return courseData;
}

function printCourse(courseData){
    courseData.forEach(item =>{ 
        console.log(item.title);
        item.videos.forEach(list =>{
            console.log(list.title);
            list.video.forEach(video =>{
                console.log('【'+ video.id +'】'+ video.title);
            })
        })
        
    })
}