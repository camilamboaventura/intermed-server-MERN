const router = require("express").Router();
const bcrypt = require("bcryptjs");

const UserModel = require("../models/User.model");
const PatientRecord = require("../models/PatientRecord.model");
const generateToken = require("../config/jwt.config");
const isAuthenticated = require("../middlewares/isAuthenticated");
const attachCurrentUser = require("../middlewares/attachCurrentUser");
const isAdmin = require("../middlewares/isAdmin");
const isDoctor = require("../middlewares/isDoctor");
const isUser = require("../middlewares/isUser");
const uploadCloud = require("../config/cloudinary.config");
const PatientRecordModel = require("../models/PatientRecord.model");

const salt_rounds = 10;

// Upload de Imagem no Cloudinary
router.post(
  "/image-upload",
  isAuthenticated,
  attachCurrentUser,
  uploadCloud.single("image"),
  (req, res) => {
    if (!req.file) {
      return res.status(500).json({ msg: "No file uploaded" });
    }

    console.log("oi", req.file);

    return res.status(201).json({ fileUrl: req.file.path });
  }
);

// Crud (CREATE) - HTTP POST
// Criar um novo usuário
router.post("/signup", async (req, res) => {
  // Requisições do tipo POST tem uma propriedade especial chamada body, que carrega a informação enviada pelo cliente
  console.log(req.body);

  try {
    // Recuperar a senha que está vindo do corpo da requisição
    const { password } = req.body;

    // Verifica se a senha não está em branco ou se a senha não é complexa o suficiente
    if (
      !password ||
      !password.match(
        /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$/
      )
    ) {
      // O código 400 significa Bad Request
      return res.status(400).json({
        msg: "Password is required and must have at least 8 characters, uppercase and lowercase letters, numbers and special characters.",
      });
    }

    // Gera o salt
    const salt = await bcrypt.genSalt(salt_rounds);

    // Criptografa a senha
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log("oi", req.body);
    // Salva os dados de usuário no banco de dados (MongoDB) usando o body da requisição como parâmetro
    const result = await UserModel.create({
      ...req.body,
      passwordHash: hashedPassword,
    });

    // Responder o usuário recém-criado no banco para o cliente (solicitante). O status 201 significa Created
    return res.status(201).json(result);
  } catch (err) {
    console.error(err);
    // O status 500 signifca Internal Server Error
    return res.status(500).json({ msg: JSON.stringify(err) });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    // Extraindo o email e senha do corpo da requisição
    const { email, password } = req.body;

    // Pesquisar esse usuário no banco pelo email
    const user = await UserModel.findOne({ email });

    console.log(user);

    // Se o usuário não foi encontrado, significa que ele não é cadastrado
    if (!user) {
      return res
        .status(400)
        .json({ msg: "This email is not yet registered in our website;" });
    }

    // Verificar se a senha do usuário pesquisado bate com a senha recebida pelo formulário

    if (await bcrypt.compare(password, user.passwordHash)) {
      // Gerando o JWT com os dados do usuário que acabou de logar
      const token = generateToken(user);

      return res.status(200).json({
        user: {
          name: user.name,
          email: user.email,
          _id: user._id,
          role: user.role,
        },
        token,
      });
    } else {
      // 401 Significa Unauthorized
      return res.status(401).json({ msg: "Wrong password or email" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: JSON.stringify(err) });
  }
});

// cRud (READ) - HTTP GET
// Buscar todos os usuarios pacientes

router.get(
  "/patients",
  isAuthenticated,
  attachCurrentUser,
  isDoctor,
  async (req, res) => {
    try {
      // Buscar o usuário no banco pelo id
      const result = await UserModel.find({ role: "USER" });

      console.log(result);

      if (result) {
        // Responder o cliente com os dados do usuário. O status 200 significa OK
        return res.status(200).json(result);
      } else {
        return res.status(404).json({ msg: "Patient not found." });
      }
    } catch (err) {
      console.error(err);
      return res.status(500).json({ msg: JSON.stringify(err) });
    }
  }
);

// Buscar todos os usuarios

router.get(
  "/users",
  isAuthenticated,
  attachCurrentUser,
  isAdmin,
  async (req, res) => {
    try {
      // Buscar o usuário no banco pelo id
      const result = await UserModel.find();

      console.log(result);

      if (result) {
        // Responder o cliente com os dados do usuário. O status 200 significa OK
        return res.status(200).json(result);
      } else {
        return res.status(404).json({ msg: "Patient not found." });
      }
    } catch (err) {
      console.error(err);
      return res.status(500).json({ msg: JSON.stringify(err) });
    }
  }
);

router.get(
  "/doctors",
  isAuthenticated,
  attachCurrentUser,
  isUser,
  async (req, res) => {
    try {
      // Buscar o usuário no banco pelo id
      const result = await UserModel.find(
        { role: { $eq: "DOCTOR" } },
        { name: 1, medical_specialty: 1 }
      );

      console.log(result);

      if (result) {
        // Responder o cliente com os dados do usuário. O status 200 significa OK
        return res.status(200).json(result);
      } else {
        return res.status(404).json({ msg: "Patient not found." });
      }
    } catch (err) {
      console.error(err);
      return res.status(500).json({ msg: JSON.stringify(err) });
    }
  }
);

// Buscar dados do usuário
router.get(
  "/users/:id",
  isAuthenticated,
  attachCurrentUser,
  isAdmin,
  async (req, res) => {
    console.log(req.headers);
    try {
      const { id } = req.params;
      // Buscar o usuário no banco pelo id
      const result = await UserModel.findOne({ _id: id }).populate({
        path: "_id",
        model: "PatientRecord",
      });
      // Buscar o usuário logado que está disponível através do middleware attachCurrentUser
      const loggedInUser = req.currentUser;
      if (loggedInUser) {
        // Responder o cliente com os dados do usuário. O status 200 significa OK
        return res.status(200).json(result);
      } else {
        return res.status(404).json({ msg: "User not found." });
      }
    } catch (err) {
      console.error(err);
      return res.status(500).json({ msg: JSON.stringify(err) });
    }
  }
);

router.get(
  "/patients/:id",
  isAuthenticated,
  attachCurrentUser,
  isDoctor,
  async (req, res) => {
    console.log(req.headers);
    try {
      const { id } = req.params;
      // Buscar o usuário no banco pelo id
      const result = await UserModel.findOne({ _id: id }).populate({
        path: "records",
        model: "PatientRecord",
        populate: { path: "created_by", model: "User" },
      });
      // Buscar o usuário logado que está disponível através do middleware attachCurrentUser
      const loggedInUser = req.currentUser;
      if (loggedInUser) {
        // Responder o cliente com os dados do usuário. O status 200 significa OK
        return res.status(200).json(result);
      } else {
        return res.status(404).json({ msg: "User not found." });
      }
    } catch (err) {
      console.error(err);
      return res.status(500).json({ msg: JSON.stringify(err) });
    }
  }
);

//Busca o perfil do usuário logado.
router.get(
  "/profile/:id",
  isAuthenticated,
  attachCurrentUser,
  async (req, res) => {
    try {
      const { id } = req.params;
      // Buscar o usuário no banco pelo id
      const result = await UserModel.findOne({ _id: id }).populate(
        "medicalConsultation"
      );
      // Buscar o usuário logado que está disponível através do middleware attachCurrentUser
      const loggedInUser = req.currentUser;
      if (loggedInUser) {
        // Responder o cliente com os dados do usuário. O status 200 significa OK
        return res.status(200).json(result);
      } else {
        return res.status(404).json({ msg: "User not found." });
      }
    } catch (err) {
      console.error(err);
      return res.status(500).json({ msg: JSON.stringify(err) });
    }
  }
);

// crUd (UPDATE) - HTTP PUT/PATCH
// Atualizar o usuário
router.put(
  "/users/:id",
  isAuthenticated,
  attachCurrentUser,
  isAdmin,
  async (req, res) => {
    try {
      // Extrair o id do paciente do parâmetro de rota
      const { id } = req.params;
      console.log(req.body);
      // Atualizar o paciente específico no banco
      const result = await UserModel.findOneAndUpdate(
        { _id: id },
        { $set: req.body },
        { new: false }
      );

      console.log(result);

      // Caso a busca não tenha encontrado resultados, retorne 404
      if (!result) {
        return res.status(404).json({ msg: "Patient not found." });
      }

      // Responder com o paciente atualizado para o Admin
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
  "/users/:id",
  isAuthenticated,
  attachCurrentUser,
  isAdmin,
  async (req, res) => {
    try {
      // Extrair o id do paciente do parâmetro de rota
      const { id } = req.params;

      // Deletar o paciente no banco
      const result = await UserModel.deleteOne({ _id: id });

      console.log(result);

      // Caso a busca não tenha encontrado resultados, retorne 404
      if (result.n === 0) {
        return res.status(404).json({ msg: "Patient not found." });
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
