const jquery = require('jquery')
$ = window.$ = window.jQuery = jquery;
import mv from "../lib/mv";
import ogc from "../lib/ogc";
//import slug from "../lib/slug"

// OpenLayers
import Map from "ol/Map";
import { Tile, Vector } from "ol/layer";
import OSM from "ol/source/OSM";
import { Vector as VectorSource } from "ol/source";

import Sortable from "sortablejs";
require('bootstrap')


//css
import "bootstrap/dist/css/bootstrap.min.css";
import "../css/mviewerstudio.css";
import "../lib/icon-picker/icon-picker.css";
import "bootstrap-tagsinput/dist/bootstrap-tagsinput.css";

var _conf;
var API = {};
var VERSION = "3.1-snapshot";

$(document).ready(function () {
  //Mviewer Studio version
  console.log("MviewerStudio version " + VERSION);

  //Get URL Parameters
  if (window.location.search) {
    $.extend(
      API,
      $.parseJSON(
        '{"' +
          decodeURIComponent(
            window.location.search
              .substring(1)
              .replace(/&/g, '","')
              .replace(/=/g, '":"')
          ) +
          '"}'
      )
    );
  }
  $.ajax({
    type: "GET",
    url: "config.json",
    dataType: "json",
    contentType: "application/json",
    success: function (data) {
      console.groupCollapsed("init app from config");
      _conf = data.app_conf;
      if (_conf.proxy === undefined) {
        _conf.proxy = "../proxy/?url=";
      }

      if (_conf.logout_url) {
        $("#menu_user_logout").attr("href", _conf.logout_url);
      }

      // Update web page title and title in the brand navbar
      document.title = _conf.studio_title;
      $("#studio-title").text(_conf.studio_title);

      // Base layers
      mv.showBaseLayers(_conf.baselayers, "default-bl");
      // Sélection par défaut des 2 1er baselayers
      $("#frm-bl .bl input")
        .slice(0, 2)
        .prop("checked", true)
        .trigger("change");
      $("#frm-bl-visible").val(
        $("#frm-bl-visible option:not(:disabled)").first().val()
      );

      // Map extent
      map2.getView().setCenter(_conf.map.center);
      map2.getView().setZoom(_conf.map.zoom);

      // Form placeholders
      $("#opt-title").attr(
        "placeholder",
        _conf.app_form_placeholders.app_title
      );
      $("#opt-logo").attr("placeholder", _conf.app_form_placeholders.logo_url);
      $("#opt-help").attr("placeholder", _conf.app_form_placeholders.help_file);

      // Thematic layers providers
      var csw_providers = [];
      var wms_providers = [];
      if (
        _conf.external_themes &&
        _conf.external_themes.used &&
        _conf.external_themes.url
      ) {
        $.ajax({
          type: "GET",
          url: _conf.external_themes.url,
          success: function (csv) {
            _conf.external_themes.data = Papa.parse(csv, {
              header: true,
            }).data;
            var html = [];
            _conf.external_themes.data.forEach(function (mv, id) {
              if (mv.xml && mv.id) {
                var url = mv.xml;
                var themeid = mv.id;
                if (url && themeid) {
                  html.push(
                    [
                      '<div class="checkbox list-group-item">',
                      '<label for="import-theme-' + themeid + id + '">',
                      '<input type="checkbox" data-url="' +
                        url +
                        '" data-theme-label="' +
                        mv.title +
                        '" data-theme-id="' +
                        themeid +
                        '" name="checkboxes" id="import-theme-' +
                        themeid +
                        id +
                        '">',
                      mv.title,
                      "</label></div>",
                    ].join("")
                  );
                }
              }
            });
            $("#mod-themesview .list-group").append(html);
          },
        });
      } else {
        $("#btn-importTheme").remove();
      }

      let nb_providers = 0;

      if (_conf.data_providers && _conf.data_providers.csw) {
        _conf.data_providers.csw.forEach(function (provider, id) {
          var cls = "active";
          if (nb_providers > 0) {
            cls = "";
          }
          let csw_provider_html = '<li class="' + cls + '">';
          csw_provider_html +=
            '<a onclick="setActiveProvider(this);" href="#" class="dropdown-toggle"';
          csw_provider_html +=
            ' data-providertype="csw" data-provider="' + provider.url + '"';
          if (provider.baseref) {
            csw_provider_html +=
              ' data-metadata-app="' + provider.baseref + '"';
          }
          csw_provider_html += ">" + provider.title + "</a></li>";
          csw_providers.push(csw_provider_html);
          nb_providers++;
        });
        $("#providers_list").append(csw_providers.join(" "));
        if (_conf.data_providers.csw.length > 0) {
          $("#providers_list").append(
            '<li role="separator" class="divider"></li>'
          );
        }
      }

      if (_conf.data_providers && _conf.data_providers.wms) {
        _conf.data_providers.wms.forEach(function (provider, id) {
          var cls = "active";
          if (nb_providers > 0) {
            cls = "";
          }
          wms_providers.push(
            '<li class="' +
              cls +
              '">' +
              '<a onclick="setActiveProvider(this);" data-providertype="wms" class="dropdown-toggle"' +
              ' data-provider="' +
              provider.url +
              '" href="#">' +
              provider.title +
              "</a></li>"
          );
          nb_providers++;
        });

        $("#providers_list").append(wms_providers.join(" "));
        if (_conf.data_providers.wms.length > 0) {
          $("#providers_list").append(
            '<li role="separator" class="divider"></li>'
          );
        }
      }

      if (API.xml) {
        loadApplicationParametersFromRemoteFile(API.xml);
      } else if (API.wmc) {
        loadApplicationParametersFromWMC(API.wmc);
      } else {
        newConfiguration();
      }

      updateProviderSearchButtonState();

      // Default params for layers
      if (_conf.default_params && _conf.default_params.layer) {
        mv.setDefaultLayerProperties(_conf.default_params.layer);
      }

      // Get user info
      if (_conf.user_info_visible) {
        $.ajax({
          type: "GET",
          url: _conf.user_info,
          dataType: "json",
          contentType: "application/json",
          success: function (data) {
            var userGroupFullName;
            var userGroupSlugName;
            var selectGroupPopup = false;
            if (data) {
              if (data.organisation && data.organisation.legal_name) {
                userGroupFullName = data.organisation.legal_name;
              } else if (data && data.user_groups) {
                if (data.user_groups.length > 1) {
                  selectGroupPopup = true;
                } else {
                  userGroupFullName = data.user_groups[0].full_name;
                  userGroupSlugName = data.user_groups[0].slug_name;
                }
              }

              if (selectGroupPopup) {
                mv.updateUserGroupList(data);
                $("#mod-groupselection").modal({
                  backdrop: "static",
                  keyboard: false,
                });
              } else {
                if (!userGroupSlugName) {
                  userGroupSlugName = slugify(userGroupFullName);
                }
                mv.updateUserInfo(
                  data.first_name + " " + data.last_name,
                  userGroupSlugName,
                  userGroupFullName
                );
              }
            }
          },
          error: function (xhr, ajaxOptions, thrownError) {
            console.error("user info retrieval failed", {
              xhr: xhr,
              ajaxOptions: ajaxOptions,
              thrownError: thrownError,
            });
            alert(
              "Echec de la récupération de l'identité de l'utilisateur.\nVeuillez consulter votre administrateur."
            );
          },
        });
      } else {
        mv.hideUserInfo();
      }
      console.groupEnd("init app from config");
    },
  });
  $("#tabs").tab();
});

