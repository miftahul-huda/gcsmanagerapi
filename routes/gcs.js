var formidable = require('express-formidable')
var express = require('express');
var Utils = require("../modules/library/utils")
const nodepath = require('path');
const { fn } = require('sequelize');


class GCSRouter {

    static getRouter(logic)
    {
        var express = require('express');
        var router = express.Router();
        const path = require('path');
        router.logic = logic;
        let me = this;

        //Upload file /api/v2/upload?path={pathtoupload}&target={targetfilename}
        router.post('/upload' , formidable({
            uploadDir: '/tmp'
        }),  (req, res)=>{
            //Get path parameter
            let path = req.query.path;
            let targetFilename = req.query.target;
            let targetProject = req.query.project;

            //console.log("target Project")
            //console.log(targetProject)



            //If path parameter is not provided, return false
            if(path == null || path.length == 0)
            {
                res.send({ success: false, error: { code: 'app.700', message: "Path query parameter is not provided"  } })
            }
            else 
            {
                //Else upload file to GCS
                logic.uploadFile(req, path, targetFilename, targetProject).then((response)=>{
                    res.send({ success: true, payload: response})
                }).catch((err)=>{
                    res.send({ success: false, error: err })
                })
            }
        });

        //Download file /api/v2/upload?path={pathtoupload}&target={targetfilename}
        router.get('/download',  (req, res)=>{
            //Get path parameter
            let path = req.query.path;
            let targetFilename = req.query.target;
            let targetProject = req.query.project;


            //If path parameter is not provided, return false
            if(path == null || path.length == 0)
            {
                res.send({ success: false, error: { code: 'app.700', message: "Path query parameter is not provided"  } })
            }
            else 
            {
                if(path.substr(path.length - 1, 1) == '/')
                {
                    path = path.substr(0, path.length - 1);
                }


                if(targetFilename == null || targetFilename.length == 0)
                {
                    let fname = path.split('/');
                    if(fname.length > 0)
                    {
                        fname = fname[fname.length - 1];
                        targetFilename = fname;
                    }
                    else
                    {
                        let ext = nodepath.extname(path);
                        targetFilename = Utils.randomString(10) + "." + ext;
                    }
                }

                console.log("/download")
                //Else upload file to GCS
                logic.downloadFile(path, targetFilename, targetProject).then((payload)=>{
                    res.download(payload)
                }).catch((err)=>{
                    console.log(err)
                    res.send({ success: false, error: err })
                })
            }
        });


        //Download file /api/v2/folder/zip-download?path={pathtoupload}&target={targetfilename}
        router.get('/folder/zip-download',  (req, res)=>{
            //Get path parameter
            let path = req.query.path;
            let targetFilename = req.query.target;
            let targetProject = req.query.project;

            if(targetFilename == null || targetFilename.length == 0)
            {
                targetFilename = Utils.randomString(10) + ".zip";
            }


            //If path parameter is not provided, return false
            if(path == null || path.length == 0)
            {
                res.send({ success: false, error: { code: 'app.700', message: "Path query parameter is not provided"  } })
            }
            else 
            {

                if(path.substr(path.length - 1, 1) != '/')
                {
                    path = path + '/'
                }

                //Else upload file to GCS
                logic.zipAndDownload(path, targetFilename, targetProject).then((payload)=>{
                    console.log('response')
                    console.log(payload)
                    res.download(payload)
                }).catch((err)=>{
                    console.log("errrror")
                    console.log(err)
                    res.send({ success: false, error: err })
                })
            }
        });

        //Download file /api/v2/folder/zip?path={pathtoupload}&target={targetfilename}
        router.get('/folder/zip',  (req, res)=>{
            //Get path parameter
            let path = req.query.path;
            let targetFilename = req.query.target;
            let targetProject = req.query.project;

            if(targetFilename == null || targetFilename.length == 0)
            {
                targetFilename = Utils.randomString(10) + ".zip";
            }


            //If path parameter is not provided, return false
            if(path == null || path.length == 0)
            {
                res.send({ success: false, error: { code: 'app.700', message: "Path query parameter is not provided"  } })
            }
            else if(targetFilename == null || targetFilename.length == 0)
            {
                res.send({ success: false, error: { code: 'app.710', message: "Target query parameter is not provided"  } })
            }
            else 
            {


                if(path.substr(path.length - 1, 1) != '/')
                {
                    path = path + '/'
                }

                //Else upload file to GCS
                logic.zipGcsFolder(path, targetFilename, targetProject).then((payload)=>{
                    console.log('response')
                    console.log(payload)
                    res.send({ success:true, payload: payload})
                }).catch((err)=>{
                    res.send({ success: false, error: err })
                })
            }
        });


        //Get list of files in folder /api/v2/files?path={pathtolist}
        router.get('/files',  (req, res)=>{
            //Get path parameter
            let path = req.query.path;

            //If path parameter is not provided, return false
            if(path == null || path.length == 0)
            {
                res.send({ success: false, error: { code: 'app.700', message: "Path query parameter is not provided"  } })
            }
            else 
            {

                //Else upload file to GCS
                logic.listFiles(path).then((payload)=>{
                    console.log('response')
                    console.log(payload)
                    res.send({ success: true, payload: payload })
                }).catch((err)=>{
                    console.log(err)
                    res.send({ success: false, error: err })
                })
            }
        });


        //Create new file in folder /api/v2/create?path={path}
        router.post('/create', express.json({type: '*/*', limit: '300mb'}), (req, res)=>{
            //Get path parameter
            let path = req.query.path;
            let content = req.body.content;

            console.log(content)

            //If path parameter is not provided, return false
            if(path == null || path.length == 0)
            {
                res.send({ success: false, error: { code: 'app.700', message: "Path query parameter is not provided"  } })
            }
            else if(content == null || content.length == 0)
            {
                res.send({ success: false, error: { code: 'app.703', message: "content parameter is not provided. Content should be base64encoded"  } })
            }
            else 
            {

                //Else upload file to GCS
                logic.createNewFile(path, content).then((payload)=>{
                    console.log('response')
                    console.log(payload)
                    res.send({ success: true, payload: payload })
                }).catch((err)=>{
                    console.log(err)
                    res.send({ success: false, error: err })
                })
            }
        });

        //Create new file in folder /api/v2/copy?path={path}
        router.get('/copy', (req, res)=>{
            //Get path parameter
            let sourePath = req.query.path;
            let targetPath = req.query.target;

            //If path parameter is not provided, return false
            if(sourePath == null || sourePath.length == 0)
            {
                res.send({ success: false, error: { code: 'app.700', message: "Path query parameter is not provided"  } })
            }
            else if(targetPath == null || targetPath.length == 0)
            {
                res.send({ success: false, error: { code: 'app.701', message: "Target query parameter is not provided"  } })
            }
            else 
            {

                //Else upload file to GCS
                logic.copy(sourePath, targetPath).then((payload)=>{
                    console.log('response')
                    console.log(payload)
                    res.send({ success: true, payload: payload })
                }).catch((err)=>{
                    console.log(err)
                    res.send({ success: false, error: err })
                })
            }
        });

        //Create new file in folder /api/v2/rename?path={path}
        router.get('/rename', (req, res)=>{
            //Get path parameter
            let sourePath = req.query.path;
            let targetPath = req.query.target;

            //If path parameter is not provided, return false
            if(sourePath == null || sourePath.length == 0)
            {
                res.send({ success: false, error: { code: 'app.700', message: "Path query parameter is not provided"  } })
            }
            else if(targetPath == null || targetPath.length == 0)
            {
                res.send({ success: false, error: { code: 'app.701', message: "Target query parameter is not provided"  } })
            }
            else 
            {

                //Else upload file to GCS
                logic.rename(sourePath, targetPath).then((payload)=>{
                    console.log('response')
                    console.log(payload)
                    res.send({ success: true, payload: payload })
                }).catch((err)=>{
                    console.log(err)
                    res.send({ success: false, error: err })
                })
            }
        });

        //Create new file in folder /api/v2/rename?path={path}
        router.get('/delete', (req, res)=>{
            //Get path parameter
            let path = req.query.path;

            //If path parameter is not provided, return false
            if(path == null || path.length == 0)
            {
                res.send({ success: false, error: { code: 'app.700', message: "Path query parameter is not provided"  } })
            }
            else 
            {

                //Else upload file to GCS
                logic.delete(path).then((payload)=>{
                    console.log('response')
                    console.log(payload)
                    res.send({ success: true, payload: payload })
                }).catch((err)=>{
                    console.log(err)
                    res.send({ success: false, error: err })
                })
            }
        });



        return router;
    }


}

module.exports = GCSRouter;