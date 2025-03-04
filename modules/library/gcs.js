const {Storage} = require('@google-cloud/storage');
var path = require('path');

class GCS  {

    //Upload file to Google cloud storage
    static upload(bucketName, inputFile, targetFilename, targetProjectInfo)
    {
        let promise = new Promise((resolve, reject)=>{
            //Create storage client
            let storage = null;


            if(targetProjectInfo == null)
                storage = new Storage();
            else 
            {

                const credential = targetProjectInfo.credential;
                const projectId = targetProjectInfo.projectId;
                storage = new Storage({ projectId: projectId, credentials: credential })

            }


            if(targetFilename.substr(0, 1) == "/")
                targetFilename = targetFilename.substr(1);

            //console.log("targetFilename")
            //console.log(targetFilename)

            //Create options
            let options = 
            {
                // Support for HTTP requests made with `Accept-Encoding: gzip`
                gzip: false,
                destination: targetFilename,
                // By setting the option `destination`, you can change the name of the
                // object you are uploading to a bucket.
                metadata: {
                  // Enable long-lived HTTP caching headers
                  // Use only if the contents of the file will never change
                  // (If the contents will change, use cacheControl: 'no-cache')
                  //cacheControl: 'public, max-age=31536000',
                  cacheControl: 'no-cache',
                },
            }


            //Upload 
            storage.bucket(bucketName).upload(inputFile, options).then((response)=>{
                resolve("gs://" + bucketName + "/" + targetFilename)   
            }).catch((e)=>{
                console.log("error")
                console.log(e)
                reject(e)
            });
        })

        return promise;

    }

    static downloadFile(bucketName, filePath, outputFilename)
    {
        //console.log("downloadFile")
        //console.log(bucketName + ", " + filePath + ", " + outputFilename)
        let promise = new Promise((resolve, reject)=>{

            // Creates a client
            const storage = new Storage();

            const options = {
                destination: outputFilename,
            };

            storage.bucket(bucketName).file(filePath).download(options).then((response)=>{
                resolve(outputFilename)
            }).catch((e)=>{
                console.log("error")
                console.log(e)
                reject(e)
            });
        })

        return promise;
    }

    static listFiles(gcsPath)
    {
        let promise = new Promise((resolve, reject)=>{

            let ff = gcsPath.split("/")
            let bucketName = ff[1]
            let ppath = gcsPath.replace("/" + bucketName + "/", "")

            // Creates a clients
            const storage = new Storage();
            const options = {
                prefix: ppath,
            };


            storage.bucket(bucketName).getFiles(options).then(([files])=>{
                let newFiles = []
                files.map((file)=>{
                    newFiles.push({ name: bucketName + "/" + file.name, size: file.metadata.size, contentType: file.metadata.contentType })
                })
                resolve(newFiles)
            }).catch((e)=>{
                console.log("error")
                console.log(e)
                reject(e)
            });
        })

        return promise;
    }

    static copy(sourcePath, targetPath)
    {
        let promise = new Promise((resolve, reject)=>{

            const storage = new Storage();  
            let info = this.parseInfo(sourcePath)
            const sourceBucket = storage.bucket(info.bucket);
            const sourceFilepath = sourceBucket.file(info.filePath);

            info = this.parseInfo(targetPath)
            const destBucket = storage.bucket(info.bucket);
            const destFilepath = destBucket.file(info.filePath);

            sourceFilepath.copy(destFilepath).then((response)=>{
                resolve()
            }).catch(e=>{
                reject()
            })
        })

        return promise;
    }

    static delete(gcsPath)
    {
        let promise = new Promise((resolve, reject)=>{

            const storage = new Storage();  
            let info = this.parseInfo(gcsPath)
            const sourceBucket = storage.bucket(info.bucket);
            const sourceFilepath = sourceBucket.file(info.filePath);


            sourceFilepath.delete().then((response)=>{
                resolve()
            }).catch(e=>{
                reject()
            })
        })

        return promise;
    }


    static rename(sourcePath, targetPath)
    {
        let promise = new Promise((resolve, reject)=>{

            const storage = new Storage();  
            let info = this.parseInfo(sourcePath)
            const sourceBucket = storage.bucket(info.bucket);
            const sourceFilepath = sourceBucket.file(info.filePath);


            info = this.parseInfo(targetPath)
            const destBucket = storage.bucket(info.bucket);
            const destFilepath = destBucket.file(info.filePath);

            sourceFilepath.rename(destFilepath).then((response)=>{
                resolve()
            }).catch(e=>{
                reject()
            })
        })

        return promise;
    }

    static parseInfo(gcsPath)
    {
        let bucket = gcsPath.split("/")
        bucket = bucket[1]

        let filename = path.basename(gcsPath)
        let filePath = gcsPath.replace("/" + bucket + "/" , "")

        return { bucket: bucket, filePath: filePath, filename: filename }
    }
}

module.exports = GCS;