// //EPSG:2154
// proj4.defs(
//   "EPSG:2154",
//   "+proj=lcc +lat_1=49 +lat_2=44 +lat_0=46.5 +lon_0=3 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"
// );

// ol.proj.proj4.register(proj4);

//Map
var map = new Map({
  layers: [
    new Tile({
      source: new OSM(),
    }),
  ],
  target: "map",
});

var savedParameters;

//Map_filter
var draw;
var source = new VectorSource({ wrapX: false });
var vector = new Vector({
  source: source,
});
var map2 = new Map({
  layers: [
    new Tile({
      source: new OSM(),
    }),
    vector,
  ],
  target: "map_filter",
});
var config;

var newConfiguration = function () {
  [
    "opt-title",
    "opt-logo",
    "opt-help",
    "theme-edit-icon",
    "theme-edit-title",
  ].forEach(function (param, id) {
    $("#" + param).val("");
  });
  [
    "opt-exportpng",
    "opt-measuretools",
    "theme-edit-collapsed",
    "opt-mini",
    "opt-showhelp",
    "opt-coordinates",
    "opt-togglealllayersfromtheme",
  ].forEach(function (param, id) {
    $("#" + param).prop("checked", false);
  });

  $("#opt-style").val("css/themes/default.css").trigger("change");
  $("#panel-theme").hide();

  map.getView().setCenter(_conf.map.center);
  map.getView().setZoom(_conf.map.zoom);
  config = {
    application: { title: "", logo: "" },
    themes: {},
    temp: { layers: {} },
  };
  //Store des parametres non gérés
  savedParameters = { application: [], baselayers: {} };
  $("#themes-list, #themeLayers, #liste_applications, #distinct_values")
    .find(".list-group-item")
    .remove();
  $("#frm-bl .custom-bl").remove();
};

