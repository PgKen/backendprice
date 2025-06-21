const express = require('express');
const app = express();
const mysql = require('mysql2');
const moment = require('moment'); // ใช้ moment.js สำหรับจัดการวันที่

const cors = require('cors');
const { log } = require('node:console');
app.use(cors());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // Allow all origins
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// เพิ่ม middleware ตรงนี้
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  console.log("test");
  res.send('Hello Express! xxx');
});

var db_config = {
  host: "localhost",
  user: "root",
  password: "comp@113",
  database: "db_price",
};

var conn;


let sqlDate = "SELECT tb_priceproduct.date_check FROM tb_priceproduct GROUP BY tb_priceproduct.date_check "
sqlDate += "ORDER BY tb_priceproduct.date_check DESC LIMIT 0, 2 "

let sqlDateLast = "SELECT tb_proselect.id_prod AS rId,tb_product.name_pro,"
sqlDateLast += "tb_product.name_pro_en,tb_proselect.price_pro,tb_priceproduct.date_check,"
sqlDateLast += "tb_product.name_pro_cn,picture.name_img,picture.id_pro,tb_unit.id_unit,tb_unit.unitname "
sqlDateLast += "FROM tb_priceproduct "
sqlDateLast += "INNER JOIN tb_proselect ON tb_priceproduct.id_pricepro = tb_proselect.idprice "
sqlDateLast += "INNER JOIN tb_product ON tb_proselect.id_prod = tb_product.id_product "
sqlDateLast += "INNER JOIN tb_typeproduct ON tb_product.typepro = tb_typeproduct.id_typepro "
sqlDateLast += "INNER JOIN picture ON tb_proselect.id_prod = picture.id_pro "
sqlDateLast += "INNER JOIN tb_unit ON tb_proselect.unit = tb_unit.id_unit "
sqlDateLast += "WHERE date_check = ? "
/*WHERE id_mtype = 8*/
/*GROUP BY
tb_proselect.id_prod*/
sqlDateLast += "ORDER BY tb_priceproduct.date_check DESC, RAND() ASC LIMIT 0, 16 "



let sqlImgPrice2 = "SELECT tb_proselect.id_prod AS rId,tb_product.name_pro,tb_product.name_pro_en,"
sqlImgPrice2 += "tb_proselect.price_pro,tb_priceproduct.date_check,tb_product.name_pro_cn,picture.name_img,"
sqlImgPrice2 += "picture.id_pro,tb_unit.id_unit,tb_unit.unitname "
sqlImgPrice2 += "FROM tb_priceproduct "
sqlImgPrice2 += "INNER JOIN tb_proselect ON tb_priceproduct.id_pricepro = tb_proselect.idprice "
sqlImgPrice2 += "INNER JOIN tb_product ON tb_proselect.id_prod = tb_product.id_product "
sqlImgPrice2 += "INNER JOIN tb_typeproduct ON tb_product.typepro = tb_typeproduct.id_typepro "
sqlImgPrice2 += "INNER JOIN picture ON tb_proselect.id_prod = picture.id_pro "
sqlImgPrice2 += "INNER JOIN tb_unit ON tb_proselect.unit = tb_unit.id_unit "
sqlImgPrice2 += "WHERE date_check = ? "
sqlImgPrice2 += " AND tb_proselect.id_prod = ? "

function handleDisconnect() {
  conn = mysql.createConnection(db_config); // Recreate the connection, since
  // the old one cannot be reused.

  conn.connect(function (err) {
    // The server is either down
    if (err) {
      // or restarting (takes a while sometimes).
      console.log("error when connecting to db:", err);
      setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
    } // to avoid a hot loop, and to allow our node script to
  }); // process asynchronous requests in the meantime.
  // If you're also serving http, display a 503 error.
  conn.on("error", function (err) {
    console.log("db error", err);
    if (err.code === "PROTOCOL_CONNECTION_LOST") {
      // Connection to the MySQL server is usually
      handleDisconnect(); // lost due to either server restart, or a
    } else {
      // connnection idle timeout (the wait_timeout
      throw err; // server variable configures this)
    }
  });
}

handleDisconnect();

app.post("/app_login", (req, res) => {
  const { username } = req.body;
  console.log("Login attempt with:", username);
  const { password } = req.body;
  console.log("Password attempt with:", password);
  // res.end();

  const sql = "SELECT * FROM tb_user WHERE username = ? AND password = ?";
  conn.query(sql, [username, password], (err, result) => {
    if (err) {
      console.error("Error executing query:", err);
      return res.status(500).json({ success: false, message: "Database error" });
    }
    if (result.length > 0) {
      // User found
      res.json({ success: true, user: result[0] });
    } else {
      // User not found
      res.status(401).json({ success: false, message: "Invalid username or password" });
    }
  }
  );
});

