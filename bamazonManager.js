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

    readProducts();
 
});

function AddToInvertory(){

 inquirer.prompt([
    
     {
      type: "input",
      message: "ID Number",
      name: "ID"
    },
    {
      type: "input",
      message: "Quantity",
      name: "quantity"
    },
    {
      type: "confirm",
      message: "Do you want proceed?:",
      name: "confirm",
      default: true
    }
    ]).then(function(inquirerResponse){
            

   connection.query('SELECT stock_quantity, product_name FROM products WHERE ?', 
   [
       {
           id: inquirerResponse.ID
        }
   ],
   function(err, res){
    if (err) throw err;
    //add all of the rows to the cli-table
   var product = res[0].product_name;
   var userQuantity = Number(inquirerResponse.quantity);
   var quantity = Number(res[0].stock_quantity);
   quantity = quantity + userQuantity;

    connection.query('UPDATE products SET ? WHERE ?',
    [
            {
                stock_quantity: quantity
            },
            {
                id: inquirerResponse.ID
            },
    ],
    function(err, res){
    if (err) throw err;
        connection.end(); 
        console.log("Quantity of ", product, "updated to ", quantity);  
    }
    )
    
 }); 
  
    }); 

    

}

function AddNewProduct(){


    inquirer.prompt([
    
     {
      type: "input",
      message: "Product",
      name: "product"
    },
    {
      type: "input",
      message: "Department",
      name: "department"
    },
    {
      type: "input",
      message: "Price",
      name: "price"
    },
    {
      type: "input",
      message: "Quantity",
      name: "quantity"
    },
    {
      type: "confirm",
      message: "Do you want proceed?:",
      name: "confirm",
      default: true
    }
  ]).then(function(inquirerResponse){
  
  var query = connection.query(

    'insert into products set ?',
    {
        product_name: inquirerResponse.product,
        department_name: inquirerResponse.department,
        price: inquirerResponse.price,
        stock_quantity: inquirerResponse.quantity
    },
    function(err, res){
        console.log(err);    
    }
    )
    connection.end();
   });
   
}
function ViewProductsforSale(){
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
    connection.end();
    console.log(table.toString());
   
});


}
function ViewLowInventory(){
  //new cli-table
  var table = new Table({
    head: ['ID Number', 'Product', 'Department', 'Price', 'Quantity Available']
  });
  //get all rows from the Products table
  connection.query('SELECT * FROM products WHERE stock_quantity < 50', function(err, res){
    if (err) throw err;
    //add all of the rows to the cli-table
    for (var i = 0; i < res.length; i++) {
      table.push([res[i].id, res[i].product_name, res[i].department_name, '$' + res[i].price.toFixed(2), res[i].stock_quantity]);
    }
    //log the table to the console
    console.log(table.toString());
   
});
connection.end();
// readProducts();
}
function readProducts() {
    var items = [];
    var chosenItems = [];

    ManagerSelections = ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product"];
    // Log all results of the SELECT statement

    for(var i=0; i<ManagerSelections.length; i++) {

    itemToPost = "";
    itemToPost += ManagerSelections[i];
      items.push(itemToPost)
    }

    inquirer.prompt([
    
     {
      type: "list",
      message: "Choose Database View",
      choices: items,
      name: "view"
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
      console.log("\nGo Bamazon!", inquirerResponse.view);
    
      if(inquirerResponse.view === "View Products for Sale"){

            ViewProductsforSale();
      }
      else if(inquirerResponse.view === "View Low Inventory"){

            ViewLowInventory();
      }
      else if(inquirerResponse.view === "Add to Inventory"){

            AddToInvertory();
      }
      else if(inquirerResponse.view === "Add New Product"){

            AddNewProduct();
      }

    else {
      console.log("\nExiting Bamazon Manager Application");
      connection.end();
    }  
   }
    });
  
}
