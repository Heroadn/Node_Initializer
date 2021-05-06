//const queries = require('./queries')
const bcrypt = require('bcrypt-nodejs')

module.exports = app => {
    const { existsOrError, notExistsOrError, equalsOrError } = app.api.validation

    const save = async(req, res) => {
        //Recebe o usuario da requisição, e o rest operator pegua os argumentos e adiciona ao objeto usuario
        var agendamentos = { ...req.body };
        //Recebendo o id do agendamento
        if(req.params.id)  agendamentos.id = req.params.id

        //Recebendo o id do usuario
        if(req.user.id) agendamentos.usuarios_id = req.user.id;

        try {
            //now = new Date().toLocaleString();
            existsOrError(agendamentos.data_registro,    'Nome não informado')
            existsOrError(agendamentos.data_agendamento, 'E-mail não informado')
            existsOrError(agendamentos.status,      'Senha não informada')
            existsOrError(agendamentos.motivo,      'Confirmação de Senha inválida')
            existsOrError(agendamentos.clientes_id, 'Cliente não informado')

            //Verificando se o cliente pertecence ao usuario
            app.db('clientes').where('id', agendamentos.usuarios_id).select()
            .then(clientes => {
                //equalsOrError(clientes.usuarios_id,agendamentos.usuarios_id, "Cliente não pertence ao Usuario");
            })
        } catch(msg) {
            return res.status(400).send(msg)
        }

        if(agendamentos.id){
            app.db('agendamentos')
                .update(agendamentos)
                .where({id:agendamentos.id})
                .then(_ => res.status(204).send())
                .catch(err => res.status(500).send(err))
        }else{
            app.db('agendamentos')
                .insert(agendamentos)
                .then(_ => res.status(204).send())
                .catch(err => res.status(500).send(err))
        }
    }

    const limit = 10 // usado para paginação
    const get = async(req, res) => {
        //console.log(req.user.id);
        const page = req.query.page || 1;

        const result = await app.db('agendamentos').count('id as count').first()
        const count = parseInt(result.count);

        app.db('agendamentos')
            .select('data_registro','data_agendamento','status','motivo','clientes_id','usuarios_id')
            .limit(limit).offset(page * limit - limit)
            .then(agendamentos => res.json({ Agendamentos: agendamentos, count, limit }))
            .catch(err => res.status(500).send(err))
    }

    const getById = (req, res) => {
        app.db('agendamentos')
            .where({id: req.params.id})
            .first()
            .then(agendamentos =>{
                agendamentos.content = content.toString();
                return res.json(agendamentos);
            })
            .catch(err => res.status(500).send(err))
    }

    const remove = async (req, res) => {
        try{
            const rowsDeleted = await app.db('agendamentos')
                .where({id:req.params.id}).del()

                try {
                    existsOrError(rowsDeleted, 'Agendamento não encontrado.')
                } catch(msg) {
                    return res.status(400).send(msg)    
                }

                res.status(204).send()
        }catch(msg) {
            res.status(500).send(msg)
        }
    }

//Retorna os metodos
return { save, remove, get, getById}
}