app.get("/app_allpriceB1", (req, res) => {
  var sql = "SELECT id_prod,name_pro,price_pro,date_check FROM tb_priceproduct";
  sql +=
    " inner join tb_proselect on tb_priceproduct.id_pricepro = tb_proselect.idprice";
  sql +=
    " inner join tb_product on tb_proselect.id_prod = tb_product.id_product";
  sql +=
    " inner join tb_typeproduct on tb_product.typepro = tb_typeproduct.id_typepro";
  sql += " WHERE id_mtype = 1";
  sql += " ORDER BY date_check";
  conn.query(sql, (err, result) => {
    // res.send(sql);
    res.send(result)
  });
});


app.get("/app_maintypes", (req, res) => {
  log("Fetching main types from database...");
  const sql = "SELECT * FROM tb_maintype";
  conn.query(sql, (err, result) => {
    if (err) {
      console.error("Error executing query:", err);
      return res.status(500).json({ success: false, message: "Database error" });
    }
    res.json(result);
  });
});


app.get("/app_getmaintypes/:id", (req, res) => {

  function main() {
    get_id_icepro();
  }
  main();

  function get_id_icepro() {
    let sql = "SELECT * FROM `tb_priceproduct` ORDER BY `tb_priceproduct`.`id_pricepro` DESC"
    conn.query(sql, (err, result) => {
      if (err) {
        console.error("Error executing query:", err);
        return res.status(500).json({ success: false, message: "Database error" });
      }
      if (result.length > 0) {
        // console.log(result[0]);
        getListProduct(result[0].id_pricepro);
      } else {
        res.status(404).json({ success: false, message: "No price products found" });
      }
    });
  }

  function getListProduct(id) {
    console.log("getListProduct called with ID:", id);
    log("Fetching products for main type with ID:", req.params.id);

    const idPrice = id;
    const reqId = req.params.id;
    if (!idPrice) {
      console.error("No price product ID found");
      return res.status(404).json({ success: false, message: "No price product ID found" });
    }
    if (reqId) {
      log("Fetching products for main type with ID:", req.params.id);
      // let sql = "SELECT * FROM tb_typeproduct ";
      // sql += "INNER JOIN tb_maintype ON tb_typeproduct.id_mtype = tb_maintype.id_maintype ";
      // sql += "LEFT JOIN tb_proselect ON tb_typeproduct.id_typepro = tb_proselect.id_typepro ";
      // sql += "LEFT JOIN tb_product ON tb_proselect.id_prod = tb_product.id_product ";
      // sql += "WHERE id_mtype = ? AND tb_proselect.idprice = ?";
      // sql += " ORDER BY tb_typeproduct.id_typepro";

      let sql = "SELECT * FROM tb_proselect ";
      sql += "LEFT JOIN tb_product"

      conn.query(sql, [reqId, idPrice], (err, result) => {
        if (err) {
          console.error("Error executing query:", err);
          return res.status(500).json({ success: false, message: "Database error" });
        }
        if (result.length > 0) {
          console.log(result[0]);
          res.json(result);
        } else {
          res.status(404).json({ success: false, message: "Main type not found" });
        }
      });
    } else {
      console.log("Not !!!! Fetching products for main type with ID :", reqId);

    }
  }


  // const id = req.params.id;
  // log("Fetching main type with ID:", id);
  // let sql = "SELECT * FROM tb_typeproduct ";
  // sql += "INNER JOIN tb_maintype ON tb_typeproduct.id_mtype = tb_maintype.id_maintype ";
  // sql += "LEFT JOIN tb_proselect ON tb_product.id_product = tb_proselect.id_prod ";
  // sql += "WHERE id_mtype = ?";
  // sql += " ORDER BY tb_typeproduct.id_typepro"; 


  // conn.query(sql, [id], (err, result) => {
  //   if (err) {
  //     console.error("Error executing query:", err);
  //     return res.status(500).json({ success: false, message: "Database error" });
  //   }
  //   if (result.length > 0) {
  //     // console.log(result[0]);
  //     res.json(result);
  //   } else {
  //     res.status(404).json({ success: false, message: "Main type not found" });
  //   }
  // });
});

// app.get('/dffprice', (req, res) => {
//   function main() {
//     get_price();
//   }
//   main();

//   function get_price() {



//     let data = [];
//     let sqlDate = "SELECT tb_priceproduct.date_check FROM tb_priceproduct GROUP BY tb_priceproduct.date_check "
//     sqlDate += "ORDER BY tb_priceproduct.date_check DESC LIMIT 0, 2 "
//     conn.query(sqlDate, (err, result) => {
//       if (err) {
//         console.error("Error executing query:", err);
//         return res.status(500).json({ success: false, message: "Database error" });
//       }
//       if (result.length > 0) {
//         // console.log(result[0]);
//         fnDiffPrice(result);
//       } else {
//         res.status(404).json({ success: false, message: "No price products found" });
//       }
//     });
//   }

