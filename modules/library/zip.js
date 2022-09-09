const archiver = require('archiver');
const fs = require("fs")

class ZIP  {

    /**
     * @param {String} sourceDir: /some/folder/to/compress
     * @param {String} outPath: /path/to/created.zip
     * @returns {Promise}
     */
     static zipDirectory(sourceDir, outPath) {

        console.log("zipDirectory")
      const archive = archiver('zip', { zlib: { level: 9 }});
      
      const stream = fs.createWriteStream(outPath);

    
      return new Promise((resolve, reject) => {
        archive
          .directory(sourceDir, false)
          .on('error', err => { console.log(err); reject(err)})
          .pipe(stream)
        ;
    
        stream.on('close', () => { console.log("zip done"); resolve(outPath)});
        archive.finalize();
      });
    }
}

module.exports = ZIP