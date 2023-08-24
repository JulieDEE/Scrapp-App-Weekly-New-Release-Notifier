const express = require('express');
const puppeteer = require('puppeteer');
const cors = require("cors");
const nodemailer = require('nodemailer');
const cron = require('node-cron');

require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());
const port = process.env.PORT;

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS 
    }
});

const fetchAndSendEmail = async () => {
    const url = process.env.SITE_URL;

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
        const link = book.querySelector('.catalog-product-list-image a')?.href;

        // Extract the date
        const dateMatch = extraInfos.match(/(\d{2}\/\d{2}\/\d{4})/);
        const date = dateMatch ? dateMatch[0] : null;

        // Extract the publisher
        const publisherMatch = extraInfos.match(/^(.*?)\sPARU/);
        const publisher = publisherMatch ? publisherMatch[1] : null;

        return { title, author, image, date, publisher, link };
        });

        return bookList;
    });

    const summaries = await Promise.all(books.map(async (book) => {
        const detailPage = await browser.newPage();
        await detailPage.goto(book.link, { waitUntil: 'networkidle0' });
        const summary = await detailPage.$eval('.content', el => el.innerText);
        await detailPage.close();
        return summary;
    }));

    for (let i = 0; i < books.length; i++) {
        books[i].summary = summaries[i];
    }

    let emailContent = '<h1>Informations sur les livres</h1>';
        books.forEach(book => {
            emailContent += `
                <h2>${book.title}</h2>
                <img src="${book.image}" alt="Couverture de ${book.title}">
                <p>Auteur: ${book.author}</p>
                <p>Date: ${book.date}</p>
                <p>Éditeur: ${book.publisher}</p>
                <p>Résumé: ${book.summary}</p>
                <a href="${book.link}">Voir plus</a>
                <hr>
            `;
        });
    
    let mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER,
        subject: 'Dernières nouveautés livres',
        html: emailContent
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            res.status(500).send("Erreur lors de l'envoi de l'e-mail.");
        } else {
            console.log('Email sent: ' + info.response);
            res.json(books); 
        }
    });
    
    await browser.close();
};

// AUTO SEND EMAIL EVERY MONDAY AT 9AM
cron.schedule('0 9 * * 1', fetchAndSendEmail);

app.listen(port, () => {
    console.log(`Server is running at ${port}`);
});