var loadLayers = function (themeid) {
  var theme = config.themes[themeid];
  if (theme) {
    $.each(theme.layers, function (index, layer) {
      addLayer(layer.title, layer.id);
    });
  }
};

var sortableLayerList = Sortable.create(
  document.getElementById("themeLayers"),
  {
    handle: ".glyphicon-move",
    animation: 150,
    ghostClass: "ghost",
    onEnd: function (evt) {
      sortLayers(evt.oldIndex, evt.newIndex);
    },
  }
);

var deleteThemeItem = function (btn) {
  var el = $(btn).closest(".list-group-item")[0];
  var themeid = $(el).attr("data-themeid");
  deleteTheme(themeid);
  el && el.parentNode.removeChild(el);
};

var deleteLayerItem = function (btn) {
  var el = $(btn).closest(".layers-list-item")[0];
  deleteLayer(el.getAttribute("data-layerid"));
  el && el.parentNode.removeChild(el);
};

var sortableThemeList = Sortable.create(
  document.getElementById("themes-list"),
  {
    handle: ".glyphicon-move",
    animation: 150,
    ghostClass: "ghost",
    onEnd: function (evt) {
      sortThemes();
    },
  }
);

var sortThemes = function () {
  var orderedThemes = {};
  $(".themes-list-item").each(function (i, item) {
    var id = $(this).attr("data-themeid");
    orderedThemes[id] = config.themes[id];
  });
  config.themes = orderedThemes;
};

var sortLayers = function (fromIndex, toIndex) {
  var themeid = $("#themes-list .active").attr("data-themeid");
  var arr = config.themes[themeid].layers;
  var element = arr[fromIndex];
  arr.splice(fromIndex, 1);
  arr.splice(toIndex, 0, element);
};

$("input[type=file]").change(function () {
  loadApplicationParametersFromFile();
});

var addLayer = function (title, layerid) {
  // test if theme is saved
  if (!config.themes[$("#theme-edit").attr("data-themeid")]) {
    saveTheme();
  }
  var item = $("#themeLayers").append(
    [
      '<div class="list-group-item layers-list-item" data-layerid="' +
        layerid +
        '">',
      '<span class="glyphicon glyphicon-move" aria-hidden="true"></span>',
      '<div class="pull-right btn-group" role="group">',
      '<button class="btn btn-sm btn-warning" onclick="editLayer(this);"><span class="layer-edit glyphicon glyphicon-pencil" title="Editer cette couche"></span></button>',
      '<button class="btn btn-sm btn-warning" onclick="deleteLayerItem(this);"><span class="layer-remove glyphicon glyphicon-remove" title="Supprimer"></span></button>',
      "</div>",
      '<span class="layer-name">' + title + "</span>",
      "</div>",
    ].join("")
  );

  if (title === "Nouvelle couche") {
    item.find(".layer-edit").last().click();
  }
};

