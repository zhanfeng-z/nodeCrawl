var http = require('http')
const https = require('https');
var fs = require('fs')
var request = require('request')

var writeStream = fs.createWriteStream('file.mp4')

let url = 'https://t.alipayobjects.com/images/T1T78eXapfXXXXXXXX.mp4';



request(url).pipe(writeStream)

