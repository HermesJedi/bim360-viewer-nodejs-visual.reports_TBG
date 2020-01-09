const mysql = require('mysql');

// token handling in session
var token = require('./token');

// web framework
var express = require('express');
var router = express.Router();

var Data_Base_MySQL = '';

var options = {
  host     : '67.227.237.13',
  user     : 'swordfi1_Admin',
  password : 'SwordAlfa4731',
  database : 'swordfi1_'
}

router.get('/dm/getTreeNodeSWFS', function (req, res) {

  var tokenSession = new token(req.session);
  if (!tokenSession.isAuthorized()) {
    res.status(401).end('Please login first');
    return;
  }

  var href = decodeURIComponent(req.query.id);

  if (href === '#') {
    //Data_Base_MySQL = 'swordfi1_' +  req.query.Proyecto_Revit;
    Data_Base_MySQL = 'swordfi1_' +  req.query.Nombre_Data_Base;
    options.database = Data_Base_MySQL;
    getWBS(res, 1);

  } else {
    var params = href.split('/');
    var ID = params[0];
    var OUTLINE_NUMBER = params[1];
    var OUTLINE_LEVEL = parseInt(params[2]);
    getWBS_Hijos(res, ID, OUTLINE_LEVEL);
  }
});

function getWBS(res, level) {
    //const connection = dbConnection();
  var Str_SQL = 'SELECT UNIQUE_ID_TAREA, ID_TASK, NOMBRE_TAREA, OUTLINE_LEVEL, OUTLINE_NUMBER FROM TBL_PROJECT WHERE ESTADO <> 3 ORDER BY ID_TASK ASC';
  const connection = mysql.createConnection(options)
  connection.connect((err) => {
    if (err) throw err;
    console.log("getWBS conected to MySQL: " + Data_Base_MySQL);
  });

  connection.query(Str_SQL, (err, result) => {
    if (err) throw err;
    
    var TBL_PROJECT;
    var WBS_type = 'hubs';
    var WBS_name = '';
    var WBS_id = '';
    var WBSItemsForTree = [];

    TBL_PROJECT = result;

    for(var i = 0; i<TBL_PROJECT.length; i++ ){     
      if (TBL_PROJECT[i].OUTLINE_LEVEL == level){

        WBS_id = TBL_PROJECT[i].UNIQUE_ID_TAREA + "/" + TBL_PROJECT[i].OUTLINE_NUMBER + "/" + TBL_PROJECT[i].OUTLINE_LEVEL;
        WBS_name = TBL_PROJECT[i].OUTLINE_NUMBER + " - " + TBL_PROJECT[i].NOMBRE_TAREA;
        fileName = WBS_name;

        WBSItemsForTree.push(prepareItemForTree(
          WBS_id,
          WBS_name,
          WBS_type,
          true
        ))
      }
    }
    connection.end();
    res.json(WBSItemsForTree);
  });
}

function getWBS_Hijos(res, id, level) {
    //const connection = dbConnection();
  var Str_SQL = 'SELECT UNIQUE_ID_TAREA, ID_TASK, NOMBRE_TAREA, OUTLINE_LEVEL, OUTLINE_NUMBER FROM TBL_PROJECT WHERE ESTADO <> 3 ORDER BY ID_TASK ASC';
  const connection = mysql.createConnection(options)
  connection.connect(function(err) {
    if (err) throw err;
    console.log("getWBS_Hijos Connected to MySQL: " + Data_Base_MySQL);
  });

  connection.query(Str_SQL, (err, result) => {
    if (err) throw err;
    
    var TBL_PROJECT;
    var WBS_type = 'a360projects';
    var WBS_name = '';
    var WBS_id = '';
    var WBSItemsForTree = [];
    var level_padre = parseInt(level);
    var level_buscado = level_padre + 1;
    var level_actual = 0;

    TBL_PROJECT = result;

    for(var i = 0; i<TBL_PROJECT.length; i++ ){   
      if (TBL_PROJECT[i].UNIQUE_ID_TAREA == id){  
        for(var h = (i + 1); h<TBL_PROJECT.length; h++ ){  
          level_actual = parseInt(TBL_PROJECT[h].OUTLINE_LEVEL); 
          if (level_actual == level_buscado){

            WBS_id = TBL_PROJECT[h].UNIQUE_ID_TAREA + "/" + TBL_PROJECT[h].OUTLINE_NUMBER + "/" + TBL_PROJECT[h].OUTLINE_LEVEL;
            WBS_name = TBL_PROJECT[h].OUTLINE_NUMBER + " - " + TBL_PROJECT[h].NOMBRE_TAREA;

            WBSItemsForTree.push(prepareItemForTree(
              WBS_id,
              WBS_name,
              WBS_type,
              true
            ))
          }
          if (level_actual == level){
            break;
          }
        }
        break;
      }
    }
    connection.end();
    res.json(WBSItemsForTree);
  });
}

