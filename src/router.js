import {version} from '../package.json';
import path from 'path';

var resize = require('./resize');

class AppRouter {

  constructor(app){
    this.app = app;
    this.initRouter();
  }

  initRouter(){

    const app = this.app;
    const uploadDir = app.get('storageDir');
    const upload = app.get('upload');

    /*app.get('/', (req,res,next)=>{
      return res.status(200).json({
        version: version
      })
    });*/

    app.get('/api/changepw/:oldpw/:newpw',(req,res,next) =>{
        const fs = require('fs');
        const filePath = path.join(uploadDir,'server.json');
        var serverJson = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        //console.log(serverJson);
        var allowed = serverJson.password === req.params.oldpw? true:false;

        if(allowed){
          const content = {
            password: req.params.newpw
          };
          const fs = require('fs');
          const filePath = path.join(uploadDir,"server.json");

          fs.writeFileSync(filePath,JSON.stringify(content,null,4));
        }

        return res.json({
          changed: allowed
        });
      });

    app.get('/api/login/:password',(req,res,next)=>{

      const fs = require('fs');
      const filePath = path.join(uploadDir,'server.json');
      var serverJson = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      //console.log(serverJson);
      var allowed = serverJson.password === req.params.password? true:false;

      return res.json({
        verified: allowed
      })
    });

    app.post('/api/upload',upload.array('files'), (req,res, next)=>{
      //console.log('Received file', req.files);
      return res.json({
        status: 'ok'
        //files: req.files
      })
    });

    app.post('/api/update/:fileName/:json',(req,res, next)=>{
      //console.log('Received json');
      const content = JSON.parse(req.params.json);
      const fs = require('fs');
      const filePath = path.join(uploadDir,req.params.fileName);

      fs.writeFileSync(filePath,JSON.stringify(content,null,4));
      return res.json({
        update: content
      })
    });

    app.get('/api/download/:name', (req,res,next)=>{

      const fileName = req.params.name;
      const filePath = path.join(uploadDir,fileName);

      //console.log('donwloading ' + fileName)

      var fileNameArray = fileName.split('.');
      var fileType = fileNameArray[1];
      //console.log(fileType)
      var ValidImageTypes = ["jpeg", "png","jpg"];
      if (ValidImageTypes.includes(fileType)) {
        console.log('resizing');

        var sizeOf = require('image-size');
        var dimensions = sizeOf(filePath);
        //console.log(dimensions.width, dimensions.height);
        for(var i=0;i<100;i++){
          dimensions.width *= 0.98;
          dimensions.height *= 0.98;
          if(dimensions.width < 512 || dimensions.height < 512){
            break;
          }
        }

        res.type('image/png');
        resize(filePath,fileType,Math.floor(dimensions.width),Math.floor(dimensions.height)).pipe(res);
      }else {
        console.log('not resizing')
        return res.download(filePath,fileName,(err)=>{
          if(err){
            console.log('File download error')
          }else{
            //console.log('File download available')
          }
        });
      }
    });

    app.get('/api/delete/:name', (req,res,next)=>{
      const fileName = req.params.name;
      const filePath = path.join(uploadDir,fileName);
      var fs = require('fs');
      fs.unlinkSync(filePath);
      //console.log('file removed: ' + fileName)
      res.json({
        deleted: true
      });
    });

    console.log('App router initialized');
  }

}

export default AppRouter;
