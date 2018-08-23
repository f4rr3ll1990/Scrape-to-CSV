const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');
const writeStream = fs.createWriteStream('post.csv');
var rl = require('readline');
// image download
const download = require('image-downloader')


// Write Headers
writeStream.write(`Title;Link;Image;Price;Quantity;Model \n`);

var i = rl.createInterface(process.stdin, process.stdout, null);

i.question('Ссылка на категорию: ', function(answer) {

  console.log('Парсинг> ' + answer);

  Parse(answer);

  i.close();
  process.stdin.destroy();

});


function Parse(url){
request(
  {
    url: url,
    encoding: null
  },
  (error, response, html) => {


    if (!error && response.statusCode == 200) {
      const $ = cheerio.load(html);

      $('.product').each((i, el) => {
        // const title = $(el)
        //   .find('.name')
        //   .text()
        //   .replace(/\s\s+/g, '');
        const link = $(el)
          .find('a')
          .attr('href');
        // const date = $(el)
        //   .find('.price')
        //   .text()
        //   .replace(/\s\s+/g, '');

        childParse(link);


        // Write Row To CSV
        // writeStream.write(`${title}; ${link}; ${date} \n`);
      }); // each
      console.log('Scraping Done...');
      console.log('');
      let nextlink = $('link[rel="next"]').attr('href');

      if(nextlink) {
        console.log('nextlink: '+ nextlink);
        Parse(nextlink);
      }
    } //if



}); //main request

}; // parse

function childParse(link) {
  request(
    {
      url: link,
      encoding: null
    },
    (error, response, html) => {
      if (!error && response.statusCode == 200) {
        const $ = cheerio.load(html);
        let title = $('h1')
          .text()
          .replace(/\s\s+/g, '');
        // let price = $(el)
        //   .find()

        let price = $('.price-new')
          .text()
          .replace(/\s\s+/g, '');

        let model = $('span[itemprop="model"]')
          .text()
          .replace(/\s\s+/g, ''); 


        const imglink = $('.image')
          .find('img')
          .attr('src');

        // Download to a directory and save with the original filename
        const options = {
          url: imglink,
          dest: 'images'                  // Save to /path/to/dest/image.jpg
        }
        download.image(options)
          .then(({ filename, image }) => {
            console.log('File saved to', filename)
            writeStream.write(`${title}; ${link}; ${filename}; ${price}; 999; ${model} \n`);
            
          })
          .catch((err) => {
            console.error(err)
          });
      } // child if
}); // child request
}