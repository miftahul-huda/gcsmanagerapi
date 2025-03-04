const { Sequelize, Model, DataTypes } = require('sequelize');
const { Op } = require("sequelize");
var path = require('path');
const GCS = require("../library/gcs");
const fs = require("fs")
const Utils = require("../library/utils")
const ZIP = require("../library/zip");
const { base64encode, base64decode } = require('nodejs-base64');



class GCSLogic  {

    //Public Function : uploadFile
    static uploadFile(req, targetPath, targetFilename, targetProject )
    {
        //console.log("uploadfile")
        let promise = new Promise((resolve, reject)=>{

            //Get keys from the req.files
            let keys = Object.keys(req.files)
            
            //Iterate each files
            keys.map((key)=>{


                //Get filenames informations
                let filenameInfo = GCSLogic.getFilenames(req, key, targetPath, targetFilename)

                //Get configuration from database
                GCSLogic.getConfiguration().then((config)=>{

                    //Check if extension is allowed
                    let allowedExtensions = config.ALLOWED_EXTENSIONS;
                    allowedExtensions = allowedExtensions.toLowerCase();
                    allowedExtensions = allowedExtensions.split(",")

                    let additionalExts = [];
                    for(let i = 0; i < allowedExtensions.length; i++)
                    {
                        let tmp = allowedExtensions[i].split(";")
                        additionalExts = additionalExts.concat(tmp)
                    }

                    allowedExtensions = allowedExtensions.concat(additionalExts)

                    //console.log("allowedExtensions")
                    //console.log(allowedExtensions)
                    //console.log(allowedExtensions)
                    //if extension is allowed
                    if(allowedExtensions.includes(filenameInfo.ext))
                    {

                        let targetProjectInfo = null;
                        if(targetProject != null)
                        {
                            targetProjectInfo = {};
                            targetProjectInfo.projectId = targetProject;
                            const decodedString = Buffer.from(process.env.GCS_PROJECT_CREDENTIAL, 'base64').toString('utf-8');
                            targetProjectInfo.credential = JSON.parse(decodedString);
                        }

                        //console.log("targetProjectInfo")
                        //console.log(targetProjectInfo)

                        GCS.upload(filenameInfo.bucket, filenameInfo.temporaryFile, filenameInfo.outputFilename, targetProjectInfo ).then((response)=>{
                            resolve(response)
                        }).catch((e)=>{
                            console.log("error")
                            console.log(e)
                            reject({code: 'app.702', source:"GCSLogic.uploadFile", message: "Upload failed", error: e, data: filenameInfo});
                        })
                    }
                    else
                    {
                        reject({code: 'app.701', source:"GCSLogic.uploadFile", message: "Extension " +  filenameInfo.ext + " is not allowed"})
                    }

                }).catch((e)=>{
                    reject(e)
                })
            })

        });

        return promise;
    }

    //Public Function : downloadFile
    static downloadFile(downloadPath, targetFilename )
    {
        let promise = new Promise((resolve, reject)=>{
            
            
            //Get bucket from downloadPath
            let bucket = downloadPath.split("/")
            bucket = bucket[1]

            //Get path to file to download without bucket name 
            downloadPath = downloadPath.replace("/" + bucket + "/", "")

            //Get output filename in  temporary file
            let outputFilename = targetFilename
            if( outputFilename != null && outputFilename.length > 0)
            {
                outputFilename = path.basename(outputFilename)
            }
            else
            {
                outputFilename = path.basename(downloadPath)
            }


            let tmpFolder = "/tmp/";
            outputFilename = tmpFolder + "/" + outputFilename
            
            GCS.downloadFile(bucket, downloadPath, outputFilename ).then((outfile)=>{
                resolve(outfile)
            }).catch((e)=>{
                reject({code: 'app.702', source:"GCSLogic.downloadFile", message: "Download failed", error: e})
            })
        })
        return promise;
    }


