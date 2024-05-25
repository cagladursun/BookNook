//call the neccessary modules
const express= require('express');
const mysql = require('mysql2');
const path = require('path');
const ejs = require('ejs');
const multer = require('multer');
const session = require("express-session");
const bodyParser = require('body-parser');
const fs = require('fs');
const { type } = require('os');
const { Console } = require('console');
const app = express();
const port = 3016;

// Connect to MySQL database
const db = mysql.createConnection({

    host: '127.0.0.1',
    user: 'root',
    password: '15937',
    database: 'mydb'
  });

db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
    } else {
        console.log('Connected to the database');
    }
});


// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static('public'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: 'your_secret_key',
    resave: true,
    saveUninitialized: true
}));

var user_name;
var cart_code;

//to insert users data, when he makes a registration
app.post('/register', (req, res) => {
    const { user_name, password_ ,email} = req.body;
    const query = 'INSERT INTO users (user_name, password_, email) VALUES (?, ?, ?)';
    db.query(query, [user_name, password_,email], (err, result) => {
        if (err) {
            console.error('Error inserting into the database:', err);
            res.status(500).send('Internal Server Error');
        } else {
          return res.send(`
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body>
            <script>
              alert("Succesfully logged in. Welcome ");
              window.location.href = '/BookNook';
            </script>
          </body>
          </html>
        `);
        }
    });
});

//validation of the log in
app.post('/login', (req, res) => {
    const { email, password_ } = req.body;
    if (!email || !password_) {
          return res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body>
              <script>
                alert("Username/Email and password are required.");
                window.location.href = '/BookNook';
              </script>
            </body>
            </html>
          `);
    }
    const query = 'SELECT * FROM users WHERE (user_name = ? OR email = ?) AND password_ = ?';
    db.query(query, [email, email, password_], (err, results) => {
        if (err) {
            console.error('Error querying the database:', err);
            res.status(500).send('Internal Server Error');
        } else {
            if (results.length > 0) {
                req.session = req.session || {};
                req.session.isLoggedIn = true;
                user_name = results[0].user_name;
                cart_code=results[0].cart_code;
                req.session.user_name = user_name;
                res.redirect('/login_access.html');
            } else {
              return res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body>
              <script>
                alert("Invalid email or password. ");
                window.location.href = '/BookNook';
              </script>
            </body>
            </html>
          `);
          }
        }
    });
});

//validation of the user account
app.post('/admin', (req, res) => {
  const { user_name, password_ } = req.body;
  if (!user_name || !password_) {
    return res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
    </head>
    <body>
      <script>
        alert("Username/Email and password are required.");
        window.location.href = '/BookNook';
      </script>
    </body>
    </html>
  `);
  }

  const query = 'SELECT * FROM admin WHERE user_name = ? AND password_ = ?';
  db.query(query, [user_name, password_], (err, results) => {
      if (err) {
          console.error('Error querying the database:', err);
          res.status(500).send('Internal Server Error');
      } else {
          if (results.length > 0) {
              req.session = req.session || {};
              req.session.isLoggedInAdmin = true;
              req.session.user_name = user_name;
              res.redirect('/login_access_admin.html');
          } else {
            return res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body>
              <script>
                alert("Invalid email or password. ");
                window.location.href = '/BookNook';
              </script>
            </body>
            </html>
          `);
          }
      }
  });
});




app.get('/logout', (req, res) => {
    // Destroy the user's session to log them out
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
            res.json({ success: false, message: 'Logout failed' });
        } else {
            // Successful logout
            res.json({ success: true});
        }
    });
});

//then to check who is logged in, to give an access for the needed sections
app.get('/check-login', (req, res) => {
  const isLoggedIn = req.session && req.session.isLoggedIn || false;
  const isLoggedInAdmin = req.session && req.session.isLoggedInAdmin || false;
  res.json({ isLoggedIn, isLoggedInAdmin });
});




