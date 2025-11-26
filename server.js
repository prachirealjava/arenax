var express = require("express");
var fileuploader = require("express-fileupload");
var cloudinary = require("cloudinary").v2;
var mysql2 = require("mysql2");


var app = express();//app() returns an Object:app

//AI Started to run gemini
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI("AIzaSyB4GYmU685Je_DO12W9gXrXNt3KORJpIEk");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

app.use(express.urlencoded({ extended: true }));

//app.use(fileuploader());//for receiving files from client and save on server files

//AI Connection start

   
async function RajeshBansalKaChirag(imgurl)
{
const myprompt = "Read the text on picture and tell all the information in adhaar card and give output STRICTLY in JSON format {adhaar_number:'', name:'', gender:'', dob: ''}. Dont give output as string."   
    const imageResp = await fetch(imgurl)
        .then((response) => response.arrayBuffer());

    const result = await model.generateContent([
        {
            inlineData: {
                data: Buffer.from(imageResp).toString("base64"),
                mimeType: "image/jpeg",
            },
        },
        myprompt,
    ]);
    console.log(result.response.text())
            
            const cleaned = result.response.text().replace(/```json|```/g, '').trim();
            const jsonData = JSON.parse(cleaned);
            console.log(jsonData);

    return jsonData

}




//Ai connection finished



app.listen(2006, function () {
    console.log("Server Started at Port no: 2006")
})
app.use(express.static("public"));

app.get("/",function(req,resp)
{
    console.log(__dirname);
    console.log(__filename);

    let path=__dirname+"/public/index.html";
    resp.sendFile(path);
})

app.use(express.urlencoded(true)); //convert POST data to JSON object

cloudinary.config({
    cloud_name: 'dk5zzfmku',
    api_key: '761426424853854',
    api_secret: 'Z-IgO-0PAnZSUzVMmEIbcb_3U9o' // Click 'View API Keys' above to copy your API secret
});
//--------------------------------AIven started---------------------------
let dbConfig = "mysql://avnadmin:AVNS_lnEqQrU7oO75nnAbLTY@mysql-2a0f2a12-bansalprachi908-3c97.c.aivencloud.com:27907/defaultdb";
let mySqlVen = mysql2.createConnection(dbConfig);

mysql2.createPool(dbConfig);
console.log("aiven connected successfully");
// mySqlVen.connect(function (errKuch) {
//     if (errKuch == null)
//         console.log("AiVen Connected Successfulllyyy!!!!");
//     else
//         console.log(errKuch.message)
// })
//    ------------------------------------index started-----------------------------------
//    signup backend---------------------------------------
app.get("/get-one", function (req, resp) {
    // console.log(req.query);     
    let emailid = req.query.txtEmail;
    let pwd = req.query.txtPwd;
    let userType = req.query.userType;

    mySqlVen.query("insert into user values(?,?,?,1,current_date())", [emailid, pwd, userType], function (errKuch) {
        if (errKuch == null)
            resp.send("Signup successful.....");
        else
            resp.send(errKuch.message);
    });
});

// login------------------------------------------
app.get("/do-login", function (req, resp) {
    let email = req.query.emailid;
    let pwd = req.query.pwd;

    mySqlVen.query("SELECT * FROM user WHERE emailid=? AND pwd=?", [email, pwd], function (errKuch, allRecords) {
     if (allRecords.length == 0) {
        resp.send("Invalid");
    }
    else if (allRecords[0].status == 1) {
    
        resp.send(allRecords[0].usertype);
    }
    else {
        
        resp.send("Blocked"); 
    }
});


//       mySqlVen.query("select * from user where emailid=? and pwd=?", [email, pwd], function (errKuch, allRecords) {
//         let status = allRecords[0].status;
//         if (allRecords.length == 0) {
           
//                 resp.send("Invalid");}
//            else if (allRecord[0].status == 0)
//               { resp.send("Blocked");}
           

        
//         else {
//             resp.send("success");
//         }
    
//  });
 });
//                     index ends---------------------
//    --------------------------------------------------------------------------------------------
//                    org details started--------------------------
// to save organization details into database 

