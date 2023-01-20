const express = require("express");
const app = express();
const path = require("path");
const ejs = require("ejs");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");

//routes import
const authRoute = require("./routes/authRoute");
const eventRoute = require("./routes/eventRoute");
const bloodBankRoute = require("./routes/bloodBankRoute");
const donorRoute = require("./routes/donorRoute");
const donorHistoryRoute = require("./routes/donorHistoryRoute");
const bloodRequestRoute = require("./routes/bloodRequestRoute");
const bookAppointmentRoute = require("./routes/bookAppointmentRoute");
const ambulanceRoute = require("./routes/ambulanceRoute");
const contactRoute = require("./routes/contactRoute");
const homeRoute = require("./routes/homeRoute");
const selectRoute = require("./routes/selectRoute");
const consultDoctorRoute = require("./routes/consultDoctorRoute");
const locationRoute = require("./routes/locationRoute");
const predictRoute = require("./routes/predictRoute");

var axios = require("axios").default;
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilio = require("twilio")(accountSid, authToken);

const {
  renderCreateEventPage,
} = require("./controllers/event/eventController");
const { restrictTo } = require("./utils/restrictTo");
const { protectMiddleware } = require("./utils/isAuthenticated");
const {
  renderCreateBloodBank,
} = require("./controllers/bloodBank/bloodBankController");
const { sequelize } = require("./model");
const {
  renderCreateDoctor,
  messageToDoctor,
} = require("./controllers/consultDoctor/consultDoctor");
const { sendMessage } = require("./utils/sendMessage");

//ejs and json configuration
app.use(require("cookie-parser")());
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
//parsing incoming req body data to json
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const secret = process.env.SECRET || "thisshouldbeabettersecret!";

const sessionConfig = {
  name: "session",
  secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    // secure: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};
app.use(session(sessionConfig));
app.use(flash());

app.use((req, res, next) => {
  // console.log(req.cookies.jwtToken);
  res.locals.currentUser = req.cookies.jwtToken;
  res.locals.hospitalId = req.cookies.hospitalId;

  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.user = req.user;
  res.locals.sendMessage = async (message, phone) => {
    try {
      await twilio.messages.create({
        body: message,
        from: process.env.FROM_NUMBER,
        to: phone,
      });
      console.log("send");
    } catch (error) {
      console.log(error);
    }
  };
  res.locals.shortenText = function (text, length) {
    return text.substring(0, length);
  };

  next();
});

app.get("/call/:id", (req, res) => {
  const id = req.params.id;
  res.render("call/renderCallPage", { id });
});

app.get("/map", (req, res) => {
  res.render("map/index");
});
// app.get("/", renderCreateEventPage);
app.get(
  "/admin/dashboard/createEvent",
  protectMiddleware,
  restrictTo("admin"),
  renderCreateEventPage
);
app.get(
  "/admin/dashboard/createBloodBank",
  protectMiddleware,
  restrictTo("admin"),
  renderCreateBloodBank
);

app.get(
  "/admin/dashboard/createDoctor",
  protectMiddleware,
  restrictTo("admin"),
  renderCreateDoctor
);
app.get("/districts", async (req, res) => {
  const districts = await sequelize.query(
    "SELECT * FROM districts WHERE province_id=? ",
    {
      replacements: [req.query.province_id],
      type: sequelize.QueryTypes.SELECT,
    }
  );
  res.json(districts);
});

app.get("/districtsByName", async (req, res) => {
  const districtsByName = await sequelize.query(
    "SELECT districts.name FROM districts LEFT JOIN provinces p ON p.id = districts.province_id WHERE p.name=? ",
    {
      replacements: [req.query.name],
      type: sequelize.QueryTypes.SELECT,
    }
  );
  await sequelize.query(
    "CREATE TABLE IF NOT EXISTS localLevel(id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,districtId INT REFERENCES districts ON DELETE CASCADE ON UPDATE CASCADE,name VARCHAR(255)) ",
    {
      type: sequelize.QueryTypes.CREATE,
    }
  );
  const localLevel = await sequelize.query("SELECT * FROM localLevel", {
    type: sequelize.QueryTypes.SELECT,
  });

  if (localLevel.length === 0) {
    await sequelize.query(
      "INSERT INTO localLevel(id,districtId,name) VALUES(1,8,'Dharan'),(2,8,'Itahari'),(3,8,'Pachruki')",
      {
        type: sequelize.QueryTypes.INSERT,
      }
    );
  }

  res.json(districtsByName);
});
app.get("/localLevelByName", async (req, res, next) => {
  try {
    const localLevels = await sequelize.query(
      "SELECT localLevel.name FROM localLevel LEFT JOIN districts d ON d.id = localLevel.districtId WHERE d.name=? ",
      {
        replacements: [req.query.name],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    res.json(localLevels);
  } catch (error) {
    res.render("error/pathError", { message: error.message, code: 500 });
  }
});

app.get("/validate-meeting", function (req, res) {
  /**
   * Using the Metered Get Room API to check if the
   * Specified Meeting ID is valid.
   * https://www.metered.ca/docs/rest-api/get-room-api
   */
  var options = {
    method: "GET",
    url:
      "https://" +
      process.env.METERED_DOMAIN +
      "/api/v1/room/" +
      req.query.meetingId,
    params: {
      secretKey: process.env.METERED_SECRET_KEY,
    },
    headers: {
      Accept: "application/json",
    },
  };

  axios
    .request(options)
    .then(function (response) {
      console.log(response.data);
      res.send({
        success: true,
      });
    })
    .catch(function (error) {
      console.error(error);
      res.send({
        success: false,
      });
    });
});

app.post("/create-meeting-room", function (req, res) {
  var options = {
    method: "POST",
    url: "https://" + process.env.METERED_DOMAIN + "/api/v1/room/",
    params: {
      secretKey: process.env.METERED_SECRET_KEY,
    },
    headers: {
      Accept: "application/json",
    },
  };

  axios
    .request(options)
    .then(function (response) {
      console.log(response.data);
      res.send({
        success: true,
        ...response.data,
      });
    })
    .catch(function (error) {
      console.error(error);
      res.send({
        success: false,
      });
    });
});

app.get("/metered-domain", function (req, res) {
  res.send({
    domain: process.env.METERED_DOMAIN,
  });
});
//routes
app.use("/", authRoute);
app.use("/select", selectRoute);
app.use("/blood", homeRoute);
app.use("/consultDoctor", consultDoctorRoute);
app.use("/location", locationRoute);
app.use("/predict", predictRoute);
app.use("/events", eventRoute);
app.use("/bloodBank", bloodBankRoute);
app.use("/donor", donorRoute);
app.use("/donorHistory", donorHistoryRoute);
app.use("/bookAppointment", bookAppointmentRoute);
app.use("/bloodRequest", bloodRequestRoute);
app.use("/ambulance", ambulanceRoute);
app.use("/contact", contactRoute);

//error beside routes route
app.all("*", (req, res, next) => {
  const message = `Cannot find the path ${req.originalUrl}`;
  res.render("error/pathError", { message, code: 404 });
});

module.exports = app;