//to insert new address data to the database
app.post('/address_reg', (req, res) => {
    const {name_, country ,post_code,neighbourhood, street, phone_number,details} = req.body;
    user_name = req.session.user_name;

    // If the username is not taken, insert the user into the database
    const query = 'INSERT INTO address (name_,user_name, country ,post_code,neighbourhood, street, phone_number,details) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    db.query(query, [name_,user_name, country ,post_code,neighbourhood, street, phone_number,details], (err, result) => {
        if (err) {
          return res.send(`
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body>
            <script>
              alert("Invalid data. Please try again ");
              window.location.href = '/BookNook';
            </script>
          </body>
          </html>
        `);
        } else {
          return res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body>
              <script>
                alert("New Address added");
                window.location.href = '/user_addresses';
              </script>
            </body>
            </html>
          `);
        }
    });
});

var address={
    name_:[],
    country:[],
    post_code:[],
    neighbourhood:[],
    street:[],
    phone_number:[],
    details:[],
  }
var user_name;
var valid=false;


const addressesDatabase = [];


app.post('/saveAddress', (req, res) => {
  address={
    name_:[],
    country:[],
    post_code:[],
    neighbourhood:[],
    street:[],
    phone_number:[],
    details:[],
  }
  user_name = req.session.user_name;
  const { name_, street, post_code, neighbourhood,phone_number, country, details } = req.body.addressData;

  const price=user_cart.totalPrice; //to get total price

  const order_situation='prepared';


  const query = 'INSERT INTO active_orders (name_, user_name, country, post_code ,neighbourhood, street, order_situation,price) VALUES (?)';


  const queryParams = [name_, user_name, country, post_code ,neighbourhood, street, order_situation,price];
  db.query(query, [queryParams], (err, result) => {
    if (err) {
        console.error('Error inserting into the database:', err);
        res.status(500).send('Internal Server Error');
    } else {
        var order_no;
        const order_no_query=`SELECT order_no FROM active_orders WHERE user_name ='${user_name}' AND price =${user_cart.totalPrice}`;
        db.query(order_no_query, (err, result) => {
          if (err) {
              console.error('Error updating users:', err);
          } else {
              order_no=result[0].order_no;
          }
        });
        var bookid=[];
        var amountBook=[];

        const booksInCart=`Select book_id, amount from books_in_cart where cart_code = ${cart_code}`;
        db.query(booksInCart, (err, result) => {
          if (err) {
              console.error('Error updating users:', err);
          } else {
            for (const resItem of result) {
              const bookId=resItem.book_id;
              const amount= resItem.amount;
              bookid.push(bookId);
              amountBook.push(amount);
            }
            for (let i = 0; i < bookid.length; i++) {
              const stock= `UPDATE stocks SET stock_num = stock_num +${amountBook[i]}, sold_book_num=sold_book_num-${amountBook[i]} WHERE book_id = ${bookid[i]}`;
              db.query(stock, (err, result) => {
                if (err) {
                    console.error('Error updating users:', err);
                }
              });
            }

            for (let i = 0; i < bookid.length; i++) {
              const bookinfo = `SELECT Book_Name, Price FROM book WHERE Book_Id = ${bookid[i]}`;
              db.query(bookinfo, (err, result) => {
                if (err) {
                    console.error('Error updating users:', err);
                }
                const bookName=result[0].Book_Name;
                const price=result[0].Price;
                const products = 'INSERT INTO products (order_no, user_name, book_name, price, book_id) VALUES (?, ?, ?, ?, ?)';

                db.query(products, [order_no, user_name, bookName, price, bookid[i]], (err, result) => {
                  if (err) {
                    console.error('Error inserting into products:', err);
                  }
                });

              });
            }
          }

        });
        
        
        
        const updateUsersQuery = `
            UPDATE users SET books_in_cart = 0 WHERE cart_code = ?;
        `;
        const updateCartQuery = `
            UPDATE cart SET total_price = 0 WHERE cart_code = ?;
        `;
        const setSafeUpdatesQuery = `
            SET SQL_SAFE_UPDATES = 0;
        `;
        const deleteBooksInCartQuery = `
            DELETE FROM books_in_cart WHERE cart_code = ?;
        `;

       
        db.query(updateUsersQuery, [cart_code], (err, result) => {
            if (err) {
                console.error('Error updating users:', err);
             
            } 
        });

        db.query(updateCartQuery, [cart_code], (err, result) => {
            if (err) {
                console.error('Error updating cart:', err);
             
            } 
        });

        db.query(setSafeUpdatesQuery, (err, result) => {
            if (err) {
                console.error('Error setting SQL_SAFE_UPDATES:', err);
             
            } 
        });

        db.query(deleteBooksInCartQuery, [cart_code], (err, result) => {
            if (err) {
                console.error('Error deleting books_in_cart:', err);
             
            } 
        });

        res.json({ success: true });
    }
});
});

//to check do adress needed to display them or they need to be got to choose one of them for an order
app.get('/selected', (req,res)=>{
  valid=true;
  res.redirect('/user_addresses');
});
//used to get from database user addreses and then sent them to ejs and display them
app.get('/user_addresses', (req, res) => {
  address={
    name_:[],
    country:[],
    post_code:[],
    neighbourhood:[],
    street:[],
    phone_number:[],
    details:[],
  }
    var requestData=req.body.requestData;
    user_name = req.session.user_name;
    const query = 'SELECT * FROM address WHERE user_name = ?';
    db.query(query, [user_name], (err, results) => {
        if (err) {
            console.error('Error querying the database:', err);
            res.status(500).send('Internal Server Error');
        } else {
            for (const resAd of results) {
                  const name_ = resAd.name_;
                  const country =resAd.country;
                  const post_code=resAd.post_code;
                  const neighbourhood = resAd.neighbourhood;
                  const street =resAd.street;
                  const phone_number=resAd.phone_number;
                  const details=resAd.details;
                  address.name_.push(name_);
                  address.country.push(country);
                  address.post_code.push(post_code);
                  address.neighbourhood.push(neighbourhood);
                  address.street.push(street);
                  address.phone_number.push(phone_number);
                  address.details.push(details);
            }
            //if valid is true, it means that this address data needed to diplayed in another ejs
            if(valid){
              res.render('choose_address.ejs', {address});
              valid=false;
            }
            else{
              res.render('user.addresses.ejs', {address});
            }
            
        }
    });
});

//to change password of the user
app.post('/change-password', (req, res) => {
    const { currentPassword, newPassword } = req.body;
    user_name = req.session.user_name;

    // Validate required fields
    if (!currentPassword || !newPassword) {
        return res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body>
              <script>
                alert("Both current and new passwords are required.");
                window.location.href = '/';
              </script>
            </body>
            </html>
          `);
          res.render('index');
    }

    // Check user credentials in the database
    const query = 'SELECT password_ FROM users WHERE user_name = ?';
    db.query(query, [user_name], (err, results) => {
        if (err) {
            console.error('Error querying the database:', err);
            res.status(500).send('Internal Server Error');
        } else {
            // Check if the current password is correct
            if (results.length > 0 && ((results[0].password_ || '').toString().trim()=== (currentPassword || '').toString().trim())) {
                // Update the password in the database
                const updateQuery = 'UPDATE users SET password_ = ? WHERE user_name = ?';
                db.query(updateQuery, [newPassword, user_name], (updateErr, updateResults) => {
                    if (updateErr) {
                        console.error('Error updating password:', updateErr);
                        res.status(500).send('Internal Server Error');
                    } else {
                      return res.send(`
                      <!DOCTYPE html>
                      <html lang="en">
                      <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                      </head>
                      <body>
                        <script>
                          alert("Password changed");
                          window.location.href = '/';
                        </script>
                      </body>
                      </html>
                    `);
                    res.render('login_access.html');
                    }
                });
            } else {
                return res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body>
              <script>
                alert("Incorrect current password.");
                window.location.href = '/';
              </script>
            </body>
            </html>
          `);
          res.render('login_access.html');
          }
        }
    });
});


//to change password of the user
app.post('/forgot', (req, res) => {
  const { email, password_ } = req.body;

  // Validate required fields
  if (!email || !password_) {
      return res.send(`
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body>
            <script>
              alert("Invalid data");
              window.location.href = '/';
            </script>
          </body>
          </html>
        `);
        res.render('index');
  }

  // Check user credentials in the database
  const query = 'SELECT password_ FROM users WHERE email = ?';
  db.query(query, [email], (err, results) => {
      if (err) {
          console.error('Error querying the database:', err);
          res.status(500).send('Internal Server Error');
      } else {
          // Check if the current password is correct
              // Update the password in the database
              const updateQuery = 'UPDATE users SET password_ = ? WHERE user_name = ?';
              db.query(updateQuery, [password_, user_name], (updateErr, updateResults) => {
                  if (updateErr) {
                      console.error('Error updating password:', updateErr);
                      res.status(500).send('Internal Server Error');
                  } else {
                    return res.send(`
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                      <meta charset="UTF-8">
                      <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    </head>
                    <body>
                      <script>
                        alert("Password changed");
                        window.location.href = '/';
                      </script>
                    </body>
                    </html>
                  `);
                  res.render('login_access.html');
                  }
              });
        
      }
  });
});




//to take the comments of the user
const my_rating={
  Book_Name:[],
  rating:[],
  user_comment:[],
}
var Book_Name;
app.get('/my_ratings', (req, res) => {
  user_name = req.session.user_name;
  const query = 'SELECT br.rating, br.user_comment, br.book_id, b.Book_Name FROM book_rating br JOIN book b ON br.book_id = b.book_id WHERE br.user_name = ?';
  db.query(query, [user_name], async (err, results) => {
      if (err) {
          console.error('Error querying the database:', err);
          res.status(500).send('Internal Server Error');
      } else {
          for (const resRa of results) {
                const book_id = resRa.book_id;
                const rating =resRa.rating;
                const user_comment=resRa.user_comment;
                const Book_Name =resRa.Book_Name;
                my_rating.Book_Name.push(Book_Name);
                my_rating.rating.push(rating);
                my_rating.user_comment.push(user_comment);
          }
           res.render('my_ratings.ejs', {my_rating});
      }
  });

});



let sql= "SELECT * FROM book;"
app.use(bodyParser.json()); // Parse JSON requests


// to take the category is pressed by user
var receivedCategory;
app.post('/receivedCategory', (req,res)=>{
  receivedCategory = req.body.category;
})

var book = {
  bookId: [],
  imagePaths: [],
  productName: [],
  price: [],
  rating: [],
  summary:[],
  publishYear:[],
  publisher:[],
  pageCount:[],
  coverType:[],
  favoriteCount:[],
  author:[],
  category:[],
}

var rating;
var bookName;
var price;
var summary;
var publishYear;
var publisher;
var pageCount;
var coverType;
var favoriteCount;
var author;
var category;
var Book_Id;
app.get('/category', (req, res) => {
  book = {
    bookId: [],
    imagePaths: [],
    productName: [],
    price: [],
    rating: [],
    summary:[],
    publishYear:[],
    publisher:[],
    pageCount:[],
    coverType:[],
    favoriteCount:[],
    author:[],
    category:[],
  };
  db.execute(sql, function (err, result){

    if(err){
      console.log("connection error");
      throw err;
    }
    var imagePath;
    for (const resItem of result) {
      if (resItem.Category == receivedCategory) {
        Book_Id = resItem.Book_Id;
        rating =resItem.Rating_Average;
        bookName=resItem.Book_Name;
        price=resItem.Price;
        summary=resItem.Summary;
        publishYear=resItem.Publication_Year;
        publisher=resItem.Publisher;
        pageCount=resItem.Page_Count;
        coverType=resItem.Cover_Type;
        favoriteCount=resItem.Favorite_Count;
        author=resItem.Author;
        imagePath = 'BookCover/' + `${Book_Id}.png`;
        book.bookId.push(Book_Id);
        book.imagePaths.push(imagePath);
        book.rating.push(rating);
        book.productName.push(bookName);
        book.price.push(price);
        book.summary.push(summary);
        book.publishYear.push(publishYear);
        book.publisher.push(publisher);
        book.pageCount.push(pageCount);
        book.coverType.push(coverType);
        book.favoriteCount.push(favoriteCount);
        book.author.push(author);
      }
    }
   res.render('category', { book});
  });  
  
});



let userInfo;
let info;
let cart;
let cartBooks=`SELECT * FROM books_in_cart;`
var oldPrice;
var code;
let updatePrice;
var num;
let updateBooks;
var flag=true;



  
  let user="SELECT * FROM book LEFT JOIN favorited_books ON book.Book_Id = favorited_books.book_id UNION SELECT * FROM book RIGHT JOIN favorited_books ON book.Book_Id = favorited_books.book_id;"
  
  let found = false;
  //to store and show favorites books of the user 
  app.get('/favorite', (req, res) => {
    user_name = req.session.user_name;
    book = {
      bookId: [],
      imagePaths: [],
      productName: [],
      price: [],
      rating: [],
      summary:[],
      publishYear:[],
      publisher:[],
      pageCount:[],
      coverType:[],
      favoriteCount:[],
      author:[],
      category:[],
    };
    db.execute(user, function (err, result){
      if(err){
        console.log("connection error");
        throw err;
      }
      var imagePath;
      for (const resItem of result) {
        
        const Book_Id = resItem.Book_Id;
        const isElementFound = Object.values(book).some(array => array.includes(Book_Id));
        if (resItem.user_name== user_name && (!isElementFound)) {
          
          rating =resItem.Rating_Average;
          bookName=resItem.Book_Name;
          price=resItem.Price;
          summary=resItem.Summary;
          publishYear=resItem.Publication_Year;
          publisher=resItem.Publisher;
          pageCount=resItem.Page_Count;
          coverType=resItem.Cover_Type;
          favoriteCount=resItem.Favorite_Count;
          author=resItem.Author;
          imagePath = 'BookCover/' + `${Book_Id}.png`;
          category=resItem.Category;
          book.bookId.push(Book_Id);
          book.imagePaths.push(imagePath);
          book.rating.push(rating);
          book.productName.push(bookName);
          book.price.push(price);
          book.summary.push(summary);
          book.publishYear.push(publishYear);
          book.publisher.push(publisher);
          book.pageCount.push(pageCount);
          book.coverType.push(coverType);
          book.favoriteCount.push(favoriteCount);
          book.author.push(author);
          book.category.push(category);
          found=true;
        }
      }
      res.render('favorite.ejs', {book});
    });  
    
  });
  
  var ejsFileName;
  //to delete book from favorites of the user
  let favoritedBooks="Select * from favorited_books;"
  var  deleteQuery;
  var itemId;
  app.post('/delete', (req, res) => {
    ejsFileName = req.body.ejsFileName;
    user_name = req.session.user_name;
    itemId = req.body.itemId; 
    var tableName = 'favorited_books';
    var deleteCondition;
    db.execute(favoritedBooks, function (err, result){
      if(err){
        console.log("connection error");
        throw err;
      }
      var imagePath;
      
      for (const resItem of result) {
        if (resItem.user_name== user_name) {
          deleteCondition = `user_name = '${resItem.user_name}' AND book_id = ${book.bookId[itemId]}`;
          deleteQuery = `DELETE FROM ${tableName} WHERE ${deleteCondition}`;
          res.redirect('/found');
          break;
        }
      }
      
  });
  
  app.get('/found', (req, res) => {
    db.query(deleteQuery, (error, results, fields) => {
      if (error) {
        console.error('Error deleting row:', error);
      } else {
        console.log('Row deleted successfully.');
      }
    });
    book.bookId.splice(itemId, 1);
    book.imagePaths.splice(itemId, 1);
    book.productName.splice(itemId, 1);
    book.price.splice(itemId, 1);
  
 
    res.redirect('/favorite');
  
  });  
  });

  var cartflag=false;
  

var cartCode;
var totalPrice;
var orderNote;
var shipName;
var time;

var shipment={
  shipName:[],
  time:[],
  price:[],
}
var previousValue="credit";// payment method
var user_cart={
  
  cartCode,
  totalPrice,
  orderNote,
  amount:[],
  method:previousValue,
  book,
  shipment,
};


// to take the shopping cart information of the user
app.get('/cart', (req, res) => {
  const isLoggedIn = req.session && req.session.isLoggedIn || false;
  if(isLoggedIn){
    shipment={
    shipName:[],
    time:[],
    price:[],
  }
  const querys = "Select * from shipment;"
  
  db.query(querys, (error, results, fields) => {
    if (error) {
      console.error('Error executing query:', error);
    } else {
      for (const resItem of results) {
        shipName=resItem.ship_name;
        time=resItem.time;
        price=resItem.price;
        user_cart.shipment.shipName.push(shipName);
        user_cart.shipment.time.push(time);
        user_cart.shipment.price.push(price);
      }
    }
  });
  book = {
    bookId: [],
    imagePaths: [],
    productName: [],
    price: [],
    rating: [],
    summary:[],
    publishYear:[],
    publisher:[],
    pageCount:[],
    coverType:[],
    favoriteCount:[],
    author:[],
    category:[],
  };
  user_cart={

    cartCode,
    totalPrice,
    orderNote,
    amount:[],
    method:"credit",
    book,
    shipment,
  };
  
    user_name = req.session.user_name;
    const query = `SELECT * FROM books_in_cart bic JOIN book b ON bic.book_id = b.book_id WHERE bic.cart_code = ${cart_code}`;
    const cartq=`SELECT order_note, total_price FROM cart WHERE cart_code = ${cart_code}`;

    db.query(cartq, (error, results, fields) => {
      if (error) {
        console.error('Error executing query:', error);
      } else {
        // Assuming results is an array with one row and one column
        user_cart.totalPrice = results[0].total_price;
        user_cart.orderNote=results[0].order_note;
      }
    });
    user_cart.cartCode=query.cartCode;

    db.query(query, [user_name], (err, results) => {
        if (err) {
            console.error('Error querying the database:', err);
            res.status(500).send('Internal Server Error');
        } else {
            for (const resItem of results) {
              book_id=resItem.Book_Id;
              rating =resItem.Rating_Average;
              bookName=resItem.Book_Name;
              price=resItem.Price;
              summary=resItem.Summary;
              publishYear=resItem.Publication_Year;
              publisher=resItem.Publisher;
              pageCount=resItem.Page_Count;
              coverType=resItem.Cover_Type;
              favoriteCount=resItem.Favorite_Count;
              author=resItem.Author;
              imagePath = 'BookCover/' + `${book_id}.png`;
              category=resItem.Category;
              const amount = resItem.amount;
              user_cart.book.bookId.push(book_id);
              user_cart.book.imagePaths.push(imagePath);
              user_cart.book.rating.push(rating);
              user_cart.book.productName.push(bookName);
              user_cart.book.price.push(price);
              user_cart.book.summary.push(summary);
              user_cart.book.publishYear.push(publishYear);
              user_cart.book.publisher.push(publisher);
              user_cart.book.pageCount.push(pageCount);
              user_cart.book.coverType.push(coverType);
              user_cart.book.favoriteCount.push(favoriteCount);
              user_cart.book.author.push(author);
              user_cart.book.category.push(category);
              user_cart.amount.push(amount);
            }
            res.render('carts.ejs', {user_cart});
            
        }
    });
  }
  else{
    return res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        
      </head>
      <body>
        <script>
          alert("You are not logged in. You can not access the cart.");
          window.location.href = '/BookNook';
        </script>
      </body>
      </html>
    `);
    
  }
  
});

// to choose payment method
var addPrice;
app.post('/method', (req, res) => {
  
  var id=req.body.itemId;
  user_cart.method=id;
  if(id==previousValue){
    res.render('carts.ejs', {user_cart});
  }
  else{
    if(id=="pay"){
      addPrice=parseFloat(user_cart.totalPrice)+parseFloat(9.90) ;
    }
    else{
      addPrice=parseFloat(user_cart.totalPrice)-parseFloat(9.90) ;
    }
    user_cart.totalPrice=addPrice.toFixed(2);
    previousValue=id;
    const total= `UPDATE cart SET total_price = ${addPrice.toFixed(2)} WHERE cart_code = ${cart_code}`;
    db.query(total, (error, results, fields) => {
      if (error) {
        console.error('Error updating row:', error);
      } else {
        console.log('Row updated successfully.');
      }
    });
    res.render('carts.ejs', {user_cart});
  }
});
app.post('/ship', (req, res)=>{
  var id=req.body.ship;
})

//to calculate the total price of the cart
app.post('/total', (req, res) => {
  var check=user_cart.totalPrice;
  const selectedPrice = parseFloat(req.body.selectedPrice);
  check=parseFloat(check)+parseFloat(selectedPrice) ;
  user_cart.totalPrice=check.toFixed(2);
  const total= `UPDATE cart SET total_price = ${check.toFixed(2)} WHERE cart_code = ${cart_code}`;
  db.query(total, (error, results, fields) => {
    if (error) {
      console.error('Error updating row:', error);
    } else {
      console.log('Row updated successfully.');
      res.render('carts.ejs', {user_cart});
    }
    
  });
});
//to add books to cart 
app.post('/added', (req, res) => {
  const isLoggedIn = req.session && req.session.isLoggedIn || false;
  if(isLoggedIn){
  cartflag=true;
  userInfo=`SELECT books_in_cart FROM users WHERE user_name = '${user_name}'`;
  cart = `SELECT total_price FROM cart WHERE cart_code = '${cart_code}'`;
  user_name = req.session.user_name;
  itemId = req.body.itemId; 
  ejsFileName = req.body.ejsFileName;
  
  
  db.query(userInfo, (error, results, fields) => {
    if (error) {
      console.error('Error executing query:', error);
    } else {
      num = results[0].books_in_cart;
    }
    num=num+1;
    updateBooks = `UPDATE users SET books_in_cart = ${num} WHERE user_name = '${user_name}'`;
  });
 
  db.query(cart, (error, results, fields) => {
    if (error) {
      console.error('Error executing query:', error);
    } else {
      oldPrice = results[0].total_price;
    }
    const newPrice = parseFloat(oldPrice) + parseFloat(book.price[itemId]);
    updatePrice=`UPDATE cart SET total_price = ${newPrice.toFixed(2)} WHERE cart_code = '${cart_code}'`;
  });

  db.execute(cartBooks, function (err, result){
    if(err){
      console.log("connection error");
      throw err;
    }
    if(result.length==0){
      info = `INSERT INTO books_in_cart (book_id, cart_code,amount) VALUES (${book.bookId[itemId]}, ${cart_code}, 1)`;
    }
    for (const resItem of result) {
      if (resItem.cart_code == cart_code && resItem.book_id == book.bookId[itemId]) {
        info=`UPDATE books_in_cart SET amount = amount + 1 WHERE cart_code = ${cart_code} AND book_id = ${book.bookId[itemId]}`;
        flag=false;
      
      }

    }
    if(flag){
      info = `INSERT INTO books_in_cart (book_id, cart_code,amount) VALUES (${book.bookId[itemId]}, ${cart_code}, 1)`;
    }
    res.redirect('/operations');
  });
  }
  else{
    return res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body>
        <script>
          alert("You are not logged in. You can not put items in the cart.");
          window.location.href = '/BookNook';
        </script>
      </body>
      </html>
    `);
    
  }

  

});

app.post('/deletecart', (req, res) => {
  var amount;
  user_name = req.session.user_name;
  itemId = req.body.itemId; 
  ejsFileName = req.body.ejsFileName;
  cartflag=true;
  const books_in_cart=`select * from books_in_cart where cart_code = '${cart_code}' AND book_id = ${book.bookId[itemId]}`;
  userInfo=`SELECT books_in_cart FROM users WHERE user_name = '${user_name}'`;
  cart = `SELECT total_price FROM cart WHERE cart_code = '${cart_code}'`;
  
  db.query(books_in_cart, (error, results, fields) => {
    if (error) {
      console.error('Error executing query:', error);
    } else {
     
      amount = results[0].amount;
    }
  });
  db.query(userInfo, (error, results, fields) => {
    if (error) {
      console.error('Error executing query:', error);
    } else {
      
      num = results[0].books_in_cart;
    }
    num=num-amount;
    updateBooks = `UPDATE users SET books_in_cart = ${num} WHERE user_name = '${user_name}'`;
  });
 
  db.query(cart, (error, results, fields) => {
    if (error) {
      console.error('Error executing query:', error);
    } else {
      
      oldPrice = results[0].total_price;
    }
    const newPrice = parseFloat(oldPrice) - parseFloat(book.price[itemId])*user_cart.amount[itemId];
    updatePrice=`UPDATE cart SET total_price = ${newPrice} WHERE cart_code = '${cart_code}'`;
  });

  db.execute(cartBooks, function (err, result){
    if(err){
      console.log("connection error");
      throw err;
    }
    for (const resItem of result) {
      if (resItem.cart_code == cart_code && resItem.book_id == book.bookId[itemId]) {
        info=`DELETE FROM books_in_cart  WHERE book_id = ${book.bookId[itemId]} AND cart_code = ${cart_code};`;
        
      }

    }
    res.redirect('/operations');
  });

});
app.post('/decrement', (req, res) => {
  user_name = req.session.user_name;
  itemId = req.body.itemId;
  
  userInfo=`SELECT books_in_cart FROM users WHERE user_name = '${user_name}'`;
  cart = `SELECT total_price FROM cart WHERE cart_code = '${cart_code}'`;
  
 
  db.query(userInfo, (error, results, fields) => {
    if (error) {
      console.error('Error executing query:', error);
    } else {
    
      num = results[0].books_in_cart;
    }
    num=num-1;
    updateBooks = `UPDATE users SET books_in_cart = ${num} WHERE user_name = '${user_name}'`;
  });
 
  db.query(cart, (error, results, fields) => {
    if (error) {
      console.error('Error executing query:', error);
    } else {
      
      oldPrice = results[0].total_price;
    }
    const newPrice = parseFloat(oldPrice) - parseFloat(book.price[itemId]);
    updatePrice=`UPDATE cart SET total_price = ${newPrice} WHERE cart_code = '${cart_code}'`;
  });

  db.execute(cartBooks, function (err, result){
    if(err){
      console.log("connection error");
      throw err;
    }
    console.log('result;', result) ;
    for (const resItem of result) {
      if (resItem.cart_code == cart_code && resItem.book_id == book.bookId[itemId]) {
        info=`UPDATE books_in_cart SET amount = amount -1 WHERE cart_code = ${cart_code} AND book_id = ${book.bookId[itemId]}`;
        flag=false;
      
      }
    }
    res.redirect('/operations');
  });


});
app.get('/operations', (req, res) => {
  db.query(updateBooks, (error, results, fields) => {
    if (error) {
      console.error('Error updating row:', error);
    } else {
      console.log('Row updated successfully.');
    }
  });

  db.query(updatePrice, (error, results, fields) => {
    if (error) {
      console.error('Error updating row:', error);
    } else {
      console.log('Row updated successfully.');
    }
  });
  db.query(info, (error, results, fields) => {
    if (error) {
      console.error('Error inserting row:', error);
    } else {
      console.log('Row inserted successfully.');
    }
  });

  if(ejsFileName == "f"){
    res.redirect("/favorite");
  }
  else if(ejsFileName=="c"){
    res.render("category.ejs", {book});
  }
  else if(ejsFileName=="b"){
    res.render("book_Page.ejs", {bookPage});
  }
  else{
    res.redirect("/cart");
  }
});



var stock_num;
var sold_book_num;


//to show current sold and stock number
app.get('/stocks', (req, res) => {
  book = {
    bookId: [],
    imagePaths: [],
    productName: [],
    price: [],
    rating: [],
    summary:[],
    publishYear:[],
    publisher:[],
    pageCount:[],
    coverType:[],
    favoriteCount:[],
    author:[],
    category:[],
    stock_num:[],
    sold_book_num:[],
  };
  const query = 'SELECT * FROM stocks JOIN book ON stocks.book_id = book.book_id;';
  db.query(query, (err, results) => {
    if (err) {
        console.log("connection error");
        throw err;
    } else {
      var imagePath;
      for (const resItem of results) {
        Book_Id = resItem.Book_Id;
        rating =resItem.Rating_Average;
        bookName=resItem.Book_Name;
        price=resItem.Price;
        summary=resItem.Summary;
        publishYear=resItem.Publication_Year;
        publisher=resItem.Publisher;
        pageCount=resItem.Page_Count;
        coverType=resItem.Cover_Type;
        favoriteCount=resItem.Favorite_Count;
        author=resItem.Author;
        category=resItem.Category;
        stock_num=resItem.stock_num;
        sold_book_num=resItem.sold_book_num;
        imagePath = 'BookCover/' + `${Book_Id}.png`;
        book.bookId.push(Book_Id);
        book.imagePaths.push(imagePath);
        book.rating.push(rating);
        book.productName.push(bookName);
        book.price.push(price);
        book.summary.push(summary);
        book.publishYear.push(publishYear);
        book.publisher.push(publisher);
        book.pageCount.push(pageCount);
        book.coverType.push(coverType);
        book.favoriteCount.push(favoriteCount);
        book.author.push(author);
        book.category.push(category);
        book.stock_num.push(stock_num);
        book.sold_book_num.push(sold_book_num);
     }
     res.render('stock.ejs', {book});
  }
});
   
  
});

//to get and store data of popular Publishers
var popularP={
  publisher:[],
  }
app.get('/popularP', (req, res) => {
  popularP={
    publisher:[],
    }
    const query = 'SELECT b.publisher, SUM(s.sold_book_num) AS total_sold_books FROM book b JOIN stocks s ON b.book_id = s.book_id GROUP BY b.publisher ORDER BY total_sold_books DESC LIMIT 10;';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error querying the database:', err);
            res.status(500).send('Internal Server Error');
        } else {
            for (const resAd of results) {
                  const publisher = resAd.publisher;
                  popularP.publisher.push(publisher);
            }
            res.render('popularP.ejs', {popularP});
        }
    });
});

var popularA={
  author:[],
}
//to get and store data of popular Authors
app.get('/popularA', (req, res) => {
  popularA={
    author:[],
    }
    const query = 'SELECT b.Author, SUM(s.sold_book_num) AS total_sold_books FROM book b JOIN stocks s ON b.book_id = s.book_id GROUP BY b.Author ORDER BY total_sold_books DESC LIMIT 10;';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error querying the database:', err);
            res.status(500).send('Internal Server Error');
        } else {
            for (const resAd of results) {
                  const author = resAd.Author;
                  popularA.author.push(author);
            }
            res.render('popularA.ejs', {popularA});
        }
    });
});



var bestSeller={
  author:[],
  }
//to get and store data of Best Sellers
app.get('/bestSeller', (req, res) => {
  book = {
    bookId: [],
    imagePaths: [],
    productName: [],
    price: [],
    rating: [],
    summary:[],
    publishYear:[],
    publisher:[],
    pageCount:[],
    coverType:[],
    favoriteCount:[],
    author:[],
    category:[],
    stock_num:[],
    sold_book_num:[],
  };
  const query = 'SELECT b.*, SUM(s.sold_book_num) AS total_sold_copies FROM book b JOIN stocks s ON b.book_id = s.book_id GROUP BY b.book_id ORDER BY total_sold_copies DESC LIMIT 15;';
  db.query(query, (err, results) => {
    if (err) {
        console.log("connection error");
        throw err;
    } else {
      var imagePath;
      for (const resItem of results) {
        Book_Id = resItem.Book_Id;
        rating =resItem.Rating_Average;
        bookName=resItem.Book_Name;
        price=resItem.Price;
        summary=resItem.Summary;
        publishYear=resItem.Publication_Year;
        publisher=resItem.Publisher;
        pageCount=resItem.Page_Count;
        coverType=resItem.Cover_Type;
        favoriteCount=resItem.Favorite_Count;
        author=resItem.Author;
        category=resItem.Category;
        imagePath = 'BookCover/' + `${Book_Id}.png`;
        book.bookId.push(Book_Id);
        book.imagePaths.push(imagePath);
        book.rating.push(rating);
        book.productName.push(bookName);
        book.price.push(price);
        book.summary.push(summary);
        book.publishYear.push(publishYear);
        book.publisher.push(publisher);
        book.pageCount.push(pageCount);
        book.coverType.push(coverType);
        book.favoriteCount.push(favoriteCount);
        book.author.push(author);
        book.category.push(category);
     }
     res.render('bestSeller.ejs', {book});
  }
});
   
  
});
//to get and store books of each popular Authors
app.post('/popularA_books', (req, res) => {
  var itemId=req.body.itemId;
  var Author = popularA.author[itemId];
  book = {
    bookId: [],
    imagePaths: [],
    productName: [],
    price: [],
    rating: [],
    summary:[],
    publishYear:[],
    publisher:[],
    pageCount:[],
    coverType:[],
    favoriteCount:[],
    author:[],
    category:[],
  };
  const query = 'SELECT * FROM book WHERE Author = ? ';
  db.query(query, [Author], (err, results) => {
    if (err) {
        console.log("connection error");
        throw err;
    } else {
      var imagePath;
      for (const resItem of results) {
        Book_Id = resItem.Book_Id;
        rating =resItem.Rating_Average;
        bookName=resItem.Book_Name;
        price=resItem.Price;
        summary=resItem.Summary;
        publishYear=resItem.Publication_Year;
        publisher=resItem.Publisher;
        pageCount=resItem.Page_Count;
        coverType=resItem.Cover_Type;
        favoriteCount=resItem.Favorite_Count;
        author=resItem.Author;
        category=resItem.Category;
        imagePath = 'BookCover/' + `${Book_Id}.png`;
        book.bookId.push(Book_Id);
        book.imagePaths.push(imagePath);
        book.rating.push(rating);
        book.productName.push(bookName);
        book.price.push(price);
        book.summary.push(summary);
        book.publishYear.push(publishYear);
        book.publisher.push(publisher);
        book.pageCount.push(pageCount);
        book.coverType.push(coverType);
        book.favoriteCount.push(favoriteCount);
        book.author.push(author);
        book.category.push(category);
     }
     res.render('category.ejs', {book});
  }
});
});
//to get and store books of each popular Book
app.post('/popularP_books', (req, res) => {
  var itemId=req.body.itemId;
  var Publisher = popularP.publisher[itemId];
  book = {
    bookId: [],
    imagePaths: [],
    productName: [],
    price: [],
    rating: [],
    summary:[],
    publishYear:[],
    publisher:[],
    pageCount:[],
    coverType:[],
    favoriteCount:[],
    author:[],
    category:[],
  };
  const query = 'SELECT * FROM book WHERE Publisher = ? ';
  db.query(query, [Publisher], (err, results) => {
    if (err) {
        console.log("connection error");
        throw err;
    } else {
      var imagePath;
      for (const resItem of results) {
        Book_Id = resItem.Book_Id;
        rating =resItem.Rating_Average;
        bookName=resItem.Book_Name;
        price=resItem.Price;
        summary=resItem.Summary;
        publishYear=resItem.Publication_Year;
        publisher=resItem.Publisher;
        pageCount=resItem.Page_Count;
        coverType=resItem.Cover_Type;
        favoriteCount=resItem.Favorite_Count;
        author=resItem.Author;
        category=resItem.Category;
        imagePath = 'BookCover/' + `${Book_Id}.png`;
        book.bookId.push(Book_Id);
        book.imagePaths.push(imagePath);
        book.rating.push(rating);
        book.productName.push(bookName);
        book.price.push(price);
        book.summary.push(summary);
        book.publishYear.push(publishYear);
        book.publisher.push(publisher);
        book.pageCount.push(pageCount);
        book.coverType.push(coverType);
        book.favoriteCount.push(favoriteCount);
        book.author.push(author);
        book.category.push(category);
     }
     res.render('category.ejs', {book});
  }
});
});



//to get and store data of Movie adapted books
app.get('/movieAd', (req, res) => {
  book = {
    bookId: [],
    imagePaths: [],
    productName: [],
    price: [],
    rating: [],
    summary:[],
    publishYear:[],
    publisher:[],
    pageCount:[],
    coverType:[],
    favoriteCount:[],
    author:[],
    category:[],
  };
  const query = 'SELECT * FROM book ORDER BY RAND() LIMIT 15';
  db.query(query, (err, results) => {
    if (err) {
        console.log("connection error");
        throw err;
    } else {
      var imagePath;
      for (const resItem of results) {
        Book_Id = resItem.Book_Id;
        rating =resItem.Rating_Average;
        bookName=resItem.Book_Name;
        price=resItem.Price;
        summary=resItem.Summary;
        publishYear=resItem.Publication_Year;
        publisher=resItem.Publisher;
        pageCount=resItem.Page_Count;
        coverType=resItem.Cover_Type;
        favoriteCount=resItem.Favorite_Count;
        author=resItem.Author;
        category=resItem.Category;
        imagePath = 'BookCover/' + `${Book_Id}.png`;
        book.bookId.push(Book_Id);
        book.imagePaths.push(imagePath);
        book.rating.push(rating);
        book.productName.push(bookName);
        book.price.push(price);
        book.summary.push(summary);
        book.publishYear.push(publishYear);
        book.publisher.push(publisher);
        book.pageCount.push(pageCount);
        book.coverType.push(coverType);
        book.favoriteCount.push(favoriteCount);
        book.author.push(author);
        book.category.push(category);
     }
     res.render('category.ejs', {book});
  }
});
});



//to get and store data of new released books
app.get('/newR', (req, res) => {
  book = {
    bookId: [],
    imagePaths: [],
    productName: [],
    price: [],
    rating: [],
    summary:[],
    publishYear:[],
    publisher:[],
    pageCount:[],
    coverType:[],
    favoriteCount:[],
    author:[],
    category:[],
  };
  const query = 'SELECT * FROM book where Publication_Year=2023';
  db.query(query, (err, results) => {
    if (err) {
        console.log("connection error");
        throw err;
    } else {
      var imagePath;
      for (const resItem of results) {
        Book_Id = resItem.Book_Id;
        rating =resItem.Rating_Average;
        bookName=resItem.Book_Name;
        price=resItem.Price;
        summary=resItem.Summary;
        publishYear=resItem.Publication_Year;
        publisher=resItem.Publisher;
        pageCount=resItem.Page_Count;
        coverType=resItem.Cover_Type;
        favoriteCount=resItem.Favorite_Count;
        author=resItem.Author;
        category=resItem.Category;
        imagePath = 'BookCover/' + `${Book_Id}.png`;
        book.bookId.push(Book_Id);
        book.imagePaths.push(imagePath);
        book.rating.push(rating);
        book.productName.push(bookName);
        book.price.push(price);
        book.summary.push(summary);
        book.publishYear.push(publishYear);
        book.publisher.push(publisher);
        book.pageCount.push(pageCount);
        book.coverType.push(coverType);
        book.favoriteCount.push(favoriteCount);
        book.author.push(author);
        book.category.push(category);
     }
     res.render('category.ejs', {book});
  }
});
});



// to get and store data of coming books
app.get('/coming', (req, res) => {
  book = {
    bookId: [],
    imagePaths: [],
    productName: [],
    price: [],
    rating: [],
    summary:[],
    publishYear:[],
    publisher:[],
    pageCount:[],
    coverType:[],
    favoriteCount:[],
    author:[],
    category:[],
  };
  const query = 'SELECT * FROM book where Publication_Year=2024';
  db.query(query, (err, results) => {
    if (err) {
        console.log("connection error");
        throw err;
    } else {
      var imagePath;
      for (const resItem of results) {
        Book_Id = resItem.Book_Id;
        rating =resItem.Rating_Average;
        bookName=resItem.Book_Name;
        price=resItem.Price;
        summary=resItem.Summary;
        publishYear=resItem.Publication_Year;
        publisher=resItem.Publisher;
        pageCount=resItem.Page_Count;
        coverType=resItem.Cover_Type;
        favoriteCount=resItem.Favorite_Count;
        author=resItem.Author;
        category=resItem.Category;
        imagePath = 'BookCover/' + `${Book_Id}.png`;
        book.bookId.push(Book_Id);
        book.imagePaths.push(imagePath);
        book.rating.push(rating);
        book.productName.push(bookName);
        book.price.push(price);
        book.summary.push(summary);
        book.publishYear.push(publishYear);
        book.publisher.push(publisher);
        book.pageCount.push(pageCount);
        book.coverType.push(coverType);
        book.favoriteCount.push(favoriteCount);
        book.author.push(author);
        book.category.push(category);
     }
     res.render('category.ejs', {book});
  }
});
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/BookCover');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

//function for an admin: to add new book into database, and add cover image of the book in needed folder in needed format
const upload = multer({ storage: storage });
app.post('/addBook', upload.single('book_cover'), (req, res) => {
  const { Book_name, Author, Publication_Year, Publisher, Page_count, Rating_Average, Price, Favorite_Count, Cover_Type, Category, Summary } = req.body;

  // Insert book details into the database
  db.query(
    'INSERT INTO book (Book_name, Author, Publication_Year, Publisher, Page_count, Rating_Average, Price, Favorite_Count, Cover_Type, Category, Summary, Todaysbook) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [Book_name, Author, Publication_Year, Publisher, Page_count, 0, Price, 0, Cover_Type, Category, Summary, 'NO'],
    (err, result) => {
      if (err) {
        console.error('Error inserting book details:', err);
        res.status(500).send('Error adding book');
      } else {
        const bookId = result.insertId; 
        // Rename the uploaded file using the Book_id and move it to the appropriate directory
        const newPath = path.join('public', newFileName);
        const existingFilePath = path.join('public/BookCover', `${bookId}.png`);
        if (fs.existsSync(existingFilePath)) {
          fs.unlinkSync(existingFilePath);
        }
        fs.rename(req.file.path, newPath, (err) => {
          if (err) {
            console.error('Error renaming and moving the file:', err);
            res.status(500).send('Error adding book');
          } else {
            return res.send(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                </head>
                <body>
                  <script>
                    alert("Book added successfully!");
                    window.location.href = '/BookNook';
                  </script>
                </body>
                </html>
              `);
          }
        });
      }
    }
  );
});



