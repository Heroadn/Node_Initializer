const { authSecret } = require('../.env')
const jwt = require('jwt-simple')
const bcrypt = require('bcrypt-nodejs')

module.exports = app => 
{

    /*  Metodo responsavel por login onde é retornado e definido 
    *   um token de usuario
    */
    const signin = async (req, res) => {
        //Caso não for informado o email e senha
        if (!req.body.email || !req.body.senha) {
            return res.status(400).send('Informe usuário e senha!')
        }

        const usuarios = await app.db('usuarios')
            .where({ email: req.body.email })
            .first()

        //Verifica se o email fornecido pelo usuario se identifica com o usuario cadastrado
        if(!usuarios) return res.status(400).send('Usuário não encontrado!')

        //Verifica se a senha fornecido pelo usuario se identifica com o usuario cadastrado
        const isMatch = bcrypt.compareSync(req.body.senha, usuarios.senha)
        if (!isMatch) return res.status(401).send('Email/Senha inválidos!')

        //Tempo atual
        const now = Math.floor(Date.now() / 1000)

        //Definindo payload do JWT
        const payload = {
            id: usuarios.id,
            nome: usuarios.nome,
            email: usuarios.email,//admin: user.admin,
            iat: now,
            exp: now + (60 * 60 * 24 * 3)
        }

        //Rest operator pegua os argumentos e adiciona, apos ele gera um token JWT
        res.json({
            ...payload,
            token: jwt.encode(payload, authSecret)
        })
    }

    //Ele valida a consistencia do token JWT
    const validateToken = async (req, res) => {
        const userData = req.body || null
        try {
            if(userData) {
                const token = jwt.decode(userData.token, authSecret)
                if(new Date(token.exp * 1000) > new Date()) {
                    return res.send(true)
                }
            }
        } catch(e) {
            // problema com o token
        }

        res.send(false)
    }

    return { signin, validateToken }
}