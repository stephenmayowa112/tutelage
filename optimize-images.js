const imagemin = require('imagemin');
const imageminWebp = require('imagemin-webp');
const imageminPngquant = require('imagemin-pngquant');
const imageminMozjpeg = require('imagemin-mozjpeg');

(async () => {
  console.log('Optimizing images...');
  
  // Optimize JPG/PNG to WebP
  await imagemin(['images/*.{jpg,png}'], {
    destination: 'images/optimized',
    plugins: [
      imageminWebp({
        quality: 80,
        method: 6
      })
    ]
  });
  
  // Optimize JPG files
  await imagemin(['images/*.jpg'], {
    destination: 'images/optimized',
    plugins: [
      imageminMozjpeg({
        quality: 85
      })
    ]
  });
  
  // Optimize PNG files
  await imagemin(['images/*.png'], {
    destination: 'images/optimized',
    plugins: [
      imageminPngquant({
        quality: [0.6, 0.8]
      })
    ]
  });
  
  console.log('Images optimized!');
})();