var BookID;//Gloabal book id
var globalrating;//Globalrating
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // Parse JSON requests
app.use((req, res, next) => {

  const rating = globalrating;
  next();
});

app.get('/', (req, res) => {
  res.render("book_Page");
});
var bookP = {

}
app.post('/bookPage', (req, res) => {//When clicked on to the book image open the book page of that book
  var itemId=req.body.itemId;
  
  bookP={
    imagePaths:book.imagePaths[itemId],
    bookId : book.bookId[itemId],
    rating :book.rating[itemId],
    productName:book.productName[itemId],
    price:book.price[itemId],
    summary:book.summary[itemId],
    publishYear:book.publishYear[itemId],
    publisher:book.publisher[itemId],
    pageCount:book.pageCount[itemId],
    coverType:book.coverType[itemId],
    favoriteCount:book.favoriteCount[itemId],
    author:book.author[itemId],
    receivedCategory:book.receivedCategory,
    id:itemId,
  }
  BookID = bookP.bookId;
  req.session.BookID = bookP.bookId;
  res.render("book_Page.ejs",  {bookP});
});

app.get('/bookrating', (req,res) => {//get the global book id and get the books ratings from the database
  book_id = BookID;
  const queryreviews = 'SELECT user_name, rating, user_comment FROM book_rating WHERE book_id = ?';
  db.query(queryreviews, [book_id], (err, reviewresults) => {
    if (err) {
      console.error('Error querying the database:', err);
      res.status(500).send('Internal Server Error');
    } else {
      const bookrating = {//array for holding the new ratşng and comment values
        user_name: [],
        rating: [],
        user_comment: []
      };
      for (const review of reviewresults) {
        const user_name = review.user_name;
        const rating = review.rating;
        const user_comment = review.user_comment;
        bookrating.user_name.push(user_name);
        bookrating.rating.push(rating);
        bookrating.user_comment.push(user_comment);
      }

      $average_rating = 0;
      $total_review = 0;
      $five_star_review = 0;
      $four_star_review = 0;
      $three_star_review = 0;
      $two_star_review = 0;
      $one_star_review = 0;
      $total_user_rating = 0;
      
     
          for(let i = 0; i <bookrating.rating.length; i++) {//Change the review stars
            var num = bookrating.rating[i];
            if(num == 5){
              $five_star_review++;
            }
            else if(num == 4){
              $four_star_review++;
            }
            else if(num == 3){
              $three_star_review++;
            }
            else if(num == 2){
              $two_star_review++;
            }
            else if(num == 1){
              $one_star_review++;
            }
            $total_review++;
    
            $total_user_rating =  +$total_user_rating + +bookrating.rating[i];
            $average_rating = $total_user_rating / $total_review;
          };

          const sql = 'UPDATE book SET Rating_Average = ? WHERE Book_Id = ?';//Update the rating_average in the book table
          db.query(sql ,[$average_rating, book_id],(errr,results) =>{
            if(errr){
              console.error('Error querying the database:', err);
              res.status(500).send('Internal Server Error');
            } else {
              $output = [$average_rating,$total_review,$five_star_review,$four_star_review,$three_star_review,$two_star_review,
                $one_star_review,bookrating.user_name, bookrating.rating, bookrating.user_comment,
              ];
              res.json($output);
            }
          });
        
    }
  });
});

