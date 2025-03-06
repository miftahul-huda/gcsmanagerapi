const {Storage} = require('@google-cloud/storage');
var path = require('path');

class GCS  {

    //Upload file to Google cloud storage
    static upload(inputFile, targetFilename, targetProjectInfo)
    {
        let promise = new Promise((resolve, reject)=>{

            console.log("Targetfielname")
            console.log(targetFilename)
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


            if(targetFilename.substr(targetFilename.length - 1, 1) == "/")
            {
                targetFilename = targetFilename.substr(0, targetFilename.length - 1)
                targetFilename = targetFilename + "/" + path.basename(inputFile)
            }

            let fileInfo = GCS.parseInfo(targetFilename)

            console.log("fileinfo 2")
            console.log(fileInfo)
            let bucketName = fileInfo.bucket
            targetFilename = fileInfo.filePath


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

    static downloadFile(filePath, outputFilename, targetProjectInfo)
    {
        //console.log("downloadFile")
        //console.log(bucketName + ", " + filePath + ", " + outputFilename)
        let promise = new Promise((resolve, reject)=>{

            let fileInfo = GCS.parseInfo(filePath)
            let bucketName = fileInfo.bucket

            let storage = null;
            if(targetProjectInfo == null)
                storage = new Storage();
            else 
            {
                const credential = targetProjectInfo.credential;
                const projectId = targetProjectInfo.projectId;
                storage = new Storage({ projectId: projectId, credentials: credential })
            }

            

            const options = {
                destination: outputFilename,
            };

            console.log("===bucketname===")
            console.log(bucketName)
            console.log("===filepath===")
            console.log(fileInfo.filePath)
            console.log("===outputFilename===")
            console.log(outputFilename)

            storage.bucket(bucketName).file(fileInfo.filePath).download(options).then((response)=>{
                console.log("response")
                console.log(response)
                
                resolve(outputFilename)

            }).catch((e)=>{
                console.log("error storage.bucket.download")
                console.log(e)
                reject(e)
            });
        })

        return promise;
    }

    static listFiles(gcsPath, targetProjectInfo)
    {
        let promise = new Promise((resolve, reject)=>{

            let fileInfo = GCS.parseInfo(gcsPath)
            let bucketName = fileInfo.bucket
            let ppath = fileInfo.filePath

            if(ppath.substr(ppath.length - 1, 1) != "/")
                ppath = ppath + "/"


            console.log("bucketName")
            console.log(bucketName)
            console.log("ppath")
            console.log(ppath)


            // Creates a clients
            
            let storage = null;
            if(targetProjectInfo == null)
                storage = new Storage();
            else 
            {
                const credential = targetProjectInfo.credential;
                const projectId = targetProjectInfo.projectId;
                storage = new Storage({ projectId: projectId, credentials: credential })
            }

            const options = {
                prefix: ppath,
            };


            storage.bucket(bucketName).getFiles(options).then(([files])=>{
                let newFiles = []

                files.map((file)=>{
                    let fname = file.name;
                    if(fname.substr(fname.length - 1, 1) != "/")
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

    static copy(sourcePath, targetPath, targetProjectInfo)
    {
        let promise = new Promise((resolve, reject)=>{
            
            let storage = null;
            if(targetProjectInfo == null)
                storage = new Storage();
            else 
            {
                const credential = targetProjectInfo.credential;
                const projectId = targetProjectInfo.projectId;
                storage = new Storage({ projectId: projectId, credentials: credential })
            }

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

    static delete(gcsPath, targetProjectInfo)
    {
        let promise = new Promise((resolve, reject)=>{

            let storage = null;
            if(targetProjectInfo == null)
                storage = new Storage();
            else 
            {
                const credential = targetProjectInfo.credential;
                const projectId = targetProjectInfo.projectId;
                storage = new Storage({ projectId: projectId, credentials: credential })
            }

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


    static rename(sourcePath, targetPath, targetProjectInfo)
    {
        let promise = new Promise((resolve, reject)=>{

            let storage = null;
            if(targetProjectInfo == null)
                storage = new Storage();
            else 
            {
                const credential = targetProjectInfo.credential;
                const projectId = targetProjectInfo.projectId;
                storage = new Storage({ projectId: projectId, credentials: credential })
            }

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
        if(gcsPath.substr(0, 1) == "/")
            gcsPath = gcsPath.substr(1, gcsPath.length - 1)

        if(gcsPath.substr(gcsPath.length - 1, 1) == "/")
        {
            gcsPath = gcsPath.substr(0, gcsPath.length - 1)
        }


        let bucket = gcsPath.split("/")
        bucket = bucket[0]

        let filename = path.basename(gcsPath)
        let filePath = gcsPath.replace( bucket + "/" , "")

        return { bucket: bucket, filePath: filePath, filename: filename }
    }
}

module.exports = GCS;