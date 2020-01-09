$(document).ready(function () {
  $('#refreshAutodeskTree').hide();
  if (getForgeToken() != '') {
    
    prepareDataManagementTree();

    $('#refreshAutodeskTree').show();
    $('#refreshAutodeskTree').click(function(){
      $('#dataManagementHubs').jstree(true).refresh();
    });
  }

  $.getJSON("/api/forge/clientID", function (res) {
      $("#ClientID").val(res.ForgeClientId);
  });
});

var haveBIM360Hub = false;

function prepareDataManagementTree() {
  $('#dataManagementHubs').jstree({
    'core': {
      'themes': {"icons": true},
      'data': {
        "url": '/dm/getTreeNode',
        "dataType": "json",
        "multiple": false,
        "cache": false,
        "data": function (node) {
          $('#dataManagementHubs').jstree(true).toggle_node(node);
          return {"id": node.id};
        },
        "success": function (nodes) {
          nodes.forEach(function (n) {
            if (n.type === 'bim360Hubs' && n.id.indexOf('b.') > 0)
              haveBIM360Hub = true;
          });
            if (!haveBIM360Hub) {
                $("#provisionAccountModal").modal();
                haveBIM360Hub = true;
            }
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
      ["types", "state", "sort"]
  }).bind("activate_node.jstree", function (evt, data) {
    if (data != null && data.node != null && data.node.type == 'versions') {
      if (data.node.id === 'not_available') { alert('No viewable available for this version'); return; }
      var parent_node = $('#dataManagementHubs').jstree(true).get_node(data.node.parent);
      $(".report-dropdowns").css('visibility', 'visible');
      $("#dropdown2dviews").css('visibility', 'visible');

      launchViewer(data.node.id, 'forgeViewer', 'viewerSecondary');

      var proyecto_revit = parent_node.text;
      var Nombre_Data_Base = $('#dataManagementHubs').jstree(true).get_node(data.node.parents[2]);

      $('#dataswfswbs').jstree("destroy").empty();
      /// Primero se obtienen las WBS
      prepare_SWFS_WBS_Tree(Nombre_Data_Base.text);
      
      //// luego se obtienen el ID del proyecto
      proyecto_revit =  proyecto_revit.substring(0, proyecto_revit.length - 4);
      obten_id_proyecto(proyecto_revit);

      //$.notify("loading... DB: " + parent_node.text, { className: "info", position:"bottom right" });
      $.notify("Loading... DB: " + Nombre_Data_Base, { className: "info", position:"bottom right" });
    }

  });
}