//   function fnDiffPrice(date) {
//     console.log("fnDiffPrice called with date:", date);
//     res.end();

//   }

//   function fnDiffPrice(arrDate) {
//     let sqlDateLast = "SELECT tb_proselect.id_prod AS rId,tb_product.name_pro,"
//     sqlDateLast += "tb_product.name_pro_en,tb_proselect.price_pro,tb_priceproduct.date_check,"
//     sqlDateLast += "tb_product.name_pro_cn,picture.name_img,picture.id_pro,tb_unit.id_unit,tb_unit.unitname "
//     sqlDateLast += "FROM tb_priceproduct "
//     sqlDateLast += "INNER JOIN tb_proselect ON tb_priceproduct.id_pricepro = tb_proselect.idprice "
//     sqlDateLast += "INNER JOIN tb_product ON tb_proselect.id_prod = tb_product.id_product "
//     sqlDateLast += "INNER JOIN tb_typeproduct ON tb_product.typepro = tb_typeproduct.id_typepro "
//     sqlDateLast += "INNER JOIN picture ON tb_proselect.id_prod = picture.id_pro "
//     sqlDateLast += "INNER JOIN tb_unit ON tb_proselect.unit = tb_unit.id_unit "
//     sqlDateLast += "WHERE date_check = ? "
//     /*WHERE id_mtype = 8*/
//     /*GROUP BY
//     tb_proselect.id_prod*/
//     sqlDateLast += "ORDER BY tb_priceproduct.date_check DESC, RAND() ASC LIMIT 0, 16 "

//     let sql = sqlDateLast

//     let arrDate1 = moment(arrDate[0].date_check).format("YYYY-MM-DD");

//     console.log("arrDate1:", arrDate1);

//     conn.query(sql, [arrDate1], (err, res) => {
//       //console.log(resS);

//       let mapdata = res.map(item => {
//         return {
//           ...item,
//           date_check: moment(item.date_check).format("DD-MM-YYYY"),
//         }
//       })
//       let dataImg1 = mapdata
//       console.log("dataImg1:", dataImg1);

//       fnDiffPrice2(arrDate, dataImg1)
//     })
//   }

//   function fnDiffPrice2(arrDate, dataImg1) {

//     let sqlDateLast = "SELECT tb_proselect.id_prod AS rId,tb_product.name_pro,"
//     sqlDateLast += "tb_product.name_pro_en,tb_proselect.price_pro,tb_priceproduct.date_check,"
//     sqlDateLast += "tb_product.name_pro_cn,picture.name_img,picture.id_pro,tb_unit.id_unit,tb_unit.unitname "
//     sqlDateLast += "FROM tb_priceproduct "
//     sqlDateLast += "INNER JOIN tb_proselect ON tb_priceproduct.id_pricepro = tb_proselect.idprice "
//     sqlDateLast += "INNER JOIN tb_product ON tb_proselect.id_prod = tb_product.id_product "
//     sqlDateLast += "INNER JOIN tb_typeproduct ON tb_product.typepro = tb_typeproduct.id_typepro "
//     sqlDateLast += "INNER JOIN picture ON tb_proselect.id_prod = picture.id_pro "
//     sqlDateLast += "INNER JOIN tb_unit ON tb_proselect.unit = tb_unit.id_unit "
//     sqlDateLast += "WHERE date_check = ? "
//     /*WHERE id_mtype = 8*/
//     /*GROUP BY
//     tb_proselect.id_prod*/
//     sqlDateLast += "ORDER BY tb_priceproduct.date_check DESC, RAND() ASC LIMIT 0, 16 "


//     let sql = sqlDateLast;
//     let arrDate2 = moment(arrDate[1].date_check).format("YYYY-MM-DD");

//     console.log("arrDate2:", arrDate2);

//     conn.query(sql, [arrDate2], (err, resp) => {
//       //console.log(resS);

//       let mapdata = resp.map(item => {
//         return {
//           ...item,
//           date_check: moment(item.date_check).format("DD-MM-YYYY"),
//         }
//       })

//       let dataImg2 = mapdata
//       res.json({
//         dataImg1: dataImg1,
//         dataImg2: dataImg2
//       });
//     })
//   }



//   // function fnDiffPrice(date) {
//   //   console.log("fnDiffPrice called with date:", date);
//   //   if (date.length < 2) {
//   //     return res.status(400).json({ success: false, message: "Not enough dates to compare" });
//   //   }
//   //   const date1 = date[0].date_check;
//   //   const date2 = date[1].date_check;

