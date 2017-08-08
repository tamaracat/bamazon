var mysql = require('mysql');
var inquirer = require("inquirer");
var Table = require('cli-table');
//global variables
var shoppingCart = [];
var totalCost = 0;
var chosenID = 0;

var connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'mounT@in16',
    database: 'bamazon'
});

connection.connect(function(err){
    if (err) throw err;
    console.log("connected as id: " + connection.threadId);
    // insertProduct();

    printItems(function(){
      readProducts();
    });

    
});


function insertProduct(){
    var query = connection.query(

    'insert into products set ?',
    {
        product_name: "Nature's Bakery Whole Wheat Fig Bar",
        department_name: 'Grocery & Gourmet Food',
        price: 4.07,
        stock_quantity: 121
    },
    function(err, res){
        console.log(res.affectedRows + ' product inserted');
    }
    )
}
function printItems(readItems){
  //new cli-table
  var table = new Table({
    head: ['ID Number', 'Product', 'Department', 'Price', 'Quantity Available']
  });
  //get all rows from the Products table
  connection.query('SELECT * FROM products', function(err, res){
    if (err) throw err;
    //add all of the rows to the cli-table
    for (var i = 0; i < res.length; i++) {
      table.push([res[i].id, res[i].product_name, res[i].department_name, '$' + res[i].price.toFixed(2), res[i].stock_quantity]);
    }
    //log the table to the console
    console.log(table.toString());
   
});
    readProducts();
  }

function readProducts() {
    var items = [];
    var chosenItems = [];

  connection.query("SELECT product_name, id FROM products", function(err, res) {
    if (err) throw err;
    // Log all results of the SELECT statement

    for(var i=0; i<res.length; i++) {

    itemToPost = "";
    itemToPost += "ID: " + res[i].id + " Product Name: " + res[i].product_name;
      items.push(itemToPost)
    }

    inquirer.prompt([
    
     {
      type: "input",
      message: "Enter the ID of the you wish to purchase?",
      name: "ID"
    },
    {
      type: "input",
      message: "Enter Quantity?",
      name: "quantity"
    },
    {
      type: "confirm",
      message: "Do you want proceed?:",
      name: "confirm",
      default: true
    }
  ]).then(function(inquirerResponse){
      //alert the user if they did not select anything and run function again
   if (inquirerResponse.confirm) {
      console.log("\nGo Bamazon!");
    
    updateQuantity(inquirerResponse);
    }
    else {
      console.log("\nThank You!");
    }  
    });
     
  });
  
}
function updateQuantity(inquirerResponse){

var IDtoInt = Number(inquirerResponse.ID);

console.log("IDtoInt: ", IDtoInt);

var quantity = 0;

   connection.query('SELECT stock_quantity FROM products WHERE ?', 
   [
       {
           id: IDtoInt
        }
   ],
   function(err, res){
    if (err) throw err;
    //add all of the rows to the cli-table
    console.log("QUANTITY: ", res[0].stock_quantity);
   
   
   quantity = res[0].stock_quantity;

   quantity = quantity - inquirerResponse.quantity;

   if (quantity > 0 ){

   connection.query('UPDATE products SET ? WHERE ?',
    [
        {
             stock_quantity: quantity
        },
        {
            id: IDtoInt
       },
   ],
     function(err, res){
    if (err) throw err;
      
    console.log("Quantity updated to ", quantity);

    checkout(inquirerResponse);

      
});    
  } // End og if statement  
  else {
          // bid wasn't high enough, so apologize and start over
          console.log("Item out of stock. Choose a different item");
       
          readProducts();
        }
});
    
}
function checkout(inquirerResponse){

    var IDtoInt = Number(inquirerResponse.ID);

    connection.query('SELECT price FROM products WHERE ?', 
   [
       {
           id: IDtoInt
        }
   ],
   function(err, res){
    if (err) throw err;

    var num = Number(inquirerResponse.quantity);
   
    var custPrice = num * res[0].price;

    console.log("The total cost of the item is: ", custPrice);
   
   readProducts();
   
   });

}