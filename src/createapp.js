import http from 'http';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import AppRouter from './router';
import multer from 'multer';
import path from 'path';

const storageDir = 'C:/mongodb/backend';

class CreateApp {

  constructor(appName,port){
    this.createApp(appName,port);
  }

  createApp(appName,port){
    //file storage config
    var storageConfig = multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, storageDir);
      },
      filename: function (req, file, cb) {
        //cb(null, `${Date.now().toString()}-${file.originalname}`);
        cb(null, file.originalname);
      }
    });

    var upload = multer({ storage: storageConfig })

    //app config
    const app = express();

    app.server = http.createServer(app);
    app.use(morgan('dev'));
    app.use(cors({exposeHeaders: "*"}));
    app.use(bodyParser.json({limit: '50mb'}));
    app.use(bodyParser.urlencoded({extended: false}));
    app.use(express.static(path.join(__dirname,'' + appName + '/')));

    app.set('root',__dirname);
    app.set('storageDir',storageDir);
    app.set('upload',upload);

    new AppRouter(app);

    app.server.listen(process.env.PORT || port, ()=>{console.log('App is running on port ' + app.server.address().port);});
  }


}

export default CreateApp;
