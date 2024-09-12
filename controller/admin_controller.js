const mysql = require("mysql");
const sql = mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "clothing_store",
});
const mysql2=require('mysql2/promise');
const pool=mysql2.createPool({
    host:'localhost',
    user:'root',
    database:'clothing_store'
});
const login={
    id:"",
    email:"",
    password:""
}
const sign={
    username:'',
    password:'',
    email:''
}
const bcrypt=require('bcrypt');
class Admin{

    static async getadminlogin(req,res){

        if(req.session.adminlogin)
            return res.render('AdminLogin',{message:req.flash('info'),body:req.session.adminlogin});
            else
            return res.render('AdminLogin',{message:req.flash('info'),body:login});
    }
    static async adminlogin(req,res){
        const sql= await pool.getConnection();
        const body=req.body;
        req.session.adminlogin=body;
        const result= await sql.query(`select * from admins where email='${body.email}'`);
        const u=result[0][0];
            if(u!=undefined)
            {    
                const p = await bcrypt.compare(body.password,result[0][0].password_hash);
                if(p){
                    console.log(result[0][0].username,result[0][0].email);
                    req.session.admin={id:result[0][0].admin_id,username:`${result[0][0].username}`,email:`${result[0][0].email}`};
                    req.session.adminlogin=null;
                    req.flash('info','Logged in Successfully');
                   return res.redirect(`/admin/ProductList`);
                }
                else{
                    req.flash('info',"Password does not match!");
                   return res.redirect('/admin/login');
                }
            }
            else{
                req.flash('info',"Wrong Credentials!");
                return res.redirect('/admin/login');
            }
    }
    // static async getSignup(req,res) {
    //         return res.render('SignUp',{message:req.flash('info'),body:sign});
    // }
    // static async signup(req,res)
    // {   const sql= await pool.getConnection();
    //     const body=req.body;
    //     const password= await bcrypt.hash(body.password,10);
           
    //      await sql.query(`Insert into admins(username,password_hash,email) values('${body.username}','${password}','${body.email}') `);
    //                               return res.redirect('/adminsign')
    // }
                  
             
    static async Add(req, res) {
        return res.render("admin");
      }

      static async addproduct(req, res) {
        const body = req.body;
        sql.query(
          `select id from category where name='${body.category}'`,
          (err,result)=>{
            sql.query(
                `insert into products(product_name,description,category_id,price,discount_price,stock_quantity,size,color,material,image_url,section) values('${body.productname}','${body.message}',${result[0].id},${body.price},${body.discountprice},${body.quantity},'${body.size}','${body.color}','${body.material}','${body.image1}','${body.section}')`,
                (err, result) => {
                  if (err) throw err;
                  const id = result.insertId;
                  sql.query(
                    `insert into product_images(product_id,image_url,image_url2,image_url3) values(${id},'${body.image2}','${body.image3}','${body.image4}')`,
                    (err, result) => {
                      if (err) throw err;
                      return res.redirect("/admin/addProduct");
                    }
                  );
                }
              );
          }
        );
      }

      static async Edit(req, res) {
        const id = req.query.productid;
        sql.query(
          `select products.product_id as i,products.image_url as p,product_name,description,price,discount_price,stock_quantity,size,color,material,Section,product_images.image_url,product_images.image_url2,product_images.image_url3,category.name from ((products inner join product_images on products.product_id=product_images.product_id)inner join category on category.id=products.category_id) where products.product_id=${id} `,
          (err, result) => {
            if (err) throw err;
            return res.render("editProduct", { product: result });
          }
        );
      }
      static async editproduct(req, res) {
        const body = req.body;
        sql.query(
          `select id from category where name='${body.category}'`,
          (err, result) => {
            sql.query(
              `update products set product_name='${body.productname}',description='${body.message}',price=${body.price},discount_price=${body.discountprice},category_id=${result[0].id},stock_quantity=${body.quantity},size='${body.size}',color='${body.color}',material='${body.material}',Section='${body.section}' where product_id=${body.id}`,
              (err, result) => {
                if (err) throw err;
              }
            );
            if(body.image1)
            {
                sql.query(
                    `update products set products.image_url='${body.image1}' where product_id=${body.id}`,
                    (err, result) => {
                      if (err) throw err;
                    }
                  );
            }
          }
        );
        if (body.image2)
        {
            sql.query(
                `update product_images set image_url='${body.image2}' where product_id=${body.id}`,
                (err, result) => {
                  if (err) throw err;
                }
              );
        }
        if (body.image3)
        {
            sql.query(
                `update product_images set image_url2='${body.image3}' where product_id=${body.id}`,
                (err, result) => {
                  if (err) throw err;
                }
              );
        }
        if (body.image4)
         {
            sql.query(
                `update product_images set image_url3='${body.image4}' where product_id=${body.id}`,
                (err, result) => {
                  if (err) throw err;
                }
              );
         }
        return res.redirect(`/admin/editProduct?productid=${body.id}`);
      }

      static async deleteproduct(req,res){
        const id=req.params.id;
        sql.query(`delete from product_images where product_id=${id}`);
        sql.query(`delete from cart where ProductID=${id}`);
        sql.query(`delete from products where product_id=${id}`);
        return res.redirect('/admin/ProductList');
      }

      static async List(req, res) {
        sql.query(
          "select product_id,image_url,product_name,price,discount_price,category.name from products inner join category on products.category_id=category.id",
          (err, result) => {
            if (err) throw err;
            return res.render("ProductList", { list: result ,message:req.flash('info')});
          }
        );
      }

      static async details(req, res) {
        const id=req.query.productid;
        sql.query(
          `select products.image_url as p,product_name,description,price,discount_price,stock_quantity,size,color,material,product_images.image_url,product_images.image_url2,product_images.image_url3,category.name from ((products inner join product_images on products.product_id=product_images.product_id)inner join category on category.id=products.category_id) where products.product_id=${id}`,
          (err, result) => {
            if (err) throw err;
            return res.render("productDetails(Admin)", { product: result,id:id });
          }
        );
      }

    static async searchit(req,res)
    {
    const body=req.body;
    console.log(body.search);
    sql.query(`select * from products INNER join category on products.category_id=category.id where category.name="${body.search}"`,(err,result)=>{
      if(err) throw err;
      console.log(result);
      return res.render("ProductList",{list:result,message:`Search Results for "${body.search}"`});
    })
    }
    static async logout(req, res){
          delete req.session.admin.id;
          delete req.session.admin.username;
          delete req.session.admin.email;
         return res.redirect('/admin/ProductList');
        };
}
module.exports=Admin;