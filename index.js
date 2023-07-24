const express = require('express');
const puppeteer = require('puppeteer');
const cors = require("cors");


const app = express();
app.use(express.json());
app.use(cors());
const port = 3000;

app.get('/', async (req, res) => {
    const url = 'https://www.decitre.fr/livres/litterature/rentree-litteraire/les-romans-incontournables.html';

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle0' });

    const books = await page.evaluate(() => {
        const bookElements = document.querySelectorAll('.dct-product');

        const bookList = Array.from(bookElements).map(book => {
        const title = book.querySelector('.product-title')?.innerText;
        const author = book.querySelector('.authors a')?.innerText;
        const image = book.querySelector('picture')?.getAttribute('data-iesrc');
        const extraInfos = book.querySelector('.extra-infos')?.innerText
            
        // Extract the date
        const dateMatch = extraInfos.match(/(\d{2}\/\d{2}\/\d{4})/);
        const date = dateMatch ? dateMatch[0] : null;

        // Extract the publisher
        const publisherMatch = extraInfos.match(/^(.*?)\sPARU/);
        const publisher = publisherMatch ? publisherMatch[1] : null;

        return { title, author, image, date, publisher };
        });

        return bookList;
    });

    await browser.close();
    res.json(books);
});


app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});