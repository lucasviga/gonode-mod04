'use strict'

const File = use('App/Models/File')
const Helpers = use('Helpers')

class FileController {
  async store ({ request, response }) {
    try {
      // se existir um arquivo na requisicao
      if (!request.file('file')) return

      // 2mb e o tamanho limite
      const upload = request.file('file', { size: '2mb' })

      const fileName = `${Date.now()}.${upload.subtype}`

      await upload.move(Helpers.tmPath('uploads'))
    } catch (err) {}
  }
}

module.exports = FileController