app.post('/review', (req, res) => {//To add new rating to book_rating table
  const { user_name, user_comment, rating } = req.body;

  if (globalrating !== undefined) {
    // Check if user_name is defined
    if (!user_name) {
      return res.status(400).send('Username is required to make a review!');
    }
    
    const query = 'INSERT INTO book_rating (book_id,user_name,rating,user_comment) VALUES (?,?,?,?)';
    db.query(query, [book_id, user_name, globalrating, user_comment], (err, results) => {
      if (err) {
        console.error('Error querying the database:', err);
        return res.status(500).send('You need to login in order to make an review!');
      } else {
        
        if (results.affectedRows > 0) {
          // Set ismadereview in the session
          req.session.ismadereview = true;
          
        } else {
          return res.status(500).send('Error inserting data into the database.');
        }
      }
      
    });
  }
  res.redirect('book_Page');
});

app.post('/check-star', (req, res) => {//GEt the star from users and assign in the global rating
  const { rating } = req.body;
  globalrating = rating;

  
  res.json({ rating });
});




var allBooks={};//for holding top book and today's book
app.get("/BookNook", (req, res) => {
  // Query for top books
  const querytop = "SELECT book.Book_Name, book.Book_Id FROM book JOIN (SELECT book_id, sold_book_num FROM stocks ORDER BY sold_book_num DESC LIMIT 15) AS top_books WHERE book.Book_Id = top_books.Book_Id";

  db.query(querytop, (errTop, resultsTop) => {
    if (errTop) {
      console.error('Error querying the database for top books:', errTop);
      return res.status(500).send('Error retrieving top books.');
    }

    var topbooks = {
      bookid: [],
      bookname: [],
      bookcover: []
    };

    for (const review of resultsTop) {
      const book_id = review.Book_Id;
      const book_name = review.Book_Name;
      const book_cover = 'BookCover/' + `${book_id}.png`;
      topbooks.bookid.push(book_id);
      topbooks.bookname.push(book_name);
      topbooks.bookcover.push(book_cover);
    }

    // get the current date to compare with the on in the database
    let timestamp = new Date();
    let year = timestamp.getFullYear();
    let month = (timestamp.getMonth() + 1).toString().padStart(2, '0'); // Adding 1 to month because months are zero-indexed
    let day = timestamp.getDate().toString().padStart(2, '0');

    let todaysdate = `${year}-${month}-${day}`;

    let hour = timestamp.getHours();
    
    const querytoday = 'SELECT date FROM todaysbook';//Getting the date from the database
    var date;
    db.query(querytoday, (error, result) => {
      if (error) {
        console.error('Error querying the database for top books:', errTop);
        return res.status(500).send('Error retrieving top books.');
      }
      let dateString;
      for (const resdate of result) {
        let dateString = resdate.date;
        let dateObject = new Date(dateString);
      
        // Adjust month and day to get the correct values
        let year = dateObject.getFullYear();
        let month = (dateObject.getMonth() + 1).toString().padStart(2, '0');
        let day = dateObject.getDate().toString().padStart(2, '0');
      
        date = `${year}-${month}-${day}`;
      };
      if (todaysdate > date) {//If the users date is bigger it means it is the future so today's book will change
        const sql = 'update todaysbook set date = ?';//update the date with user's date
        db.query(sql,[todaysdate], (error1, resultss) => {
          if (error1) {
            console.error('Error querying the database for today\'s book date:', errToday);
            return res.status(500).send('Error retrieving today\'s book ID.');
          }
        const querybookid = 'SELECT Book_Id FROM book WHERE Todaysbook = "yes"';
        db.query(querybookid, (errToday, resultsToday) => {
          if (errToday) {
            console.error('Error querying the database for today\'s book ID:', errToday);
            return res.status(500).send('Error retrieving today\'s book ID.');
          }
  
          const todaybookid = resultsToday[0].Book_Id; 
  
          let rand = Math.floor(Math.random() * resultsToday.length) + 1;//select a random book as a today's book
          const queryyesterday = 'UPDATE book SET Todaysbook = "No" WHERE Book_Id = ?';//remove the old today's book
          db.query(queryyesterday, [todaybookid], (errUpdateYesterday) => {
            if (errUpdateYesterday) {
              console.error('Error updating yesterday\'s book:', errUpdateYesterday);
              return res.status(500).send('Error updating yesterday\'s book.');
            }
  
            const querytoday = 'UPDATE book SET Todaysbook = "Yes" WHERE Book_Id = ?';//assign the old today's book
            db.query(querytoday, [rand], (errUpdateToday) => {
              if (errUpdateToday) {
                console.error('Error updating today\'s book:', errUpdateToday);
                return res.status(500).send('Error updating today\'s book.');
              }

  
              // Query for today's books
              const queryTodayBooks = 'SELECT Book_Id, Book_Name, Summary FROM book WHERE Todaysbook = "yes"';
              db.query(queryTodayBooks, (errTodayBooks, resultsTodayBooks) => {
                if (errTodayBooks) {
                  console.error('Error querying today\'s books:', errTodayBooks);
                  return res.status(500).send('Error retrieving today\'s books.');
                }
  
                let todaybooks = {
                  bookid: [],
                  bookname: [],
                  bookcover: [],
                  booksummary: []
                };
  
                for (const review of resultsTodayBooks) {
                  const book_id = review.Book_Id;
                  const book_name = review.Book_Name;
                  const book_cover = 'BookCover/' + `${book_id}.png`;
                  const book_summary = review.Summary;
  
                  todaybooks.bookid.push(book_id);
                  todaybooks.bookname.push(book_name);
                  todaybooks.bookcover.push(book_cover);
                  todaybooks.booksummary.push(book_summary);
                }
                
                // Combine topbooks and todaybooks and render the page
                const allBooks = { topbooks, todaybooks };
                res.render('index.ejs', allBooks);
              });
            });
          });
        });
        });
        
      } else {
        // If it's not 0, fetch today's books directly for rendering
        const querytoday = 'SELECT Book_Id, Book_Name, Summary FROM book WHERE Todaysbook = "yes"';
        db.query(querytoday, (errTodayBooks, resultsTodayBooks) => {
          if (errTodayBooks) {
            console.error('Error querying today\'s books:', errTodayBooks);
            return res.status(500).send('Error retrieving today\'s books.');
          }
  
          let todaybooks = {
            bookid: [],
            bookname: [],
            bookcover: [],
            booksummary: []
          };
  
          for (const review of resultsTodayBooks) {
            const book_id = review.Book_Id;
            const book_name = review.Book_Name;
            const book_cover = 'BookCover/' + `${book_id}.png`;
            const book_summary = review.Summary;
  
            todaybooks.bookid.push(book_id);
            todaybooks.bookname.push(book_name);
            todaybooks.bookcover.push(book_cover);
            todaybooks.booksummary.push(book_summary);
          }
          const allBooks = {topbooks, todaybooks};
          res.render('index.ejs', {allBooks});
        });
      }
    });
    });
  });
