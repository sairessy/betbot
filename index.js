const puppeteer = require('puppeteer');
const DataStore = require('nedb');

const database = new DataStore('database.db');
database.loadDatabase();

// Main function!
(async () => {
  let values = [];
  let arr = '-1';

  setInterval(async () => {   
    let value = await getData();
//     let value = Math.round(Math.random() * 40);  
    let numErr = 0;
    
    while (value === null || value == null || value === undefined || value == undefined) {
      value = await getData();
      numErr++;
    }
    
    values.push(value);
    database.insert({date: Date.now(), value});

    console.log(values);

    if(values.length === 3) {
      const s = checkEveness(values);

      if(s.status) {
        const num = s.even ? 'odd' : 'even';
        console.log(`OK, ${num}!`);
      }

      values = [];
      numErr = 0;
    }

    arr += ','+value;
  }, 30000);
})();

//  Get Last drawn ball on jogabets lucky six
async function getData() {
  const browser = await puppeteer.launch({
    headless: true
    // executablePath: 'C:/Program Files/Google/Chrome/Application/chrome',
  });

  const page = await browser.newPage();

  // await page.setDefaultNavigationTimeout(0); 
  await page.goto('https://jogabets.co.mz/en/betting/lucky', {waitUntil: 'load', timeout: 0});

  const lastValue = await page.evaluate(() => {
    return document.querySelector('.first-five .ball').innerText;
  });

  await browser.close();  
  return lastValue;
}

// Check if all array values has the same eveness
function checkEveness(values) {
  let even = true;
  let odd = false;
  
  for (let i = 0; i < values.length; i++) {
    const v = values[i];
    if(v % 2 !== 0) {
      even = false;
      break;
    }
  }

  if(!even) {
    odd = true;

    for (let i = 0; i < values.length; i++) {
      const v = values[i];
      if(v % 2 === 0) {
        odd = false;
        break;
      }
    }
  }

  return  {
    status: even || odd,
    even,
    odd
  };
}