app.post("/save-organizer", async function (req, resp) {
    let picurl = "";

        if (req.files != null) {
            let fName = req.files.profilePic.name;
            let fullPath = __dirname + "/public/uploads/" + fName;
            await req.files.profilePic.mv(fullPath);



            await cloudinary.uploader.upload(fullPath).then(function (picurlResult) {
                picurl = picurlResult.url; //will give u the url of ur pic on cloudinary server
                // console.log(picurl);
            });
        }
        else
            picurl = "nopic.jpg";

    let emailid = req.body.txtEmail;
    let orgname = req.body.txtOrgName;
    let regno = req.body.txtRegNo;
    let address = req.body.txtAddress;
    let city = req.body.txtCity;
    let dealsinsports = req.body.txtDeals;
    let website = req.body.txtWebsite;
    let instalink = req.body.txtInsta;
    let orghead = req.body.txtHead;
    let contactno = req.body.txtContact;
    let otherinfo = req.body.txtOther;

    mySqlVen.query(
        "insert into organizers values(?,?,?,?,?,?,?,?,?,?,?,?)",
        [emailid, orgname, regno, address, city, dealsinsports, website, instalink, orghead, contactno, otherinfo, picurl],
        function (errKuch) {
            if (errKuch == null)
                resp.send("Organizer record Saved Successfully");
            else
                resp.send(errKuch.message);
        }
    );
});


// search -------------------------
app.get("/fetch-organizer", function (req, resp) {
    let email = req.query.emailid;
    mySqlVen.query("select * from organizers where emailid=?", [email], function (err, result) {
        if (result.length == 0)
            resp.send("No Record Found");
        else
            resp.json(result);
    });
});


// update/modify  ----------------
app.post("/update-organizer", async function (req, resp) {
    let picurl = "";
                            // ------ 1 challenge in pic  we use hdn  -----------------
                             // ------ 2 challenge in pic  we use &&req.files.profilePic!=null  and add  
//     else if(req.body.hdn && req.body.hdn.trim().length>0)
// {
// picurl=req.body.hdn;}  
   


    if (req.files && req.files.profilePic!= null) {     // user want to update profile pic                           
        let fName = req.files.profilePic.name;
        let fullPath = __dirname + "/public/uploads/" + fName;
       await req.files.profilePic.mv(fullPath);
          
              await  cloudinary.uploader.upload(fullPath).then(function(result) 
              {
                picurl=result.url;   //will give u the url of ur pic on cloudinary server

          //  console.log(picurl);
      });
    }
    
    else if(req.body.hdn && req.body.hdn.trim().length>0)
        {
                     picurl=req.body.hdn;
    }
    
 else 
        picurl = "nopic.jpg";

        let emailid = req.body.txtEmail;
        let orgname = req.body.txtOrgName;
        let regno = req.body.txtRegNo;
        let address = req.body.txtAddress;
        let city = req.body.txtCity;
        let dealsinsports = req.body.txtDeals;
        let website = req.body.txtWebsite;
        let instalink = req.body.txtInsta;
        let orghead = req.body.txtHead;
        let contactno = req.body.txtContact;
        let otherinfo = req.body.txtOther;

        mySqlVen.query(
            "update organizers set orgname=?, regno=?, address=?, city=?, dealsinsports=?, website=?, instalink=?, orghead=?, contactno=?, otherinfo=?, picurl=? where emailid=?",
            [orgname, regno, address, city, dealsinsports, website, instalink, orghead, contactno, otherinfo, picurl, emailid],
            function (errKuch, result) 
            {
                if(errKuch==null)
                {
                    if(result.affectedRows==1)
                        resp.send("Record Saved Successfulllyyy....Badhai");
                    else
                        resp.send("Inavlid email Id");
                }
                else 
                    resp.send(errKuch.message)   
        })

})
               
   
// ----------------------------------  org details end-----------------------------------------------
//                                  post tournament started------------
// publish button backend
// -----------------------------------------------------------------------------
// save-tournament backend
app.get("/save-tournament", function (req, resp) {// this defines a backend route when frontend send get request to savetournament this function runs
   console.log(req.query);
    let email = req.query.email;    //fetch data from the request sent by the browser using ajax(each line get value that was passed in ajax)
    let event = req.query.event;
    let date = req.query.date;
    let time = req.query.time;
    let address = req.query.address;
    let city = req.query.city;
    let sports = req.query.sports;
    let minage = req.query.minAge;
    let maxage = req.query.maxAge;
    let lastdate = req.query.lastDate;
    let fee = req.query.fee;
    let prize = req.query.prize;
    let contact = req.query.contact;
// these ????? are called in parameters
    mySqlVen.query("insert into tournaments(email,event,date,time,address,city,sports,minage,maxage,lastdate,fee,prize,contact) values (?,?,?,?,?,?,?,?,?,?,?,?,?)",//sends insert sql query to mysql database(inserting all the tournament details into the tournaments table)
        [email, event, date, time, address, city, sports, minage, maxage, lastdate, fee, prize, contact],function (errKuch) {
            if (errKuch == null)
                resp.send("Tournament Saved Successfully");
            else
                
                resp.send(errKuch.message);
        });
});
// -----------------------------------post touurnament ended ------------------------------------------
                        //    tournament Manager.html starts