var editLayer = function (item) {
  $("#themeLayers .list-group-item").removeClass("active");
  var element = $(item).parent().parent();
  element.addClass("active");
  var title = element.find(".layer-name").text();
  var layerid = element.attr("data-layerid");
  if (layerid != "undefined") {
    $("#mod-layerOptions").modal();
    mv.showLayerOptions(element);
  } else {
    $("#mod-layerNew").modal();
  }
};

var importThemes = function () {
  console.groupCollapsed("importThemes");
  console.log("external theme to import", _conf.external_themes.data);
  $("#importedThemes input:checked").each(function (id, item) {
    var url = $(item).attr("data-url");
    var id = $(item).attr("data-theme-id");
    var label = $(item).attr("data-theme-label");
    addTheme(label, true, id, false, url);
  });
  console.groupEnd("importThemes");
};

var addTheme = function (title, collapsed, themeid, icon, url) {
  if ($("#panel-theme").is(":visible")) {
    alert("Enregistrez d'abord votre thématique.");
    return;
  }
  if (url) {
    //external theme
    $("#themes-list").append(
      [
        '<div class="list-group-item list-group-item-info themes-list-item" data-theme-url="' +
          url +
          '" data-theme="' +
          title +
          '" data-themeid="' +
          themeid +
          '" data-theme-collapsed="' +
          collapsed +
          '" data-theme-icon="' +
          icon +
          '">',
        '<span class="glyphicon glyphicon-move" aria-hidden="true"></span>',
        '<div class="pull-right btn-group" role="group">',
        '<button class="btn btn-sm btn-warning" onclick="deleteThemeItem(this);" ><span class="theme-remove glyphicon glyphicon-remove" title="Supprimer"></span></button>',
        "</div>",
        '<span class="theme-name">' +
          title +
          '</span><span class="label label-success">Ext.</span>',
        "</div>",
      ].join("")
    );
  } else {
    $("#themes-list").append(
      [
        '<div class="list-group-item themes-list-item" data-theme="' +
          title +
          '" data-themeid="' +
          themeid +
          '" data-theme-collapsed="' +
          collapsed +
          '" data-theme-icon="' +
          icon +
          '">',
        '<span class="glyphicon glyphicon-move" aria-hidden="true"></span>',
        '<div class="pull-right btn-group" role="group">',
        '<button class="btn btn-sm btn-warning" onclick="editTheme(this);"><span class="theme-edit glyphicon glyphicon-pencil" title="Editer ce thème"></span></button>',
        '<button class="btn btn-sm btn-warning" onclick="deleteThemeItem(this);" ><span class="theme-remove glyphicon glyphicon-remove" title="Supprimer"></span></button>',
        "</div>",
        '<span class="theme-name">' +
          title +
          '</span><span class="label label-info">0</span>',
        "</div>",
      ].join("")
    );
  }

  config.themes[themeid] = {
    title: title,
    id: themeid,
    icon: icon,
    collapsed: collapsed,
    url: url,
    layers: [],
  };
  if (title === "Nouvelle thématique") {
    $(".themes-list-item[data-themeid='" + themeid + "'] .theme-edit")
      .parent()
      .trigger("click");
  }
};

var editTheme = function (item) {
  $("#themes-list .list-group-item").removeClass("active");
  $(item).parent().parent().addClass("active");
  var title = $(item).parent().parent().attr("data-theme");
  var themeid = $(item).parent().parent().attr("data-themeid");
  var collapsed =
    $(item).parent().parent().attr("data-theme-collapsed") === "true"
      ? false
      : true;
  var icon = $(item).parent().parent().attr("data-theme-icon");
  if (icon === "undefined") icon = "fas fa-caret-right";

  $("#panel-theme").show();
  $("#theme-edit-title").val(title);
  $("#theme-edit-collapsed").prop("checked", collapsed);
  $("#theme-edit").attr("data-themeid", themeid);
  $("#theme-pick-icon").val(icon);
  $("#theme-pick-icon")
    .siblings(".selected-icon")
    .attr("class", "selected-icon");
  $("#theme-pick-icon").siblings(".selected-icon").addClass(icon);

  //Remove old layers entries
  $(".layers-list-item").remove();
  //Show layerslm
  loadLayers(themeid);
};

