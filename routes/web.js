const CrudRouter = require("./crudrouter");

class WebRouter {

    static getConfig()
    {
        return {};
    }

    static getRouter(logic)
    {
        var express = require('express');
        var router = express.Router();
        const path = require('path');
        router.logic = logic;
        let me = this;

        router.get('', (req, res)=>{
            var dir = __dirname;
            var p = path.resolve( dir, "../public/pages/", "index");
            res.render(p, { config: me.getConfig() } )
        });

        return router;
    }
}

module.exports = WebRouter;