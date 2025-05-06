import { v2 as cloudinary } from 'cloudinary';
import formidable from 'formidable';
import fs from 'fs';

cloudinary.config({
  cloud_name: 'dmdn0pqoe',
  api_key: '431243152312472',
  api_secret: 'SikYTo7nplUZaVqvHlE8CLC_jbA'
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const form = formidable();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Erro no parse do form:', err);
      return res.status(500).json({ error: 'Erro ao processar o formulário' });
    }

    const file = files.file[0]; // Formidable v3 retorna um array

    try {
      const result = await cloudinary.uploader.upload(file.filepath);
      return res.status(200).json({
        url: result.secure_url,
        filename: file.originalFilename,
      });
    } catch (uploadErr) {
      console.error('Erro ao fazer upload:', uploadErr);
      return res.status(500).json({ error: 'Erro ao enviar para o Cloudinary' });
    }
  });
}

