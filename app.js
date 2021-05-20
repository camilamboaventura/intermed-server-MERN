require("dotenv").config();
const express = require("express");
const cors = require("cors");
require("./config/db.config")();

const app = express();

app.use(express.json());
// Não esquecer de criar variável de ambiente com o endereço do seu app React (local ou deployado no Netlify)
app.use(cors());

const userRouter = require("./routes/user.routes");
app.use("/", userRouter);

const patientRecordRouter = require("./routes/patientRecord.routes");
app.use("/", patientRecordRouter);

const medicalConsultationRouter = require("./routes/medicalConsultation.routes");
app.use("/", medicalConsultationRouter);

app.listen(Number(process.env.PORT), () =>
  console.log(`Server up and running at port ${process.env.PORT}`)
);