// to show details of the book in today's book
  app.post('/mainPageBook', (req, res) => {
  var itemId=req.body.itemId;
  var bookP = {
    bookId: [],
    imagePaths: [],
    productName: [],
    price: [],
    rating: [],
    summary:[],
    publishYear:[],
    publisher:[],
    pageCount:[],
    coverType:[],
    favoriteCount:[],
    author:[],
    receivedCategory:[],
  };

  const sql = 'SELECT * FROM book WHERE Book_Id = ?';
  db.query(sql, [itemId], (err, results) => {
    if (err) {
        console.log("connection error");
        throw err;
    } 
    for (const resItem of results) {
      Book_Id = resItem.Book_Id;
      BookID =resItem.Book_Id;
      rating =resItem.Rating_Average;
      bookName=resItem.Book_Name;
      price=resItem.Price;
      summary=resItem.Summary;
      publishYear=resItem.Publication_Year;
      publisher=resItem.Publisher;
      pageCount=resItem.Page_Count;
      coverType=resItem.Cover_Type;
      favoriteCount=resItem.Favorite_Count;
      author=resItem.Author;
      category=resItem.Category;
      imagePath = 'BookCover/' + `${Book_Id}.png`;
      bookP.bookId.push(Book_Id);
      bookP.imagePaths.push(imagePath);
      bookP.rating.push(rating);
      bookP.productName.push(bookName);
      bookP.price.push(price);
      bookP.summary.push(summary);
      bookP.publishYear.push(publishYear);
      bookP.publisher.push(publisher);
      bookP.pageCount.push(pageCount);
      bookP.coverType.push(coverType);
      bookP.favoriteCount.push(favoriteCount);
      bookP.author.push(author);
      bookP.receivedCategory.push(category);
    }
    BookID = bookP.bookId;
    res.render("book_Page.ejs",  {bookP});
  });
});

