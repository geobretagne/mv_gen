export default (function () {
  var _wmsLayerProperties = {
    layerType: "wms",
    tiled: false,
    url: "",
    infoFormat: "text/html",
  };

  var _userInfo = {
    name: undefined,
    groupSlugName: undefined,
    groupFullName: undefined,
  };

  const _layerProperties = function (wms_capabilities) {
    //todo
  };

  return {
    setDefaultLayerProperties: function (defaultParams) {
      if (defaultParams.info_format)
        _wmsLayerProperties.infoFormat = defaultParams.info_format;
      if (defaultParams.layer_tiled)
        _wmsLayerProperties.tiled = defaultParams.tiled;
      if (defaultParams.layer_type)
        _wmsLayerProperties.layerType = defaultParams.layer_type;
    },

    showCSWResults: function (results) {
      var html = [];
      $.each(results, function (index, result) {
        var _abstract =
          result.abstract.length > 200
            ? result.abstract.substring(0, 200) + "..."
            : result.abstract;
        var div = [];
        div.push(
          '<div class="ogc-result csw-result col-sm-12 col-md-12" data-title="' +
            result.title +
            '"'
        );
        div.push(' data-layerid="' + result.layerid + '"');
        if (result.metadata) {
          div.push(' data-metadata="' + result.metadata + '"');
        }
        if (result["metadata-csw"]) {
          div.push(' data-metadata-csw="' + result["metadata-csw"] + '"');
        }
        if (result.wms) {
          div.push(' data-url="' + result.wms + '"');
        }
        if (result.attribution) {
          div.push(' data-type="wms"');
        }
        div.push(">");
        div.push(
          '<div class="checkbox">',
          '<label><input id="' +
            result.layerid +
            '-ck" type="checkbox" aria-label="..."><strong>' +
            result.title +
            "</strong></label>",
          "</div>",
          "<small>" + _abstract + "</small>",
          "</div>"
        );

        html.push(div.join(""));
      });
      $("#csw-results").append(html).show();

      if (results.length > 0) {
        $("#search-message").text("");
        $("#search-message").hide();
      } else {
        $("#search-message").text("Aucun résultat pour cette recherche.");
      }
    },

    showBaseLayers: function (data, classe) {
      var html = [];
      var html2 = [];
      $.each(data, function (index, l) {
        var div = [
          '<div class="' +
            classe +
            ' bl col-sm-6 col-md-3" data-title="' +
            l.label +
            '" data-layerid="' +
            l.id +
            '" >',
          '<div class="thumbnail">',
          '<input id="' + l.id + '-bl" type="checkbox" aria-label="...">',
          '<img class="card-img-top" src="' + l.thumbgallery + '">',
          '<div class="caption">',
          "<h4>" + l.label + "</h4>",
          "<p>" + l.title + "</p>",
          "</div>",
          "</div>",
          "</div>",
        ].join("");
        html.push(div);
        html2.push(
          '<option disabled value="' +
            l.id +
            '" >' +
            l.label +
            " - " +
            l.title +
            "</option>"
        );
      });
      $("#frm-bl").append(html);
      $("#frm-bl-visible").append(html2);
      $(".bl." + classe + " input").bind("change", function (e) {
        var id = $(this).parent().parent().attr("data-layerid");
        var value = $(e.currentTarget).prop("checked");
        if (value === true) {
          console.log("baselayer %s: checked", id);
          $("#frm-bl-visible option[value='" + id + "']").removeAttr(
            "disabled"
          );
        } else {
          console.log("baselayer %s: unchecked", id);
          $("#frm-bl-visible option[value='" + id + "']").attr(
            "disabled",
            "disabled"
          );
        }
      });
    },

    showStyles: function (styles, layerid) {
      $("#frm-lis-styles .layer-style").remove();
      $("#frm-sld").val("");
      var themeid = $("#theme-edit").attr("data-themeid");
      function getLayerbyId(l) {
        return l.id === layerid;
      }
      var layer = config.themes[themeid].layers.find(getLayerbyId);
      if (layer.sld) {
        $("#frm-sld").val(layer.sld);
      }
      var html = [];
      $(styles).each(function (id, style) {
        var div = [
          '<div class="layer-style col-sm-6 col-md-4" name="' +
            style.name +
            '" data-legendurl="' +
            style.src +
            '" data-stylename="' +
            style.name +
            '" data-layerid="' +
            layerid +
            '" >',
          '<div class="thumbnail">',
          '<img src="' + style.src + '">',
          '<div class="caption">',
          "<span>" + style.name + "</span>",
          "</div>",
          '<input id="' +
            style.name +
            '-style-alias" type="text" value="' +
            style.name +
            '" >',
          '<input id="' +
            style.name +
            '-style-selection" type="checkbox" aria-label="...">',
          "</div>",
        ].join("");
        html.push(div);
      });
      $("#frm-lis-styles").append(html);
      if (layer.style && layer.style != "") {
        var styles = layer.style.split(",");
        var aliases;
        switch (styles.length) {
          case 1:
            $(
              ".layer-style[name='" + layer.style + "'] input[type='checkbox']"
            ).prop("checked", "checked");
            break;
          default:
            aliases = layer.stylesalias.split(",");
            for (var i = 0; i <= styles.length; i++) {
              $(
                ".layer-style[name='" + styles[i] + "'] input[type='checkbox']"
              ).prop("checked", "checked");
              $(
                ".layer-style[name='" + styles[i] + "'] input[type='text']"
              ).val(aliases[i]);
            }
        }
      }
    },

    showDistinctValues: function (values, option) {
      console.log("showDistinctValues option: %s", option);
      var html = [];
      $.each(values, function (id, value) {
        html.push(
          '<a onclick="$(this).toggleClass(\'active\');" class="list-group-item">' +
            value +
            "</a>"
        );
      });
      $("#distinct_values a").remove();
      $("#distinct_values").append(html.join(" "));
      $("#mod-featuresview").modal();
      $("#mod-featuresview").attr("data-target", option);
    },

    saveSourceAttributeFilter: function () {
      var values = [];
      var layerid = $(".layers-list-item.active").attr("data-layerid");
      var fld = $("#attribute_filter_fields").val();
      var operator = $("#attribute_filter_operators").val();
      var selected = $("#source_fields_tags").tagsinput("items");
      var type = config.temp.layers[layerid].fields[fld].type;

      $.each(selected, function (id, value) {
        if (type === "string") {
          values.push("'" + value + "'");
        } else {
          values.push(value);
        }
      });
      var expression = "";
      if (operator === "=") {
        expression = values[0];
      } else {
        expression = "(" + values.join(",") + ")";
      }
      filter = fld + " " + operator + " " + expression;
      $("#frm-filter").val(filter);
      $("#filter_wizard").hide();
    },

    showFields: function (fields, layerid) {
      $("#frm-lis-fields .row.fld").remove();
      $("#attribute_filter_fields option").remove();
      $("#opt-attributefield option").remove();
      var themeid = $("#theme-edit").attr("data-themeid");
      function getLayerbyId(l) {
        return l.id === layerid;
      }
      var layer = config.themes[themeid].layers.find(getLayerbyId);
      $(fields).each(function (id, fld) {
        if (config.temp.layers[layerid].fields[fld]) {
          $("#attribute_filter_fields, #opt-attributefield").append(
            '<option value="' + fld + '">' + fld + "</option>"
          );
        }
        //name, alias, type
        var alias = "";
        var selected = "";
        if (layer.fieldsoptions && layer.fieldsoptions[fld]) {
          alias = layer.fieldsoptions[fld].alias;
          selected = "selected";
        } else {
          alias = fld;
          selected = "";
        }
        var item = [
          '<div class="row fld ' + selected + '" data-field="' + fld + '" >',
          '<div class="col-md-3 fld-name">' + fld + "</div>",
          '<div class="col-md-3 fld-alias">',
          '<input type="text" value="' + alias + '" class="form-control">',
          "</div>",
          '<div class="col-md-3 fld-option">',
          '<select class="form-control" onchange="mv.fieldTypeSelectionChange(this)">',
          '<option value="false">Non utilisé</option>',
          '<option value="title">Titre</option>',
          '<option value="link">Lien</option>',
          '<option value="image">Image</option>',
          '<option value="text">Texte</option>',
          "</select>",
          "</div>",
          "</div>",
        ].join("");

        $("#frm-lis-fields").append(item);
        if (layer.fieldsoptions && layer.fieldsoptions[fld]) {
          $(
            "#frm-lis-fields .fld[data-field='" +
              fld +
              "'] option[value='" +
              layer.fieldsoptions[fld].type +
              "']"
          ).prop("selected", "selected");
        }
      });
      if (layer.attributefilter && layer.attributefield) {
        $("#opt-attributefield").val(layer.attributefield);
      }
      if (layer.usetemplate && layer.template) {
        mv.parseTemplate(
          layer.template.split("{{#features}}")[1].split("{{/features}}")[0]
        );
      }
    },

    showWMSResults: function (results) {
      var html = [];
      var nb_results = 0;

      $.each(results, function (index, result) {
        // Only layers with :
        // - a name
        // - a bbox
        // - a parent layer
        // should be displayed (those with no name should not be used by client applications)
        if (
          result.layerid !== undefined &&
          result.bbox &&
          result.bbox.length > 0 &&
          result.parentLayerId !== undefined
        ) {
          var _abstract =
            result.abstract.length > 200
              ? result.abstract.substring(0, 200) + "..."
              : result.abstract;
          var div = [];
          div.push(
            '<div class="ogc-result wms-result col-sm-12 col-md-12" data-title="' +
              result.title +
              '"'
          );
          div.push(' data-layerid="' + result.layerid + '"');
          if (result.metadata) {
            div.push(' data-metadata="' + result.metadata + '"');
          }
          if (result["metadata-csw"]) {
            div.push(' data-metadata-csw="' + result["metadata-csw"] + '"');
          }
          if (result.wms) {
            div.push(' data-url="' + result.wms + '"');
          }
          if (result.attribution) {
            div.push(' data-type="wms"');
          }
          div.push(">");
          div.push(
            '<div class="checkbox">',
            '<label><input id="' +
              result.layerid +
              '-ck" type="checkbox" aria-label="..."><strong>' +
              result.extTitle +
              "</strong></label>",
            "</div>",
            "<small>" + _abstract + "</small>",
            "</div>"
          );
          html.push(div.join(""));
          nb_results++;
        }
      });
      $("#wms-results").append(html).show();

      if (nb_results > 0) {
        $("#search-message").text("");
        $("#search-message").hide();
      } else {
        $("#search-message").text("Aucun résultat pour cette recherche.");
      }
    },

    getConfLayers: function () {
      var selected_layers = $(".ogc-result input[type='checkbox']:checked");
      var counter = 0;
      var ogc_type = "";
      selected_layers.each(function (i, ctl) {
        if (ctl.checked) {
          var conf = $(ctl).closest(".ogc-result").data();
          if (counter > 0) {
            addLayer("Nouvelle couche");
            $(".list-group-item.layers-list-item")
              .removeClass("active")
              .last()
              .addClass("active");
          }
          $(".layers-list-item.active")
            .attr("data-type", _wmsLayerProperties.layerType)
            .attr("data-url", conf.url)
            .attr("data-layerid", conf.layerid)
            .attr("data-title", conf.title)
            .attr("data-queryable", "true")
            .attr("infoformat", _wmsLayerProperties.infoFormat)
            .attr("data-metadata", conf.metadata)
            .attr("data-metadata-csw", conf.metadataCsw)
            .attr("visible", true)
            .attr("data-attribution", conf.attribution)
            .find(".layer-name")
            .text(conf.layerid);

          var layer = {
            id: conf.layerid,
            title: conf.title,
            name: conf.title,
            type: _wmsLayerProperties.layerType,
            url: conf.url,
            queryable: true,
            attribution: conf.attribution,
            infoformat: _wmsLayerProperties.infoFormat,
            tiled: _wmsLayerProperties.tiled,
            metadata: conf.metadata,
            "metadata-csw": conf.metadataCsw,
            visible: true,
          };

          config.themes[$("#theme-edit").attr("data-themeid")].layers.push(
            layer
          );
        }
        counter += 1;
      });
      $("#mod-layerNew").modal("hide");
      //remove selection from results
      $(".ogc-result input[type='checkbox']:checked").prop("checked", false);
    },

    resetSearch: function () {
      $("#csw-results .csw-result").remove();
      $("#wms-results .wms-result").remove();
      $("#wfs-results .wfs-result").remove();
    },

    fieldTypeSelectionChange: function (select) {
      if ($(select).val() === "false") {
        $(select).closest(".fld").removeClass("selected");
      } else {
        $(select).closest(".fld").addClass("selected");
      }
    },

    showLayerOptions: function (el) {
      //clear forms
      $("#layer_conf1 form").trigger("reset");
      $("#layer_conf2 form").trigger("reset");
      $("#frm-lis-fields").empty();
      $("#layer_conf3 form").trigger("reset");
      $("#frm-lis-styles").empty();
      $("#layer_conf4 form").trigger("reset");
      $("#layer_conf5 form").trigger("reset");
      $("#layer_conf6 form").trigger("reset");
      $("input[data-role='tagsinput']").tagsinput("removeAll");
      $("#layer_sections>.tab-pane")
        .removeClass("active")
        .first()
        .addClass("active");
      $("#layer_sections_menu li")
        .removeClass("active")
        .first()
        .addClass("active");

      var layerid = el.attr("data-layerid");
      var themeid = $("#theme-edit").attr("data-themeid");

      function getLayerbyId(l) {
        return l.id === layerid;
      }
      var layer = config.themes[themeid].layers.find(getLayerbyId);

      $("#frm-type").val(layer.type).trigger("change");
      $("#frm-name").val(layer.title);
      $("#frm-scalemin").val(layer.scalemin);
      $("#frm-scalemax").val(layer.scalemax);
      $("#frm-opacity").val(layer.opacity);
      $("#frm-legendurl").val(layer.legendurl);
      $("#frm-layerid").val(layer.id);
      $("#frm-url").val(layer.url);
      $("#frm-queryable").prop("checked", layer.queryable);
      $("#frm-featurecount").val(layer.featurecount);
      $("#frm-infopanel option[value='" + layer.infopanel + "']").prop(
        "selected",
        true
      );
      $("#frm-secure").val(layer.secure);
      $("#frm-useproxy").prop("checked", layer.useproxy);
      $("#frm-searchable").prop("checked", layer.searchable);
      $("#frm-searchengine").val(layer.searchengine).trigger("change");
      $("#frm-fusesearchkeys").val(layer.fusesearchkeys);
      $("#frm-fusesearchresult").val(layer.fusesearchresult);
      $("#frm-infoformat option[value='" + layer.infoformat + "']")
        .prop("selected", true)
        .trigger("change");
      if (layer.metadata) {
        $("#frm-metadata").val(layer.metadata);
      }
      if (layer["metadata-csw"]) {
        $("#frm-metadata-csw").val(layer["metadata-csw"]);
      }
      $("#frm-visible").prop("checked", layer.visible);
      $("#frm-tiled").prop("checked", layer.tiled);
      $("#frm-attribution").val(layer.attribution);
      $("#frm-filter").val(layer.filter);
      if (layer.attributefilter) {
        $("#frm-attributelabel").val(layer.attributelabel);
        layer.attributevalues.split(",").forEach(function (value, id) {
          $("#control_fields_tags").tagsinput("add", value);
        });
      }
      if (layer.usetemplate && layer.templateurl) {
        $("#frm-template").prop("checked", true);
        $("#frm-template-url").val(layer.templateurl);
        console.log(
          "referenced template from layer %s: %s",
          layer.id,
          layer.templateurl
        );
      }
      $(".checkedurl").trigger("change");
      if (layer.type === "wms") {
        $("a[href='#layer_conf4']").parent().show();
        $("a[href='#layer_conf5']").parent().show();
        ogc.getFieldsFromWMS(layer.url, layerid);
        ogc.getStylesFromWMS(layer.url, layerid);
      } else {
        $("a[href='#layer_conf4']").parent().hide();
        $("a[href='#layer_conf5']").parent().hide();
      }
    },

    writeFieldsOptions: function (layer) {
      console.groupCollapsed("writeFieldsOptions");
      var aliases = [];
      var fields = [];
      var template = { title: "", text: [], photo: [], link: [], template: [] };

      $.each(layer.fieldsoptions, function (index, options) {
        if (layer.usetemplate) {
          switch (options.type) {
            case "title":
              template.title =
                '<h3 class="title-feature">{{' + options.name + "}}</h3>";
              break;
            case "text":
              template.text.push(
                '<div class="feature-text"><span>' +
                  options.alias +
                  ":</span> {{" +
                  options.name +
                  "}}</div><br/>"
              );
              break;
            case "image":
              template.photo.push(
                '<img src="{{' +
                  options.name +
                  '}}" class="img-responsive" style="margin-top:5%;" />'
              );
              break;
            case "link":
              template.link.push(
                '<a href="{{' +
                  options.name +
                  '}}" target="_blank">' +
                  options.alias +
                  "</a>"
              );
              break;
          }
        } else {
          if (options.type === "title") {
            fields.unshift(options.name);
            aliases.unshift(options.alias);
          } else {
            fields.push(options.name);
            aliases.push(options.alias);
          }
        }
      });
      if (layer.usetemplate && !layer.templateurl) {
        template.template.push("{{#features}}");
        template.template.push('<li class="item" style="width:238px;">');
        template.template.push(template.title);
        template.template.push('<p class="text-feature">');
        $(template.text).each(function (index, text) {
          template.template.push(text);
        });
        template.template.push("</p>");
        $(template.photo).each(function (index, image) {
          template.template.push(image);
        });
        $(template.link).each(function (index, link) {
          template.template.push(link);
        });
        template.template.push("</li>");
        template.template.push("{{/features}}");
        layer.template = template.template.join(" \n");
        console.log("layer.template:", layer.template);
      } else {
        layer.fields = fields.join(",");
        layer.aliases = aliases.join(",");
        console.log("layer.fields:", layer.fields);
        console.log("layer.aliases:", layer.aliases);
      }
      console.groupEnd("writeFieldsOptions");
    },

    saveLayerOptions: function () {
      var el = $(".layers-list-item.active");
      var layerid = el.attr("data-layerid");
      var themeid = $("#theme-edit").attr("data-themeid");
      function getLayerbyId(l) {
        return l.id === layerid;
      }
      var layer = config.themes[themeid].layers.find(getLayerbyId);
      if ($("#frm-scalemin").val() >= 0 && $("#frm-scalemax").val() > 0) {
        layer.scalemin = $("#frm-scalemin").val();
        layer.scalemax = $("#frm-scalemax").val();
      } else {
        delete layer.scalemin;
        delete layer.scalemax;
      }
      layer.type = $("#frm-type").val();
      layer.title = $("#frm-name").val();
      layer.name = $("#frm-name").val();
      layer.id = $("#frm-layerid").val();
      layer.url = $("#frm-url").val();
      layer.legendurl = $("#frm-legendurl").val();
      layer.queryable = $("#frm-queryable").prop("checked") === true;
      layer.secure = $("#frm-secure").val();
      layer.useproxy = $("#frm-useproxy").prop("checked") === true;
      layer.searchable = $("#frm-searchable").prop("checked") === true;
      layer.searchengine = $("#frm-searchengine").val();
      layer.fusesearchkeys = $("#frm-fusesearchkeys").val();
      layer.fusesearchresult = $("#frm-fusesearchresult").val();
      layer.infoformat = $("#frm-infoformat").val();
      layer.featurecount = $("#frm-featurecount").val();
      layer.infopanel = $("#frm-infopanel").val();
      layer.metadata = $("#frm-metadata").val();
      layer["metadata-csw"] = $("#frm-metadata-csw").val();
      layer["attribution"] = $("#frm-attribution").val();
      layer.visible = $("#frm-visible").prop("checked") === true;
      layer.opacity = $("#frm-opacity").val();
      layer.sld = $("#frm-sld").val();
      layer.tiled = $("#frm-tiled").prop("checked") === true;
      layer.usetemplate = $("#frm-template").prop("checked") === true;
      layer.templateurl =
        $("#frm-template-url").val() == ""
          ? false
          : $("#frm-template-url").val();
      layer.filter = $("#frm-filter").val();

      //Controle FilterAttributes
      var fld = $("#opt-attributefield").val();
      var values = $("#control_fields_tags").val();
      var label = $("#frm-attributelabel").val();
      if (values.split(",").length > 1) {
        layer.attributefilter = true;
        layer.attributefield = fld;
        layer.attributevalues = values;
        layer.attributelabel = label;
      }

      //Fields
      layer.fieldsoptions = {};
      $("#frm-lis-fields option[value!='false']:selected").each(function (
        index,
        option
      ) {
        var type = option.value;
        var field = $(option).closest(".fld").attr("data-field");
        var alias = $(option).closest(".fld").find(".fld-alias input").val();
        layer.fieldsoptions[field] = { name: field, alias: alias, type: type };
      });
      mv.writeFieldsOptions(layer);
      //Fields
      var selected_styles = $("#frm-lis-styles input[type='checkbox']:checked");
      var style_names = [];
      var style_alias = [];
      switch (selected_styles.length) {
        case 0:
          layer.style = "";
          layer.stylesalias = "";
          break;
        case 1:
          layer.style = $(selected_styles)
            .first()
            .closest(".layer-style")
            .attr("data-stylename");
          layer.stylesalias = "";
          break;
        default:
          selected_styles.each(function (index, style) {
            var name = $(style).closest(".layer-style").attr("data-stylename");
            var alias = $(style)
              .closest(".layer-style")
              .find("input[type='text']")
              .val();
            style_names.push(name);
            style_alias.push(alias);
          });
          layer.style = style_names.join(",");
          layer.stylesalias = style_alias.join(",");
      }

      $("#mod-layerOptions").modal("hide");
    },

    form2xml: function () {
      var el = $(".layers-list-item.active");
      var layerid = el.attr("data-layerid");
      var themeid = $("#theme-edit").attr("data-themeid");
      function getLayerbyId(l) {
        return l.id === layerid;
      }
      var layer = config.themes[themeid].layers.find(getLayerbyId);
      var xml = mv.writeLayerNode(layer);
      /*var reg = reg = /" /g;
            xml = xml.replace(reg, '" \r\n    ').replace('</layer>', '\r\n</layer>');*/
      $("#mod-codeview").modal();
      $("#mod-codeview pre").text(xml);
    },

    writeLayerNode: function (l) {
      var padding = function (n) {
        return "\r\n" + " ".repeat(n);
      };
      var layer_parameters = {};
      //require parameters
      var require_parameters = ["id", "name", "type", "url"];
      require_parameters.forEach(function (p, i) {
        var value = l[p];
        if (p == "url") {
          value = mv.escapeXml(value);
        }
        layer_parameters[p] = [p, '="', value, '"'].join("");
      });
      //optional parameters
      var optional_parameters = [
        "tiled",
        "visible",
        "infoformat",
        "fields",
        "aliases",
        "style",
        "stylesalias",
        "metadata",
        "metadata-csw",
        "attribution",
        "queryable",
        "searchable",
        "searchengine",
        "fusesearchkeys",
        "fusesearchresult",
        "secure",
        "useproxy",
        "filter",
        "sld",
        "legendurl",
        "scalemin",
        "scalemax",
        "featurecount",
        "infopanel",
        "opacity",
      ];
      optional_parameters.forEach(function (p, i) {
        if (l[p]) {
          var value = l[p];
          if (p == "metadata" || p == "metadata-csw" || p == "legendurl") {
            value = mv.escapeXml(l[p]);
          }
          layer_parameters[p] = [p, '="', value, '"'].join("");
        }
      });
      //more complexes parameters
      var attributefilter = "";
      if (l.attributefilter) {
        attributefilter = [
          'attributefilter="true"',
          'attributefield="' + l.attributefield + '"',
          'attributevalues="' + l.attributevalues + '"',
          'attributelabel="' + l.attributelabel + '"',
        ].join(" ");
        layer_parameters.attributefilter = attributefilter;
      }
      //template exception
      var template = "";
      if (l.usetemplate && l.template) {
        template = "<template><![CDATA[" + l.template + "]]></template>";
      }
      if (l.usetemplate && l.templateurl) {
        template = '<template url="' + l.templateurl + '" ></template>';
      }
      var layer = [padding(8) + "<layer "];
      $.each(layer_parameters, function (prop, parameter) {
        layer.push(padding(12) + parameter);
      });
      layer.push(">");
      layer.push(template);
      layer.push(padding(8) + "</layer>");

      return layer.join("");
    },

    escapeXml: function (unsafe) {
      var rep = "";
      if (unsafe) {
        rep = unsafe.replace(/[<>&"]/g, function (c) {
          switch (c) {
            case "<":
              return "&lt;";
            case ">":
              return "&gt;";
            case "&":
              return "&amp;";
            case "'":
              return "&apos;";
            case '"':
              return "&quot;";
          }
        });
      }
      return rep;
    },

    search: function () {
      $("#search-message").text("Recherche en cours...");
      $("#search-message").show();

      mv.resetSearch();
      var providerType = $(".dropdown-menu li.active>a").attr(
        "data-providertype"
      );
      var url = $(".dropdown-menu li.active>a").attr("data-provider");
      var keyword = $("#input-ogc-filter").val();
      switch (providerType) {
        case "csw":
          var metadata_baseref = $(".dropdown-menu li.active>a").attr(
            "data-metadata-app"
          );
          ogc.cswSearch(url, keyword, metadata_baseref);
          break;

        case "wms":
          ogc.wmsSearch(url, keyword);
          break;

        case "wfs":
          //fdff
          break;
      }
    },

    parseTemplate: function (tpl) {
      var title = $(tpl).find(".title-feature").text().match("{{(.*)}}")[1];
      $("#frm-lis-fields .fld[data-field='" + title + "'] .fld-option select")
        .val("title")
        .trigger("change");
      var texts = [];
      var photos = [];
      var links = [];
      $(tpl)
        .find(".feature-text")
        .each(function (i, t) {
          var text = $(t).text().match("{{(.*)}}")[1];
          var alias = $(t).find("span").text().split(":")[0];
          texts.push({ text: text, alias: alias });
          $(
            "#frm-lis-fields .fld[data-field='" + text + "'] .fld-option select"
          )
            .val("text")
            .trigger("change");
          $(
            "#frm-lis-fields .fld[data-field='" + text + "'] .fld-alias input"
          ).val(alias);
        });
      $(tpl)
        .find("img")
        .each(function (i, img) {
          var photo = $(img).attr("src").match("{{(.*)}}")[1];
          photos.push(photo);
          $(
            "#frm-lis-fields .fld[data-field='" +
              photo +
              "'] .fld-option select"
          )
            .val("image")
            .trigger("change");
        });
      $(tpl)
        .find("a")
        .each(function (i, a) {
          var link = $(a).attribute("href").match("{{(.*)}}")[1];
          var alias = $(a).text();
          links.push({ link: link, alias: alias });
          $(
            "#frm-lis-fields .fld[data-field='" + link + "'] .fld-alias input"
          ).val(alias);
          $(
            "#frm-lis-fields .fld[data-field='" + link + "'] .fld-option select"
          )
            .val("link")
            .trigger("change");
        });

      console.log("parseTemplate:", {
        title: title,
        texts: texts,
        photos: photos,
        links: links,
      });
    },

    showHideQueryParameters: function (value) {
      if (value === "application/vnd.ogc.gml") {
        $("#query-parameters").addClass("visible");
      } else {
        $("#query-parameters").removeClass("visible");
      }
    },

    changeVisibleBaseLayer: function (visibleBaselayer) {
      $(".bl").removeClass("visible");
      $(".bl[data-layerid='" + visibleBaselayer + "']").addClass("visible");
    },

    changeGlobalSearch: function (value) {
      switch (value) {
        case "false":
          $("#searchelasticsearch_options").hide();
          break;
        case "elasticsearch":
          $("#searchelasticsearch_options").show();
          break;
      }
    },

    changeSearchLocalities: function (value) {
      switch (value) {
        case "false":
          $("#searchlocalities_options").hide();
          $("#opt-searchlocalities-url").val("");
          break;
        case "ban":
          $("#searchlocalities_options").show();
          $("#opt-searchlocalities-url").val(
            "https://api-adresse.data.gouv.fr/search/"
          );
          break;
        case "geoportail":
          $("#opt-searchlocalities-url").val("");
          $("#searchlocalities_options").show();
          break;
      }
    },

    changeSearchEngine: function (value) {
      if (value === "fuse") {
        $("#fuse_options").show();
      } else {
        $("#fuse_options").hide();
      }
    },

    changeLayerType: function (value) {
      switch (value) {
        case "wms":
          $("#frm-searchengine option[value='fuse']").attr(
            "disabled",
            "disabled"
          );
          break;
        case "geojson":
          $("#frm-searchengine option[value='fuse']").removeAttr("disabled");
          break;
      }
    },

    ajaxURL: function (url) {
      if (url.indexOf("&amp;") > 0) {
        url = $.parseHTML(url)[0].nodeValue;
      }
      var _proxy = _conf.proxy;
      // relative path
      if (url.indexOf("http") != 0) {
        return _conf.mviewer_instance + url;
      }
      // same domain
      else if (url.indexOf(location.protocol + "//" + location.host) === 0) {
        return url;
      } else if (_proxy) {
        return _proxy + encodeURIComponent(url);
      } else {
        return url;
      }
    },

    checkURL: function (e) {
      var ctrl = e.currentTarget;
      var url = mv.ajaxURL(ctrl.value);
      $.ajax({
        context: this,
        type: "HEAD",
        async: true,
        url: url,
        success: function (data, status, xhr, ctrl) {
          if (xhr.status === 200) {
            $(this).css("color", "green");
          }
        },
        error: function (data, status, xhr) {
          $(this).css("color", "red");
        },
      });
    },

    createDublinCore(data) {
      var d = new Date();
      var thedate = d.toISOString().split("T")[0];
      var thedate = d.toISOString();
      var themes = [];
      var creator = "anonymous";
      var publisher = "anonymous";

      if (_userInfo.groupSlugName) {
        publisher = _userInfo.groupSlugName;
      }

      $.each(data.themes, function (id, theme) {
        themes.push("<dc:subject>" + theme.title + "</dc:subject>");
      });

      var dc = [
        '<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:dc="http://purl.org/dc/elements/1.1/">',
        '<rdf:Description rdf:about="http://www.ilrt.bristol.ac.uk/people/cmdjb/">',
        "<dc:title>" + data.title + "</dc:title>",
        "<dc:creator>" + creator + "</dc:creator>",
        "<dc:publisher>" + publisher + "</dc:publisher>",
        themes.join("\r\n"),
        "<dc:date>" + thedate + "</dc:date>",
        "</rdf:Description>",
        "</rdf:RDF>",
      ].join("\r\n");
      return dc;
    },

    parseWMC(xml) {
      newConfiguration();
      var wmc = $("ViewContext", xml);
      var themeid = createId("theme");
      var wmc_extent = {};
      wmc_extent.srs = $(wmc).find("General > BoundingBox").attr("SRS");
      wmc_extent.minx = parseInt(
        $(wmc).find("General > BoundingBox").attr("minx")
      );
      wmc_extent.miny = parseInt(
        $(wmc).find("General > BoundingBox").attr("miny")
      );
      wmc_extent.maxx = parseInt(
        $(wmc).find("General > BoundingBox").attr("maxx")
      );
      wmc_extent.maxy = parseInt(
        $(wmc).find("General > BoundingBox").attr("maxy")
      );
      var map_extent = ol.proj.transformExtent(
        [wmc_extent.minx, wmc_extent.miny, wmc_extent.maxx, wmc_extent.maxy],
        wmc_extent.srs,
        "EPSG:3857"
      );
      var title = $(wmc).find("General > Title").text() || $(wmc).attr("id");
      $("#opt-title").val(title).trigger("change");
      map.getView().fit(map_extent, { size: map.getSize() });
      addTheme(title, false, themeid, "fas fa-angle-right");
      $(wmc)
        .find("LayerList > Layer")
        .each(function () {
          // we only consider queryable layers
          if ($(this).attr("queryable") == "1") {
            var layer = {
              id: $(this).children("Name").text(),
              type: "wms",
              tiled: false,
              title: $(this).children("Name").text(),
              name: $(this).children("Name").text(),
              url: mv.escapeXml(
                $(this).find("Server > OnlineResource").attr("xlink:href")
              ),
              queryable: true,
              featurecount: 10,
              infopanel: "right-panel",
              infoformat: "text/html",
              metadata: mv.escapeXml(
                $(this).find("MetadataURL > OnlineResource").attr("xlink:href")
              ),
              "metadata-csw": mv.escapeXml(
                mv.gessCSW(
                  $(this)
                    .find("MetadataURL > OnlineResource")
                    .attr("xlink:href")
                )
              ),
              attribution:
                $(this).find("attribution").find("Title").text() || "",
              visible: $(this).attr("hidden") === "0" ? true : false,
              opacity: parseFloat($(this).find("opacity").text() || "1"),
              style: $(this)
                .find("StyleList  > Style[current='1'] > Name")
                .text(),
              sld: mv.escapeXml(
                $(this)
                  .find(
                    "StyleList  > Style[current='1'] > SLD > OnlineResource"
                  )
                  .attr("xlink:href")
              ),
            };
            var minscale = parseFloat(
              $(this).find("MinScaleDenominator").text()
            );
            var maxscale = parseFloat(
              $(this).find("MaxScaleDenominator").text()
            );
            if (!isNaN(minscale) || !isNaN(maxscale)) {
              layer.scale = {};
              if (!isNaN(minscale)) {
                layer.scale.min = minscale;
              }
              if (!isNaN(maxscale)) {
                layer.scale.max = maxscale;
              }
            }
            if (
              !layer.sld &&
              $(this).find("StyleList  > Style > Name").length > 1
            ) {
              layer.styles = $(this)
                .find("StyleList  > Style > Name")
                .map(function (id, name) {
                  return $(name).text();
                })
                .toArray()
                .join(",");
              layer.stylesalias = layer.styles;
            }
            config.themes[themeid].layers.push(layer);
          }
          var nb_layers = $(wmc).find("LayerList > Layer").length;
          $('.themes-list-item[data-themeid="' + themeid + '"]')
            .find(".label")
            .text(nb_layers);
        });
    },

    parseApplication(xml) {
      console.groupCollapsed("parseApplication");
      newConfiguration();
      var proxy = $(xml).find("proxy");
      var olscompletion = $(xml).find("olscompletion");
      if (olscompletion && olscompletion.attr("type")) {
        $("#frm-searchlocalities")
          .val(olscompletion.attr("type"))
          .trigger("change");
      }
      if (olscompletion && olscompletion.attr("url")) {
        $("#opt-searchlocalities-url").val(olscompletion.attr("url"));
      }
      if (olscompletion && olscompletion.attr("attribution")) {
        $("#opt-searchlocalities-attribution").val(
          olscompletion.attr("attribution")
        );
      }
      var elasticsearch = $(xml).find("elasticsearch");
      if (elasticsearch && elasticsearch.attr("url")) {
        $("#frm-globalsearch").val("elasticsearch").trigger("change");
        [
          "url",
          "geometryfield",
          "linkid",
          "doctype",
          "mode",
          "version",
        ].forEach(function (param, id) {
          $("#opt-elasticsearch-" + param).val(elasticsearch.attr(param));
        });
      }
      var searchparameters = $(xml).find("searchparameters");
      if (searchparameters && searchparameters.attr("bbox")) {
        $("#opt-elasticsearch-bbox").prop(
          "checked",
          searchparameters.attr("bbox") === "true"
        );
      }
      if (searchparameters && searchparameters.attr("features")) {
        $("#opt-searchfeatures").prop(
          "checked",
          searchparameters.attr("features") === "true"
        );
      }

      [proxy].forEach(function (param, id) {
        // this parameters are not yet supported but must be saved for later
        if (param.length > 0) {
          savedParameters[param.selector] = param[0].outerHTML;
        }
      });
      //Application
      var application = $(xml).find("application");
      ["stats", "statsurl"].forEach(function (param, id) {
        // this parameters are not yet supported but must be saved for later
        var parameter = new Object();
        if (application.attr(param)) {
          parameter[param] = application.attr(param);
          savedParameters.application.push(parameter);
        }
      });
      ["title", "logo", "help", "style"].forEach(function (value, id) {
        if (application.attr(value)) {
          $("#opt-" + value)
            .val(application.attr(value))
            .trigger("change");
        }
        if (value === "style") {
          updateTheme($("#opt-" + value)[0]);
        }
      });

      [
        "exportpng",
        "measuretools",
        "showhelp",
        "coordinates",
        "togglealllayersfromtheme",
      ].forEach(function (value, id) {
        if (application.attr(value) && application.attr(value) === "true") {
          $("#opt-" + value).prop("checked", true);
        }
      });
      //Mapoptions
      var mapoptions = $(xml).find("mapoptions");
      ["projection", "maxzoom"].forEach(function (value, id) {
        if (mapoptions.attr(value)) {
          $("#opt-" + value).val(mapoptions.attr(value));
        }
      });
      map.getView().setCenter(mapoptions.attr("center").split(",").map(Number));
      map.getView().setZoom(parseInt(mapoptions.attr("zoom")));
      //BaseLayers
      var baseLayersMode = $(xml).find("baselayers").attr("style") || "default";
      $("#frm-bl-mode option[value='" + baseLayersMode + "']").prop(
        "selected",
        true
      );
      var baselayers = $(xml).find("baselayer");
      //Reinitialisation
      $(".bl input").prop("checked", false);
      $("#frm-bl-visible option").attr("disabled", "disabled");
      baselayers.each(function (i, bl) {
        var id = $(bl).attr("id");
        var savedBaselayer = {};
        $.each(bl.attributes, function (i, attr) {
          if (attr.name !== "visible") {
            savedBaselayer[attr.name] = attr.nodeValue;
          }
        });
        if (_conf.baselayers[id]) {
          $("#frm-bl .bl[data-layerid='" + id + "'] input")
            .prop("checked", true)
            .trigger("change");
        } else {
          savedParameters.baselayers[id] = savedBaselayer;
          console.log("baselayer " + id + ": unknown");
        }
      });
      mv.showBaseLayers(savedParameters.baselayers, "custom-bl");
      $("#frm-bl .custom-bl input").prop("checked", true).trigger("change");
      var visibleBaselayer = $(xml)
        .find('baselayer[visible="true"]')
        .attr("id");
      $("#frm-bl-visible").val(visibleBaselayer).trigger("change");
      //tHEMES & layers
      var themePanel = $(xml).find("themes");
      if (themePanel.attr("mini") === "true") {
        $("#opt-mini").prop("checked", true);
      }
      var themes = $(xml).find("theme");
      themes.each(function (id, th) {
        addTheme(
          $(th).attr("name"),
          $(th).attr("collapsed") || true,
          $(th).attr("id"),
          $(th).attr("icon"),
          $(th).attr("url")
        );
        var layers = $(th).find("layer");
        var counter = 0;
        layers.each(function (id, l) {
          counter += 1;
          var layer = {
            id: $(l).attr("id"),
            type: $(l).attr("type") || "wms",
            tiled: $(l).attr("tiled") === "true",
            scalemin: $(l).attr("scalemin"),
            scalemax: $(l).attr("scalemax"),
            title: $(l).attr("name"),
            name: $(l).attr("name"),
            url: $(l).attr("url"),
            queryable: $(l).attr("queryable") === "true",
            featurecount: $(l).attr("featurecount"),
            infopanel: $(l).attr("infopanel") || "right-panel",
            searchable: $(l).attr("searchable") === "true",
            searchengine: $(l).attr("searchengine"),
            fusesearchkeys: $(l).attr("fusesearchkeys"),
            fusesearchresult: $(l).attr("fusesearchresult"),
            secure: $(l).attr("secure") || "public",
            useproxy: $(l).attr("useproxy") === "true",
            infoformat: $(l).attr("infoformat"),
            metadata: $(l).attr("metadata"),
            "metadata-csw": $(l).attr("metadata-csw"),
            attribution: $(l).attr("attribution"),
            filter: $(l).attr("filter"),
            visible: $(l).attr("visible") === "true",
            opacity: $(l).attr("opacity"),
            template: $(l).find("template").text(),
            usetemplate:
              ($(l).find("template") &&
                $(l).find("template").text().length > 3) ||
              ($(l).find("template").attr("url") &&
                $(l).find("template").attr("url").length > 1),
            templateurl: false,
            fields: $(l).attr("fields"),
            fieldsoptions: false,
            aliases: $(l).attr("aliases"),
            style: $(l).attr("style"),
            stylesalias: $(l).attr("stylesalias"),
            sld: $(l).attr("sld"),
            legendurl: $(l).attr("legendurl"),
            attributefilter: $(l).attr("attributefilter") === "true",
          };
          if (layer.attributefilter) {
            layer.attributefield = $(l).attr("attributefield");
            layer.attributelabel = $(l).attr("attributelabel");
            layer.attributevalues = $(l).attr("attributevalues");
          }
          if (layer.usetemplate === true && $(l).find("template").attr("url")) {
            layer.templateurl = $(l).find("template").attr("url");
            console.log(
              "referenced template from layer %s: %s",
              layer.id,
              layer.templateurl
            );
          }
          $("#frm-template").prop("checked", layer.usetemplate);
          if (layer.fields && layer.aliases) {
            layer.fieldsoptions = {};
            $(layer.fields.split(",")).each(function (index, fld) {
              var type = "text";
              var alias = layer.aliases.split(",")[index];
              layer.fieldsoptions[fld] = {
                name: fld,
                alias: alias,
                type: type,
              };
            });
          }
          config.themes[$(th).attr("id")].layers.push(layer);
        });
        if ($(th).attr("url")) {
          $(
            ".themes-list-item[data-themeid='" + $(th).attr("id") + "'] .label"
          ).text("Ext.");
        } else {
          $(
            ".themes-list-item[data-themeid='" + $(th).attr("id") + "'] .label"
          ).text(counter);
        }
      });

      $("#mod-importfile").modal("hide");
      console.groupEnd("parseApplication");
    },

    getListeApplications() {
      $.ajax({
        type: "GET",
        url: "srv/list.php",
        success: function (data, status, xhr) {
          $("#liste_applications a").remove();
          var applications = [];
          var groups = [];
          var creators = [];

          // Get list of groups
          data.forEach(function (app) {
            if (app.group && groups.indexOf(app.group) == -1) {
              groups.push(app.group);
            }
          });

          $("#apps_group_list option").remove();
          $("#apps_group_list").append("<option>Tous</option>");
          $("#apps_group_list")
            .parent()
            .toggle(groups.length > 1);

          groups.forEach(function (group) {
            $("#apps_group_list").append("<option>" + group + "</option>");
          });

          // Get list of creators
          data.forEach(function (app) {
            if (app.creator && creators.indexOf(app.creator) == -1) {
              creators.push(app.creator);
            }
          });

          $("#apps_creator_list option").remove();
          $("#apps_creator_list").append("<option>Tous</option>");
          $("#apps_creator_list")
            .parent()
            .toggle(creators.length > 1);

          creators.forEach(function (creator) {
            $("#apps_creator_list").append("<option>" + creator + "</option>");
          });

          data
            .sort(function (map1, map2) {
              return map1.title > map2.title ? 1 : -1;
            })
            .forEach(function (app, index) {
              var items = [
                '<a href="#" class="list-group-item" data-url="' +
                  _conf.mviewer_instance +
                  app.url +
                  '"',
                'data-group="' + app.group + '"',
                'data-creator="' + app.creator + '"',
                "onclick=\"loadApplicationParametersFromRemoteFile(this.attributes['data-url'].value);\" >",
                '<h4 class="list-group-item-heading">' + app.title + "</h4>",
                '<div class="row small">',
                '<div class="col-md-6 app-creator">Auteur&nbsp;: ' +
                  app.creator +
                  "</div>",
                '<div class="col-md-6 app-date">Date&nbsp;: ' +
                  app.date +
                  "</div>",
                "</div> ",
                '<div class="row small">',
                '<div class="col-md-6 app-subjects">Thématiques&nbsp;: ' +
                  app.subjects +
                  "</div>",
              ];
              if (app.group) {
                items = items.concat([
                  '<div class="col-md-6 app-group">Groupe&nbsp;: ' +
                    app.group +
                    "</div>",
                ]);
              }
              items = items.concat(["</div>", "</a>"]);

              applications.push(items.join(" "));
            });

          $("#liste_applications").append(applications);
        },
        error: function (data, status, xhr) {
          console.error(
            "map files list retrieval from mviewerstudio backend failed",
            {
              data: data,
              status: status,
              xhr: xhr,
            }
          );
          // TODO: add a message in the file selection popup
        },
      });
    },

    gessCSW(metadata_url) {
      if (metadata_url && metadata_url.search("geonetwork") > 1) {
        var mdid = metadata_url.split("#/metadata/")[1];
        return (
          metadata_url.substring(0, metadata_url.search("geonetwork")) +
          "geonetwork/srv/eng/csw?SERVICE=CSW&VERSION=2.0.2&REQUEST=GetRecordById&elementSetName=full&ID=" +
          mdid
        );
      }
    },

    cleanURL(url) {
      var url2 = decodeURIComponent(url).split("?")[0];
      return url2;
    },

    filterApplications() {
      var filter_groups = $("#apps_group_list").prop("selectedIndex") > 0;
      var filter_creators = $("#apps_creator_list").prop("selectedIndex") > 0;
      var group = $("#apps_group_list option:selected").text();
      var creator = $("#apps_creator_list option:selected").text();

      $("#liste_applications a").each(function (index, el) {
        var app_creator = $(this).attr("data-creator");
        var app_group = $(this).attr("data-group");

        var app_group_ok = !filter_groups || app_group == group;
        var app_creator_ok = !filter_creators || app_creator == creator;

        $(this).toggle(app_group_ok && app_creator_ok);
      });
    },

    validateXML(value) {
      var isXml;
      try {
        xml = $.parseXML(value);
        isXml = true;
      } catch (e) {
        isXml = false;
      }
      return isXml;
    },

    updateUserGroupList(data) {
      var userGroups = data.user_groups;
      var userGroupsAsHtml = [];

      userGroups.forEach(function (userGroup, index) {
        var _userRole = userGroup.user_role;
        switch (_userRole) {
          case "referent":
            _userRole = "Référent";
            break;
          case "contributor":
            _userRole = "Contributeur";
            break;
        }

        var items = [
          '<a href="#" class="list-group-item"',
          " onclick=\"$('#mod-groupselection').modal('hide'); ",
          "mv.updateUserInfo('" +
            data.first_name +
            " " +
            data.last_name +
            "', ",
          "'" + userGroup.slug_name + "', ",
          "'" + userGroup.full_name.replace(/\'/g, "\\'") + "');\" >",
          '<h4 class="list-group-item-heading">' +
            userGroup.full_name +
            "</h4>",
          '<div class="row small">',
          '<div class="col-md-6">Type de groupe&nbsp;: ' +
            userGroup.group_type +
            "</div>",
          '<div class="col-md-6">Rôle pour ce groupe&nbsp;: ' +
            _userRole +
            "</div>",
          "</div>",
          "</a>",
        ];

        userGroupsAsHtml.push(items.join(" "));
      });

      $("#user_group_list").append(userGroupsAsHtml);
    },

    updateUserInfo(name, groupSlugName, groupFullName) {
      _userInfo.name = name;
      _userInfo.groupSlugName = groupSlugName;
      _userInfo.groupFullName = groupFullName;
      $("#user_connected").text(
        "Connecté en tant que " +
          _userInfo.name +
          " (" +
          _userInfo.groupFullName +
          ")"
      );
    },

    hideUserInfo() {
      $("#user_connected").hide();
      $("#menu_user_logout").hide();
    },
  };
})();