var saveTheme = function () {
  //get active item in left panel
  var theme = $("#themes-list .active");
  //get edited values (right panel)
  var title = $("#theme-edit-title").val();
  var themeid = $("#theme-edit").attr("data-themeid");
  var collapsed = !$("#theme-edit-collapsed").prop("checked");
  var icon = $.trim($("#theme-pick-icon").val());
  //update values in left panel
  theme.attr("data-theme", title);
  theme.attr("data-theme-collapsed", collapsed);
  theme.attr("data-theme-icon", icon);
  theme.find(".theme-name").text(title);
  var nb_layers = $("#themeLayers .list-group-item").length;
  theme.find(".label").text(nb_layers);
  //deactivate theme edition
  $("#themes-list .list-group-item").removeClass("active");
  $("#panel-theme").hide();

  //save theme locally
  config.themes[themeid].title = title;
  config.themes[themeid].id = themeid;
  config.themes[themeid].collapsed = collapsed;
  config.themes[themeid].icon = icon;
};

var deleteTheme = function (themeid) {
  $("#panel-theme").hide();
  delete config.themes[themeid];
};

var deleteLayer = function (layerid) {
  var themeid = $("#theme-edit").attr("data-themeid");
  var index = config.themes[themeid].layers.findIndex(function (l) {
    return l.id === layerid;
  });
  config.themes[themeid].layers.splice(index, 1);
};

var createId = function (obj) {
  var d = new Date();
  var df =
    d.getFullYear() +
    ("0" + (d.getMonth() + 1)).slice(-2) +
    ("0" + d.getDate()).slice(-2) +
    ("0" + d.getHours()).slice(-2) +
    ("0" + d.getMinutes()).slice(-2) +
    ("0" + d.getSeconds()).slice(-2);
  return obj + "-" + df;
};

var createBaseLayerDef = function (bsl) {
  var parameters = "";
  $.each(bsl, function (param, value) {
    if (param === "attribution") {
      value = mv.escapeXml(value);
    }
    parameters += param + '="' + value + '" ';
  });
  return parameters;
};