//   //   let sql = "SELECT tb_priceproduct.id_pricepro, tb_product.name_product, tb_priceproduct.price_pro, tb_priceproduct.date_check ";
//   //   sql += "FROM tb_priceproduct ";
//   //   sql += "INNER JOIN tb_proselect ON tb_priceproduct.id_pricepro = tb_proselect.idprice ";
//   //   sql += "INNER JOIN tb_product ON tb_proselect.id_prod = tb_product.id_product ";
//   //   sql += "WHERE tb_priceproduct.date_check IN (?, ?) ";
//   //   sql += "ORDER BY tb_priceproduct.date_check DESC";

//   //   conn.query(sql, [date1, date2], (err, result) => {
//   //     if (err) {
//   //       console.error("Error executing query:", err);
//   //       return res.status(500).json({ success: false, message: "Database error" });
//   //     }
//   //     if (result.length > 0) {
//   //       console.log(result);
//   //       res.json(result);
//   //     } else {
//   //       res.status(404).json({ success: false, message: "No price products found for the given dates" });
//   //     }
//   //   });
//   // }

// });


app.get('/app_dffprice', function (req, res) {
  let arrDate = []
  let dataImg1 = []
  let dataImg2 = []
  let totalData = []

  async function main() {
    await fnArrDate()
  }
  main()

  function fnArrDate() {
    let sql = sqlDate
    conn.query(sql, (err, resD) => {
      //console.log(resD);

      arrDate[0] = moment(resD[0].date_check).format("YYYY-MM-DD")
      arrDate[1] = moment(resD[1].date_check).format("YYYY-MM-DD")
      fnDataImg1()
    })
  }

  function fnDataImg1() {
    let sql = sqlDateLast
    console.log(arrDate[0]);
    console.log(arrDate[1]);

    conn.query(sql, [arrDate[0]], (err, resS) => {
      //console.log(resS);

      let mResS = resS.map(item => {
        return {
          id: item.id_pro,
          date_check: moment(item.date_check).format("DD-MM-YYYY"),
          name_pro: item.name_pro,
          price_pro: item.price_pro,
          name_img: item.name_img,
          unitname: item.unitname
          // ...item,
          // date_check: moment(item.date_check).format("DD-MM-YYYY"),
        }
      })
      dataImg1 = mResS
      fnDataImg2()
      //console.log(resS);
      //console.log(resS);
    })
  }

  function fnDataImg2() {
    //console.log(dataImg1.length);
    // console.log(dataImg1)

    let nonRess = [{
      rId: 0,
      name_pro: '',
      name_pro_en: '',
      price_pro: 0,
      date_check: '0',
      name_pro_cn: '',
      name_img: '',
      id_pro: 0,
      id_unit: 0,
      unitname: ''
    }]

    let sql = sqlImgPrice2
    //console.log(arrDate[1]);

    for (let i = 0; i < dataImg1.length; i++) {
      //console.log(dataImg1[i].id);
      conn.query(sql, [arrDate[1],
      [dataImg1[i].id]
      ], (err, resS) => {
        //console.log(resS);
        // let mResS = resS.map(item => {
        //   return {
        //     date_check: moment(item.date_check).format("DD-MM-YYYY"),
        //     name_pro: item.name_pro,
        //     price_pro: item.price_pro,
        //     name_img: item.name_img,
        //     unitname: item.unitname
        //   }
        // })
        if (resS != "") {
          dataImg2.push(resS)
        } else {
          dataImg2.push(nonRess)
        }
        if (i == (dataImg1.length - 1)) {
          difData()
        }
      });
    }
  }

  function difData() {
    // console.log(dataImg2);
    // console.log(dataImg2[0][0].price_pro);
    //console.log(dataImg2[2][0].price_pro);

    let name = ""
    let price = ""
    let price2 = ""
    let date_check = ""
    let img = ""
    let unit = ""
    for (let i = 0; i < dataImg1.length; i++) {

      name = dataImg1[i].name_pro
      price = dataImg1[i].price_pro
      price2 = dataImg2[i][0].price_pro
      date_check = dataImg1[i].date_check
      img = dataImg1[i].name_img
      unit = dataImg1[i].unitname

      if (price > price2 && price2 != 0) { // up
        diff = 2
      } else if (price < price2 && price2 != 0) { // down
        diff = 1
      } else { // =
        diff = 0
      }


      totalData.push({
        date_check: date_check,
        date_check_before: moment(dataImg2[i][0].date_check).format("DD-MM-YYYY"),
        name_pro: name,
        price_pro: price,
        price_pro_before: price2,
        name_img: img,
        unitname: unit,
        diff: diff
      })

      if (i == (dataImg1.length - 1)) {
        sendData()
      }
    }
  }


  function sendData() {
    //console.log(dataImg1);
    //console.log(dataImg2);



    res.send(totalData)
  }
});



const PORT = 3300;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});