    //Public Function: To zip folder and download the zip file
    static zipAndDownload(gcsPath, targetFilename )
    {
        let promise = new Promise((resolve, reject)=>{
            
            
            let fileInfo = GCSLogic.getFileInfos(gcsPath, targetFilename)
            //console.log("zipAndDownload")
            //console.log(fileInfo)

            let tmpFolder = "/tmp/zip_" + Utils.randomString(10);
            fs.mkdirSync(tmpFolder)

            //Download files to local folder
            GCSLogic.downloadFiles(gcsPath, tmpFolder).then((downloadedFiles)=>{

                //Zip  the local folder
                GCSLogic.zipFiles(tmpFolder, fileInfo.outputFilename).then((zipFilepath)=>{

                    //Delete folder after zip
                    fs.rmSync(tmpFolder, { recursive: true, force: true });

                    //Return the zip file
                    resolve(zipFilepath)

                }).catch((e)=>{
                    reject(e)
                })
            }).catch((e)=>{
                reject(e)
            })

        })
        return promise;
    }

    //Public Function: To zip folder and download the zip file
    static zipGcsFolder(gcsPath, targetFilename )
    {
        let promise = new Promise((resolve, reject)=>{
            
            let fileInfo = GCSLogic.getFileInfos(gcsPath, targetFilename)
            let tmpFolder = "/tmp/zip_" + Utils.randomString(10);
            fs.mkdirSync(tmpFolder)

            //Download files to local folder
            GCSLogic.downloadFiles(gcsPath, tmpFolder).then((downloadedFiles)=>{

                //Zip  the local folder
                GCSLogic.zipFiles(tmpFolder, fileInfo.outputFilename).then((zipFilepath)=>{

                    //Delete folder after zip
                    fs.rmSync(tmpFolder, { recursive: true, force: true });

                    GCS.upload(fileInfo.bucket, zipFilepath, fileInfo.outputFilePath ).then((response)=>{
                        resolve(fileInfo.outputFilePath)
                    }).catch((e)=>{
                        reject({code: 'app.702', source:"GCSLogic.uploadFile", message: "Upload failed", error: e});
                    })
                    
                }).catch((e)=>{
                    reject(e)
                })
            }).catch((e)=>{
                reject(e)
            })

        })
        return promise;
    }

    //Public function: createNewFile, to create new file by content.
    static createNewFile(gcsPath, content)
    {
        let promise  = new Promise((resolve, reject)=>{
            content = base64decode(content)
            let ext = path.extname(gcsPath);
            let tmpFile = "/tmp/" + Utils.randomString(10) + "." + ext;
            fs.writeFileSync(tmpFile, content)

            let bucket = gcsPath.split("/")
            bucket = bucket[1]

            gcsPath = gcsPath.replace("/" + bucket + "/", "")

            GCS.upload(bucket, tmpFile, gcsPath).then((response)=>{
                fs.unlinkSync(tmpFile)
                resolve(gcsPath)
            }).catch((e)=>{
                resolve({ code: '708', source:"GCSLogic.createNewFile", error:e, message: "create new file failed" })
            })
        })

        return promise;
    }

    //Public function: copy, to copy file.
    static copy(sourcePath, destPath)
    {
        let promise  = new Promise((resolve, reject)=>{

            GCS.copy(sourcePath, destPath).then((response)=>{
                resolve(true)
            }).catch((e)=>{
                resolve({ code: '704', source:"GCSLogic.copy", error:e, message: "copy file failed" })
            })
        })

        return promise;
    }

    //Public function: rename, to rename file.
    static rename(sourcePath, destPath)
    {
        let promise  = new Promise((resolve, reject)=>{

            GCS.rename(sourcePath, destPath).then((response)=>{
                resolve(true)
            }).catch((e)=>{
                resolve({ code: '704', source:"GCSLogic.rename", error:e, message: "rename file failed" })
            })
        })

        return promise;
    }

    //Public function: rename, to rename file.
    static delete(gcsPath)
    {
        let promise  = new Promise((resolve, reject)=>{

            GCS.delete(gcsPath).then((response)=>{
                resolve(true)
            }).catch((e)=>{
                resolve({ code: '705', source:"GCSLogic.delete", error:e, message: "delete file failed" })
            })
        })

        return promise;
    }

    static listFiles(gcsPath)
    {
        let promise = new Promise((resolve, reject)=>{
            GCS.listFiles(gcsPath).then((files)=>{
                resolve(files)
            }).catch(e=> reject(e))
        });

        return promise;
    }

