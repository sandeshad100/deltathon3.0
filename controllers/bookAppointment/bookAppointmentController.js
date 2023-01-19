const db = require("../../model/index");
const sequelize = db.sequelize;
const User = db.users;
const AppError = require("../../utils/appError");
const sendEmail = require("../../utils/email");
const PDFDocument = require("pdfkit");
const fs = require("fs");

const { QueryTypes, DataTypes } = require("sequelize");
exports.renderBookAppointmentForm = async (req, res) => {
  try {
    var bloodBanks = await sequelize.query(
      "SELECT hospitalId,name,district,localLevel FROM bloodBank ",
      {
        type: QueryTypes.SELECT,
      }
    );
  } catch (error) {
    bloodBanks = [];
  }

  res.render("bookAppointment/createForm", { bloodBanks });
};
exports.createBookAppointment = async (req, res, next) => {
  const { name, email, address, phone, bloodGroup, bloodBank } = req.body;

  if (!name || !email || !address || !phone || !bloodGroup || !bloodBank) {
    return res.render("error/pathError", {
      message: "Please provide all fields",
      code: 400,
    });
  }
  await sequelize.query(
    "CREATE TABLE IF NOT EXISTS bookAppointment (id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,name VARCHAR(255) ,email VARCHAR(255),address VARCHAR(255),phone VARCHAR(255),bloodGroup VARCHAR(255),bloodBank VARCHAR(255),createdAt DATETIME DEFAULT CURRENT_TIMESTAMP)",
    { type: QueryTypes.CREATE }
  );
  await sequelize.query(
    "INSERT INTO bookAppointment(name,email,address,phone,bloodGroup,bloodBank) VALUES(?,?,?,?,?,?) ",
    {
      type: QueryTypes.INSERT,
      replacements: [name, email, address, phone, bloodGroup, bloodBank],
    }
  );
  req.flash("sucess", "Created book appointment sucessfully");
  try {
    const pdf = new PDFDocument();
    pdf.pipe(fs.createWriteStream(`form_${name}.pdf`));
    pdf.text("Name: " + name);
    pdf.moveDown();
    pdf.text("email: " + email);
    pdf.moveDown();
    pdf.text("Address: " + address);
    pdf.moveDown();
    pdf.text("Phone: " + phone);
    pdf.moveDown();
    pdf.text("bloodGroup:" + bloodGroup);
    pdf.moveDown();
    pdf.text("Donation Date: " + bloodBank);
    pdf.moveDown();
    pdf.end();
    const message = [{ filename: "form.pdf", path: `form_${name}.pdf` }];
    const bloodBankEmail = await sequelize.query(
      "SELECT email FROM bloodBank WHERE hospitalId=?",
      {
        type: QueryTypes.SELECT,
        replacements: [bloodBank],
      }
    );

    await sendEmail({
      email: email,
      subject: "Form of book appointment ",
      message,
    });
    await sendEmail({
      email: bloodBankEmail[0].email,
      subject: "Form of book appointment ",
      message,
    });
    res.render("error/pathError", {
      message: "Booked Appointment sucessfully",
      code: 200,
    });

    // res.redirect("/bloodBank");
  } catch (error) {
    // console.log(error);
    res.render("error/pathError", {
      message: error,
      code: 400,
    });
  }
};