var saveApplicationParameters = function (option) {
  // option == 0 : save serverside
  // option == 1 : save serverside + download
  // option == 2 : save serverside + launch map

  var padding = function (n) {
    return "\r\n" + " ".repeat(n);
  };
  var savedProxy = "";
  var olscompletion = "";
  var elasticsearch = "";
  var savedSearchparameters = "";
  var application = [
    "<application",
    'title="' + $("#opt-title").val() + '"',
    'logo="' + $("#opt-logo").val() + '"',
    'help="' + $("#opt-help").val() + '"',
    'style="' + $("#opt-style").val() + '"',
    'exportpng="' + ($("#opt-exportpng").prop("checked") === true) + '"',
    'showhelp="' + ($("#opt-showhelp").prop("checked") === true) + '"',
    'coordinates="' + ($("#opt-coordinates").prop("checked") === true) + '"',
    'measuretools="' + ($("#opt-measuretools").prop("checked") === true) + '"',
    'togglealllayersfromtheme="' +
      ($("#opt-togglealllayersfromtheme").prop("checked") === true) +
      '"',
  ];

  config.title = $("#opt-title").val();

  if (config.title == "") {
    alert(
      "Attention, vous devez obligatoirement indiquer un titre à votre application avant de sauvegarder."
    );
    return;
  }

  savedParameters.application.forEach(function (parameter, id) {
    $.each(parameter, function (prop, val) {
      console.log(prop, val);
      application.push(prop + '="' + val + '"');
    });
  });
  application =
    application.join(padding(4)) + ">" + padding(0) + "</application>";
  if (_conf.proxy) {
    savedProxy = padding(0) + "<proxy url='" + _conf.proxy + "'/>";
  }
  var search_params = {
    bbox: false,
    localities: false,
    features: false,
    static: false,
  };
  if ($("#frm-searchlocalities").val() != "false") {
    olscompletion = [
      padding(0) +
        '<olscompletion type="' +
        $("#frm-searchlocalities").val() +
        '"',
      'url="' + $("#opt-searchlocalities-url").val() + '"',
      'attribution="' + $("#opt-searchlocalities-attribution").val() + '" />',
    ].join(" ");
    search_params.localities = true;
  }
  if (
    $("#frm-globalsearch").val() === "elasticsearch" &&
    $("#opt-elasticsearch-url").val()
  ) {
    elasticsearch = [
      padding(0) +
        '<elasticsearch url="' +
        $("#opt-elasticsearch-url").val() +
        '"',
      'geometryfield="' + $("#opt-elasticsearch-geometryfield").val() + '"',
      'linkid="' + $("#opt-elasticsearch-linkid").val() + '"',
      'doctypes="' + $("#opt-elasticsearch-doctypes").val() + '"',
      'mode="' + ($("#opt-elasticsearch-mode").val() || "match") + '"',
      'version="' + $("#opt-elasticsearch-version").val() + '" />',
    ].join(" ");
    if ($("#opt-elasticsearch-doctypes").val().length >= 0) {
      search_params.static = "true";
    }
    if ($("#opt-elasticsearch-bbox").prop("checked")) {
      search_params.bbox = "true";
    }
  }
  if ($("#opt-searchfeatures").prop("checked")) {
    search_params.features = true;
  }

  searchparameters =
    padding(0) +
    '<searchparameters bbox="' +
    search_params.bbox +
    '" localities="' +
    search_params.localities +
    '" features="' +
    search_params.features +
    '" static="' +
    search_params.static +
    '"/>';

  var center = map.getView().getCenter().join(",");
  var zoom = map.getView().getZoom();
  var mapoptions =
    padding(0) +
    '<mapoptions maxzoom="20" projection="EPSG:3857" center="' +
    center +
    '" zoom="' +
    zoom +
    '" />';

  var baseLayersMode = $("#frm-bl-mode").val();
  var visibleBaselayer = $("#frm-bl-visible").val();
  var baseLayers = [padding(0) + '<baselayers style="' + baseLayersMode + '">'];
  $(".bl input:checked").each(function (i, b) {
    // set first bl visible
    var baseLayer =
      _conf.baselayers[$(b).parent().parent().attr("data-layerid")] ||
      savedParameters.baselayers[$(b).parent().parent().attr("data-layerid")];
    var definition = [
      '<baselayer visible="false" ',
      createBaseLayerDef(baseLayer),
      " ></baselayer>",
    ].join("");
    if (baseLayer.id === visibleBaselayer) {
      definition = definition.replace('visible="false"', 'visible="true"');
    }
    baseLayers.push(padding(4) + definition);
  });
  baseLayers.push(padding(0) + "</baselayers>");
  var themes = [
    padding(0) +
      '<themes mini="' +
      ($("#opt-mini").prop("checked") === true) +
      '">',
  ];
  // Respect theme order
  $(".themes-list-item").each(function (id, theme) {
    var themeid = $(theme).attr("data-themeid");
    if (config.themes[themeid]) {
      var t = config.themes[themeid];
      var theme = [];
      if (t.url) {
        theme = [
          padding(4) +
            '<theme id="' +
            t.id +
            '" url="' +
            t.url +
            '" name="' +
            t.title +
            '" collapsed="' +
            t.collapsed +
            '" icon="' +
            t.icon +
            '">',
        ];
      } else {
        theme = [
          padding(4) +
            '<theme id="' +
            t.id +
            '" name="' +
            t.title +
            '" collapsed="' +
            t.collapsed +
            '" icon="' +
            t.icon +
            '">',
        ];
      }
      $(t.layers).each(function (i, l) {
        var layer = mv.writeLayerNode(l);
        theme.push(layer);
      });
      themes.push(theme.join(" "));
      themes.push(padding(4) + "</theme>");
    }
  });
  themes.push(padding(0) + "</themes>");

  var conf = [
    '<?xml version="1.0" encoding="UTF-8"?>\r\n<config mviewerstudioversion="' +
      VERSION +
      '">\r\n',
    "<metadata>\r\n" + mv.createDublinCore(config) + "\r\n</metadata>\r\n",
    application,
    mapoptions,
    savedProxy,
    olscompletion,
    elasticsearch,
    searchparameters,
    baseLayers.join(" "),
    themes.join(" "),
    padding(0) + "</config>",
  ];

  if (mv.validateXML(conf.join(""))) {
    // Save the map serverside
    $.ajax({
      type: "POST",
      url: _conf.upload_service,
      data: conf.join(""),
      dataType: "json",
      contentType: "text/xml",
      success: function (data) {
        console.log("saved map file: %s", data.filepath);

        if (option == 0) {
          // Ok it's been saved and that's it
          alert("Fichier sauvegardé sur le serveur (" + data.filepath + ").");
        } else if (option == 1) {
          // Download map config file
          var element = document.createElement("a");
          var blob = new Blob([conf.join("")], { type: "text/xml" });
          element.setAttribute("href", window.URL.createObjectURL(blob));
          element.setAttribute("download", "config.xml");
          document.body.appendChild(element);
          element.click();
          document.body.removeChild(element);
        } else {
          // Preview the map
          var url = "";
          if (data.success && data.filepath) {
            // Build a short and readable URL for the map
            if (_conf.mviewer_short_url && _conf.mviewer_short_url.used) {
              var filePathWithNoXmlExtension = "";
              //Get path from mviewer/apps eg store for mviewer/apps/store
              if (_conf.mviewer_short_url.apps_folder) {
                filePathWithNoXmlExtension = [
                  _conf.mviewer_short_url.apps_folder,
                  data.filepath,
                ].join("/");
              } else {
                filePathWithNoXmlExtension = data.filepath;
              }
              if (filePathWithNoXmlExtension.endsWith(".xml")) {
                filePathWithNoXmlExtension = filePathWithNoXmlExtension.substring(
                  0,
                  filePathWithNoXmlExtension.length - 4
                );
              }
              url = _conf.mviewer_instance + "#" + filePathWithNoXmlExtension;
            } else {
              // Build a classic URL for the map
              url =
                _conf.mviewer_instance +
                "?config=" +
                _conf.conf_path_from_mviewer +
                data.filepath;
            }
            window.open(url, "mvs_vizualize");
          }
        }
      },
      error: function (xhr, status, error) {
        console.error("map file save failed", {
          xhr: xhr,
          status: status,
          error: error,
        });
        alert(
          "Echec de la sauvegarde du fichier.\nVeuillez consulter votre administrateur."
        );
      },
    });
  } else {
    alert("Document xml invalide");
  }
};