    static downloadFiles(gcsPath, downloadPath)
    {
        let promise = new Promise((resolve, reject)=>{

            let bucket = gcsPath.split("/")
            bucket = bucket[1]
            GCS.listFiles(gcsPath).then((files)=>{

                //console.log(files)

                GCSLogic.totalFiles = files.length;
                GCSLogic.counter = 0;
                let downloadedFiles = []
    
                files.map((file)=>{
                    let fname = path.basename(file.name)
                    let downloadedFilePath = downloadPath + "/" + fname;
                    GCS.downloadFile(bucket, file.name, downloadedFilePath ).then((outfile)=>{
                        GCSLogic.counter++;
                        downloadedFiles.push(downloadedFilePath)

                        if(GCSLogic.counter >= GCSLogic.totalFiles)
                        {
                           resolve(downloadedFiles)
                        }
                    }).catch((e)=>{
                        reject({ code: '705', source: 'GCSLogic.zipAndDownload', error: e, message: "Download file " + file.name + " failed" })
                    })
                })
    
            })
        })

        return promise;
    }

    static zipFiles(folderToZip, outputFilename)
    {
        let promise = new Promise((resolve, reject)=>{
            ZIP.zipDirectory(folderToZip, outputFilename).then((result)=>{

                //console.log("zipFiles")
                //console.log(result)
                resolve(result)
    
            }).catch((e)=>{
                console.log("zip error")
                console.log(e)
                reject(e)  
            })
        })

        return promise;
    }


    static getFileInfos(downloadPath, targetFilename)
    {
        //Get bucket from downloadPath
        let bucket = downloadPath.split("/")
        bucket = bucket[1]

        //Get path to file to download without bucket name 
        //downloadPath = downloadPath.replace("/" + bucket + "/", "")

        //Get output filename , if provided use the provided name, else use the last path name
        let outputFilename = targetFilename
        if( outputFilename != null && outputFilename.length > 0)
        {
            outputFilename = path.basename(outputFilename)
        }
        else
        {
            //let dpath = downloadPath.split("/")
            outputFilename = Utils.randomString(10) + ".zip";
        }

        let outputFilePath = targetFilename.replace("/" + bucket + "/", "")
        let ext = path.extname(downloadPath)

        return { bucket: bucket, outputFilename: outputFilename, outputFilePath: outputFilePath, ext: ext }
    }

    static getFilenames(req, key, targetPath, targetFilename)
    {
        if(targetPath.substr(0, 1) == "/")
            targetPath = targetPath.substr(1, targetPath.length - 1)

        if(targetPath.substr(targetPath.length - 1, 1) == "/")
            targetPath = targetPath.substr(0, targetPath.length - 1)


        //Get bucket from targetPath
        let bucket = targetPath.split("/")
        
        bucket = bucket[0]


        //Get uploaded filename and its extension
        let originalFilename = req.files[key].name;
        let ext = path.extname(originalFilename).toLowerCase();
        ext = ext.replace(".", "")

        //Get the uploaded temporary filename
        let inputFile = req.files[key].path;

        //Get the output filename, use targetfilename if it exists
        let outputFilename = originalFilename;
        if(targetFilename != null && targetFilename.length > 0)
            outputFilename = targetFilename;

        //set path  of the output filename
        let gcsFolder = targetPath.replace( bucket, "");         
        outputFilename = gcsFolder + '/' + outputFilename;


        return { originalFilename: originalFilename, temporaryFile: inputFile, ext: ext, bucket: bucket, outputFilename: outputFilename }
    }

    //Get configuration from database
    static async getConfiguration()
    {
        let promise = new Promise((resolve, reject)=>{
            let model  = require("../models/configurationmodel")
            model.findAll().then((configs)=>{
                if(configs.length > 0)
                {
                    let config = configs[0]
                    resolve(config)
                }
                else 
                {
                    reject({code: 'app.100', source:"GCSLogic.getConfiguration", message: "No configuration"})
                }
               
            }).catch((e)=>{
                reject({code: 'sys.000', source:"GCSLogic.getConfiguration", message: "Unknown error", error: e})
            })
        })

        return promise;
    }


}

module.exports = GCSLogic;