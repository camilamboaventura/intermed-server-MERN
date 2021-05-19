const router = require("express").Router();
const MedicalConsultationModel = require("../models/MedicalConsultation.model");
const UserModel = require("../models/User.model");
const isAuthenticated = require("../middlewares/isAuthenticated");
const attachCurrentUser = require("../middlewares/attachCurrentUser");
const isAdmin = require("../middlewares/isAdmin");
const isDoctor = require("../middlewares/isDoctor");
const isUser = require("../middlewares/isUser");

// Criar uma nova consult
router.post(
  "/book",
  isAuthenticated,
  attachCurrentUser,
  isUser,
  async (req, res) => {
    try {
      // Criar a transação
      const result = await MedicalConsultationModel.create({
        ...req.body,
        pacient_id: req.currentUser._id,
      });

      // Atualizar as transações deste usuário
      const updatedUser = await UserModel.findOneAndUpdate(
        { _id: req.body.pacient_id },
        { $push: { medicalConsultation: result._id } }
      );

      console.log(updatedUser);

      // Atualizar as transações de cada produto

      // for (let product of req.body.products) {
      //   await ProductModel.findOneAndUpdate(
      //     { _id: product.productId },
      //     // $inc é o operador de incremento: ele vai subtrair ou adicionar desse campo a quantidade informada
      //     {
      //       $push: { transactions: result._id },
      //       // Atualizar os estoques dos produtos
      //       $inc: { qtt_in_stock: -product.qtt },
      //     }
      //   );
      // }

      // Responde o resultado pro cliente
      return res.status(201).json(result);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ msg: JSON.stringify(err) });
    }
  }
);

// // Recuperar detalhes da transação
// router.get("/transaction/:id", async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Buscar os dados da transação usando o id da URL
//     const result = await TransactionModel.findOne({ _id: id }).populate({
//       path: "products.productId",
//       model: "Product",
//     });

//     console.log(result);

//     return res.status(200).json(result);
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ msg: JSON.stringify(err) });
//   }
// });

// crUd (UPDATE) - HTTP PUT/PATCH
// Atualizar o prontuário
router.put(
  "/books/:id",
  isAuthenticated,
  attachCurrentUser,
  isUser,
  async (req, res) => {
    try {
      // Extrair o id do prontuário paciente do parâmetro de rota
      const { id } = req.params;

      // Atualizar o PRONTUÁRIO do paciente específico no banco
      const result = await MedicalConsultationModel.findOneAndUpdate(
        { _id: id },
        { $set: req.body },
        { new: true }
      );

      console.log(result);

      // Caso a busca não tenha encontrado resultados, retorne 404
      if (!result) {
        return res.status(404).json({ msg: "Medical Consultation not found." });
      }

      // Responder com a consulta do paciente atualizado
      return res.status(200).json(result);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ msg: JSON.stringify(err) });
    }
  }
);

// Deletar uma consulta medica
router.delete(
  "/books/:id",
  isAuthenticated,
  attachCurrentUser,
  isUser,
  async (req, res) => {
    try {
      // Extrair o id do prontuário do parâmetro de rota
      const { id } = req.params;

      // Deletar a consulta medica no banco
      const result = await MedicalConsultationModel.deleteOne({ _id: id });

      console.log(result);

      // Caso a busca não tenha encontrado resultados, retorne 404
      if (result.n === 0) {
        return res.status(404).json({ msg: "Medical Consultation not found." });
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