var addgeoFilter = function () {
  var layername = $(".layers-list-item.active").attr("data-layerid");
  map2.updateSize();
  draw = new ol.interaction.Draw({
    source: source,
    type: "Polygon",
  });
  draw.on("drawend", function (e) {
    source.clear();
    var currentFeature = e.feature; //this is the feature fired the event
    var layer = config.temp.layers[layername];
    var projGeom = e.feature
      .getGeometry()
      .clone()
      .transform("EPSG:3857", layer.projection);
    var format = new ol.format.WKT();
    var wktRepresenation = format.writeGeometry(projGeom);
    $("#frm-filter").val(
      "INTERSECTS(" + layer.geometry + "," + wktRepresenation + ")"
    );
    $("#filter_wizard").hide();
  });
  map2.addInteraction(draw);
};

var extractFeatures = function (fld, option) {
  var layerid = $(".layers-list-item.active").attr("data-layerid");
  var layer = config.temp.layers[layerid];
  ogc.getFeatures(layer.wfs_url, layerid, fld, option);
  if (option === "control") {
    $("#frm-attributelabel").val(fld);
  }
};

var loadApplicationParametersFromFile = function () {
  var file = document.getElementById("filebutton").files[0];
  if (file) {
    var reader = new FileReader();
    reader.readAsText(file, "UTF-8");
    reader.onload = function (evt) {
      var xml = $.parseXML(evt.target.result);
      mv.parseApplication(xml);
    };
    reader.onerror = function (evt) {
      alert("error reading file");
    };
  }
};

