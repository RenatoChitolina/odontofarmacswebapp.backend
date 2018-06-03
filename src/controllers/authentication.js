const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const profileRepository = require('../repositories/cloudant/profileCloudantRepository');
const utils = require('../helpers/utils');
const env = require('../.env');

module.exports.signin = async (server, req, res) => {
    let cpfCro = utils.removeNonDigits(req.body.cpfCro) || "";
    let password = req.body.password || "";

    try {
        let profile = await profileRepository.getByCpf(cpfCro);

        if (!profile) {
            profile = await profileRepository.getByCro(cpfCro);

            if (!profile) {
                res.status(400).send({ errors: ["CPF/CRO e senha devem ser válidos."] });
                return;
            }
        }

        if (!bcrypt.compareSync(password, profile.password)) {
            //TODO: (R) Workaround provisório para os casos de requisições executadas imediatamente após o completeSignup, 
            //onde o client recebe o password encriptado. Remover e fazer de forma mais segura futuramente
            if (password != profile.password) {
                res.status(400).send({ errors: ["CPF/CRO e senha devem ser válidos."] });
                return;
            }
        }

        let token = jwt.sign(profile, env.AUTH_SECRET, { expiresIn: env.TOKEN_DURATION });

        res.status(200).send({ infos: ['Autenticação efetuada com sucesso.'], data: { id: profile._id, cpf: profile.cpf, name: profile.name, token, expiresIn: parseInt(env.TOKEN_DURATION.split(" ")[0]) } });
    } catch (err) {
        res.status(400).send({ errors: ["Não foi possível verificar o CPF/CRO informado neste momento. Tente novamente."] });
    }
}

module.exports.beginSignup = async (server, req, res) => {
    let errors = await validateSignupData(req);

    if (errors.length > 0) {
        res.status(400).send({ errors: errors });
        return;
    }

    res.status(200).send({ infos: [] });
}

module.exports.completeSignup = async (server, req, res) => {
    let errors = await validateSignupData(req);

    if (errors.lenght > 0) {
        res.status(400).send({ errors: errors });
        return;
    }

    let profileToAdd = {
        type: req.body.type.index,
        name: req.body.name,
        surname: req.body.surname,
        birth: req.body.birth,
        cpf: utils.removeNonDigits(req.body.cpf),
        password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync()),
        signature: req.body.signature
    }

    let cro = utils.removeNonDigits(req.body.cro || "");
    if (cro != "")
        profileToAdd.cro = cro;

    let email = req.body.email || "";
    if (email != "")
        profileToAdd.email = email;

    let profileAddedHead = await profileRepository.insert(profileToAdd);

    let profileAdded = await profileRepository.getById(profileAddedHead.id);

    res.status(200).send({ infos: ['Cadastro efetuado com sucesso.'], data: profileAdded });
}

module.exports.updateProfilePassword = async (server, req, res) => {
    let profileId = req.body.profileId || "";
    let currentPassword = req.body.currentPassword || "";
    let newPassword = req.body.newPassword || "";
    let newPasswordConfirm = req.body.newPasswordConfirm || "";

    try {
        if (!utils.matchPassword(newPassword)) {
            res.status(400).send({ errors: ["Nova senha válida deve ser informada, de 6 a 20 caracteres (letras e números)."] });
            return result;
        }

        if (!bcrypt.compareSync(newPasswordConfirm, bcrypt.hashSync(newPassword, bcrypt.genSaltSync()))) {
            res.status(400).send({ errors: ["Confirmação de senha deve corresponder à nova senha informada."] });
            return result;
        }

        let profile = await profileRepository.getById(profileId);

        if (!profile) {
            res.status(400).send({ errors: ["Não foi possível encontrar um perfil para o ID informado. Tente novamente."] });
            return;
        }

        if (!bcrypt.compareSync(currentPassword, profile.password)) {
            res.status(400).send({ errors: ["Senha atual deve ser válida."] });
            return;
        }

        profile.password = bcrypt.hashSync(newPassword, bcrypt.genSaltSync());

        let profileUpdatedHead = await profileRepository.update(profile);

        let profileUpdated = await profileRepository.getById(profileUpdatedHead.id);

        res.status(200).send({ infos: ['Atualização de senha efetuada com sucesso.'], data: profileUpdated });
    } catch (err) {
        res.status(400).send({ errors: ["Não foi possível atualizar a senha neste momento. Tente novamente."] });
    }
}

validateSignupData = async (req) => {
    let type = req.body.type.index || 0;
    let name = req.body.name || "";
    let surname = req.body.surname || "";
    let birth = req.body.birth || 0;
    let cpf = utils.removeNonDigits(req.body.cpf || "");
    let cro = utils.removeNonDigits(req.body.cro || "");
    let email = req.body.email || "";
    let password = req.body.password || "";
    let passwordConfirm = req.body.passwordConfirm || "";
    let signature = req.body.signature || 0;

    let result = [];

    //1 - Profissional
    //2 - Estudante
    if (type <= 0) {
        result.push("Tipo de perfil deve ser informado.");
        return result;
    }

    if (name == "") {
        result.push("Nome deve ser informado.");
        return result;
    }

    if (surname == "") {
        result.push("Sobrenome deve ser informado.");
        return result;
    }

    if (birth == "") {
        result.push("Data de nascimento deve ser informada.");
        return result;
    }

    if (!utils.matchCpf(cpf)) {
        result.push("CPF válido deve ser informado.");
        return result;
    }

    //TODO: (R) descobrir algoritmo para validar o CRO

    if (email != "")
        if (!utils.matchEmail(email)) {
            result.push("E-mail válido deve ser informado.");
            return result;
        }

    if (!utils.matchPassword(password)) {
        result.push("Senha válida deve ser informada, de 6 a 20 caracteres (letras e números).");
        return result;
    }

    if (!bcrypt.compareSync(passwordConfirm, bcrypt.hashSync(password, bcrypt.genSaltSync()))) {
        result.push("Confirmação de senha deve corresponder à senha informada.");
        return result;
    }

    try {
        let profile = await profileRepository.getByCpf(cpf);

        if (profile) {
            result.push("Já existe um cadastro para o CPF informado.");
            return result;
        }
    } catch (err) {
        result.push("Não foi possível verificar o CPF informado neste momento. Tente novamente.");
        return result;
    }

    if (cro != "") {
        try {
            let profile = await profileRepository.getByCro(cro);

            if (profile) {
                result.push("Já existe um cadastro para o CRO informado.");
                return result;
            }
        } catch (error) {
            result.push("Não foi possível verificar o CRO informado neste momento. Tente novamente.");
            return result;
        }
    }

    return result;
}