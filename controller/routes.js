var config = require('../config/config.json');

var userFiles = require('../app/models/userFiles');

var Dropbox = require("dropbox");

var client = new Dropbox.Client({
    key: config.dropbox.appKey,
    secret: config.dropbox.appSecret
});

client.authDriver(new Dropbox.AuthDriver.NodeServer(8912));

module.exports = function(app) {
    app.get('/', function (req, res) {
            res.render('index');
    });

    app.get('/signin', function(req, res) {


        client.authenticate(function (error, client) {
            if (error) {
                res.send(error);
            }
            res.redirect('getData');
        });
    });

    app.get('/getData',function(req, res){
        var path = req.param('path');
        var directory;
        client.getAccountInfo(function(error, accountInfo) {
            if (error) {
                res.send(error);  // Something went wrong.
            }
            req.session.uid = accountInfo.uid;
            if(path == null){
                directory = "/";
            }else{
                directory = path;
            }
            client.readdir(directory, function (error, entries, stats) {
                if (error) {
                    res.send(error);
                }
                console.log(stats._json.contents);
                userFiles.findOne({
                    id: req.session.uid,
                    directory: directory
                }, function(err, files) {
                    if(err)
                        res.send(err);
                    if (files) {
                        var url = "/home?path=" + directory;
                        res.redirect(url);
                    }else{
                        for (var i = 0; i < stats._json.contents.length; i++) {
                            var name = stats._json.contents[i].path.split("/");

                            userFiles.create({
                                id         : accountInfo.uid,
                                name       : name[name.length-1],
                                size       : stats._json.contents[i].size,
                                date       : stats._json.contents[i].modified,
                                isFolder   : stats._json.contents[i].is_dir,
                                directory  : directory,
                                path       : stats._json.contents[i].path

                            }, function (err) {
                                if (err)
                                    res.send(err);
                            });
                            if (i + 1 == stats._json.contents.length) {
                                var url = "/home?path=" + directory;

                                res.redirect(url);
                            }
                        }
                    }
                });
            });
        });
    });

    app.get("/home", function(req, res){
        var path = req.param("path");
        var directory;
        if(path == null){
            directory = "/";
        }else{
            directory = path;
        }
        if(req.session.uid != null) {
            userFiles.find({
                id        : req.session.uid,
                directory : directory
            }, function (err, files) {
                if (err)
                    res.send(err);
                res.render("home", {
                    name: files
                });
            });
        }else{
            res.redirect("/");
        }

    });

    app.get("/logout", function(req, res) {
        req.session.destroy();
        client.signOut();
        res.redirect("/");
    })
};