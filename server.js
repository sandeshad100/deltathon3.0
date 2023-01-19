const app = require("./app");
const PORT = process.env.PORT || 3000;

//for handling uncaughtexception error
process.on("uncaughtException", (err) => {
  console.log(err.name, err.message);
  console.log("uncaught exception occured shutting down");

  process.exit(1);
});

//initializign config file
const dotenv = require("dotenv");
dotenv.config();

const server = app.listen(3000, () => {
  console.log("server has started at port,", 3000);
});

//for unhandledrejection error
process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  console.log("unhandled rejection occured shutting down");
  server.close(() => {
    process.exit(1);
  });
});
