"use strict"

class shopTable {
    #cost = 0;
    values = [];
    itemMap;
    constructor({itemsList}) {
        this.values = itemsList;
        this.itemMap = new Map();
    }

    get values() {
        return this.values;
    }
    get cost() {
        return this.#cost;
    }

    createTable() {
        let table =`
        <table border="1">
            <tr>
                <th>Item</th>
                <th>Cost</th>
            </tr>`;
        this.values.forEach(({name, cost}) => {
            table += `
            <tr>
                <td>${name}</td>
                <td>${String(cost.toFixed(2))}</td>
            </tr>`;
            this.itemMap.set(name, cost);
        });
        table += `
        </table>`;
        return table;
    }

    createList() {
        let list = ``;
        this.values.forEach(({name}) => {
            list += `
            <option value="${name}">${name}</option>`
        });
        return list;
    }

    createOrder(selected) {
        this.values.forEach(({name, cost}) => {
            this.itemMap.set(name, cost);
        })
        this.#cost = 0;
        let order = `
        <table border="1">
            <tr>
                <th>Item</th>
                <th>Cost</th>
            </tr>`;
        selected.forEach((elem) => {
            order += `
            <tr>
                <td>${elem}</td>
                <td>${(this.itemMap.get(elem)).toFixed(2)}</td>
            </tr>`;
            this.#cost += this.itemMap.get(elem);
        });
        order += `
            <tr>
                <td>Total Cost:</td>
                <td>${(this.#cost).toFixed(2)}</td>
            </tr>
        </table>`;
        return order;
    }
}
const http = require('http');
const fs = require('fs');
const express = require('express');
const portNumber = 5000;
const path = require('path');
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({extended:false}));

process.stdin.setEncoding("utf-8");
if (process.argv.length != 3) {
    process.stdout.write("Usage supermarketServer.js jsonFile");
    process.exit(1);
}
let shop;
let items;
const file = fs.readFile(process.argv[2], 'utf-8', (err, fileContent) => {
    if (err) {
        throw err;
    }

    items = JSON.parse(fileContent);
    shop = new shopTable(items);
});

const prompt = "Type itemsList or stop to shutdown the server: ";
app.set("views", path.resolve(__dirname, "templates"));
app.set("view engine", "ejs");

app.get("/", (request, response) => {
    response.render("index");
});

app.get("/catalog", (request, response) => {
    const variables = { itemsTable: shop.createTable() };
    response.render("displayItems", variables);
});

app.get("/order", (request, response) => {
    const variables = { items: shop.createList() };
    response.render("placeOrder", variables);
});

app.post("/order", (request, response) => {
    const variables = { name: request.body.name,
                        email: request.body.email,
                        delivery: request.body.delivery,
                        orderTable: shop.createOrder(request.body.itemsSelected)};
    response.render("orderConfirmation", variables);
});

process.stdout.write(prompt);
process.stdin.on('readable', () => {
    let input = process.stdin.read();
    if (input != null) {
        input = input.trim();
        if (input === "stop") {
            console.log("Shutting down the server");
            process.exit(0);
        } else if (input === "itemsList") {
            console.log(items.itemsList);
        } else {
            console.log(`invalid command: ${input}`);
        }
    }
    process.stdout.write(prompt);
    process.stdin.resume();
});

app.listen(portNumber);
