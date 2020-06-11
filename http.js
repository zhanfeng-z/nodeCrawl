const fs = require('fs')
const Promise = require('bluebird')
const async = require('async')
const request = require('request')
const cheerio = require('cheerio')
let urlLists = []
let i = 0
let concurrencyCount = 0
let text = 0
const error_url = []

// 入口方法
crawl()

async function crawl () {
  console.log('开始采集新闻地址...')
  for (let i = 1; i <= 65; i++) {
    console.log('开始采集新闻第' + i + '页')
    const url = 'http://www.cjlu.edu.cn/do.jsp?dotype=newsmm&columnsid=13&currentPage=' + i
    const urlList = await getArticle(url)
    urlLists = urlLists.concat(urlList)
  }

  async.mapLimit(urlLists, 5, function (url, callback) {
    fetchPage(url, callback)
  }, function (err, result) {
    console.log('final:')
    console.log(error_url)
    //   console.log(result);
  })

  console.log(urlLists)
};

function getArticle (url) {
  return new Promise((resolve, reject) => {
    let html = ''
    request
      .get(url)
      .on('data', chunk => {
        html += chunk
      })
      .on('end', () => {
        const $ = cheerio.load(html)
        const urlList = []
        const length = $('.new-main-list li').length
        $('.new-main-list li').each((index) => {
          const link = 'http://www.cjlu.edu.cn' + $('.new-main-list li a').eq(index).attr('href')
          urlList.push(link)
        })
        resolve(urlList)
      })
  })
}

function fetchPage (url, callback) {
  concurrencyCount++
  console.log('现在的并发数是', concurrencyCount, '，正在抓取的是', url)
  let html = ''
  request
    .get(url)
    .on('data', chunk => {
      html += chunk
    })
    .on('end', () => {
      const $ = cheerio.load(html)

      const news_item = {
        title: $('.new-mian-right h4').text(),
        time: $('.main_box_ner span').eq(2).text().substring(5),
        link: url,
        author: $('.main_box_ner span').eq(0).text().substring(3).trim(),
        i: i = i + 1
      }
      savedContent($, news_item.title)
      savedImg($, news_item.title)
      concurrencyCount--
      setTimeout(function () {
        callback(null, url + ' html content')
      }, Math.random() * 1000)
    })
    .on('error', function (err) {
      console.log('获取数据出错')
    })
}

function savedContent ($, news_title) {
  text++
  const fileName = `data/${i}_${news_title}.txt`
  fs.createWriteStream(fileName) // 创建可写流
  $('.main_box').next().find('p').each(function (index, item) {
    let x = $(this).text()

    if (x != '') {
      x = x + '\n'
      // 将新闻文本内容一段一段添加到/data文件夹下，并用新闻的标题来命名文件
      fs.appendFileSync(fileName, x, { encoding: 'utf8' })
    }
  })
}

function savedImg ($, news_title) {
  $('.main_box').next().find('img').each(function (index, item) {
    const img_url = $(this).prop('src')
    const suffix = img_url.substr(-4, 4)
    console.log('图片原地址：' + img_url)
    let url = ''
    if (img_url.indexOf('://') > -1) {
      url = img_url
    } else {
      url = 'http://www.cjlu.edu.cn' + img_url
    }
    console.log('图片地址：' + url)
    const img_title = news_title + index + suffix
    request
      .get(url)
      .on('error', err => {
        console.error(err)
        error_url.push(url)
      })
      .pipe(fs.createWriteStream('image/' + img_title))
  })
}
