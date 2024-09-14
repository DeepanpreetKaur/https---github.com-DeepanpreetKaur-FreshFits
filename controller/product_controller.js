const { ExpressValidator } = require("express-validator");
const mysql = require("mysql");
const sql = mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "clothing_store",
});
class products {
  
  static async homepage(req, res) {
    sql.query("select * from products", (err, result) => {
      if (err) throw err;
      return res.render("Profile.ejs", { images: result,message:req.flash('info')});
    });
  }
  static async cart(req, res) {
    sql.query(
      `select products.product_id as id,image_url,( select SUM(price*Quantity) from (products inner join cart on products.product_id=cart.ProductId)inner join users on users.UserID=cart.UserID where users.UserID=${req.session.user.id})as Tamount, ( select SUM(Quantity) from cart inner join users on users.UserID=cart.UserID where users.UserID=${req.session.user.id})as items,product_name,price,(price*Quantity) as sub,size,Quantity from (products inner join cart on products.product_id=cart.ProductId)inner join users on users.UserID=cart.UserID where users.UserID=${req.session.user.id}`,
      (err, result) => {
        if (err) throw err;
        return res.render("UserCart.ejs", { list: result,message:req.flash('info') });
      }
    );
  }
  static async changequantity(req,res)
  {
    const id=req.query.id;
    const quantity=req.query.quantity;
    sql.query(`update cart set Quantity=${quantity} where ProductID=${id} and UserID=${req.session.user.id}`,
      (err, result) => {
        if (err) throw err;
        // return res.redirect('/cart');
      }
    )
  }
  static async deletefromCart(req,res){
    const id=req.query.id;
    sql.query(`delete from cart where ProductID=${id} and UserID=${req.session.user.id}`,(err,result)=>{
      if (err) throw err;
    })
  }
  static async ProductDetails(req, res) {  
    if(req.query.productid)
    {
      req.session.productid=req.query.productid;
    }
    sql.query(
      `select products.image_url as p,products.product_id,product_name,description,price,discount_price,stock_quantity,size,color,material,product_images.image_url,product_images.image_url2,product_images.image_url3,category.name from ((products inner join product_images on products.product_id=product_images.product_id)inner join category on category.id=products.category_id) where products.product_id=${req.session.productid} `,
      (err, result) => {
        if (err) throw err;
        return res.render("productDetails", { product: result,message:req.flash('info')});
      }
    );
  }

  static async addcart(req,res)
  {
    sql.query(`insert into cart(UserID,ProductID,Quantity) values(${req.session.user.id},${req.session.productid},1)`,(err,result)=>{
      if (err) throw err;
      req.flash("info","Added to cart");
      return res.redirect('/ProductDetails');
    })
  }
 
  static async women(req, res) {
    sql.query(
      'select * from products where Section="Women"and status="available"',
      (err, result) => {
        if (err) throw err;
        return res.render("Women", { images: result ,message:req.flash('info')});
      }
    );
  }
  static async men(req, res) {
    sql.query(
      'select * from products where Section="Men" and status="available"',
      (err, result) => {
        if (err) throw err;
        return res.render("Men", { images: result,message:req.flash('info') });
      }
    );
  }
  static async kids(req, res) {
    sql.query(
      'select * from products where Section="Kids" and status="available"',
      (err, result) => {
        if (err) throw err;

        return res.render("Kids", { images: result,message:req.flash('info') });
      }
    );
  }
  static async orderConfig(req, res) {
    sql.query(
      `select products.product_id as id,image_url,( select SUM(price*Quantity) from (products inner join cart on products.product_id=cart.ProductId)inner join users on users.UserID=cart.UserID where users.UserID=${req.session.user.id})as Tamount, ( select SUM(Quantity) from cart inner join users on users.UserID=cart.UserID where users.UserID=${req.session.user.id})as items,StreetAddress,City,State,Country,product_name,price,(price*Quantity) as sub,size,Quantity from ((products inner join cart on products.product_id=cart.ProductId)inner join users on users.UserID=cart.UserID)inner join useraddress on users.UserID=useraddress.UserID where users.UserID=${req.session.user.id}`,
      (err, result) => {
        if (err) throw err;
        sql.query(`delete from cart where UserID=${req.session.user.id}`);
        return res.render("OrderConfirmation", { list: result });
      }
    );
  }
  
  static async search(req,res)
  {
    if(req.body.search)
    { 
      req.session.search=req.body.search;
    }
    console.log(req.session.search);
    sql.query(`select * from products INNER join category on products.category_id=category.id where category.name="${req.session.search}"`,(err,result)=>{
      if(err) throw err;
      return res.render("search",{images:result,message:req.flash('info')});
    })
  }

}

module.exports = products;
