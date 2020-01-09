let ID_PROYECTO = 0;

$(document).ready(function () {
  /*
  $('#refreshAutodeskTree').hide();
  if (getForgeToken() != '') {
    
    prepare_SWFS_WBS_Tree();

    $('#refreshAutodeskTree').show();
    $('#refreshAutodeskTree').click(function(){
      $('#dataswfswbs').jstree(true).refresh();
    });
  }
  */
});

function prepare_SWFS_WBS_Tree(Nombre_Data_Base) {

  $('#dataswfswbs').jstree({
    'core': {
      'themes': {"icons": true},
      'data': {
        "url": '/dm/getTreeNodeSWFS',
        "dataType": "json",
        "multiple": false,
        "cache": false,
        "data": function (node) {
          $('#dataswfswbs').jstree(true).toggle_node(node);
          return {"id": node.id, "Nombre_Data_Base": Nombre_Data_Base};
        },
        "success": function (nodes) {
          /*
          nodes.forEach(function (n) {
            if (n.type === 'bim360Hubs' && n.id.indexOf('b.') > 0)
              haveBIM360Hub = true;
          });
            if (!haveBIM360Hub) {
                $("#provisionAccountModal").modal();
                haveBIM360Hub = true;
            }
          */
        }        
      }
    },
    'types': {
      'default': {
        'icon': 'glyphicon glyphicon-question-sign'
      },
      '#': {
        'icon': 'glyphicon glyphicon-user'
      },
      'hubs': {
        'icon': '/img/a360hub.png'
      },
      'personalHub': {
        'icon': '/img/a360hub.png'
      },
      'bim360Hubs': {
        'icon': '/img/bim360hub.png'
      },
      'bim360projects': {
        'icon': '/img/bim360project.png'
      },
      'a360projects': {
        'icon': '/img/a360project.png'
      },
      'items': {
        'icon': 'glyphicon glyphicon-file'
      },
      'folders': {
        'icon': 'glyphicon glyphicon-folder-open'
      },
      'versions': {
        'icon': 'glyphicon glyphicon-time'
      }
    },
    "plugins": 
      ["types", "state"]
  }).bind("activate_node.jstree", function (evt, data) {
    if (data != null && data.node != null && data.node.type == 'a360projects') {
      if (data.node.id === 'not_available') { alert('No viewable available for this version'); return; }
      var parent_node = $('#dataswfswbs').jstree(true).get_node(data.node.name);

      obten_elementos_relacionados(data.node.id, ID_PROYECTO);

      $.notify("loading... " + data.node.text, { className: "info", position:"bottom right" }); 
    }
  });

  //["types", "state", "sort"]
}

function obten_id_proyecto(PROYECTO_REVIT) {
  jQuery.ajax({
    url: '/dm/getID_PROYECTO_REVIT',
    data: {proyecto_revit: PROYECTO_REVIT},
    success: function(proyecto) {
        ID_PROYECTO = proyecto[0].id_proyecto;
    },
    async: false
  });  
}