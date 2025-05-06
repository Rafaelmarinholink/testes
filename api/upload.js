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
    bodyParser: false
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: 'Erro ao fazer upload' });

    const file = files.file;
    const path = file.filepath;

    try {
      const result = await cloudinary.uploader.upload(path, {
        folder: 'saber-capital'
      });

      res.status(200).json({
        url: result.secure_url,
        filename: result.original_filename
      });
    } catch (error) {
      res.status(500).json({ error: 'Falha ao enviar ao Cloudinary' });
    }
  });
}
