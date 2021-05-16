const router = require("express").Router();
// const moment = require("moment");
const PatientRecord = require("../models/PatientRecord.model");
const UserModel = require("../models/User.model");
const isAuthenticated = require("../middlewares/isAuthenticated");
const attachCurrentUser = require("../middlewares/attachCurrentUser");
const isAdmin = require("../middlewares/isAdmin");
const isDoctor = require("../middlewares/isDoctor");
const uploadCloud = require("../config/cloudinary.config");

// Upload de Imagem no Cloudinary
// router.post(
//   "/image-upload",
//   isAuthenticated,
//   attachCurrentUser,
//   uploadCloud.single("image"),
//   (req, res) => {
//     if (!req.file) {
//       return res.status(500).json({ msg: "No file uploaded" });
//     }

//     console.log(req.file);

//     return res.status(201).json({ fileUrl: req.file.path });
//   }
// );

// Crud (CREATE) - HTTP POST
// Criar um novo usuário
router.post(
  "/record/:id",
  isAuthenticated,
  attachCurrentUser,
  isDoctor,
  async (req, res) => {
    // Requisições do tipo POST tem uma propriedade especial chamada body, que carrega a informação enviada pelo cliente
    console.log(req.body);

    try {
      // Tira a propriedade image_url do objeto caso ela tenha um valor falso, para acionar o filtro de default value do Mongoose
      if (!req.body.test_results) {
        delete req.body.test_results;
      }

      // Transformando a lista de allergy numa array de strings
      //   if (req.body.allergy) {
      //     req.body.allergy = req.body.allergy.split(",");
      //   }

      //   if (req.body.medications) {
      //     req.body.medications = req.body.medications.split(",");
      //   }

      // Salva os dados de usuário no banco de dados (MongoDB) usando o body da requisição como parâmetro
      const result = await PatientRecord.create({
        ...req.body,
        patient_id: req.params.id,
      });
      const userRecord = await UserModel.findOneAndUpdate(
        { _id: req.params.id },
        { $push: { records: result._id } },
        { new: true }
      );
      // Responder o usuário recém-criado no banco para o cliente (solicitante). O status 201 significa Created
      return res.status(201).json(result);
    } catch (err) {
      console.error(err);
      // O status 500 signifca Internal Server Error
      return res.status(500).json({ msg: JSON.stringify(err) });
    }
  }
);

//cRud (READ) - HTTP GET
//Buscar todos os prontuários
router.get(
  "/records",
  isAuthenticated,
  attachCurrentUser,
  isDoctor,
  async (req, res) => {
    try {
      // Buscar o usuário no banco pelo id
      const result = await PatientRecord.find();

      console.log(result);

      if (result) {
        // Responder o cliente com os dados do usuário. O status 200 significa OK
        return res.status(200).json(result);
      } else {
        return res.status(404).json({ msg: "Patient record not found." });
      }
    } catch (err) {
      console.error(err);
      return res.status(500).json({ msg: JSON.stringify(err) });
    }
  }
);

// cRud (READ) - HTTP GET
// Buscar dados do usuário
router.get(
  "/patients/:id/records",
  isAuthenticated,
  attachCurrentUser,
  isDoctor,
  async (req, res) => {
    try {
      // Extrair o parâmetro de rota para poder filtrar o usuário no banco

      const { id } = req.params;

      // Buscar o usuário no banco pelo id
      const result = await PatientRecord.findOne({ _id: id }).populate(
        "records"
      );

      console.log(result);

      return res.status(201).json(result);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ msg: JSON.stringify(err) });
    }
  }
);

// crUd (UPDATE) - HTTP PUT/PATCH
// Atualizar o prontuário
router.put(
  "/records/:id",
  isAuthenticated,
  attachCurrentUser,
  isAdmin,
  async (req, res) => {
    try {
      // Extrair o id do prontuário paciente do parâmetro de rota
      const { id } = req.params;

      // Atualizar o PRONTUÁRIO do paciente específico no banco
      const result = await PatientRecord.findOneAndUpdate(
        { _id: id },
        { $set: req.body },
        { new: true }
      );

      console.log(result);

      // Caso a busca não tenha encontrado resultados, retorne 404
      if (!result) {
        return res.status(404).json({ msg: "Patient Record not found." });
      }

      // Responder com o prontuário do paciente atualizado para o Admin
      return res.status(200).json(result);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ msg: JSON.stringify(err) });
    }
  }
);

// cruD (DELETE) - HTTP DELETE
// Deletar um prontuário
router.delete(
  "/records/:id",
  isAuthenticated,
  attachCurrentUser,
  isAdmin,
  async (req, res) => {
    try {
      // Extrair o id do prontuário do parâmetro de rota
      const { id } = req.params;

      // Deletar o prontuário no banco
      const result = await PatientRecord.deleteOne({ _id: id });

      console.log(result);

      // Caso a busca não tenha encontrado resultados, retorne 404
      if (result.n === 0) {
        return res.status(404).json({ msg: "Patient Record not found." });
      }

      // Por convenção, em deleções retornamos um objeto vazio para descrever sucesso
      return res.status(200).json({});
    } catch (err) {
      console.error(err);
      return res.status(500).json({ msg: JSON.stringify(err) });
    }
  }
);

module.exports = router;
