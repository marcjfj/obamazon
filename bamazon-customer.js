var mysql = require('mysql');
var Table = require('cli-table');
var { Spinner } = require('cli-spinner');
var inquirer = require('inquirer');

console.log('Mother Freaking');
console.log(`
 /$$$$$$$   /$$$$$$  /$$      /$$  /$$$$$$  /$$$$$$$$  /$$$$$$  /$$   /$$
| $$__  $$ /$$__  $$| $$$    /$$$ /$$__  $$|_____ $$  /$$__  $$| $$$ | $$
| $$  /\ $$| $$  /\ $$| $$$$  /$$$$| $$  /\ $$     /$$/ | $$ / \ $$| $$$$| $$
| $$$$$$$ | $$$$$$$$| $$ $$/$$ $$| $$$$$$$$    /$$/  | $$  | $$| $$ $$ $$
| $$__  $$| $$__  $$| $$  $$$| $$| $$__  $$   /$$/   | $$  | $$| $$  $$$$
| $$  /\ $$| $$  | $$| $$/\  $ | $$| $$  | $$  /$$/    | $$  | $$| $$/\  $$$
| $$$$$$$/| $$  | $$| $$ /\/  | $$| $$  | $$ /$$$$$$$$|  $$$$$$/| $$ /\  $$
|_______/ |__/  |__/|__/     |__/|__/  |__/|________/ /\______/ |__/  /\__/                                                                        
`);
console.log('**All Rights Reserved**');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'bamazon',
});
connection.connect();
const spinner = new Spinner('%s');
spinner.setSpinnerString('|/-\\');
spinner.start();
setTimeout(() => {
  spinner.stop();
  getProducts();
}, 2000);

function getProducts() {
  connection.query('SELECT * FROM products', function(error, results, fields) {
    if (error) throw error;

    const table = new Table({
      head: ['ID', 'Product', 'Department', 'QTY', 'Price'],
      colWidths: [7, 30, 10, 8, 8],
    });

    results.forEach(item => {
      table.push([
        item.item_id,
        item.product_name,
        item.department_name,
        item.stock_quantity,
        item.price,
      ]);
    });
    console.log(``);
    console.log(table.toString());
    pickProduct();
    // connection.end();
  });
}

function pickProduct() {
  inquirer
    .prompt([
      {
        name: 'productId',
        message: 'type the ID of the product you want',
      },
    ])
    .then(answers => {
      console.log(answers);
      searchProduct(answers.productId);
    });
}

function searchProduct(id) {
  console.log('you dirty dog...');
  connection.query(
    `SELECT * FROM products WHERE item_id = ${id} LIMIT 1`,
    function(error, results, fields) {
      if (error) {
        console.log(`that didn't make sense`);
        pickProduct();
        return;
      }
      console.log(`How many ${results[0].product_name}'s do you want??`);
      getQuantity(results[0].product_name, id, results[0].stock_quantity);
    }
  );
}

function getQuantity(name, id, available) {
  inquirer
    .prompt([
      {
        name: 'productQTY',
        message: `How many ${name}'s do you want??`,
      },
    ])
    .then(answers => {
      console.log(answers);
      if (answers.productQTY <= available) {
        purchase(id, answers.productQTY);
      } else {
        console.log(`Sorry, pervert, we don't have enough ${name}'s in stock`);
        console.log(`we only have ${available}`);
        getQuantity(name, id, available);
      }
    });
}

function purchase(id, qty) {
  connection.query(
    `SELECT * FROM products WHERE item_id = ${id} LIMIT 1`,
    function(error, results, fields) {
      if (error) {
        console.log(`that didn't make sense`);
        return;
      }
      console.log(`congratualations!`);
      console.log(`You just bought ${qty} ${results[0].product_name}'s`);
      console.log(`Your account has been charged $${results[0].price * qty}.`);
      connection.query(
        `UPDATE products SET stock_quantity = ${results[0].stock_quantity -
          qty} WHERE item_id = ${id}`,
        function(error, results, fields) {
          if (error) {
            console.log(`that didn't make sense`);
            throw error;
          }
        }
      );
      spinner.start();
      setTimeout(() => {
        spinner.stop();
        getProducts();
      }, 2000);
    }
  );
}
