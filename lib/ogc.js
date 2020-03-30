import $ from "jquery";

export var ogc = (function () {
  $.findNS = function (o, nodeName) {
    return o.children().filter(function () {
      if (this.nodeName)
        return this.nodeName.toUpperCase() == nodeName.toUpperCase();
      else return false;
    });
  };

  var _cswEmptyGetRecordQuery =
    '<?xml version="1.0" encoding="UTF-8"?>\
<csw:GetRecords xmlns:csw="http://www.opengis.net/cat/csw/2.0.2" service="CSW" version="2.0.2" {resultType}>\
    <csw:Query typeNames="{typeNames}">\
        <csw:ElementSetName>full</csw:ElementSetName>\
        <csw:Constraint version="1.1.0">\
            <ogc:Filter xmlns:ogc="http://www.opengis.net/ogc">\
                <ogc:Or>\
                    <ogc:PropertyIsLike wildCard="*" singleChar="." escapeChar="!">\
                        <ogc:PropertyName>Type</ogc:PropertyName>\
                        <ogc:Literal>dataset</ogc:Literal>\
                    </ogc:PropertyIsLike>\
                    <ogc:PropertyIsLike wildCard="*" singleChar="." escapeChar="!">\
                        <ogc:PropertyName>Type</ogc:PropertyName>\
                        <ogc:Literal>series</ogc:Literal>\
                    </ogc:PropertyIsLike>\
                </ogc:Or>\
            </ogc:Filter>\
        </csw:Constraint>\
    </csw:Query>\
</csw:GetRecords>';

  var _cswGetRecordQueryTemplate =
    '<?xml version="1.0" encoding="UTF-8"?>\
<csw:GetRecords xmlns:csw="http://www.opengis.net/cat/csw/2.0.2" service="CSW" version="2.0.2" {resultType}>\
    <csw:Query typeNames="{typeNames}">\
        <csw:ElementSetName>full</csw:ElementSetName>\
        <csw:Constraint version="1.1.0">\
            <ogc:Filter xmlns:ogc="http://www.opengis.net/ogc">\
                <ogc:And>\
                    <ogc:And>\
                        <ogc:Or>\
                            <ogc:PropertyIsLike wildCard="*" singleChar="." escapeChar="!">\
                                <ogc:PropertyName>Type</ogc:PropertyName>\
                                <ogc:Literal>dataset</ogc:Literal>\
                            </ogc:PropertyIsLike>\
                            <ogc:PropertyIsLike wildCard="*" singleChar="." escapeChar="!">\
                                <ogc:PropertyName>Type</ogc:PropertyName>\
                                <ogc:Literal>series</ogc:Literal>\
                            </ogc:PropertyIsLike>\
                        </ogc:Or>\
                    </ogc:And>\
                    <ogc:Or>\
                        <ogc:Or>\
                            <ogc:PropertyIsEqualTo matchCase="true">\
                                <ogc:PropertyName>Title</ogc:PropertyName>\
                                <ogc:Literal>{query}</ogc:Literal>\
                            </ogc:PropertyIsEqualTo>\
                            <ogc:PropertyIsEqualTo matchCase="true">\
                                <ogc:PropertyName>AlternateTitle</ogc:PropertyName>\
                                <ogc:Literal>{query}</ogc:Literal>\
                            </ogc:PropertyIsEqualTo>\
                            <ogc:PropertyIsEqualTo matchCase="true">\
                                <ogc:PropertyName>Identifier</ogc:PropertyName>\
                                <ogc:Literal>{query}</ogc:Literal>\
                            </ogc:PropertyIsEqualTo>\
                            <ogc:PropertyIsEqualTo matchCase="true">\
                                <ogc:PropertyName>ResourceIdentifier</ogc:PropertyName>\
                                <ogc:Literal>{query}</ogc:Literal>\
                            </ogc:PropertyIsEqualTo>\
                        </ogc:Or>\
                        <ogc:And>\
                            <ogc:Or>\
                                <ogc:PropertyIsLike matchCase="false" wildCard="*" singleChar="." escapeChar="!">\
                                    <ogc:PropertyName>Title</ogc:PropertyName>\
                                    <ogc:Literal>{query}*</ogc:Literal>\
                                </ogc:PropertyIsLike>\
                                <ogc:PropertyIsLike matchCase="false" wildCard="*" singleChar="." escapeChar="!">\
                                    <ogc:PropertyName>AlternateTitle</ogc:PropertyName>\
                                    <ogc:Literal>{query}*</ogc:Literal>\
                                </ogc:PropertyIsLike>\
                                <ogc:PropertyIsLike matchCase="false" wildCard="*" singleChar="." escapeChar="!">\
                                    <ogc:PropertyName>Abstract</ogc:PropertyName>\
                                    <ogc:Literal>{query}*</ogc:Literal>\
                                </ogc:PropertyIsLike>\
                                <ogc:PropertyIsLike matchCase="false" wildCard="*" singleChar="." escapeChar="!">\
                                    <ogc:PropertyName>Subject</ogc:PropertyName>\
                                    <ogc:Literal>{query}*</ogc:Literal>\
                                </ogc:PropertyIsLike>\
                                <ogc:PropertyIsLike matchCase="false" wildCard="*" singleChar="." escapeChar="!">\
                                    <ogc:PropertyName>OrganisationName</ogc:PropertyName>\
                                    <ogc:Literal>{query}*</ogc:Literal>\
                                </ogc:PropertyIsLike>\
                            </ogc:Or>\
                        </ogc:And>\
                    </ogc:Or>\
                </ogc:And>\
            </ogc:Filter>\
        </csw:Constraint>\
        <ogc:SortBy xmlns:ogc="http://www.opengis.net/ogc">\
            <ogc:SortProperty>\
                <ogc:PropertyName>Relevance</ogc:PropertyName>\
                <ogc:SortOrder>DESC</ogc:SortOrder>\
            </ogc:SortProperty>\
        </ogc:SortBy>\
    </csw:Query>\
</csw:GetRecords>';

  var _cswFilter = function (query, typeNames) {
    var _resultType =
      'resultType="results_with_summary" startPosition="1" maxRecords="30" xmlns:gmd="http://www.isotc211.org/2005/gmd"';
    var _typeNames = "csw:Record";
    if ((typeNames = "gmd:MD_Metadata")) {
      _resultType =
        'resultType="results" outputSchema="csw:IsoRecord" startPosition="1" maxRecords="30"';
      _typeNames = "gmd:MD_Metadata";
    }

    if (query) {
      return _cswGetRecordQueryTemplate
        .replace("{resultType}", _resultType)
        .replace("{query}", query)
        .replace("{typeNames}", _typeNames);
    } else {
      return _cswEmptyGetRecordQuery
        .replace("{resultType}", _resultType)
        .replace("{typeNames}", _typeNames);
    }
  };

  var _cswParse = function (xml, cswUrl, metadataUrl, typeNames) {
    var results = [];
    if (typeNames === "gmd:MD_Metadata") {
      $.each($(xml).find("gmd\\:MD_Metadata, MD_Metadata"), function (
        index,
        metadata
      ) {
        var layer = {};
        layer.identifier = $(metadata)
          .find("gmd\\:fileIdentifier, fileIdentifier")
          .find("gco\\:CharacterString, CharacterString")
          .text();
        layer.abstract = $(metadata)
          .find("gmd\\:identificationInfo, identificationInfo")
          .find("gmd\\:MD_DataIdentification,  MD_DataIdentification")
          .find("gmd\\:abstract, abstract")
          .find("gco\\:CharacterString, CharacterString")
          .text();
        layer.attribution = $(metadata)
          .find("gmd\\:identificationInfo, identificationInfo")
          .find("gmd\\:MD_DataIdentification,  MD_DataIdentification")
          .find("gmd\\:pointOfContact, pointOfContact")
          .find("gmd\\:CI_ResponsibleParty, CI_ResponsibleParty")
          .find("gmd\\:organisationName, organisationName")
          .find("gco\\:CharacterString, CharacterString")
          .text();
        layer.image = $(metadata)
          .find("gmd\\:identificationInfo, identificationInfo")
          .find("gmd\\:MD_DataIdentification,  MD_DataIdentification")
          .find("gmd\\:graphicOverview, graphicOverview")
          .find("gmd\\:fileName, fileName")
          .find("gco\\:CharacterString, CharacterString")
          .text();
        layer.wms = $(metadata)
          .find("gmd\\:protocol, protocol")
          .find("gco\\:CharacterString, CharacterString")
          .filter(function (index, el) {
            return $(el).text().search("OGC:WMS") >= 0;
          })
          .parent()
          .parent()
          .find("gmd\\:URL, URL")
          .text()
          .split("?")[0];
        layer.wfs = $(metadata)
          .find("gmd\\:protocol, protocol")
          .find("gco\\:CharacterString, CharacterString")
          .filter(function (index, el) {
            return $(el).text().search("OGC:WFS") >= 0;
          })
          .parent()
          .parent()
          .find("gmd\\:URL, URL")
          .text()
          .split("?")[0];
        layer.layerid = $(metadata)
          .find("gmd\\:protocol, protocol")
          .find("gco\\:CharacterString, CharacterString")
          .filter(function (index, el) {
            return $(el).text().search("OGC:WMS") >= 0;
          })
          .parent()
          .parent()
          .find("gmd\\:name, name")
          .find("gco\\:CharacterString, CharacterString")
          .text();
        layer.title = $(metadata)
          .find("gmd\\:identificationInfo, identificationInfo")
          .find("gmd\\:MD_DataIdentification,  MD_DataIdentification")
          .find("gmd\\:citation, citation")
          .find("gmd\\:CI_Citation, CI_Citation")
          .find("gmd\\:title, title")
          .find("gco\\:CharacterString, CharacterString")
          .text();
        if (metadataUrl) {
          layer.metadata = metadataUrl + layer.identifier;
        }

        var getRecordByIdParams =
          "SERVICE=CSW&VERSION=2.0.2&REQUEST=GetRecordById&ELEMENTSETNAME=full&ID&ID=" +
          layer.identifier;
        var getRecordByIdUrl = cswUrl.replace(/[?&]$/, "");
        getRecordByIdUrl =
          getRecordByIdUrl.indexOf("?") === -1
            ? getRecordByIdUrl + "?" + getRecordByIdParams
            : getRecordByIdUrl + "&" + getRecordByIdParams;
        layer["metadata-csw"] = getRecordByIdUrl;

        if (layer.layerid != "" && layer.wms != "") {
          results.push(layer);
        } else {
          console.log("incomplete metadata document: " + layer.identifier);
        }
      });
    } else {
      $.each($(xml).find("Record"), function (index, metadata) {
        var layer = {};
        layer.identifier = $(metadata).find("identifier").text();
        layer.image = $(metadata).find('[protocol="image/png"]').text();
        layer.abstract = $(metadata).find("abstract").text();
        layer.wms = $(metadata)
          .find('[protocol="OGC:WMS"]')
          .text()
          .split("?")[0];
        layer.wfs = $(metadata)
          .find('[protocol="OGC:WFS"]')
          .text()
          .split("?")[0];
        layer.layerid = $(metadata).find('[protocol="OGC:WMS"]').attr("name");
        layer.title = $(metadata).find("title").first().text();
        layer.attribution = "Attributions";
        if (metadataUrl) {
          layer.metadata = metadataUrl + layer.identifier;
        }

        var getRecordByIdParams =
          "SERVICE=CSW&VERSION=2.0.2&REQUEST=GetRecordById&ELEMENTSETNAME=full&ID&ID=" +
          layer.identifier;
        var getRecordByIdUrl = cswUrl.replace(/[?&]$/, "");
        getRecordByIdUrl =
          getRecordByIdUrl.indexOf("?") === -1
            ? getRecordByIdUrl + "?" + getRecordByIdParams
            : getRecordByIdUrl + "&" + getRecordByIdParams;
        layer["metadata-csw"] = getRecordByIdUrl;

        results.push(layer);
      });
    }

    mv.showCSWResults(results);
  };

  var _cswAjax = function (url, body, metadataUrl, typeNames) {
    $.ajax({
      type: "POST",
      url: mv.ajaxURL(url),
      crossDomain: true,
      data: body,
      dataType: "xml",
      contentType: "application/xml",
      success: function (data) {
        _cswParse(data, url, metadataUrl, typeNames);
      },
      error: function (xhr, ajaxOptions, thrownError) {
        console.error("CSW request failed", {
          url: url,
          body: body,
          xhr: xhr,
          ajaxOptions: ajaxOptions,
          thrownError: thrownError,
        });
        alert("Echec de la requête CSW :\n" + url);
      },
    });
  };

  var _wmsCapabilitiesParse = function (data, layerid) {
    var layer = $(data)
      .find("Layer Layer Name")
      .filter(function (index, name) {
        return $(name).text() === layerid;
      })
      .parent();
    var styles = layer.find("Style");
    var crs = layer.find("CRS").first().text();
    config.temp.layers[layerid].projection = crs;
    var lst = [];
    styles.each(function (index, style) {
      lst.push({
        name: $(style).find("Name").text(),
        src: $(style).find("OnlineResource").attr("xlink:href"),
      });
    });
    mv.showStyles(lst, layerid);
  };

  var _wmsParse = function (xml, keyword) {
    var results = {};
    var parentLayerId = undefined;
    var parentExtTitle = undefined;

    // Parse one Layer item and its Layer subitems
    function parseLayer(index, l) {
      var layer = {};
      var previousParentLayerId = parentLayerId;
      var previousParentExtTitle = parentExtTitle;
      var metadataUrlItemHtml;
      var metadataUrlItemXml;

      layer.abstract = $(l).find("Abstract").text();
      layer.wms = _getWmsUrlFromGetCapabilitiesUrl(
        $(xml)
          .find(
            "Capability>Request>GetCapabilities>DCPType>HTTP>Get>OnlineResource"
          )
          .attr("xlink:href")
      );
      layer.layerid = $(l).find(">Name").text();
      layer.parentLayerId = parentLayerId;
      layer.title = $(l).find(">Title").text();
      layer.bbox = $(l).find(">BoundingBox");
      if (parentLayerId) {
        layer.extTitle = parentExtTitle + " > " + layer.title;
      } else {
        layer.extTitle = layer.title;
      }
      layer.attribution = $(l).find("Attribution Title").text();

      // Get url of human readable metadata document
      metadataUrlItemHtml = $(l)
        .find("MetadataURL Format")
        .filter(function () {
          return $(this).html() == "text/html";
        })
        .parent()
        .first();
      layer["metadata"] = metadataUrlItemHtml
        .find("OnlineResource")
        .attr("xlink:href");

      // Get url of raw metadata document
      metadataUrlItemXml = $(l)
        .find("MetadataURL Format")
        .filter(function () {
          return $.inArray($(this).html(), ["text/xml", "text/plain"]) > -1;
        })
        .parent()
        .first();
      layer["metadata-csw"] = metadataUrlItemXml
        .find("OnlineResource")
        .attr("xlink:href");

      // Filter layers with regard to the provided keyword
      if (keyword) {
        if (
          layer.title.toLowerCase().search(keyword.toLowerCase()) >= 0 ||
          layer.abstract.toLowerCase().search(keyword.toLowerCase()) >= 0
        ) {
          results[layer.layerid] = layer;
        }
      } else {
        results[layer.layerid] = layer;
      }

      // Parse sublayers
      if ($(l).find(">Layer").length > 0) {
        parentLayerId = layer.layerid;
        parentExtTitle = layer.extTitle;
        $(l).find(">Layer").each(parseLayer);
      }

      // Reset parent layer id to the previous value
      parentLayerId = previousParentLayerId;
      parentExtTitle = previousParentExtTitle;
    }

    // Search the first level Layer item(s) (there should be only one)
    $(xml).find("Capability>Layer").each(parseLayer);

    mv.showWMSResults(results);
  };

  var _getWmsUrlFromGetCapabilitiesUrl = function (getCapabilitiesUrl) {
    var urlParts = decodeURI(getCapabilitiesUrl)
      .replace(":80", "")
      .split("#")[0]
      .split("?");
    if (urlParts.length == 2) {
      var secondPart = urlParts[1];
      urlParts.pop();
      urlParts = urlParts.concat(secondPart.split("&"));

      var wmsUrlParts = [];
      urlParts.forEach(function (part) {
        if (
          !(part == "::") &&
          !part.toLowerCase().startsWith("getcapabilities=") &&
          !part.toLowerCase().startsWith("service=") &&
          !part.toLowerCase().startsWith("version=")
        ) {
          wmsUrlParts.push(part);
        }
      });

      var wmsUrl = wmsUrlParts[0] + "?" + wmsUrlParts.slice(1).join("&");

      return encodeURI(wmsUrl);
    } else {
      return encodeURI(urlParts[0]);
    }
  };

  var _wmsAjax = function (url, keyword) {
    var getCapabilitiesParams =
      "REQUEST=GetCapabilities&SERVICE=WMS&Version=1.3.0";
    var getCapabilitiesUrl = url.replace(/[?&]$/, "");
    getCapabilitiesUrl =
      getCapabilitiesUrl.indexOf("?") === -1
        ? getCapabilitiesUrl + "?" + getCapabilitiesParams
        : getCapabilitiesUrl + "&" + getCapabilitiesParams;

    $.ajax({
      type: "GET",
      url: mv.ajaxURL(getCapabilitiesUrl),
      crossDomain: true,
      dataType: "xml",
      contentType: "application/xml",
      success: function (data) {
        _wmsParse(data, keyword);
      },
      error: function (xhr, ajaxOptions, thrownError) {
        console.error("WMS GetCapabilities request failed", {
          url: getCapabilitiesUrl,
          xhr: xhr,
          ajaxOptions: ajaxOptions,
          thrownError: thrownError,
        });
        alert(
          "Echec de la requête WMS GetCapabilities :\n" + getCapabilitiesUrl
        );
      },
    });
  };

  var _DescribeFeatureTypeParse = function (data, typeName, layerid, url) {
    var fields = [];
    var layer = { wfs_url: url, fields: {} };
    $(data)
      .find("xsd\\:sequence, sequence")
      .find("xsd\\:element, element")
      .each(function (id, fld) {
        var _type;
        var xml_type = $(fld).attr("type");
        if (xml_type.search("gml") != -1) {
          _type = "geometry";
          layer.geometry = $(fld).attr("name");
        } else if (xml_type.search("string") != -1) {
          _type = "string";
          fields.push($(fld).attr("name"));
          layer.fields[$(fld).attr("name")] = { type: _type };
        } else {
          _type = "number";
          fields.push($(fld).attr("name"));
          layer.fields[$(fld).attr("name")] = { type: _type };
        }
        config.temp.layers[layerid] = layer;
      });
    mv.showFields(fields, layerid);
  };

  var _getFields = function (url, typeName, layerid) {
    var descFeatTypeParams =
      "SERVICE=WFS&VERSION=1.1.0&REQUEST=DescribeFeatureType&TYPENAME=" +
      typeName;
    var descFeatTypeUrl = url.replace(/[?&]$/, "");
    descFeatTypeUrl =
      descFeatTypeUrl.indexOf("?") === -1
        ? descFeatTypeUrl + "?" + descFeatTypeParams
        : descFeatTypeUrl + "&" + descFeatTypeParams;

    $.ajax({
      type: "GET",
      url: mv.ajaxURL(descFeatTypeUrl),
      crossDomain: true,
      dataType: "xml",
      contentType: "application/xml",
      success: function (data) {
        _DescribeFeatureTypeParse(data, typeName, layerid, url);
      },
      error: function (xhr, ajaxOptions, thrownError) {
        console.error("WFS DescribeFeatureType request failed", {
          url: descFeatTypeUrl,
          xhr: xhr,
          ajaxOptions: ajaxOptions,
          thrownError: thrownError,
        });
        alert(
          "Echec de la requête WFS DescribeFeatureType :\n" + descFeatTypeUrl
        );
      },
    });
  };

  var _getStyles = function (url, layerid) {
    var getCapabilitiesParams =
      "REQUEST=GetCapabilities&SERVICE=WMS&Version=1.3.0";
    var getCapabilitiesUrl = url.replace(/[?&]$/, "");
    getCapabilitiesUrl =
      getCapabilitiesUrl.indexOf("?") === -1
        ? getCapabilitiesUrl + "?" + getCapabilitiesParams
        : getCapabilitiesUrl + "&" + getCapabilitiesParams;

    $.ajax({
      type: "GET",
      url: mv.ajaxURL(getCapabilitiesUrl),
      crossDomain: true,
      dataType: "xml",
      contentType: "application/xml",
      success: function (data) {
        _wmsCapabilitiesParse(data, layerid);
      },
      error: function (xhr, ajaxOptions, thrownError) {
        console.error("WMS GetCapabilities request failed", {
          url: getCapabilitiesUrl,
          xhr: xhr,
          ajaxOptions: ajaxOptions,
          thrownError: thrownError,
        });
        alert(
          "Echec de la requête WMS GetCapabilities :\n" + getCapabilitiesUrl
        );
      },
    });
  };

  var _describeLayerParse = function (xml, layerid) {
    var wfs_url = $(xml).find("LayerDescription").attr("wfs").split("?")[0];
    var typeName = $(xml).find("LayerDescription Query").attr("typeName");
    _getFields(wfs_url, typeName, layerid);
  };
  var _getWFSUrl = function (wmsUrl, layerid) {
    var descLayerParams =
      "SERVICE=WMS&VERSION=1.1.1&REQUEST=DescribeLayer&LAYERS=" + layerid;
    var descLayerUrl = wmsUrl.replace(/[?&]$/, "");
    descLayerUrl =
      descLayerUrl.indexOf("?") === -1
        ? descLayerUrl + "?" + descLayerParams
        : descLayerUrl + "&" + descLayerParams;

    $.ajax({
      type: "GET",
      url: mv.ajaxURL(descLayerUrl),
      crossDomain: true,
      dataType: "xml",
      contentType: "application/xml",
      success: function (data) {
        _describeLayerParse(data, layerid);
      },
      error: function (xhr, ajaxOptions, thrownError) {
        console.error("WMS DescribeLayer request failed", {
          url: descLayerUrl,
          xhr: xhr,
          ajaxOptions: ajaxOptions,
          thrownError: thrownError,
        });
        alert("Echec de la requête WMS DescribeLayer :\n" + descLayerUrl);
      },
    });
  };

  var _getDictinctValues = function (data, propertyName, option) {
    var distinctValues = [];
    var testValues = {};
    $.each(data.features, function (id, feature) {
      var value = feature.properties[propertyName];
      if (!testValues[value]) {
        distinctValues.push(value);
        testValues[value] = true;
      }
    });
    mv.showDistinctValues(distinctValues, option);
  };

  return {
    /*setLayerFinderMode: function (options) {
            _mode_layerFind = options;
        },*/

    cswSearch: function (url, keyword, metadataUrl) {
      //var typeNames = "csw:Record";
      var typeNames = "gmd:MD_Metadata";
      var filter = _cswFilter(keyword, typeNames);
      _cswAjax(url, filter, metadataUrl, typeNames);
    },

    wmsSearch: function (url, keyword) {
      _wmsAjax(url, keyword);
    },

    getFieldsFromWMS(url, layerid) {
      _getWFSUrl(url, layerid);
    },

    getStylesFromWMS(url, layerid) {
      _getStyles(url, layerid);
    },

    getFeatures(url, typeName, propertyName, option) {
      var getFeaturesParams =
        "SERVICE=WFS&VERSION=1.0.0&REQUEST=GETFEATURE&TYPENAME=" +
        typeName +
        "&OUTPUTFORMAT=application/json&PROPERTYNAME=" +
        propertyName +
        "&MAXFEATURES=100";
      var getFeaturesUrl = url.replace(/[?&]$/, "");
      getFeaturesUrl =
        getFeaturesUrl.indexOf("?") === -1
          ? getFeaturesUrl + "?" + getFeaturesParams
          : getFeaturesUrl + "&" + getFeaturesParams;

      $.ajax({
        type: "GET",
        url: mv.ajaxURL(getFeaturesUrl),
        crossDomain: true,
        dataType: "json",
        contentType: "application/json",
        success: function (data) {
          _getDictinctValues(data, propertyName, option);
        },
        error: function (xhr, ajaxOptions, thrownError) {
          console.error("WFS GetFeature request failed", {
            url: getFeaturesUrl,
            xhr: xhr,
            ajaxOptions: ajaxOptions,
            thrownError: thrownError,
          });
          alert("Echec de la requête WFS GetFeature :\n" + getFeaturesUrl);
        },
      });
    },
  };
})();
