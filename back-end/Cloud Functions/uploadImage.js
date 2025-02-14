 const path = require('path');
 const os = require('os');
 const fs = require('fs');
 const cors = require('cors')({origin : true})
 const {
   Storage
 } = require('@google-cloud/storage');
 const https = require("https");

//Specifying the bucketname
 const bucketName = "box1test1"
 const testBucket = new Storage().bucket(bucketName);

 //Using Busboy to take the file/image and store it in specific folder of that bucket
 const Busboy = require('busboy');

//Function to upload file/image to the bucket
 const uploadFileToBucket = (filePath, boxNumber) => {
   let justFileName = filePath.replace("/tmp/", "");
   options = {
     destination: `${boxNumber}/${justFileName}`
   }
   return testBucket.upload(filePath, options).then((res) => {
     console.log(`File Uploaded to bucket! Success! => ` + res[0].metadata.mediaLink)
   })
 }

//Main driver function to take the file/image and store in cloud storage bucket
 exports.helloWorld = (req, res) => {

  res.set('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS' && req.method === "POST") {
    // Send response to OPTIONS requests
    res.set('Access-Control-Allow-Methods', 'GET');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.set('Access-Control-Max-Age', '3600');
  }

   const busboy = new Busboy({
     headers: req.headers
   });
   const tmpdir = os.tmpdir();

   const fields = {};

   const uploads = {};

   busboy.on('field', (fieldname, val) => {
     console.log(`Processed field ${fieldname}: ${val}.`);
     fields[fieldname] = val;
   });

   const fileWrites = [];

   busboy.on('file', (fieldname, file, filename) => {
     console.log(`Processed file ${filename}`);
     const filepath = path.join(tmpdir, filename);
     uploads[fieldname] = filepath;

     const writeStream = fs.createWriteStream(filepath);
     file.pipe(writeStream);

     const promise = new Promise((resolve, reject) => {
       file.on('end', () => {
         writeStream.end();
       });
       writeStream.on('finish', resolve);
       writeStream.on('error', reject);
     });
     fileWrites.push(promise);
   });

   busboy.on('finish', async () => {
     await Promise.all(fileWrites);
     for (const file in uploads) {
       let boxNumber = fields.boxNumber || "";
       uploadFileToBucket(uploads[file], boxNumber).then(()=>
         {
           console.log('Checking Image')
           https.get("https://us-central1-serverless-329200.cloudfunctions.net/mlhttp?boxNumber="+boxNumber, (resp) => {
           let data = "";
           resp.on("data", (chunk) => {
             data += chunk;
             console.log(data)


             
           }).on("end", () => {
             
              if(data.includes("success") || data.includes("200")){
               console.log("Returning 200")
               return res.status(200).json({
                 data
               });
             }else{
               console.log("Returnign 400")
              return res.status(400).json({
                data
              });
             }


           })
         }).on("error", (err) => {
           console.log("Error: " + err.message);
           return res.status(400).send(err)
         }).on("end", () => {
           console.log("Completed everything...!")
         })
         });
     }
   });

   busboy.end(req.rawBody);
 };