//to get the text that is written in search box
app.post('/search', (req, res) => {//Get the searched value from the search box
  var searchQuery = req.body.searchBox; 
  res.redirect(`/bookPageser?q=${encodeURIComponent(searchQuery)}`);
});


app.get('/bookPageser', (req, res) => {//find the book that searched via the search box and get its book page
  var imagePath;
  var bookP = {
    bookId: [],
    imagePaths: [],
    productName: [],
    price: [],
    rating: [],
    summary:[],
    publishYear:[],
    publisher:[],
    pageCount:[],
    coverType:[],
    favoriteCount:[],
    author:[],
    receivedCategory:[],
  };
  var searchQuery = req.query.q;
  searchQuery = req.query.q;

  if (!searchQuery) {
    return res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body>
        <script>
          // Display an alert when the user is not logged in
          alert("Error: Book name not provided in the search query.");
          // Redirect to the root URL using server-side redirection
          window.location.href = '/BookNook';
        </script>
      </body>
      </html>
    `);
  }

  if (searchQuery == undefined) {
  } else {
    const query = 'SELECT * FROM book where Book_Name = ?';
    db.query(query, [searchQuery], (err, results) => {
      if (err) {
          console.log("connection error");
          throw err;
      } 
      else if(results.length == 0){
        res.status(400).send("Error: Book name provided wrong in the search query.");
      }
      else if (results.length != 0) {

        for (const resItem of results) {
          Book_Id = resItem.Book_Id;
          BookID =resItem.Book_Id;
          rating =resItem.Rating_Average;
          bookName=resItem.Book_Name;
          price=resItem.Price;
          summary=resItem.Summary;
          publishYear=resItem.Publication_Year;
          publisher=resItem.Publisher;
          pageCount=resItem.Page_Count;
          coverType=resItem.Cover_Type;
          favoriteCount=resItem.Favorite_Count;
          author=resItem.Author;
          category=resItem.Category;
          imagePath = 'BookCover/' + `${Book_Id}.png`;
          bookP.bookId.push(Book_Id);
          bookP.imagePaths.push(imagePath);
          bookP.rating.push(rating);
          bookP.productName.push(bookName);
          bookP.price.push(price);
          bookP.summary.push(summary);
          bookP.publishYear.push(publishYear);
          bookP.publisher.push(publisher);
          bookP.pageCount.push(pageCount);
          bookP.coverType.push(coverType);
          bookP.favoriteCount.push(favoriteCount);
          bookP.author.push(author);
          bookP.receivedCategory.push(category);
        }
        if(bookP.length != 0){
          res.render('book_Page', { bookP });
        }
      } else {
        // No results found, render a different page or provide a message
        res.render('book_Page', { searchQuery: searchQuery });
      }
    });
    
  }
});

//to add book to favorite that is selected by user 
app.post('/updateFavorite', (req, res) => {
  const isLoggedIn = req.session && req.session.isLoggedIn || false;
  if(isLoggedIn)
  {
    const bookId = req.body.book_id;
  user_name = req.session.user_name; // Replace with actual user information or retrieve it from session
  // Check if the record already exists
  const checkQuery = `SELECT * FROM favorited_books WHERE book_id = ? AND user_name = ?`;
  db.query(checkQuery, [bookId, user_name], (checkErr, checkResults) => {
    if (checkErr) {
      console.error('Error checking favorites: ' + checkErr.stack);
      res.sendStatus(500);
      return;
    }

    if (checkResults.length > 0) {
      // Record exists, delete it (user is removing from favorites)
      const deleteQuery = `DELETE FROM favorited_books WHERE book_id = ? AND user_name = ?`;
      db.query(deleteQuery, [bookId, user_name], (deleteErr) => {
        if (deleteErr) {
          console.error('Error deleting from favorites: ' + deleteErr.stack);
          res.sendStatus(500);
          return;
        }
        res.sendStatus(200);
      });
    } else {
      // Record doesn't exist, insert it (user is adding to favorites)
      const insertQuery = `INSERT INTO favorited_books (book_id, user_name) VALUES (?, ?)`;
      db.query(insertQuery, [bookId, user_name], (insertErr) => {
        if (insertErr) {
          console.error('Error inserting into favorites: ' + insertErr.stack);
          res.sendStatus(500);
          return;
        }
        res.sendStatus(200);
      });
    }
  });
  }else{
    return res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body>
        <script>
          alert("You are not logged in. You can not add book to the favorites.");
          window.location.href = '/BookNook';
        </script>
      </body>
      </html>
    `);
  }
  
});


