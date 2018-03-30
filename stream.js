var fs = require('fs');

var readStream = fs.createReadStream('test.pdf');
var writeStream = fs.createWriteStream('test_copy.pdf');

readStream.on('data', chunk =>{
    if(writeStream.write(chunk) === false){
        console.log('still cached');
        readStream.pause();
    }
})

readStream.on('end', () =>{
    writeStream.end();
})

writeStream.on('drain', () =>{
    console.log('data drains');
    readStream.resume();
})