class CrudRouter {
    static getRouter(logic)
    {
        var express = require('express');
        var router = express.Router();
        router.logic = logic;
        let me = this;

        router.post('/create', function (req, res){
            me.init(req, res);
            let o = req.body;
            let logic = router.logic;
            logic.session = req.session;
        
            logic.create(o).then(function (savedO)
            {
                res.send(savedO);
            }).catch(function (err){
                console.log("error")
                res.send(err);
            })
        })
        
        router.get('', function (req, res){
            me.init(req, res);
            let logic = router.logic;
            logic.session = req.session;
            console.log(logic);
            logic.findAll().then(function (os)
            {
                res.send(os);
            }).catch(function (err){
                console.log("error")
                console.log(err)
                res.send(err);
            })
        })
        
        router.get('/find/:search', function (req, res){
        
            me.init(req, res);
            let logic = router.logic;
            logic.session = req.session;
            let search = req.params.search;
        
            logic.findByKeyword(search).then(function (os)
            {
                
                res.send(os);
            }).catch(function (err){
                console.log("error")
                console.log(err)
                res.send(err);
            })
        })
        
        router.get('/find/:search/:offset/:limit', function (req, res){
        
            me.init(req, res);
            let logic = router.logic;
            logic.session = req.session;
            let offset = req.params.offset;
            let limit = req.params.limit;
            let search = req.params.search;
        
            logic.findByKeyword(search, offset, limit).then(function (os)
            {
                
                res.send(os);
            }).catch(function (err){
                console.log("error")
                console.log(err)
                res.send(err);
            })
        })

        router.get('/find/:search/:offset/:limit/:sortcol/:sortdir', function (req, res){
        
            me.init(req, res);
            let logic = router.logic;
            logic.session = req.session;
            let offset = req.params.offset;
            let limit = req.params.limit;
            let search = req.params.search;
            let sortCol = req.params.sortcol;
            let sortDir = req.params.sortdir;
        
            logic.findByKeyword(search, offset, limit, [[sortCol, sortDir]]).then(function (os)
            {
                
                res.send(os);
            }).catch(function (err){
                console.log("error")
                console.log(err)
                res.send(err);
            })
        })
        
        

        router.get('/:offset/:limit', function (req, res, next){
        
            me.init(req, res);
            let logic = router.logic;
            logic.session = req.session;
            let offset = req.params.offset;
            let limit = req.params.limit;

            if(isNaN(offset) || isNaN(limit))
                next();
            else
            {
                logic.findAll(null, offset, limit).then(function (os)
                {
                    res.send(os);
                }).catch(function (err){
                    console.log("error")
                    console.log(err)
                    res.send(err);
                })
            }
            
        })


        router.get('/:offset/:limit/:sortcol/:sortdir', function (req, res, next){
        
            me.init(req, res);
            let logic = router.logic;
            logic.session = req.session;
            let offset = req.params.offset;
            let limit = req.params.limit;
            let sortCol = req.params.sortcol;
            let sortDir = req.params.sortdir;
        
            if(isNaN(offset) || isNaN(limit))
                next();
            else
            {
                logic.findAll(null, offset, limit, [[sortCol, sortDir]]).then(function (os)
                {
                    res.send(os);
                }).catch(function (err){
                    console.log("error")
                    console.log(err)
                    res.send(err);
                })
            }
            
        })
        
        router.get('/get/:id', function (req, res){

            me.init(req, res);
            let id = req.params.id;
            let logic = router.logic;
            logic.session = req.session;
            logic.get(id).then(function (os)
            {
                res.send(os);
            }).catch(function (err){
                console.log("error")
                res.send(err);
            })
        })
        
        router.post('/update/:id', function (req, res){

            me.init(req, res);
            let o = req.body;
            let id = req.params.id;
            let logic = router.logic;
            logic.session = req.session;
            logic.update(id, o).then(function (savedO)
            {
                res.send(savedO);
            }).catch(function (err){
                console.log("error")
                res.send(err);
            })
        })
        
        router.get('/delete/:id', function (req, res){

            me.init(req, res);
            let id = req.params.id;
            let logic = router.logic;
            logic.session = req.session;
            logic.delete(id).then(function (result)
            {
                res.send(result);
            }).catch(function (err){
                console.log("error")
                res.send(err);
            })
        })

        return router;
    }

    static init(){ 

    }
}

module.exports = CrudRouter;