var deleteMyApplications = function () {
  $.ajax({
    type: "GET",
    url: "srv/delete.php",
    success: function (data) {
      alert(data.deleted_files + " application(s) supprimée(s)");
      mv.getListeApplications();
    },
    error: function (xhr, ajaxOptions, thrownError) {
      console.error("map files deletion failed", {
        xhr: xhr,
        ajaxOptions: ajaxOptions,
        thrownError: thrownError,
      });
      alert(
        "Echec de la requête de suppression.\nVeuillez consulter votre administrateur."
      );
    },
  });
};

var loadApplicationParametersFromRemoteFile = function (url) {
  $.ajax({
    type: "GET",
    url: url,
    headers: {
      "Cache-Control": "private, no-store, max-age=0",
    },
    success: function (data) {
      mv.parseApplication(data);
    },
    error: function (xhr, ajaxOptions, thrownError) {
      console.error("map file retrieval failed", {
        xhr: xhr,
        ajaxOptions: ajaxOptions,
        thrownError: thrownError,
      });
      alert(
        "Echec de la requête de récupération de l'application.\nVeuillez consulter votre administrateur."
      );
    },
  });
};

var loadApplicationParametersFromWMC = function (url) {
  $.ajax({
    type: "GET",
    url: url,
    success: function (data) {
      mv.parseWMC(data);
    },
    error: function (xhr, ajaxOptions, thrownError) {
      console.error("web map context (WMC) file retrieval failed", {
        xhr: xhr,
        ajaxOptions: ajaxOptions,
        thrownError: thrownError,
      });
      alert(
        "Echec de la récupération du fichier Web Map Context (WMC).\nVeuillez consulter votre administrateur."
      );
    },
  });
};

var updateTheme = function (el) {
  var cls = $("#" + el.id + " option[value='" + el.value + "']").text();
  $(el)
    .removeClass()
    .addClass("form-control " + cls);
};

document.querySelector('#opt-style').addEventListener('change', updateTheme)

var setActiveProvider = function (el) {
  $(el).parent().parent().find(".active").removeClass("active");
  $(el).parent().addClass("active");
  updateProviderSearchButtonState();
};

var updateProviderSearchButtonState = function () {
  var active_provider_item = $("#providers_list").find(".active");
  if (active_provider_item) {
    $("#providers_dropdown").html(
      active_provider_item.text() + ' <span class="caret"/>'
    );
    $("#search-message").text("");
    $("#search-message").hide();
    $("#provider_search_btn").prop("disabled", false);
  } else {
    $("#provider_search_btn").prop("disabled", true);
    $("#search-message").text(
      "Aucun fournisseur sélectionné. Veuillez en choisir un."
    );
    $("#search-message").show();
  }
};

var addNewProvider = function (el) {
  var frm = $(el).closest("div");
  var url = frm.find("input.custom-url").val();
  var type = frm.find("select").val();
  var title = frm.find("input.custom-title").val();

  if (title && url) {
    $("#providers_list")
      .append(
        '<li><a onclick="setActiveProvider(this);" data-providertype="' +
          type +
          '" data-provider="' +
          url +
          '" href="#">' +
          title +
          "</a></li>"
      )
      .trigger("click");
    frm.find("input.custom-url").val("");
    frm.find("input.custom-title").val("");
    updateAddProviderButtonState(el);
  }
};

var updateAddProviderButtonState = function (el) {
  var frm = $(el).closest("div");
  var url = frm.find("input.custom-url").val();
  var title = frm.find("input.custom-title").val();
  $("#add_provider_btn").prop("disabled", !(url && title));
};

$("#mod-featuresview").on("hidden.bs.modal", function () {
  var option = $(this).attr("data-target");
  var target = "";
  if (option === "source") {
    target = "#source_fields_tags";
  }
  if (option === "control") {
    target = "#control_fields_tags";
  }
  $("#distinct_values a.active").each(function (id, fld) {
    $(target).tagsinput("add", $(fld).text());
  });
});

$('a[href="#geo_filter"]').on("shown.bs.tab", function (e) {
  addgeoFilter();
});

$(".checkedurl").change(mv.checkURL);

$("#mod-importfile").on("shown.bs.modal", function () {
  mv.getListeApplications();
});
