const axios = require('axios')
const cheerio = require('cheerio')
const fs = require('fs')
const path = require('path')

const baseUrl = 'http://www.nbd.com.cn/app_features/870'

axios.get(baseUrl)
  .then(async response => {
    const $ = cheerio.load(response.data)
    const contents = $('.content-item a')
    if (!contents || contents.length <= 0) {
      return
    }
    for (let index = 0; index < contents.length; index++) {
      await visitNews(contents.eq(index).attr('href'), index + 1)
    }
  })
  .catch(err => {
    console.log(err)
  })

function visitNews (newsLink, index) {
  return new Promise(resolve => {
    console.log(`爬取第${index}篇 爬取${newsLink}`)
    axios.get(newsLink)
      .then(response => {
        const $ = cheerio.load(response.data)
        const title = $('h1').eq(0).text().trim()
        const time = $('.time').eq(0).text().trim()
        const newsContent = `标题：${title} \r\n时间：${time} \r\n链接：${newsLink}`
        fs.appendFileSync(path.join(__dirname, `../data/每经/${index}.txt`), newsContent)
        resolve()
      })
      .catch(err => {
        console.log(err)
      })
  })
}
