var express = require('express');
var router = express.Router();
//const swaggerJSDoc=require('swagger-jsdoc');
const swaggerUi=require('swagger-ui-express');
//const swaggerDocument = require('./swagger.json');


var movieMiddleware=require('../middleware/movieService');


// const swaggerOption={

// 	swaggerDefination:{
// 		info:{
// 			title: "TMDB APIs",
// 			version : "2.0"
// 		}
// 	},
// 	apis:['./app.js']
// }

 const swaggerOptions = {
  openapi: '3.0.1',
  info: {
      version: '1.0.0',
      title: 'APIs Document',
      description: 'your description here',
      termsOfService: '',
      contact: {
          name: 'abc',
          email: 'abc@xyz.com',      
      },      
  }
  };
//router.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerOptions));
router.use('/api-docs', swaggerUi.serve);
router.get('/api-docs', swaggerUi.setup(swaggerOptions));
// const swaggerDocs=swaggerJSDoc(swaggerOption);
// router.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));


/**
* @swagger
* /movies
*  get:
*   description:get all movies list
*    responses:
*     200:
*      description: Success
*/
/* GET users listing. */
router.get('/', movieMiddleware, function(req, res, next) {
  console.log("reqqqq body in router movie"+JSON.stringify(req.body));
  res.send(res.body);

});

module.exports = router;
