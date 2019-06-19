'use strict'

const moment = require('moment')
const crypto = require('crypto')
const User = use('App/Models/User')
const Mail = use('Mail')

class ForgotPasswordController {
  async store ({ request, response }) {
    try {
      const email = request.input('email')
      const user = await User.findByOrFail('email', email)

      user.token = crypto.randomBytes(10).toString('hex')
      // recebe a data de hoje
      user.token_created_at = new Date()

      await user.save()

      await Mail.send(
        ['emails.forgot_password'],
        {
          email,
          token: user.token,
          link: `${request.input('redirect_url')}?token=${user.token}`
        },
        // recebe o objeto de email
        message => {
          message
            .to(user.email)
            .from('lucasviga12@gmail.com', 'Lucas Viga')
            .subject('Recuperaão de senha')
        }
      )
    } catch (err) {
      return response
        .status(err.status)
        .send({ error: { message: 'Algo não deu certo, esse email existe?' } })
    }
  }

  async update ({ request, response }) {
    try {
      // pega o token e o passoword da requisicao
      const { token, password } = request.all()

      const user = await User.findByOrFail('token', token)

      const tokenExpired = moment()
        .subtract('2', 'days')
        .isAfter(user.token_created_at)

      // retorna um true/false
      if (tokenExpired) {
        // if true
        return response
          .status(401)
          .send({ error: { message: 'o token de recuperação expirou' } })
      }

      user.token = null
      user.token_created_at = null
      user.password = password

      await user.save()
    } catch (err) {
      return response
        .status(err.status)
        .send({
          error: { message: 'Algo não deu errado ao resetar sua senha' }
        })
    }
  }
}

module.exports = ForgotPasswordController
