module.exports = {
  ffmpeg: process.platform === 'win32' ? 'C:\\ProgramData\\chocolatey\\lib\\ffmpeg\\tools\\ffmpeg\\bin\\ffmpeg.exe' : 'ffmpeg',
  ffmprobe: process.platform === 'win32' ? 'C:\\ProgramData\\chocolatey\\lib\\ffmpeg\\tools\\ffmpeg\\bin\\ffprobe.exe' : 'ffprobe',
  soffice: process.platform === 'win32' ? 'C:\\Program Files\\LibreOffice\\program\\soffice.exe' : 'soffice',
  pandoc: 'pandoc',
  magick: process.platform === 'win32' ? 'C:\\Program Files\\ImageMagick-7.1.2-Q16-HDRI\\magick.exe' : 'magick',
  pdftotext: process.platform === 'win32' ? 'C:\\Program Files\\xpdf-tools-win-4.05\\bin64\\pdftotext.exe' : 'pdftotext',
  ebookConvert: process.platform === 'win32' ? 'C:\\Program Files\\Calibre2\\ebook-convert.exe' : 'ebook-convert'
};