app.get('/checkFavorite', (req, res) => {
  const isLoggedIn = req.session && req.session.isLoggedIn || false;
  if(isLoggedIn)
  {
    const BookID = req.session.BookID;
     user_name = req.session.user_name; 
     const checkQuery = 'SELECT COUNT(*) AS count FROM favorited_books § WHERE book_id = ? AND user_name = ?';
    db.query(checkQuery, [BookID, user_name], (error, results) => {
      if (error) {
          console.error('Error checking favorite status:', error);
          res.status(500).json({ error: 'Internal Server Error' });
          return;
      }
      const isFavorite = results[0].count > 0;
      res.json({ isFavorite });
  });
  }
  else{
    return res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body>
        <script>
          // Display an alert when the user is not logged in
          alert("You are not logged in. You can not add book to the favorites.");
          // Redirect to the root URL using server-side redirection
          window.location.href = '/BookNook';
        </script>
      </body>
      </html>
    `);
    
  }

 
});
//to display the active orders of user
app.get("/activeorder",(req,res) => {
  const user_name = req.session.user_name;
  const order = {
    order_no: [],
    name_: [],
    user_name: [],
    country:[],
    post_code: [],
    neighbourhood: [],
    street: [],
    order_situation: [],
    products_id: [],
    price: [],
    estimated_delivery: [],
    Pbook_name: [],
    Pprice:[],
  };

  const sql = 'SELECT * FROM active_orders WHERE user_name = ?';
  db.query(sql,[user_name],(err,results) => {
    if (err) {
      console.error('Error checking active orders:', error);
      res.status(500).json({ error: 'Database Error' });
     
      return next(new Error('An error occurred.'));
    }
    else{
      for (const resItem of results) {
        order.order_no.push(resItem.order_no);
        order.name_.push(resItem.name_);
        order.user_name.push(resItem.user_name);
        order.country.push(resItem.country);
        order.post_code.push(resItem.post_code);
        order.neighbourhood.push(resItem.neighbourhood);
        order.street.push(resItem.street);
        order.order_situation.push(resItem.order_situation);
        order.price.push(resItem.price);
        const originalDateString = resItem.estimated_delivery;
        const dateObject = new Date(originalDateString);
        const dateOnlyString = dateObject.toISOString().split('T')[0];
        order.estimated_delivery.push(dateOnlyString);

        const query = 'SELECT book_name, price FROM products WHERE order_no IN (?)';

        db.query(query,[order.order_no],(err,result) => {
          if (err) {
            console.error('Error checking active orders:', err);
            res.status(500).json({ error: 'Database Error' });
            return;
          }
          else{
            for (const Item of result) {

              order.Pbook_name.push(Item.book_name);
              order.Pprice.push(Item.price);
            };
           
          }
          res.render('activeorder.ejs', {order});
        });
        
      };
      
    }
  });
});





app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}/BookNook`);
});










































