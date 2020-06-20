const puppeteer = require('puppeteer')

async function crawl () {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    devtools: false,
    // ignoreDefaultArgs: ['--enable-automation'],
    args: [
      '--window-size=1920,1080'
    ]
  })
  const page = await browser.newPage()
  await page.goto('http://xiaoan.test.in-hope.com.cn/index')
  await page.waitForSelector('.user .login')
  await page.tap('.user .login')
  await page.waitForSelector('#txtmobile')
  await page.type('#txtmobile', '18857890570', { delay: 500 })
  await page.type('#txtpassword', 'xuejian', { delay: 500 })
  await page.tap('.loginbtn')
  await page.waitForSelector('.user-header-img')
  await page.hover('.nav li:nth-of-type(1)')
  await page.waitFor(50)
  await page.tap('#headPullDown .menuItem:nth-of-type(2) li:nth-of-type(2)')
  await page.waitForSelector('.el-autocomplete:nth-of-type(2) input')
  await page.type('.el-autocomplete:nth-of-type(2) input', '年度报告', { delay: 200 })
  await page.waitFor(1000)
  await page.keyboard.press('Enter')
  await page.waitFor(5000)
  const crawlInfoList = await page.evaluate(() => {
    const liLendth = document.querySelectorAll('.el-card__body .no-list .list li').length
    const infoList = []
    for (let index = 1; index <= liLendth; index++) {
      const dom = document.querySelector(`.el-card__body .no-list .list li:nth-of-type(${index}) .a-link`)
      console.log(dom)
      const title = dom.innerText
      const link = `${window.location.origin}${dom.attributes.href.value}`
      infoList.push({
        title,
        link
      })
    }
    return infoList
  })
  console.log(crawlInfoList)
  // browser.close()
}

crawl()
