const puppeteer = require('puppeteer')
const fs = require('fs')
const async = require('async')
const request = require('request')

let res = {
  index: 1
}
let isFirst = true
let concurrencyCount = 0
let imgIndex = 0

async function crawl () {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    devtools: false,
    args: ['--window-size=1920,1080']
  })
  const page = await browser.newPage()
  await page.goto('https://www.zhihu.com/question/350859986')
  await page.waitFor(1500)
  while (true) {
    res = await page.evaluate((listItemIndex) => {
      let isEnd = false

      listItemIndex++
      // 判断是否已经滑到最底部
      if (document.querySelector('.QuestionPage .Question-main .QuestionAnswers-answerButton') || listItemIndex > 10) {
        isEnd = true
      }
      window.scrollTo({
        top: window.scrollY + 10000,
        left: 0,
        behavior: 'smooth'
      })
      return {
        index: listItemIndex,
        isEnd
      }
    }, res.index)
    // 未登录访问知乎，第一次滑动后会出现登录弹窗，自动点击关闭
    if (isFirst) {
      await page.waitFor(500)
      await page.click('.signFlowModal .Modal-closeButton')
      isFirst = false
    }
    // 滑动到最底部退出循环
    if (res.isEnd) {
      break
    }
    await page.waitFor(1500)
  }
  const imgList = await page.evaluate(() => {
    const img = []
    const imgNoscriptDomList = document.querySelectorAll('#QuestionAnswers-answers .List div:nth-of-type(2) .List-item .RichText figure noscript')
    imgNoscriptDomList.forEach(item => {
      const imgSrcMatch = item.innerText.match(/data-original="(\S*)"/) || item.innerText.match(/src="(\S*)"/)
      img.push(imgSrcMatch[1])
    })
    return img
  })
  download(imgList)
}

async function download (imgList) {
  fs.mkdir('../data/node-resource/', function (err) {
    if (err) {
      return console.error(err)
    }
    try {
      async.mapLimit(imgList, 5, function (url, callback) {
        imgLoad(url, callback)
      }, function (err, result) {
        console.log(err)
        console.log(result)
      })
    } catch (err) {
      console.log(err)
    }
  })
}

function imgLoad (url, callback) {
  concurrencyCount++
  imgIndex++
  console.log(`现在的并发数是${concurrencyCount}，正在下载的是第${imgIndex}张，${url}`)

  const stream = request
    .get(url)
    .on('error', err => {
      console.error(err)
    })
    .pipe(fs.createWriteStream(`../data/node-resource/${imgIndex}.jpg`))

  stream.on('finish', () => {
    concurrencyCount--
    callback(null, url)
  })
}

crawl()