function prepareItemForTree(_id, _text, _type, _children, _fileType, _fileName) {
  return { id: _id, text: _text, type: _type, children: _children, fileType:_fileType, fileName: _fileName };
}


router.get('/dm/getRelacionWBSIDS', function (req, res) {

  var tokenSession = new token(req.session);
  if (!tokenSession.isAuthorized()) {
    res.status(401).end('Please login first');
    return;
  }

  var href = decodeURIComponent(req.query.id);

  if (href === '#') {

  } else {
    var params = href.split('/');
    var ID = params[0];
    var OUTLINE_NUMBER = params[1];
    var OUTLINE_LEVEL = parseInt(params[2]);

    getREL_PRO_ELE(res, ID, req.query.id_proyecto);
  }
});

function getREL_PRO_ELE(res, id, ID_PROYECTO) {
    //const connection = dbConnection();
  var Str_SQL = 'SELECT ID_ELEMENTO, UNIQUE_ID_TAREA, ID_PROYECTO FROM TBL_REL_PRO_ELE WHERE ID_PROYECTO = ' +  ID_PROYECTO + ' AND UNIQUE_ID_TAREA = ' + id + ' ORDER BY UNIQUE_ID_TAREA ASC';
  const connection = mysql.createConnection(options)
  connection.connect((err) => {
    if (err) throw err;
    console.log("getREL_PRO_ELE Connected to MySQL: " + Data_Base_MySQL);
  });

  connection.query(Str_SQL, (err, result) => {
    if (err) throw err;
    
    var TBL_REL_PRO_ELE = result;
    var WBSItemsForReturn = [];

    for(var i = 0; i<TBL_REL_PRO_ELE.length; i++ ){   
      WBSItemsForReturn.push(prepareItemForReturn(
        TBL_REL_PRO_ELE[i].ID_ELEMENTO
      ))
    }
    connection.end();
    res.json(WBSItemsForReturn);
  });
}

function prepareItemForReturn(_id) {
  return { id: _id};
}

router.get('/dm/getID_PROYECTO_REVIT', function (req, res) {

  var Str_SQL = "SELECT ID_PROYECTO, PROYECTO_RVT FROM TBL_PROYECTO_RVT WHERE PROYECTO_RVT = '" +  req.query.proyecto_revit + "' OR PROYECTO_RVT = '" +  req.query.proyecto_revit + ".rvt'";
  const connection = mysql.createConnection(options)
  connection.connect((err) => {
    if (err) throw err;
    console.log("getID_PROYECTO_REVIT Connected to MySQL: " + Data_Base_MySQL);
  });

  connection.query(Str_SQL, (err, result) => {
    if (err) throw err;
    
    var TBL_PROYECTO_RVT = result;
    var ItemForReturn = [];

    for(var i = 0; i<TBL_PROYECTO_RVT.length; i++ ){   
      ItemForReturn.push(prepareIdProyectoForReturn(
        TBL_PROYECTO_RVT[i].ID_PROYECTO
      ))
      break;
    }
    connection.end();
    res.json(ItemForReturn);
  });
});

function prepareIdProyectoForReturn(_id_proyecto) {
  return { id_proyecto: _id_proyecto};
}


module.exports = router;