// angular js 

app.get("/fetch-tournaments",function(req,resp)
{                 let email=req.query.email;
    if(email!=undefined && email!=""){
        mySqlVen.query("select * from tournaments where email=? ",[email],function(err,result)
        {    
            if(err)
                resp.send(err.message); 
         else   if (result.length==0)
                    resp.send("no record found");
                else
                    resp.json(result);
        });
    } else{
        mySqlVen.query("select * from tournaments ",function(err,result)
        {    
            if(err)
                     resp.send(err.message);
                    else
                        resp.json(result);

            });
        }
})
    
    
app.get("/delete-tournament",function(req,resp)
{
    console.log(req.query)
    let rid=req.query.ridKuch;
    

    mySqlVen.query("delete from tournaments where rid=? ",[rid],function(errKuch,result)
    {
        if(errKuch==null)
                {
                    if(result.affectedRows==1)
                        resp.send(rid+" tournament  Deleted Successfulllyyyy...");
                    else
                        resp.send("rid");
                }
                else
                resp.send(errKuch);

    })
}) 
//---------------------------------------------------------   //    tournament Manager.html  ends

// -------------------------------------- profile player.html started--------------------------------------
   app.post("/save-player", async function (req, resp) {
    let acardpicurl = "";
    let profilepicurl = "";
    let jsonData;

    if (req.files && req.files.adhaarPic) {
        let fName = req.files.adhaarPic.name;
        let fullPath = __dirname + "/public/uploads/" + fName;
        await req.files.adhaarPic.mv(fullPath);

        let result = await cloudinary.uploader.upload(fullPath);
        acardpicurl = result.url;

        
         jsonData = await RajeshBansalKaChirag(acardpicurl);//for gemini
       
    } else {
        acardpicurl = "nopic.jpg";
    }

    if (req.files && req.files.profilePic) {
        let fName = req.files.profilePic.name;
        let fullPath = __dirname + "/public/uploads/" + fName;
        await req.files.profilePic.mv(fullPath);

        let result = await cloudinary.uploader.upload(fullPath);
        profilepicurl = result.url;
    } else {
        profilepicurl = "nopic.jpg";
    }

    let emailid = req.body.txtEmail;
    //let name = jsonData.name;
    //let dob = jsonData.dob;
    //let gender = jsonData.gender;
    //let name = req.body.name;
   // let dob = req.body.dob;
    //let gender = req.body.gender;
    let address = req.body.txtAddress;
    let contact = req.body.txtContact;
    let game = req.body.txtGames;
    let otherinfo = req.body.txtOther;
    let dobMySQL = convertToMySQLDate(jsonData.dob);

    mySqlVen.query(
        "INSERT INTO players VALUES(?,?,?,?,?,?,?,?,?,?)",
        [emailid, acardpicurl, profilepicurl, jsonData.name, dobMySQL,jsonData.gender, address, contact, game, otherinfo],
        function (err) {
            if (err == null)
                resp.send("Player record Saved Successfully");
            else
                resp.send(err.message);
        }
    );
});
    
