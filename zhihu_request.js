let fs = require('fs');
let cheerio = require('cheerio');
let async = require('async');
let request = require('request');

let index = 0;
let concurrencyCount = 0;
let imgIndex = 0;
let question = '28560777';  //问题编号
let url = 'https://www.zhihu.com/api/v4/questions/' + question + '/answers?include=data%5B%2A%5D.is_normal%2Cadmin_closed_comment%2Creward_info%2Cis_collapsed%2Cannotation_action%2Cannotation_detail%2Ccollapse_reason%2Cis_sticky%2Ccollapsed_by%2Csuggest_edit%2Ccomment_count%2Ccan_comment%2Ccontent%2Ceditable_content%2Cvoteup_count%2Creshipment_settings%2Ccomment_permission%2Ccreated_time%2Cupdated_time%2Creview_info%2Crelevant_info%2Cquestion%2Cexcerpt%2Crelationship.is_authorized%2Cis_author%2Cvoting%2Cis_thanked%2Cis_nothelp%2Cupvoted_followees%3Bdata%5B%2A%5D.mark_infos%5B%2A%5D.url%3Bdata%5B%2A%5D.author.follower_count%2Cbadge%5B%3F%28type%3Dbest_answerer%29%5D.topics&limit=5&offset=0&sort_by=default'

fs.exists("../node-resource/", function(exists) {  
    if (!exists) {
        fs.mkdir("../node-resource/",function(err){
            if (err) {
                return console.error(err);
            }
            requestUrl();
        });
    } else {
        requestUrl();
    }  
}) 

function requestUrl(){
    index++;
    request({
        url: url,
        method: "GET",
        gzip:true,
        json: true,
        headers: {
            'accept':'application/json, text/plain, */*',
            'Accept-Language':'zh-CN,zh;q=0.9,en;q=0.8',
            'Cache-Control':'no-cache',
            'Connection':'keep-alive',
            'Cookie':'_zap=74d49d33-2f88-4798-b9f0-9feb47a3332c; z_c0="2|1:0|10:1517655181|4:z_c0|80:MS4xYmhqcEFRQUFBQUFtQUFBQVlBSlZUWTNpWWx1OG4xby01c3pfZWwtd0FJZG5YbDVHSlVMQjV3PT0=|40090631ad64ddfef0dcab99be687c67b4c524680eb64290eb69445c9328a2a5"; q_c1=32246c16a8564de281c5e1832c47b887|1520335506000|1517395995000; __DAYU_PP=uzeauE7RmrFuBVzNYJMu23043fa2a3b1; _xsrf=75795dc0-0a6a-444d-9e0c-4e5472048844; d_c0="AFCvY0tdUw2PTsa1FPNx70NnOHm6pesYT0Y=|1521712791"',
            'Host':'www.zhihu.com',
            'Pragma':'no-cache',
            'Referer':'https://www.zhihu.com/question/' + question,
            'User-Agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36',
            'pragma':'no-cache',
            'x-udid': 'AFCvY0tdUw2PTsa1FPNx70NnOHm6pesYT0Y='
        }
    }, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log(body)
            if(body.paging.is_end){
                console.log('回答请求完毕,共'+body.paging.totals+'条回答');
                getUrl(body.data);
            }else{
                console.log('前'+ index*5 +'条回答请求成功');
                url = body.paging.next;
                setTimeout(function(){
                    requestUrl()
                },Math.random()*3000);
                getUrl(body.data);
            }
        }else{
            console.log(error)
        }
    }); 
} 

function getUrl(img){
    let imgArray = [];
    img.forEach( elem =>{
        let $ = cheerio.load(elem.content);
        for(let i = 0;i < $('img').length;i++){
            if($('img').eq(i).attr('data-actualsrc')){
                imgArray.push($('img').eq(i).attr('data-actualsrc'));
            }
        }
    })
    downLoadImg(imgArray);
}

async function downLoadImg(imgArray){
    try{
        async.mapLimit(imgArray, 5, function (url, callback) {
            imgLoad(url,callback);
        }, function (err,result) {
            console.log(result);
        });
    }catch(err){
        console.log(err);
    }
}

function imgLoad(url,callback){
    concurrencyCount++;
    imgIndex++;
    console.log(`现在的并发数是${concurrencyCount}，正在抓取的是第${imgIndex}张，${url}`);
    let stream = request
        .get(url)
        .pipe(fs.createWriteStream(`../node-resource/${imgIndex}.jpg`))
    stream.on('finish', ()=>{
        concurrencyCount--;
        callback(null, url);
    });    
}