function convertToMySQLDate(dateStr) {
    if (!dateStr) return null;

    // Replace / with - to normalize
    dateStr = dateStr.replace(/\//g, "-");

    const parts = dateStr.split("-");
    if (parts.length !== 3) return null;

    const [dd, mm, yyyy] = parts;

    // Basic sanity check
    if (yyyy.length !== 4) return null;

    return `${yyyy}-${mm}-${dd}`;
}
// -------------------          search                ------------------------------------------------------
app.get("/fetch-player", function (req, resp) {
    let email = req.query.emailid;
    mySqlVen.query("SELECT * FROM players WHERE emailid=?", [email], function (err, result) {
        if (err) {
            resp.send(err.message);
        } else if (result.length == 0) {
            resp.send([]);
        } else {
            resp.json(result);
        }
    });
});
// --------------------------------------------------------------------------------
app.post("/update-player", async function (req, resp) {
    let acardpicurl = "";
    let profilepicurl = "";

    if (req.files && req.files.adhaarPic != null) {
        let fName = req.files.adhaarPic.name;
        let fullPath = __dirname + "/public/uploads/" + fName;
        await req.files.adhaarPic.mv(fullPath);
        await cloudinary.uploader.upload(fullPath).then(function (result) {
            acardpicurl = result.url;
        });
    } else if (req.body.hdn) {
        acardpicurl = req.body.hdn;
    } else {
        acardpicurl = "nopic.jpg";
    }

    if (req.files && req.files.profilePic != null) {
        let fName = req.files.profilePic.name;
        let fullPath = __dirname + "/public/uploads/" + fName;
        await req.files.profilePic.mv(fullPath);
        await cloudinary.uploader.upload(fullPath).then(function (result) {
            profilepicurl = result.url;
        });
    } else if (req.body.hdn) {
        profilepicurl = req.body.hdn;
    } else {
        profilepicurl = "nopic.jpg";
    }

    let emailid = req.body.txtEmail;
    let name = req.body.txtName;
    let dob = req.body.txtDob;
    let gender = req.body.txtGender;
    
    let address = req.body.txtAddress;
    let contact = req.body.txtContact;
    let game = req.body.txtGames;
    let otherinfo = req.body.txtOther;

    mySqlVen.query(
        "UPDATE players SET acardpicurl=?, profilepicurl=?, name=?, dob=?, gender=?, address=?, contact=?, game=?, otherinfo=? WHERE emailid=?",
        [acardpicurl, profilepicurl, name, dob, gender, address, contact, game, otherinfo, emailid],
        function (err, result) {
            if (err == null) {
                if (result.affectedRows == 1)
                    resp.send("Player record updated successfully");
                else
                    resp.send("Invalid email ID");
            } else {
                resp.send(err.message);
            }
        }
    );
});
// --------------------------------------------- profile player.html -- ends ----------------------------------------------------------------
//-------------------------------------------admin users console.html  starts---------------------------------------------
// ------------------------ Admin Users Console Backend ------------------------

app.get("/do-fetch", function (req, resp) {
    let query = "SELECT * FROM user";
    mySqlVen.query(query, function (err, allRecords) {
        if (err == null)
            resp.send(allRecords);
        else
            resp.send(err.message);
    });
});

app.get("/do-block", function (req, resp) {
    let email = req.query.email;
    let query = "UPDATE user SET status=0 WHERE emailid=?";
    mySqlVen.query(query, [email], function (err, result) {
        if (err == null)
            resp.send(result.affectedRows == 1 ? "Blocked.." : "Invalid Email id");
        else
            resp.send(err.message);
    });
});

app.get("/do-unblock", function (req, resp) {
    let email = req.query.email;
    let query = "UPDATE user SET status=1 WHERE emailid=?";
    mySqlVen.query(query, [email], function (err, result) {
        if (err == null)
            resp.send(result.affectedRows == 1 ? "unBlocked.." : "Invalid Email id");
        else
            resp.send(err.message);
    });
});

// -------------------------------------------------------Admin  user Console.html       ends--------------------------------------------------------
// ========= PLAYER BACKEND ROUTES ========= //
// =====================================================player.html started==============================================
app.get("/fetch-all-players", function (req, resp) {
    let email = req.query.email;

    if (email != undefined && email != "") {
        mySqlVen.query("SELECT * FROM players WHERE emailid=?", [email], function (err, result) {
            if (err)
                resp.send(err.message);
            else if (result.length == 0)
                resp.send("no record found");
            else
                resp.json(result);
        });
    } else {
        mySqlVen.query("SELECT * FROM players", function (err, result) {
            if (err)
                resp.send(err.message);
            else
                resp.json(result);
        });
    }
});

app.get("/delete-player", function (req, resp) {
    console.log(req.query);
    let emailid = req.query.emailid;

    mySqlVen.query("DELETE FROM players WHERE emailid=?", [emailid], function (err, result) {
        if (err == null) {
            if (result.affectedRows == 1)
                resp.send(emailid + " player deleted successfully...");
            else
                resp.send("No such player found");
        } else {
            resp.send(err.message);
        }
    });
});
   //   ===================================================player.html ends=======================================
   
   // ============================== organizer.html started ==============================
app.get("/fetch-all-organizers", function (req, resp) {
    let email = req.query.email;

    if (email != undefined && email != "") {
        mySqlVen.query("SELECT * FROM organizers WHERE emailid=?", [email], function (err, result) {
            if (err)
                resp.send(err.message);
            else if (result.length == 0)
                resp.send("no record found");
            else
                resp.json(result);
        });
    } else {
        mySqlVen.query("SELECT * FROM organizers", function (err, result) {
            if (err)
                resp.send(err.message);
            else
                resp.json(result);
        });
    }
});

app.get("/delete-organizer", function (req, resp) {
    console.log(req.query);
    let emailid = req.query.emailid;

    mySqlVen.query("DELETE FROM organizers WHERE emailid=?", [emailid], function (err, result) {
        if (err == null) {
            if (result.affectedRows == 1)
                resp.send(emailid + " organizer deleted successfully...");
            else
                resp.send("No such organizer found");
        } else {
            resp.send(err.message);
        }
    });
});
// ============================== organizer.html ends ==============================
//=============================================================tornament finder.html starts===============

app.get("/do-fetch-all-tournaments", function (req, resp) {
    //console.log(req.query); 

    let query = "SELECT * FROM tournaments WHERE city = ? AND sports = ?";
    let values = [req.query.kuchCity, req.query.kuchGame];

    mySqlVen.query(query, values, function (err, allRecords) {
        if (err) {
           // console.log(err);
            resp.send(err.message);
        } else {
           // console.log(allRecords);
            resp.send(allRecords);
        }
    });
});
// ------------------------
app.get("/do-fetch-all-cities", function (req, resp) {
    let query = "SELECT DISTINCT city FROM tournaments";

    mySqlVen.query(query, function (err, allRecords) {
        if (err) {
           // console.log(err);
            resp.send(err.message); // send error message to client
        } else {
           // console.log(allRecords);
            resp.send(allRecords); // send city list
        }
    });
});
// ========================  tournament finder.html ends  =========================
//------------------------------------------------------------------------------------------------
// -----------------dash player.html ki setting start
app.get("/update-pwd", function (req, resp) {
  let emailid = req.query.emailid;
  let oldpwd = req.query.oldpwd;
  let newpwd = req.query.newpwd;

  mySqlVen.query("SELECT * FROM user WHERE emailid=? AND pwd=?", [emailid, oldpwd], function (err, result) {
    if (err) {
      resp.send("Error");
    } else if (result.length == 0) {
      resp.send("Wrong old password");
    } else {
      mySqlVen.query("UPDATE user SET pwd=? WHERE emailid=?", [newpwd, emailid], function (err2, result2) {
        if (err2) {
          resp.send("Error");
        } else {
          resp.send("Password updated");
        }
      });
    }
  });
});
// --------------------------------------ends dash player.html ki setting ---------------------