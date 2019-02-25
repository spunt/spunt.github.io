 /**
  * Summary. Automatically render an Oracle Cloud Application webpage to an SVG file.
  *
  * @link https://ux.us.oracle.com/bspunt/pageToSVG/pageToSVG.js
  * @author Bob Spunt
  * @version 2018.01.08
  */

 (function () {
     /*
                                  ________     __________    __________
      ______________ _______ ________  __/_______  ___/_ |  / /_  ____/
      ___  __ \  __ `/_  __ `/  _ \_  /  _  __ \____ \__ | / /_  / __
      __  /_/ / /_/ /_  /_/ //  __/  /   / /_/ /___/ /__ |/ / / /_/ /
      _  .___/\__,_/ _\__, / \___//_/    \____//____/ _____/  \____/
      /_/            /____/
      */

     // Check for AdfPage API & custom paramters
     if (typeof (AdfPage) == 'undefined') {
         alert('ERROR\n\nADF API is not available. Are you sure you are on an ADF page?')
         return false
     } else if (!AdfPage.PAGE.isPageFullyLoaded()) {
         alert('ERROR\n\nPage does not appear to be fully loaded. Wait and try again.')
         return false
     } else if (!AdfPage.PAGE.isSynchronizedWithServer()) {
         alert('ERROR\n\nPage appears to be syncing with the server. Wait and try again.')
         return false
     }
     if (typeof (DEBUG_MODE) == 'undefined') {
         DEBUG_MODE = false
     }
     // +-+-+-+ +-+-+-
     // CORE FUNCTIONS
     // +-+-+-+ +-+-+-
     var pageInfo = {
         BODYBGCOLOR: getComputedStyle(document.body)['backgroundColor'],
         OVERLAY_RGBA: 'rgba(0,0,0,0.50)',
         COMPONENT_MAP: Object.values(AdfPage.PAGE._clientIdToComponentMap),
         COMPONENT_TYPE_DICT: {
             input: ['ChooseColor', 'ChooseDate', 'Form', 'CodeEditor', 'InputColor', 'InputDate', 'InputFile', 'InputNumberSlider', 'InputNumberSpinbox', 'InputRangeSlider', 'InputText', 'ResetButton', 'RichTextEditor', 'SelectBooleanCheckbox', 'SelectBooleanRadio', 'SelectItem', 'SelectManyCheckbox', 'SelectManyChoice', 'SelectManyListbox', 'SelectManyShuttle', 'SelectOneChoice', 'SelectOneListbox', 'SelectOneRadio', 'SelectOrderShuttle', 'Subform'],
             listOfValues: ['InputComboboxListOfValues', 'InputListOfValues', 'InputSearch'],
             menuAndToolbar: ['CommandToolbarButton', 'CommandMenuItem', 'GoMenuItem', 'Menu', 'MenuBar', 'Toolbar', 'Toolbox'],
             navigation: ['BreadCrumbs', 'CommandButton', 'CommandImageLink', 'CommandLink', 'CommandNavigationItem', 'GoButton', 'GoImageLink', 'GoLink', 'NavigationPane', 'Train', 'TrainButtonBar'],
             popup: ['Dialog', 'NoteWindow', 'PanelWindow', 'Popup']
         },
         DIM: {
             h: document.body.scrollHeight,
             w: document.body.scrollWidth
         },
         VIEW_ID: AdfPage.PAGE.getViewId().replace(/\W/, '')
     }
     var select = {
         adfContainer: function () {
             return $(document.body)
                 .children()
                 .filter(':visible:not(#pageToSvgOverlay, #svgContainer)')
         },
         containers: function (container = select.adfContainer()) {
             return $(container)
                 .find('*')
                 .filter(function () {
                     return util.hasVisibleRect(this);
                 })
                 .filter(function () {
                     return util.isVisibleWithVerticalScroll(this);
                 })
         },
         images: function (container = select.adfContainer()) {
             var el = $(container).find(':regex(src, png|jpg|jpeg|^data:image|personImage),:not(body, #svgContainer *):regex(css:backgroundImage, ^url)')
                 .filter(function () {
                     return util.isVisibleWithVerticalScroll(this);
                 });
             if (el.length > 0) {
                 var img = [];
                 el.each(function () {
                     if (DEBUG_MODE) {
                         util.log(this);
                     }
                     img.push(util.getImageInfo(this));
                 });
             };
             return img;
         },
         inputs: function (container = select.adfContainer()) {
             var el = $(container).find(':input,:button,.af_commandToolbarButton,[class$="dropdown-icon-style"]').filter(function () {
                 return util.isVisibleWithVerticalScroll(this);
             }).filter(':not(body, #svgContainer *)')
             return el;
         },
         popups: function () {
             return $('[data-afr-popupid]').filter(function () {
                 return util.isVisibleWithVerticalScroll(this);
             });
         },
         svgs: function (container = select.adfContainer()) {
             return $(container).find('svg').filter(function () {
                 return util.isVisibleWithVerticalScroll(this);
             });
         },
         text: function (container = select.adfContainer()) {
             var el = $(container).find('*').filter(':visible').filter(':regex(.+)').contents().filter(function () {
                 return this.nodeType == 3 && this.textContent.trim().length > 0;
             }).parent().filter(':not(.p_OraHiddenLabel)').filter(':not(:empty)').filter(function () {
                 return util.isVisibleWithVerticalScroll(this);
             });
             return el;
         },
         touchPoints: function () {
             return $(adf.Component.toElement(adf.Component.withListeners())).add(adf.Component.toElement(adf.Component.withCommand()));
         }
     }
     var draw = {
         arrow: function (img) {
             function getArrowType(shortName) {
                 var imgToPath = {
                     'discloseexpanded': 'southeast',
                     'menu.*arrow|dropdown|tile_arrow_p|down.*arrow|conv_d': 'south',
                     'disclosecollapsed|open_submenu|splitterhr|striparrowright|conv_r': 'east',
                     'striparrowleft|conv_l': 'west',
                     'up.*arrow|conv_u|springboard_selected': 'north',
                     'overflow_up': 'north2',
                     'overflow_down': 'south2',
                     'overflow.*right|overflow_end': 'east2'
                 }; // Determine if imname matches any of keys

                 var e = Object.entries(imgToPath);
                 var m = e.filter(x => img.shortName.match(x[0]));

                 if (m.length > 0) {
                     return m[0][1];
                 } else {
                     util.log(`Arrow type could not be determined for ${shortName}`);
                     return 'south';
                 }
             }
             var s = Snap('#svgDocument');
             var elemDims = util.getDims(img.el);
             util.getImageAttributes(img.el).then(function (value) {
                 var iconDims = value.dims;
                 var midx = elemDims.x + elemDims.w / 2;
                 var midy = elemDims.y + elemDims.h / 2;
                 var left = midx - iconDims.w / 2;
                 var right = midx + iconDims.w / 2;
                 var upper = midy - iconDims.h / 2;
                 var lower = midy + iconDims.h / 2;
                 var arrowheadPaths = {
                     south: `M${left},${upper} L${midx},${lower} L${right},${upper}`,
                     north: `M${left},${lower} L${midx},${upper} L${right},${lower}`,
                     east: `M${left},${upper} L${right},${midy} L${left},${lower}`,
                     west: `M${right},${upper} L${left},${midy} L${right},${lower}`,
                     southeast: `M${left},${lower} L${right},${upper} L${right},${lower}`,
                     south2: `M${left},${upper} L${midx},${midy} L${right},${upper} M${left},${midy} L${midx},${lower} L${right},${midy}`,
                     east2: `M${left},${upper} L${midx},${midy} L${left},${lower} M${midx},${upper} L${right},${midy} L${midx},${lower}`,
                     north2: `M${left},${lower} L${midx},${midy} L${right},${lower} M${left},${midy} L${midx},${upper} L${right},${midy}`,
                     west2: `M${right},${upper} L${midx},${midy} L${right},${lower} M${midx},${upper} L${left},${midy} L${midx},${lower}`
                 };
                 var d = arrowheadPaths[getArrowType(img.shortName)];
                 var g = s.g().attr(adf.Element.toMetadata(img.el));
                 g.attr('data-level', 5)
                 if (img.shortName.match(/dropdown|tile.*arrow|springboard_selected|disclose|menuarrow|submenu|splitterhr/i)) {
                     d = d += ' Z';
                     g.append(s.path(d).attr({
                         fill: value.primaryColor,
                         fillOpacity: value.opacity
                     }))
                 } else {
                     g.append(s.path(d).attr({
                         stroke: value.primaryColor,
                         strokeWidth: "3px",
                         opacity: value.opacity,
                         fill: "none"
                     }))
                 }
             });
         },
         containers: function () { // Makes a Promise
             return new Promise(function (resolve, reject) {
                 var el = select.containers(container = ACTIVE_CONTAINER);
                 var s = Snap('#svgDocument');
                 el.each(function () {
                     var thisEl = this;
                     var g = s.g().attr(adf.Element.toMetadata(thisEl));
                     g.attr('data-level', 1);
                     var dims = util.getDims(thisEl);
                     var elcss = util.getCSS(thisEl);

                     if (DEBUG_MODE) {
                         util.log(thisEl);
                         util.log(elcss);
                     }

                     var borderRadius = elcss['borderRadius'];
                     if (borderRadius.split(' ').length > 1) {
                         borderRadius = "0px";
                     }
                     var numColor = elcss['borderColor'].match(/rgb/g).length,
                         numWidth = elcss['borderWidth'].match(/px/g).length;
                     if (numColor == 1 && numWidth == 1) {
                         g.append(s.rect(dims.x, dims.y, dims.w, dims.h, borderRadius).attr({
                             fill: elcss.backgroundColor,
                             stroke: elcss['borderColor'],
                             strokeWidth: elcss['borderWidth']
                         }));
                     } else {
                         g.append(s.rect(dims.x, dims.y, dims.w, dims.h, borderRadius).attr({
                             fill: elcss.backgroundColor
                         }));
                         if (borderRadius == "0px") {
                             // Borders
                             if (elcss.borderTopWidth.indexOf('0px') < 0) {
                                 g.append(s.line(dims.x, dims.y, dims.x + dims.w, dims.y).attr({
                                     stroke: elcss.borderTopColor,
                                     strokeWidth: elcss.borderTopWidth
                                 }));
                             }

                             if (elcss.borderBottomWidth.indexOf('0px') < 0) {
                                 g.append(s.line(dims.x, dims.y + dims.h, dims.x + dims.w, dims.y + dims.h).attr({
                                     stroke: elcss.borderBottomColor,
                                     strokeWidth: elcss.borderBottomWidth
                                 }));
                             }

                             if (elcss.borderLeftWidth.indexOf('0px') < 0) {
                                 g.append(s.line(dims.x, dims.y, dims.x, dims.y + dims.h).attr({
                                     stroke: elcss.borderLeftColor,
                                     strokeWidth: elcss.borderLeftWidth
                                 }));
                             }

                             if (elcss.borderRightWidth.indexOf('0px') < 0) {
                                 g.append(s.line(dims.x + dims.w, dims.y, dims.x + dims.w, dims.y + dims.h).attr({
                                     stroke: elcss.borderRightColor,
                                     strokeWidth: elcss.borderRightWidth
                                 }));
                             }
                         }
                     }
                 });
                 util.log('draw.containers complete!');
                 resolve();
             });
         },
         iconToSvg: function (svgStr, el) {
             var el = util.forceDom(el);
             var src = el.src || util.forceJq(el).css('backgroundImage').match(/^url\((.+)\)$/)[1];
             var s = Snap('#svgDocument');
             var g = s.g().attr(adf.Element.toMetadata(el));
             g.attr('data-level', 5)
             util.getImageAttributes(el).then(function (value) {
                 var elebb = value.dims;
                 if (src.match('home_ovr')) {
                     elebb.w = 20;
                     elebb.h = 20;
                 }
                 if (src.match(/grid_matte/)) {
                     // rect color estimated from top and bottom pixels
                     var rowRgb = value.rowColors.filter(x => !x.match(/255,.*255,.*255/));
                     g.append(s.rect(elebb.x, elebb.y, elebb.w, elebb.h, 8).attr({
                         fill: util.mode(rowRgb)
                     }));
                     var fillColor = 'rgb(255, 255, 255)';
                     var fillOpacity = 1;
                     elebb.x += 8;
                     elebb.y += 8;
                     elebb.w -= Math.imul(8, 2);
                     elebb.h -= Math.imul(8, 2);
                 } else {
                     var fillColor = value.primaryColor;
                     var fillOpacity = value.opacity;
                 }
                 // path handling
                 // compute scaling factor, create transformation matrix
                 // var pathbb = Snap.path.getBBox(svgStr);
                 var d = Snap.parse(svgStr.path).select('path').attr('d');
                 var pathbb = Snap.path.getBBox(d);
                 var scaleX = elebb.w / pathbb.w;
                 var scaleY = elebb.h / pathbb.h;
                 var scale = Math.min(scaleX, scaleY);
                 var x = 0;
                 var y = 0;
                 var tmat = `matrix(${scale},0,0,${scale},${x},${y})`; // tmat = `matrix(${scaleX},0,0,${scaleY},${x},${y})`;
                 svgStr = svgStr.path.replace(/\/>$/, ` transform="${tmat}" />`);
                 s.append(Snap.parse(svgStr));
                 var tempEl = s.children().pop();
                 var svgbb = tempEl.getBBox();
                 tempEl.remove();
                 var elBBox = util.getDims(el);
                 var x = elBBox.x + elBBox.w / 2 - svgbb.w / 2 - svgbb.x;
                 var y = elBBox.y + elBBox.h / 2 - svgbb.h / 2 - svgbb.y; // var x = elebb.x - svgbb.x - pathbb.x;
                 // var y = elebb.y - svgbb.y - pathbb.y;
                 var tmat = `matrix(${scale},0,0,${scale},${x},${y})`;
                 svgStr = svgStr.replace(/transform=.*/, `transform="${tmat}" />`);
                 g.append(Snap.parse(svgStr).select('path'));
                 var svgEl = g.select('path');
                 svgEl.attr({
                     fill: fillColor,
                     fillOpacity: fillOpacity
                 });
             });
         },
         images: function () {
             var img = select.images(container = ACTIVE_CONTAINER);
             for (var i in img) {
                 if (img[i].shortName.match('seperator_img')) {
                     var s = Snap('#svgDocument');
                     var g = s.g().attr(adf.Element.toMetadata(img[i].el));
                     g.attr('data-level', 5)
                     var elebb = util.getDims(img[i].el);
                     g.append(s.rect(elebb.x, elebb.y, elebb.w, elebb.h, 0).attr({
                         fill: "rgb(170,170,170)"
                     }));
                 } else if (img[i].shortName.match('striphandle')) {
                     var s = Snap('#svgDocument');
                     var g = s.g().attr(adf.Element.toMetadata(img[i].el));
                     g.attr('data-level', 5)
                     util.getImageAttributes(img[i].el).then(function (value) {
                         var elebb = value.dims;
                         g.append(s.rect(elebb.x, elebb.y, elebb.w, elebb.h, 3).attr({
                             fill: value.primaryColor,
                             fillOpacity: value.opacity
                         }));
                     });
                 } else if (img[i].shortName.match(/tile.*arrow|menu.*arrow|strip.*arrow|overflow|dropdown|open_submenu|splitterhr|disclose/g)) {
                     draw.arrow(img[i]);
                 } else {
                     var svgStr = util.findPath(img[i].shortName);
                     if (!svgStr) {
                         util.log(`SVG for ${img[i].src} not found. Using ImageTracer to convert to SVG.`);
                         draw.imgToSvg(img[i].src, img[i].el);
                     } else {
                         draw.iconToSvg(svgStr, img[i].el);
                     }
                 }
             }
         },
         imgToSvg: function (src, el) {
             // Options doc: https://github.com/jankovicsandras/imagetracerjs/blob/master/options.md
             var thisEl = util.forceDom(el);
             var imageTracerOpts = {
                 // Color quantization
                 colorsampling: 0,
                 numberofcolors: 3,
                 mincolorratio: 0,
                 colorquantcycles: 2,
                 // Layering method
                 layering: 0,
                 // SVG rendering
                 strokewidth: 0,
                 linefilter: false,
                 scale: 1,
                 roundcoords: 1,
                 viewbox: false,
                 desc: false,
                 lcpr: 0,
                 qcpr: 0,
                 // Blur
                 blurradius: 1,
                 blurdelta: 20,
                 // Tracing
                 corsenabled: false,
                 ltres: 1,
                 qtres: 1,
                 pathomit: 8,
                 rightangleenhance: true
             };
             var imageTracerCallback = function (svgStr) {
                 if (DEBUG_MODE) {
                     util.log(el);
                     util.log(svgStr);
                 }
                 var s = Snap('#svgDocument');
                 var elebb = util.getDims(thisEl);
                 var g = s.g().attr(adf.Element.toMetadata(thisEl));
                 g.attr('data-level', 5);
                 g.append(Snap.parse(svgStr).selectAll('path'));
                 var svgbb = g.getBBox();
                 var x = elebb.cx - svgbb.w / 2;
                 var y = elebb.cy - svgbb.h / 2;
                 g.selectAll('path').forEach(function (p) {
                     p.transform(`t${x},${y}`)
                 });
             };
             ImageTracer.imageToSVG(src, imageTracerCallback, imageTracerOpts);
         },
         inputs: function () { // Makes a Promise
             return new Promise(function (resolve, reject) {
                 function hasText(el) {
                     if (el.type == 'checkbox') {
                         if ($(el).is(':checked')) {
                             return '✓';
                         } else {
                             return false;
                         }
                     }
                     if (typeof (el.value) == 'undefined') {
                         return false
                     }
                     if (el.type)
                         if (el.value === '') {
                             if (el.getAttribute('placeholder')) {
                                 return el.getAttribute('placeholder');
                             } else if (el.innerText && el.tagName != 'SELECT') {
                                 return el.innerText;
                             } else {
                                 return false;
                             }
                         } else if (el.value.match(/^\d+$/)) {
                         if (el.querySelector('option')) {
                             return el.children[el.value].innerText;
                         } else {
                             return el.value;
                         }
                     } else if (typeof (el.value) == 'string' && el.value.trim().length > 0) {
                         return el.value
                     } else {
                         return false
                     }
                 }

                 var el = select.inputs(container = ACTIVE_CONTAINER);
                 var s = Snap('#svgDocument');
                 el.each(function () {
                     var thisEl = this;

                     if (thisEl.className.match(/_dropdown-icon-style$/g)) {
                         var elcss = getComputedStyle(thisEl.parentElement);
                         var dims = util.getDims(thisEl.parentElement);
                     } else {
                         var dims = util.getDims(thisEl);
                         var elcss = getComputedStyle(thisEl);
                     }

                     var g = s.g().attr(adf.Element.toMetadata(thisEl));
                     g.attr('data-level', 3)
                     if (thisEl.className.match(/_dropdown-icon-style$/g)) {
                         var fillColor = 'rgb(228, 232, 234)';
                         var strokeWidth = "1px";
                         var borderRadius = 3;
                     } else if (thisEl.type == 'checkbox') {
                         var fillColor = 'rgb(206, 206, 206)';
                         var strokeWidth = "0.25px";
                         var borderRadius = 4;
                     } else if (thisEl.className.match(/af_selectOneChoice_content/g)) {
                         var fillColor = "#ffffff";
                         var strokeWidth = "1px";
                         var borderRadius = parseFloat(elcss['borderRadius']);
                     } else if (elcss['backgroundImage'].match(/rgb\(\d+, \d+, \d+\)/g)) {
                         var fillColor = elcss['backgroundImage'].match(/rgb\(\d+, \d+, \d+\)/g)[0];
                         var strokeWidth = "1px";
                         var borderRadius = parseFloat(elcss['borderRadius']);
                     } else {
                         var fillColor = elcss['backgroundColor'];
                         var strokeWidth = elcss['borderWidth'].split(/\s/)[0];
                         var borderRadius = parseFloat(elcss['borderRadius']);
                     } // Setting the rect


                     if (!elcss['backgroundColor'].match(/^rgba\(\d+,\s?\d+,\s?\d+,\s?0\)/) || thisEl.type == 'checkbox') {
                         var rectElem = s.rect(dims.x, dims.y, dims.w, dims.h, borderRadius).attr({
                             fill: fillColor,
                             "stroke-width": strokeWidth,
                             stroke: elcss['borderLeftColor']
                         });
                         g.append(rectElem);
                     } // Is there placeholder text?


                     if (hasText(thisEl)) {
                         var txtstr = hasText(thisEl);
                         var y = dims.y + 0.5 * dims.h; // var size = parseFloat(elcss['fontSize']);
                         // var x = dims.x + parseFloat(elcss['paddingLeft']);
                         // var y = (dims.y + dims.h + Math.floor((size - dims.h) * 0.5));

                         var talign = elcss['textAlign'];

                         if (talign.match(/center/i)) {
                             var tanchor = 'middle';
                             var x = dims.x + 0.5 * dims.w;
                         } else if (talign.match(/right/i)) {
                             var tanchor = 'end';
                             var x = dims.x + dims.w - Math.max(parseFloat(elcss['paddingRight']), 5);
                         } else {
                             var tanchor = 'start';
                             var x = dims.x + Math.max(parseFloat(elcss['paddingLeft']), 5);
                         }

                         ;
                         var textElem = s.text(x, y, txtstr).attr({
                             fill: elcss['color'],
                             font: elcss['font'],
                             "text-anchor": tanchor,
                             "alignment-baseline": 'middle',
                             "white-space": elcss['whiteSpace']
                         });
                         g.append(textElem);
                     } // af_selectOneChoice


                     if (thisEl.className.match(/af_selectOneChoice_content/g)) {
                         var padding = 8;
                         var h = dims.h - padding * 2;
                         var backgEl = s.rect(dims.x, dims.y + 1, dims.w, dims.h - 2, parseFloat(elcss['borderRadius'])).attr({
                             fill: fillColor,
                             "stroke-width": "0px",
                             opacity: "1.0"
                         });
                         var svgStr = util.findPath('selectOneChoice'); // path handling
                         // compute scaling factor, create transformation matrix

                         var pathbb = Snap.path.getBBox(svgStr.path);
                         var scale = h / pathbb.h;
                         var x = 0 - pathbb.x;
                         var y = 0 - pathbb.y;
                         var tmat = `matrix(${scale},0,0,${scale},${x},${y})`;
                         svgStr = svgStr.path.replace(/\/>$/, ` transform="${tmat}" />`);
                         s.append(Snap.parse(svgStr));
                         var tempEl = s.children().pop();
                         var svgbb = tempEl.getBBox();
                         tempEl.remove();
                         var w = svgbb.w * (h / svgbb.h);
                         var x = dims.x + dims.w - w - padding / 2 - svgbb.x - pathbb.x;
                         var y = dims.y + padding - svgbb.y - pathbb.y;
                         backgEl.attr({
                             width: w + padding,
                             x: dims.x + dims.w - w - padding
                         });
                         g.append(backgEl);
                         var tmat = `matrix(${scale},0,0,${scale},${x},${y})`;
                         svgStr = svgStr.replace(/transform=.*/, `transform="${tmat}"/>`);
                         var pathEl = Snap.parse(svgStr).select('path');
                         g.append(pathEl); // var svgEl = g.select('path');
                         // finish it!
                     }
                 });
                 util.log('draw.inputs complete!');
                 resolve();
             });
         },
         svgs: function () { // Makes a Promise
             util.flog(arguments, 'on');
             return new Promise(function (resolve, reject) {
                 var svg = select.svgs(container = ACTIVE_CONTAINER); // grab images on page
                 if (svg.length) {
                     var s = Snap('#svgDocument');
                     svg.each(function () {
                         var thisEl = this;

                         if (DEBUG_MODE) {
                             util.log(thisEl);
                         }

                         var g = s.g().attr(adf.Element.toMetadata(thisEl));
                         g.attr('data-level', 4)
                         var p = $(thisEl).find('path:not(:regex(class,icons-shortcut|icons-cluster|svg-shortcut|svg-cluster))');
                         $.map(p, function (x) {
                             var elBBox = util.getDims(x);
                             var pcss = util.getCSS(x);
                             var d = x.getAttribute('d');
                             var pathbb = Snap.path.getBBox(d);
                             var scaleX = elBBox.w / pathbb.w;
                             var scaleY = elBBox.h / pathbb.h;
                             var scale = Math.min(scaleX, scaleY);
                             var x = 0;
                             var y = 0;
                             var tmat = `matrix(${scale},0,0,${scale},${x},${y})`;
                             var svgStr = `<path d="${d}" transform="${tmat}" />`;
                             s.append(Snap.parse(svgStr));
                             var tempEl = s.children().pop();
                             var svgbb = tempEl.getBBox();
                             tempEl.remove();
                             var x = elBBox.x + elBBox.w / 2 - svgbb.w / 2 - svgbb.x;
                             var y = elBBox.y + elBBox.h / 2 - svgbb.h / 2 - svgbb.y;
                             var tmat = `matrix(${scale},0,0,${scale},${x},${y})`;
                             svgStr = svgStr.replace(/transform=.*/, `transform="${tmat}" />`);
                             g.append(Snap.parse(svgStr).select('path'));
                             var svgEl = g.children().pop();
                             svgEl.attr({
                                 fill: pcss['fill'],
                                 fillOpacity: pcss['fillOpacity'],
                                 color: pcss['color'],
                                 stroke: pcss['stroke'],
                                 strokeWidth: pcss['strokeWidth'],
                                 strokeOpacity: pcss['strokeOpacity']
                             });
                         });
                     });
                 } // util.log('draw.svgs complete!')

                 util.flog(arguments, 'off');
                 resolve();
             });
         },
         text: function () { // Makes a Promise
             return new Promise(function (resolve, reject) {
                 var el = select.text(container = ACTIVE_CONTAINER);
                 var s = Snap('#svgDocument');
                 el.each(function () {
                     var thisEl = this;

                     if (DEBUG_MODE) {
                         util.log(thisEl);
                     }

                     var dims = util.getDims(thisEl);
                     var elcss = util.getCSS(thisEl);
                     var g = s.g().attr(adf.Element.toMetadata(thisEl));
                     g.attr('data-level', 6)
                     var wrapInfo = util.getTextWrap(thisEl.innerText, dims, elcss);
                     var lineHeight = Math.max(dims.h / wrapInfo.lineStr.length, wrapInfo.lineHeight); // horizonatal alignment handling

                     talign = elcss['textAlign'];

                     if (talign.match(/center/i)) {
                         var tanchor = 'middle';
                         var x = dims.x + 0.5 * dims.w;
                     } else if (talign.match(/right/i)) {
                         var tanchor = 'end';
                         var x = dims.x + dims.w - parseFloat(elcss['paddingRight']);;
                     } else {
                         var tanchor = 'start';
                         var x = dims.x + parseFloat(elcss['paddingLeft']);
                     }

                     ; // vertical alignment handling

                     var valign = elcss['verticalAlign'];
                     var alignmentBaseline = 'middle';
                     wrapInfo.lineY = [];

                     for (var i in wrapInfo.lineStr) {
                         wrapInfo.lineY[i] = dims.y + (parseFloat(i) + 0.5) * lineHeight;
                     } // draw it

                     var t = s.text(0, 0, wrapInfo.lineStr).attr({
                         fill: elcss['color'],
                         fontSize: elcss['fontSize'],
                         fontStyle: elcss['fontStyle'],
                         fontWeight: elcss['fontWeight'],
                         fontFamily: elcss['fontFamily'],
                         "text-anchor": tanchor,
                         "white-space": elcss['whiteSpace']
                     });

                     for (var i in t.children()) {
                         t.children()[i].attr({
                             x: x,
                             y: wrapInfo.lineY[i]
                         });
                     }

                     t.attr({
                         x: [],
                         y: []
                     }); // set alignment baseline for tspans

                     t.selectAll('tspan').attr({
                         "alignment-baseline": alignmentBaseline
                     });
                     g.append(t);
                 });
                 util.log('draw.text complete!');
                 resolve();
             });
         }
     }
     var util = {
         getImageAttributes: function (el) { // Makes a Promise
             var dims = util.getDims(el);
             return new Promise(function (resolve, reject) {
                 util.elemToRGB(el).then(function (value) {
                     var dataArr = Object.values(value.data);
                     var rgbDims = {
                         w: value.width,
                         h: value.height,
                     }
                     // Loop over flat array to get 1D array of RGBA pixels
                     var rgba = [];
                     var i = -4,
                         pixel = -1
                     while ((i += 4) < dataArr.length) {
                         pixel++;
                         // Get RGB values and round to multiples of 5
                         rgba[pixel] = [dataArr[i], dataArr[i + 1], dataArr[i + 2], dataArr[i + 3]].map(x => Math.round(x / 5) * 5)
                     }

                     // Focus on transparency values
                     var o = rgba.map(x => x[3]);
                     if (o.filter(x => x == 0).length > 0) {

                         // ROW WISE
                         var row = 0;
                         var rowWiseRGB = [];
                         var rowWise = [];
                         while (row < rgbDims.h) {
                             var start = row * rgbDims.w;
                             rowWise[row] = o.slice(start, start + rgbDims.w);
                             rowWiseRGB[row] = rgba.slice(start, start + rgbDims.w);
                             row++
                         }

                         // COLUMN WISE
                         var col = 0;
                         var columnWise = [];
                         while (col < rgbDims.w) {
                             arr = [];
                             for (i = col; i < o.length; i = i + rgbDims.w) {
                                 arr.push(o[i]);
                             }
                             columnWise[col] = arr;
                             col++
                         }

                         function getSum(total, num) {
                             return total + num;
                         }
                         var colIsVisible = columnWise.map(x => x.reduce(getSum) > 0);
                         var rowIsVisible = rowWise.map(x => x.reduce(getSum) > 0)
                         var yTop = rowIsVisible.indexOf(true);
                         var xLeft = colIsVisible.indexOf(true);
                         var trimDims = {
                             x: dims.x + xLeft,
                             y: dims.y + yTop,
                             w: (colIsVisible.lastIndexOf(true) - xLeft) + 1,
                             h: (rowIsVisible.lastIndexOf(true) - yTop) + 1,
                         };
                         // var trimRowData = rowWiseRGB.slice(y, y + trimDims.h);
                         var trimData = rowWiseRGB.slice(yTop, yTop + trimDims.h).map(x => x.slice(xLeft, xLeft + trimDims.w)).map(x => x.filter(x => x[3] > 0));
                         var imgAttr = {
                             element: el,
                             dims: trimDims,
                             trimData: trimData,
                             opacity: util.mode(trimData.flat().map(x => x[3] / 255)),
                             rowColors: trimData.map(x => util.mode(x.map(x => `rgb(${x[0]}, ${x[1]}, ${x[2]})`))),
                             primaryColor: util.mode(trimData.flat().map(x => `rgb(${x[0]}, ${x[1]}, ${x[2]})`)),
                         }
                     } else { // no transparent pixels, no need to adjust dims
                         var imgAttr = {
                             element: el,
                             dims: dims,
                             trimData: rgba,
                             opacity: util.mode(rgba.map(x => x[3] / 255)),
                             primaryColor: util.mode(rgba.map(x => `rgb(${x[0]}, ${x[1]}, ${x[2]})`)),
                         }
                     }
                     resolve(imgAttr)
                 })
             })
         },
         elemToRGB: function (elem) { // Makes a Promise

             return new Promise(function (resolve, reject) {
                 elem = util.forceDom(elem);
                 var dims = util.getDims(elem);
                 var src = elem.src || $(elem).css('backgroundImage').match(/^url\("(.+)"\)$/)[1];
                 var canvas = document.createElement('canvas');
                 var context = canvas.getContext('2d');
                 context.clearRect(0, 0, canvas.width, canvas.height);
                 var image = new Image();
                 image.onload = function () {
                     context.drawImage(image, 0, 0);
                     image.style.display = 'none';
                     resolve(context.getImageData(0, 0, dims.w, dims.h))
                 };
                 image.src = src;
                 util.log(`Successfully extracted RGBA values from ${image.src}`)
             });

         },
         getImageInfo: function (el) {

             var e = util.forceDom(el);
             var src = e.src || $(e).css('backgroundImage').match(/^url\("(.+)"\)$/)[1]
             if (src.match(/^data:image/)) {
                 var name_ext = [e.className, src.split(';')[0]];
                 var shortName = name_ext[0].replace(/^af_/, '');
             } else {
                 var name_ext = src.split('/').pop().split('.')
                 var shortName = name_ext[0].replace(/-/g, '_')
                     .replace(/^grid_matte_|^ugh_|^func_|^qual_/i, '')
                     .replace(/_light$|_dark$|_ena$|_ovr$|_onb$|_act$|_dis$|_hov$|_dwn$/i, '')
                     .replace(/personImage.*/i, 'personpic')
                     .replace(/_\d\d$/g, '');
             }
             return {
                 name: name_ext[0],
                 el: e,
                 shortName: shortName,
                 ext: name_ext[1],
                 src: src,
             }
         },
         getPageImages: function () {

             var img = select.images();
             var notFound = [];
             for (var i in img) {
                 if (img[i].shortName.match(/seperator_img|striphandle|tile.*arrow|menu.*arrow|strip.*arrow|overflow|dropdown|open_submenu|splitterhr|disclose/g)) {
                     continue
                 } else if (util.findPath(img[i].shortName)) {
                     continue
                 } else {
                     notFound.push(img[i])
                 }
             }
             var src = util.unique(notFound.map(x => x['src']))
             console.log(src.length + ' images do not have an SVG source');
             $.each(src, function () {
                 var url = this;
                 $('body').append('<a href=# id=pngLink></a>')
                 var downloadLink = document.getElementById('pngLink');
                 downloadLink.href = url
                 downloadLink.download = url.split('/').pop();
                 downloadLink.click()
                 document.body.removeChild(downloadLink)
             })
         },
         cumSum: a => a.reduce((a, x, i) => [...a, x + (a[i - 1] || 0)], []),
         wait: ms => new Promise(resolve => setTimeout(resolve, ms)),
         getProp: (p, o) => p.reduce((xs, x) => (xs && xs[x]) ? xs[x] : null, o),
         getTimestamp: function () {
             var n = new Date();
             return `${n.getFullYear()}-${n.getMonth()}-${n.getDate()}_${n.getHours()}${n.getMinutes()}`
         },
         load: function (url, theDocument = document) { // Makes a Promise
             // Adapted from davidwalsh.name/javascript-loader
             return new Promise(function (resolve, reject) {
                 if (url.split('.').pop() == 'css') {
                     var element = theDocument.createElement('link');
                     element.type = 'text/css';
                     element.rel = 'stylesheet';
                     element.href = url;
                     var parent = 'head';
                 } else {
                     var element = theDocument.createElement('script');
                     element.async = true;
                     element.type = 'text/javascript';
                     element.src = url;
                     var parent = 'body';
                 }
                 // Important success and error for the promise
                 element.onload = function () {
                     util.log(`Successfully loaded ${url}`)
                     resolve(url);
                 };
                 element.onerror = function () {
                     console.error(`Error loading ${url}`)
                     reject(url);
                 };
                 // Inject into document to kick off loading
                 theDocument[parent].appendChild(element);
             });
         },
         addExtensions: function () {
             jQuery.expr[':'].regex = function (elem, index, match) {
                 var matchParams = match[3].split(','),
                     validLabels = /^(data|css):/,
                     attr = {
                         method: matchParams[0].match(validLabels) ?
                             matchParams[0].split(':')[0] : 'attr',
                         property: matchParams.shift().replace(validLabels, '')
                     },
                     regexFlags = 'ig',
                     regex = new RegExp(matchParams.join('').replace(/^\s+|\s+$/g, ''), regexFlags);
                 return regex.test(jQuery(elem)[attr.method](attr.property))
             }
             // https://github.com/adobe-webplatform/Snap.svg/issues/121#issuecomment-28770183
             Snap.plugin(function (Snap, Element, Paper, glob) {
                 var elproto = Element.prototype;
                 elproto.toFront = function () {
                     this.appendTo(this.paper);
                 };
                 elproto.toBack = function () {
                     this.prependTo(this.paper);
                 };
             })
         },
         log: function (msg) {
             try {
                 css1 = 'font:bold 12px/2 sans-serif;'
                 css2 = 'font:none 12px/2 sans-serif;'
                 console.log(`%cpageToSvg -> %c: %c${msg}`, css1, 'font:inherit;', css2)
             } catch (err) {
                 console.log(msg)
             }
         },
         flog: function (argObj, status = 'on') {
             var name = argObj.callee.name;
             switch (status.toLowerCase()) {
                 case 'on':
                     console.log(`%cBEGIN%c ${name}`, 'background:green;font:bold 12px/2 sans-serif;', 'font:inherit;')
                 case 'off':
                     console.log(`%cEND%c ${name}`, 'background:red;font:bold 12px/2 sans-serif;', 'font:inherit;')
                 default:
                     console.log(`%cRunning%c ${name}`, 'font:bold 12px/2 sans-serif;', 'font:inherit;')
             }
             // util.logToOverlay(argObj, status);
         },
         findPath: function (imageName) {
             var result = Object.values(ICONS).filter(x => x.altNames.split('|').includes(imageName));
             if (result.length == 0) {
                 util.log(`No entries in ICONS match ${imageName}`)
                 return false
             } else if (result.length > 1) {
                 alert(`Multiple entries in ICONS match ${imageName}\n${util.log(result.map(x=>x.altNames))}`)
             } else {
                 return result[0]
             }
         },
         getTextWrap: function (txtStr, elDims, elcss) {

             var s = Snap('#svgDocument');
             var tmp = s.text(0, 0, txtStr).attr({
                 font: elcss['font']
             });

             function newLineIdx(words, letter_width, max_width) {
                 var idx = util.cumSum(words.map(x => x.length * letter_width)).findIndex(x => x > max_width);
                 if (idx == -1) {
                     return words.length
                 } else if (idx == 0) {
                     return 1
                 } else {
                     return idx
                 }
             }
             var txtBBox = tmp.getBBox();
             tmp.remove()
             var letter_width = txtBBox.w / txtStr.length;
             var words = txtStr.split(/\b/);
             var lines = [];
             if (words.length == 1) {
                 lines[0] = words[0];
             } else {
                 while (words.length > 0) {
                     var idx = newLineIdx(words, letter_width, Math.ceil(elDims.w));
                     lines.push(words.splice(0, idx).join(''));
                 }
             }
             return {
                 lineStr: lines.filter(x => x.length > 0).map(x => x.trim()),
                 lineHeight: Math.ceil(txtBBox.h)
             }
         },
         getDims: function (el) {
             var el = util.forceDom(el);
             var rect = el.getBoundingClientRect();
             var css = getComputedStyle(el)
             return {
                 x: rect.left,
                 y: rect.top,
                 w: rect.width,
                 h: rect.height,
                 cx: Math.round(rect.left + (rect.width / 2)),
                 cy: Math.round(rect.top + (rect.height / 2)),
                 top: rect.top,
                 bottom: rect.top + rect.height,
                 left: rect.left,
                 right: rect.left + rect.width,
                 leftSpace: parseFloat(css['paddingLeft']) + parseFloat(css['borderLeftWidth']),
                 rightSpace: parseFloat(css['paddingRight']) + parseFloat(css['borderRightWidth']),
                 topSpace: parseFloat(css['paddingTop']) + parseFloat(css['borderTopWidth']),
                 bottomSpace: parseFloat(css['paddingBottom']) + parseFloat(css['borderBottomWidth']),
             };
         },
         getCSS: function (el) {

             // return getComputedStyle(el);
             var cssProp = [
                 'fill',
                 'fillOpacity',
                 'color',
                 'stroke',
                 'strokeWidth',
                 'strokeOpacity',
                 'backgroundColor',
                 'borderWidth',
                 'borderColor',
                 'borderRadius',
                 'backgroundImage',
                 'borderBottom',
                 'borderBottomColor',
                 'borderBottomWidth',
                 'borderLeft',
                 'borderLeftColor',
                 'borderLeftWidth',
                 'borderRight',
                 'borderRightColor',
                 'borderRightWidth',
                 'borderTop',
                 'borderTopColor',
                 'borderTopWidth',
                 'boxSizing',
                 'display',
                 'font',
                 'fontFamily',
                 'fontSize',
                 'fontStyle',
                 'fontWeight',
                 'padding',
                 'margin',
                 'paddingTop',
                 'paddingLeft',
                 'paddingBottom',
                 'paddingRight',
                 'marginTop',
                 'marginLeft',
                 'marginBottom',
                 'marginRight',
                 'alignmentBaseline',
                 'opacity',
                 'textAlign',
                 'textIndent',
                 'verticalAlign',
                 'visibility',
                 'zIndex',
             ];
             var c = getComputedStyle(el);
             var elcss = {};
             $.each(cssProp, function () {
                 elcss[this] = c[this]
             });
             return elcss
         },
         hasVisibleRect: function (el) {
             var visibleFill = !($(el).css('backgroundColor').match(/^rgba.*0\)/));
             var visibleBorder = (($(el).css('borderWidth').replace(/px|0|\./g, '').trim().length > 0) && (!($(el).css('borderColor').match(/^rgba.*0\)/))))
             return (visibleFill || visibleBorder)
         },
         isVisible: function (el, allowVerticalScroll = true) {

             var el = util.forceDom(el);
             if ($(el).is('not:visible')) {
                 return false
             }
             var dims = el.getBoundingClientRect()
             if (!(dims.height * dims.width)) {
                 return false
             }
             if (!util.isVisibleWithVerticalScroll(el)) {
                 return false
             } else {
                 return true
             }
         },
         elementsFromAbsolutePoint: function (x, y) {
             var elms, scrollX, scrollY, newX, newY;
             scrollX = window.pageXOffset;
             scrollY = window.pageYOffset;
             window.scrollTo(x, y);
             newX = x - window.pageXOffset;
             newY = y - window.pageYOffset;
             elms = document.elementsFromPoint(newX, newY);
             window.scrollTo(scrollX, scrollY);
             return elms;
         },
         isVisibleWithVerticalScroll: function (elem) {
             var dims = elem.getBoundingClientRect(),
                 cx = dims.x + (dims.width / 2),
                 cy = dims.y + (dims.height / 2)
             if (document.elementsFromPoint(cx, cy).includes(elem)) {
                 return true
             } else {
                 return util.elementsFromAbsolutePoint(cx, cy).includes(elem)
             }
         },
         forceDom: function (el) {
             // Check if we're working with a JQuery object
             if (el instanceof jQuery) {
                 return el[0]
             } else if (typeof (el) == 'string') {
                 return $('#' + $.escapeSelector(el))
             } else {
                 return el
             }
         },
         forceJq: function (el) {
             // Check if we're working with a JQuery object
             if (el instanceof jQuery) {
                 return el
             } else if (typeof (el) == 'string') {
                 return $('#' + $.escapeSelector(el))
             } else {
                 return $(el)
             }
         },
         mode: function (array) {
             if (array.length == 0) {
                 return null
             }
             var modeMap = {};
             var maxEl = array[0],
                 maxCount = 1;
             for (var i = 0; i < array.length; i++) {
                 var el = array[i];
                 if (modeMap[el] == null)
                     modeMap[el] = 1;
                 else
                     modeMap[el]++;
                 if (modeMap[el] > maxCount) {
                     maxEl = el;
                     maxCount = modeMap[el];
                 }
             }
             return maxEl;
         },
         valueCounts: function (obj, prop) {
             if (prop) {
                 var vals = obj.map(item => item[prop])
             } else {
                 var vals = Object.values(obj);
             }
             var uVals = util.unique(vals);
             var valCounts = {};
             uVals.map(function (x) {
                 valCounts[x] = vals.filter(item => (item == x) === true).length
             })
             util.log(valCounts)
             return valCounts
         },
         unique: function (array) {
             return $.grep(array, function (el, index) {
                 return index === $.inArray(el, array);
             });
         },
         formatXml: function (xml) {
             // SOURCE: https://gist.github.com/sente/1083506/d2834134cd070dbcc08bf42ee27dabb746a1c54d

             var formatted = '';
             var reg = /(>)(<)(\/*)/g;
             xml = xml.replace(reg, '$1\r\n$2$3');
             var pad = 0;
             jQuery.each(xml.split('\r\n'), function (index, node) {
                 var indent = 0;
                 if (node.match(/.+<\/\w[^>]*>$/)) {
                     indent = 0;
                 } else if (node.match(/^<\/\w/)) {
                     if (pad != 0) {
                         pad -= 1;
                     }
                 } else if (node.match(/^<\w[^>]*[^\/]>.*$/)) {
                     indent = 1;
                 } else {
                     indent = 0;
                 }
                 var padding = '';
                 for (var i = 0; i < pad; i++) {
                     padding += '  ';
                 }
                 formatted += padding + node + '\r\n';
                 pad += indent;
             });
             return formatted;
         },
         cleanupDoc() { // Makes a Promise

             return new Promise(function (resolve, reject) {

                 // Remove unnecessary tags
                 $('#svgDocument defs,desc').remove()

                 // Convert path strings to cubic for importing into NodeBox
                 $('path:not(#pageBackground)').each(function () {
                     this.setAttribute('d', Snap.path.toCubic(this.getAttribute('d')).toString().replace(/([C-Z])/g, ' $1'))
                 })

                 // Remove empty style attributes
                 var allElem = $('#svgDocument *:not(#pageBackground)');
                 allElem.each(function () {
                     if (this.getAttribute('style') === '') {
                         this.removeAttribute('style');
                     }
                 })

                 // Replace inline styles with presentation attributes
                 var allElem = $('#svgDocument [style]:not(#pageBackground)');
                 allElem.each(function () {
                     var thisEl = this;
                     var styleStr = thisEl.getAttribute('style');
                     thisEl.removeAttribute('style');
                     var styleArr = styleStr.replace(/;$/, '').split(';');
                     for (var i in styleArr) {
                         var keyVal = styleArr[i].split(':');
                         thisEl.setAttribute(keyVal[0].trim(), keyVal[1].trim())
                     }
                 });

                 // Replace aggregate font style defs with separate attributes
                 var allElem = $('#svgDocument [font]:not(#pageBackground)');
                 allElem.each(function () {
                     var thisEl = this;
                     var fontAttr = ['font-weight', 'font-style', 'font-variant', 'font-size', 'font-family'];
                     for (var i in fontAttr) {

                         thisEl.setAttribute(fontAttr[i], $(thisEl).css(fontAttr[i]));

                     }

                     thisEl.removeAttribute('font');

                 });

                 // Group by ID
                 util.groupById();

                 // Swap data-click-code and id
                 var allElem = $('#svgDocument g');
                 allElem.each(function () {
                     var thisEl = this;
                     var clickCode = $(thisEl).data('click-code');
                     $(thisEl).attr('data-client-id', thisEl.id).removeAttr('data-click-code').attr('id', clickCode);
                 });

                 // // Trim empty margins
                 // function getBounds(el) {
                 //     rects = el.get().map(x=>x.getBoundingClientRect());
                 //     x = Math.min(...rects.map(x=>Math.floor(x['left'])));
                 //     y = Math.min(...rects.map(x=>Math.floor(x['top'])));
                 //     width = Math.max(...rects.map(x=>Math.ceil(x['right']))) - x;
                 //     height = Math.max(...rects.map(x=>Math.ceil(x['bottom']))) - y;
                 //     return {
                 //         x: x,
                 //         y: y,
                 //         width: width,
                 //         height: height
                 //     }
                 // };
                 // var b= getBounds(allElem);
                 // Snap.select('svg').attr('viewBox', `${b['x']} ${b['y']} ${b['width']} ${b['height']}`)

                 $('#pageToSvgOverlay').remove()
                 util.log('cleanupDoc complete!')
                 resolve()
             })

         },
         groupById: function () {
             /*
             HTML/CSS: The z-index property specifies the descending stack order of an element. Elements with higher z-indices are displayed in front of elements with lower z-indices.
             SVG: Elements in an SVG document fragment have an implicit drawing order, with the first elements in the SVG document fragment getting "painted" first. Subsequent elements are painted on top of previously painted elements.
             */
             function sortByLevel(a, b) {
                 return a.attr('data-level') - b.attr('data-level')
             }
             var s = Snap('#svgDocument');
             var e = s.children().filter(x => x.node.id != 'pageBackground')
             var ids = e.map(x => x.node.id);
             var uids = util.unique(ids);
             uids.map(function (x) {
                 var subids = ids.filter(item => (item == x) === true);
                 if (subids.length > 1) {
                     var groupedElem = e.filter(item => (item.node.id == subids[0]) == true).sort(sortByLevel);
                     var maxLevel = groupedElem.map(x => x.attr('data-level')).slice(-1)[0];
                     var minLevel = groupedElem.map(x => x.attr('data-level'))[0];
                     var groupedChildren = groupedElem.map(function (x) {
                         if (x.type == 'g') {
                             return x.children()
                         } else {
                             return x
                         }
                     })
                     var group = s.g().attr({
                         id: subids[0],
                         'data-click-code': groupedElem[0].node.getAttribute('data-click-code'),
                         'data-component-type': groupedElem[0].node.getAttribute('data-component-type'),
                         'data-region-view-id': groupedElem[0].node.getAttribute('data-region-view-id'),
                         'data-absolute-id': groupedElem[0].node.getAttribute('data-absolute-id'),
                         'data-level': minLevel,
                     });

                     $.each(groupedChildren, function (index) {
                         group.add(groupedChildren[index])
                     })
                     groupedElem.map(x => x.remove())
                 }
             })
             s.children().sort(sortByLevel).map(x => x.toFront());

         },
         getIcons: function () { // Makes a Promise

             return new Promise(function (resolve, reject) {

                 // Custom Svg Paths
                 var customIcons = {
                     x: '<path d="M1,1 L12,12 M1,12 L12,1" stroke="#9e9e9e" stroke-linejoin="bevel" stroke-width="3"/>',
                     circlearrow: '<path d="M24 38a14 14 0 1 0-14-14 14 14 0 0 0 14 14zm0-26a12 12 0 1 1-12 12 12 12 0 0 1 12-12zm1 19l-1-2 4-4H16v-2h12l-4-4 1-2 8 7z"/>',
                     'inputComboboxListOfValues_content': '<path stroke="#979797" d="M1.5 1.5h8v10h-8zm0 11h8m-8-12h8m1 1v10m-10-10v10m5-8.5L7 7H4zm-2 5.5h4"/>',
                 }
                 $.map(Object.entries(customIcons), function (entry) {
                     ICONS[entry[0]] = {
                         altNames: entry[0].replace(/^navi_|/g, ''),
                         path: entry[1],
                         backgroundColor: "none",
                     }
                 })
                 // Alt name additions
                 ICONS['x'].altNames += '|remove|dialog_close|closeDialog';
                 util.log('adf.getIcons complete!');
                 resolve();
             });

         },
         isTouchpoint: function (el) {

             if (el.hasAttribute('onclick')) {
                 return true
             }
             var cmp = adf.Element.toComponent(el);
             // var className = el.className;
             // if (className.match(/AFDisabled/i)) {
             //     return false
             // }
             if (cmp._props.hasOwnProperty('clientListeners') || cmp._props.hasOwnProperty('behaviors') || cmp._componentType.match(/Command.*/)) {
                 return true
             } else {
                 return false
             }
         },
     }
     var adf = {
         Component: {
             getProperties: function (cmp) {
                 props = Object.keys(cmp.getPropertyKeys());
                 for (var i in c) {
                     var cmp = c[i];
                     // 'client-listeners': cmp._getClientListeners(),
                     var metaData = {
                         'ClientId': cmp.getClientId(),
                         'AbsoluteId': cmp.getAbsoluteId(),
                         'ComponentType': cmp.getComponentType(),
                         'AbsoluteLocator': cmp.getAbsoluteLocator(),
                         'AccessibleName': cmp.getAccessibleName(),
                         'AccessKey': cmp.getAccessKey(),
                         'Behaviors': cmp.getBehaviors(),
                         'Class': cmp.getClass(),
                         'DescendantComponents': cmp.getDescendantComponents(),
                         'Disabled': cmp.getDisabled(),
                         'DragSource': cmp.getDragSource(),
                         'DropTarget': cmp.getDropTarget(),
                         'Id': cmp.getId(),
                         'Immediate': cmp.getImmediate(),
                         'Parent': cmp.getParent(),
                         'Peer': cmp.getPeer(),
                         'ReadyState': cmp.getReadyState(),
                         'ShortDesc': cmp.getShortDesc(),
                         'TypeName': cmp.getTypeName(),
                         'Unsecure': cmp.getUnsecure(),
                         'Visible': cmp.getVisible(),
                     }
                     props.push(metaData);
                 }
                 return props;
             },
             getParents: function (c) {
                 parents = [];
                 var p = c.getParent()
                 parents.push(p);
                 while (p.getParent()) {
                     p = p.getParent()
                     parents.push(p)
                 }
                 return parents
             },
             getListeners: function (c) {
                 listeners = [];
                 while (c) {
                     if (util.getProp(['_props', 'clientListeners'], c)) {
                         listeners.push(util.getProp(['_props', 'clientListeners'], c))
                     }
                     c = c.getParent()
                 }
                 return listeners
             },
             withListeners: function () {
                 var cmpWithListeners = Object.values(AdfPage.PAGE._clientIdToComponentMap)
                     .filter(x =>
                         (x._props.hasOwnProperty('clientListeners') || x._props.hasOwnProperty('behaviors'))
                     )
                     .filter(x =>
                         util.isVisibleWithVerticalScroll(document.getElementById(x._clientId))
                     )
                     .filter(x =>
                         !document.getElementById(x['_clientId'])
                     )
                 return cmpWithListeners
             },
             withCommand: function () {
                 var commandCmp = Object.values(AdfPage.PAGE._clientIdToComponentMap)
                     .filter(x =>
                         document.getElementById(x._clientId)
                     ).filter(x =>
                         !document.getElementById(x._clientId).className.match(/AFDisabled/i)
                     ).filter(x =>
                         util.isVisibleWithVerticalScroll(document.getElementById(x._clientId))
                     ).filter(x =>
                         x._componentType.match(/Command.*/)
                     )
                 return commandCmp
             },
             toElement: function (cmp) {
                 return cmp.map(x => document.getElementById(x.getClientId()));
             },
             toRegion: function (cmp) {

                 var currentCmp = cmp;
                 while (!currentCmp.getParent()._props.viewId) {
                     currentCmp = currentCmp.getParent();
                     if (!currentCmp.getParent()) {
                         return 'NA'
                     }
                 }
                 return currentCmp.getParent()._props.viewId

             },
             getTarget: function (cmp) {

                 // if (cmp._componentType.match(/RichCommand/)) {
                 //     return cmp;
                 // } else
                 if (util.getProp(['_props', 'clientListeners', 'click', 0, '_popupId'], cmp)) {
                     var subid = util.getProp(['_props', 'clientListeners', 'click', 0, '_popupId'], cmp);
                     cmp = cmp.findComponent(subid);
                 } else if (util.getProp(['_props', 'behaviors', '_popupId'], cmp)) {
                     var subid = util.getProp(['_props', 'behaviors', '_popupId'], cmp);
                     cmp = cmp.findComponent(subid);
                 } else if (adf.Component.toRegion(cmp).match(/InfoTiles/i)) {
                     cmp = adf.Component.handleInfoTile(cmp)
                 }
                 return cmp;

             },
             handleInfoTile: function (srcCmp) {

                 var cmp = srcCmp;
                 var index = cmp.getProperty("index");
                 var selected = false;
                 while (index == null) {
                     cmp = cmp.getParent();
                     if (!cmp) {
                         return srcCmp
                     };
                     index = cmp.getProperty("index");
                     selected = cmp.getProperty("selected");
                 }
                 // If the tile is already selected there is no need to raise selection event
                 if (!selected) {
                     cmp = cmp.getParent(); // Go past the Declarative component definition and into its parent
                     if (cmp.getComponentType().indexOf("RichConveyorBelt") >= 0 || cmp.getComponentType().indexOf("RichDynamicDeclarativeComponent") >= 0) {
                         cmp = cmp.getParent(); // Go past the conveyor belt if any
                     }
                     // raise 'tileSelected' event on the panel group layout component surrounding detail region
                     pslSrc = cmp.getParent().getParent().getParent();
                     tileData = {
                         action: 'tileSelected',
                         selectedStretchTile: pslSrc,
                         selectedGroupTile: pslSrc.findComponent("ITPpgl3"),
                     };
                     return tileData['selectedGroupTile']
                 } else {
                     return srcCmp;
                 }
             },

         },
         Element: {
             toElementWithoutSubid: function (el) {
                 if (!el.id.match(/\:\:/)) {
                     return el;
                 }
                 var cleanId = el.id.split('::')[0];
                 return document.getElementById(cleanId);
             },
             toAbsoluteId: function (el) {
                 return AdfRichUIPeer.getLocatorByDomElement(util.forceDom(el));
             },
             toRegion: function (el) {
                 return adf.Component.toRegion(adf.Element.toComponent(el));
             },
             toComponent: function (el) {
                 el = util.forceDom(el);
                 if (el.id.match(/\:\:/)) {
                     var cleanId = el.id.split('::')[0];
                     el = document.getElementById(cleanId);
                 }
                 // return AdfPage.PAGE.findComponentByAbsoluteId(AdfRichUIPeer.getLocatorByDomElement(el));
                 var cmp = AdfRichUIPeer.getFirstAncestorComponent(util.forceDom(el));
                 if (cmp.getDescendantComponents().length == 1) {
                     return cmp.getDescendantComponents()[0];
                 }
                 return cmp
             },
             toMetadata: function (el) {

                 var el = util.forceDom(el);
                 // var id = el.id.split('::')[0];
                 var srcCmp = adf.Element.toComponent(el);
                 var id = srcCmp.getClientId();
                 if (util.isTouchpoint(el)) {
                     var cmp = adf.Component.getTarget(srcCmp);
                     var reg = adf.Component.toRegion(cmp);
                     var clickCodeLeft = 'tp_' + reg;
                 } else {
                     var cmp = srcCmp;
                     var reg = adf.Component.toRegion(cmp);
                     var clickCodeLeft = reg;
                 }
                 var clickCodeRight = cmp.getId();
                 if (clickCodeRight == "") {
                     clickCodeRight = "NA"
                 }
                 var metaData = {
                     'id': id,
                     'data-click-code': clickCodeLeft + '---' + clickCodeRight,
                     'data-component-type': cmp.getComponentType(),
                     'data-region-view-id': reg,
                     'data-absolute-id': cmp.getAbsoluteId(),
                 }
                 if (srcCmp !== cmp) {
                     metaData['data-source-client-id'] = srcCmp._clientId;
                 }
                 return metaData
             }
         },
     }
     var ui = {
         initContainer: function () { // Makes a Promise
             return new Promise(function (resolve, reject) {
                 // Cleanup
                 $('#svgContainer, #pagetoSvgOverlay').each(function () {
                     this.remove()
                 });

                 if (!DEBUG_MODE) {
                     ui.makeOverlay()
                 } else {
                     ui.makeOverlay(innerHtml = 'Running pageToSVG in DEBUG_MODE...')
                 }

                 // Check for Popups
                 var pu = select.popups();
                 if (pu.length > 0) {
                     ACTIVE_CONTAINER = pu.parent();
                 } else {
                     ACTIVE_CONTAINER = select.adfContainer();
                     // Remove "This Enviroment is used by SCM Support - Please contact Peter Campbell..." if applicable
                     $('#' + $.escapeSelector('pt1:_UISpbl1')).remove()
                     $('a:contains("Skip to main content")').filter(':visible').remove()
                     $('[title="This Enviroment is used by SCM Support - Please contact Peter Campbell +1 (719) 757 2288 - before making changes."]').closest('div').remove()
                 }

                 // Create top-level SVG container (id="svgContainer") and append to body element of document
                 var svgContainer = document.createElement('div');
                 svgContainer.style.position = 'fixed';
                 svgContainer.style.left = '0';
                 svgContainer.style.top = '0';
                 svgContainer.style.zIndex = 2147483647;
                 svgContainer.style.background = 'none';
                 svgContainer.style.display = 'block';
                 svgContainer.style.visibility = 'hidden';
                 svgContainer.style.height = pageInfo.DIM.h;
                 svgContainer.style.width = pageInfo.DIM.w;
                 svgContainer.id = 'svgContainer';
                 svgContainer.innerHTML = '<svg id="svgDocument" width="' + pageInfo.DIM.w + 'px" height="' + pageInfo.DIM.h + 'px" viewBox="0 0 ' + pageInfo.DIM.w + ' ' + pageInfo.DIM.h + '" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"></svg>';
                 document.body.prepend(svgContainer);
                 // Draw containers
                 var s = Snap('#svgDocument');
                 s.rect(0, 0, pageInfo.DIM.w, pageInfo.DIM.h).attr({
                     id: "pageBackground",
                     'data-level': 0,
                     fill: pageInfo.BODYBGCOLOR,
                 })
                 util.log('initContainer complete!');
                 resolve();
             });
         },
         createElement: function (tag = "div", attributes = {}, children = [], doc = document) {
             /**
              * ## Create Element
              * Quick and easy DOM element creation
              *
              * @param {string=} tag - The element tag
              * @param {object=} attributes - The attributes to add, mapping the key as
              *     the attribute name, and the value as its value. If the value is a
              *     function, it will be added as an event.
              * @param {(Array|*)=} children - An array of children (can be a mixture of
              *     Nodes to append, or other values to be stringified and appended
              *     as text).
              * @return {Element} - The created element
              */
             var elem = doc.createElement(tag);

             for (let [key, value] of Object.entries(attributes)) {
                 if (!value) continue;

                 if (typeof value === typeof (() => {})) {
                     if (key === "ref") value(elem);
                     else elem.addEventListener(key, value);
                     continue;
                 }

                 if (key === "style")
                     value = value.replace(/[\t\r\n]/g, " ").trim();

                 elem.setAttribute(key, value);
             }

             if (!Array.isArray(children))
                 children = [children];

             children.map(child => {
                 if (!child) return;

                 try {
                     elem.appendChild(child);
                 } catch (_) {
                     elem.appendChild(doc.createTextNode(child));
                 }
             });

             return elem;
         },
         addCSS: function (cssRuleSets, doc = document) { // Makes a Promise

             function jsToCSS(obj) {
                 cssString = '';
                 Object.entries(obj).map(function (x) {
                     var prop = `${x[0].toString().replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()}`;
                     var val = `${x[1].toString().replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()}`;
                     cssString += `\t${prop}: ${val};\n`;
                 })
                 return cssString
             }

             styleString = '';
             Object.entries(cssRuleSets).map(function (x) {
                 styleString += `\n${x[0]} {\n${jsToCSS(x[1])}}\n`
             })

             var style = doc.createElement('style');
             style.type = 'text/css';
             style.innerHTML = styleString;
             doc['head'].appendChild(style);
         },
         reset: function () {
             $('#svgContainer').each(function () {
                 this.remove()
             });
             ui.initContainer();
         },
         toggle: function () {
             var status = $('#svgContainer').css('visibility');
             if (status == 'hidden') {
                 $('#svgContainer').css('visibility', 'visible');
             } else {
                 $('#svgContainer').css('visibility', 'hidden');
             }
         },
         downloadSvg: function () {
             // Add download link to container
             $('#svgContainer').append('<a href=# id=svgLink></a>')
             // $('#svgContainer').css({
             //     'display': 'block',
             //     'visibility': 'visible',
             // });

             // grab svgDocument, serialize to string, add xml, format the xml
             // Remove "px" from location/size definitions
             var finalSvg = Snap.select('#svgDocument').toString().replace(/px"/g, '"')
             finalSvg = util.formatXml('<?xml version="1.0" encoding="UTF-8" ?>\r\n' + finalSvg);
             var finalUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(finalSvg);
             var fileName = 'pageToSVG-' + document.title.replace(/\W/, '_') + '-' + pageInfo.VIEW_ID + '.svg'

             //set url value to a element's href attribute.
             var downloadLink = document.getElementById('svgLink');
             downloadLink.href = finalUrl;
             downloadLink.download = fileName;
             downloadLink.click();
             downloadLink.remove();

             // Alert the user
             if (!DEBUG_MODE) {
                 util.log(`SVG downloaded to:\n${fileName}`);
             }

         },
         downloadObjectAsJson: function (exportObj, exportName) {
             var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
             var downloadAnchorNode = document.createElement('a');
             downloadAnchorNode.setAttribute("href", dataStr);
             var fileName = exportName.split('.')[0] + ".json";
             downloadAnchorNode.setAttribute("download", fileName);
             document.body.appendChild(downloadAnchorNode); // required for firefox
             downloadAnchorNode.click();
             downloadAnchorNode.remove();
         },
         downloadObjectAsCsv: function (exportObj, exportName) {
             var liburl = 'https://cdnjs.cloudflare.com/ajax/libs/PapaParse/4.6.1/papaparse.min.js';

             $.when($.getScript(liburl).done(function () {
                 // defaults shown
                 var papaConfig = {
                     quotes: false,
                     quoteChar: '"',
                     escapeChar: '"',
                     delimiter: ",",
                     header: true,
                     newline: "\r\n"
                 }
                 var dataStr = "data:text/csv;charset=utf-8," + encodeURIComponent(Papa.unparse(exportObj, papaConfig));
                 var downloadAnchorNode = document.createElement('a');
                 downloadAnchorNode.setAttribute("href", dataStr);
                 var fileName = exportName.split('.')[0] + ".csv";
                 downloadAnchorNode.setAttribute("download", fileName);
                 document.body.appendChild(downloadAnchorNode); // required for firefox
                 downloadAnchorNode.click();
                 downloadAnchorNode.remove();
                 if (!DEBUG_MODE) {
                     util.log(`CSV downloaded to:\n${fileName}`);
                 }
             }))
         },
         downloadTouchpoints: function () {
             var e = document.querySelector("svg").getBoundingClientRect(),
                 t = [],
                 n = [],
                 o = document.querySelectorAll("[id^=tp_]");
             if (0 != o.length) {
                 o.forEach(e => t.push(Object.keys(e.dataset)));
                 var a = t.flat().filter((e, t, n) => n.indexOf(e) === t).sort();
                 o.forEach(function (t) {
                     var o = t.getBoundingClientRect(),
                         i = {
                             id: t.id,
                             cx: o.x - e.x + o.width / 2,
                             cy: o.y - e.y + o.height / 2,
                             w: o.width,
                             h: o.height
                         };
                     a.length > 0 && a.map(e => i[e] = t.dataset[e] || ""), n.push(i)
                 });
                 var i, r = `locations-${document.title.trim()}-${i=new Date,`${i.getFullYear()}-${i.getMonth()}-${i.getDate()}_${i.getHours()}:${i.getMinutes()}`}.csv`,
                     c = Object.keys(n[0]).join(",");
                 for (var d in n) c += "\n" + Object.values(n[d]).join(",");
                 var h = "data:text/csv;charset=utf-8," + encodeURIComponent(c);
                 // l = window.open().document,
                 // u = l.createElement("div");
                 // u.innerHTML = `<h2>Data for ${n.length} touchpoints saved to:</h2><p>${r}</p>`, l.body.appendChild(u);
                 var s = document.createElement("a");
                 s.setAttribute("href", h), s.setAttribute("download", r), document.body.appendChild(s), s.click(), s.remove()
             } else alert("No touchpoints found on the page! Game over...")
         },
         makeOverlay: function (innerHtml = 'Running pageToSVG...', id = 'pageToSvgOverlay') {

             var overlay = document.createElement('div');
             overlay.id = id;
             styleAttr = {
                 fontFamily: 'sans-serif',
                 color: '#fcfdfe',
                 visibility: 'visible',
                 position: 'fixed',
                 height: '100%',
                 width: '100%',
                 padding: '25px',
                 left: 0,
                 top: 0,
                 backgroundColor: pageInfo.OVERLAY_RGBA,
                 zIndex: 2147483648,
                 display: 'inline',
             };
             Object.entries(styleAttr).map(x => overlay.style[x[0]] = x[1])
             overlay.innerHTML = `<h2 id="overlayHeader">${innerHtml}</h2>`;
             document.body.append(overlay)

         },
         makeTouchpointsTable: function () {
             TABLE_WIDTH_PROP = 1 / 4;
             TABLE_WIDTH = Math.round(window.outerWidth * TABLE_WIDTH_PROP) + 'px'
             COLOR_SCHEME = ['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00', '#ffff33', '#a65628', '#f781bf'];
             tpTableCSS = {
                 '#container': {
                     display: 'flex',
                     height: '100%',
                     width: '100%',
                     "align-items": 'stretch',
                     "align-content": 'baseline',
                     "flex-direction": 'row',
                     "background-color": '#f1f1f1',
                 },
                 '#tableContainer': {
                     flex: '1 1 auto',
                     'font-family': 'sans-serif',
                     left: 0,
                     flexBasis: 'content',
                     overflow: 'scroll',
                     top: 0,
                     width: TABLE_WIDTH,
                     height: '100%',
                     zIndex: 20000,
                     position: 'relative',
                     whiteSpace: 'nowrap',
                     display: 'inline-block',
                     borderWidth: '3px',
                     padding: '5px',
                     borderColor: 'rgb(125,125,125)',
                 },
             }

             var newTab = window.open('');
             Promise.all([
                 //  util.load('https://cdnjs.cloudflare.com/ajax/libs/tabulator/4.1.2/js/tabulator.min.js'),
                 //  util.load('https://cdnjs.cloudflare.com/ajax/libs/tabulator/4.1.2/css/tabulator_site.min.css', theDocument = newTab.document),
                 // util.load('https://cdnjs.cloudflare.com/ajax/libs/tabulator/4.1.2/css/tabulator.min.css', theDocument = newTab.document),
                 util.load('https://code.jquery.com/jquery-3.3.1.min.js', theDocument = newTab.document),
                 //  util.load('https://use.fontawesome.com/releases/v5.6.3/css/all.css', theDocument = newTab.document),
             ]).then(() => {
                 newTab.focus();

                 ui.addCSS(tpTableCSS, newTab.document);
                 // parent flex container
                 $('<div>', {
                     id: 'container',
                 }).prependTo(newTab.document.body)

                 var container = newTab.document.getElementById('container');
                 // Add a container div for the touchpoint table to live in
                 $('<div>', {
                     id: 'tableContainer',
                 }).appendTo(container);

                 // Grab the SVG from the original document and make it visible
                 $('#svgContainer').clone().attr('id', 'newSvgContainer').css({
                     position: 'relative',
                     right: "100%",
                     // flexBasis: 'content',
                     flex: '2 1 auto',
                     display: 'inline-block'
                 }).appendTo(container)
                 var svgDoc = newTab.document.getElementById('svgDocument');
                 $(svgDoc).css({
                     flex: '2 1 auto',
                     flexBasis: 'content',
                     position: 'relative',
                     visibility: 'visible',
                     overflow: 'hidden',
                     // zIndex: 10000,
                 });


                 // get touchpoint data
                 // var selectPattern = '[id^=tp_]'; // touchPoints only
                 var selectPattern = '#svgDocument g';
                 var el = newTab.document.querySelectorAll(selectPattern),
                     k = [],
                     tp = [];
                 el.forEach(x => k.push(Object.keys(x.dataset)));
                 var dataCol = k.flat().filter((val, idx, self) => self.indexOf(val) === idx).sort();
                 var columnDef = [{
                     title: 'clickCode',
                     field: 'id'
                 }];

                 // this adds data-* columns to table column list
                 // dataCol.map(x => columnDef.push({
                 //     title: x,
                 //     field: x
                 // }))

                 el.forEach(function (x) {
                     var p = {
                         id: x.id
                     };
                     if (dataCol.length > 0) {
                         dataCol.map(c => p[c] = x.dataset[c] || '')
                     }
                     tp.push(p);
                 })

                 function highlightElements(elems) {
                     var svgDoc = newTab.document.getElementById('svgDocument');
                     var svgDocDims = util.getDims(svgDoc);
                     var DILATE = 5,
                         CURRENT_CHILD_IDX = 0;

                     // window.innerHeight
                     // el.getBoundingClientRect()['y']
                     elems[0].scrollIntoViewIfNeeded({
                         behavior: "smooth",
                         block: "end",
                         inline: "nearest"
                     });
                     // elems[0].scrollIntoViewIfNeeded();
                     for (var el of elems) {
                         var dims = util.getDims(el);
                         var rect = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
                         // 'rgba(250, 20, 20, 0.3)'
                         if (CURRENT_CHILD_IDX > 0) {
                             var curColor = COLOR_SCHEME[CURRENT_CHILD_IDX];
                         } else {
                             var curColor = COLOR_SCHEME[1];
                         }
                         rect.setAttributeNS(null, 'x', dims.x - DILATE - svgDocDims.x);
                         rect.setAttributeNS(null, 'y', dims.y - DILATE - svgDocDims.y);
                         rect.setAttributeNS(null, 'height', dims.h + (DILATE * 2));
                         rect.setAttributeNS(null, 'width', dims.w + (DILATE * 2));
                         rect.setAttributeNS(null, 'fill', curColor);
                         rect.setAttributeNS(null, 'opacity', 0.35);
                         rect.setAttribute('id', 'selectionRect');
                         svgDoc.appendChild(rect);
                         CURRENT_CHILD_IDX += 1;
                     }
                 }

                 //create Tabulator on DOM element with
                 var table = new Tabulator(newTab.document.querySelector('#tableContainer'), {
                     autoResize: true,
                     layoutColumnsOnNewData: true,
                     movableColumns: true,
                     selectable: 1, // allow selecting only 1 row at a time
                     height: window.innerHeight,
                     virtualDomBuffer: 100,
                     virtualDom: false,
                     data: tp,
                     // responsiveLayout: 'collapse', // collapse, hide, true
                     layout: 'fitColumns', // fitData, fitColumns, fitDataFill
                     columns: columnDef,
                     rowClick: function (e, row) {
                         //e - the click event object
                         //row - row component
                         // $('[data-client-id="22"]');
                         newTab.document.querySelectorAll('#selectionRect').forEach(x => x.remove());
                         var clientId = row.getData().clientId;
                         var elems = newTab.document.querySelectorAll(`[data-client-id=${$.escapeSelector(clientId)}]`);
                         highlightElements(elems);
                         console.log(row.getData())
                     },
                 })

             })
         }
     }
     var beta = {
         nodeToImage: function (node, output = 'png') {
             // async                  ,true                    ,Whether to parse and render the element asynchronously
             // allowTaint             ,false                   ,Whether to allow cross-origin images to taint the canvas
             // backgroundColor        ,#ffffff                 ,Canvas background color
             // canvas                 ,null                    ,Existing canvas element to use as a base for drawing on
             // foreignObjectRendering ,false                   ,Whether to use ForeignObject rendering if the browser supports it
             // imageTimeout           ,15000                   ,Timeout for loading an image (in milliseconds). Set to 0 to disable timeout.
             // ignoreElements         ,(element) => false      ,Predicate function which removes the matching elements from the render.
             // logging                ,true                    ,Enable logging for debug purposes
             // onclone                ,null                    ,Callback function which is called when the Document has been cloned for rendering
             // proxy                  ,null                    ,Url to the proxy which is to be used for loading cross-origin images. If left empty
             // removeContainer        ,true                    ,Whether to cleanup the cloned DOM elements html2canvas creates temporarily
             var options = {
                 backgroundColor: null, // Canvas background color (set to 'null' for transparent
                 removeContainer: true, // Whether to cleanup the cloned DOM elements html2canvas creates temporarily
                 async: true, // Whether to parse and render the element asynchronously
                 canvas: null, // Existing canvas element to use as a base for drawing on
                 imageTimeout: 15000, // Timeout for loading an image (in milliseconds). Set to 0 to disable timeout.
                 logging: false, // Enable logging for debug purposes
                 onrendered: function (canvas) {
                     document.body.appendChild(canvas);
                     PAGE_RGB = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
                 }, // Callback function which is called when the Document has been cloned for rendering
             };
             var liburl = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/0.4.1/html2canvas.min.js';
             $.when($.getScript(liburl).done(function () {
                 html2canvas(node, options)
             }))

         },
         downloadNode: function (node) {

             var options = {
                 backgroundColor: null, // Canvas background color (set to 'null' for transparent
                 removeContainer: true, // Whether to cleanup the cloned DOM elements html2canvas creates temporarily
                 async: false, // Whether to parse and render the element asynchronously
                 // ignoreElements: "BODY",
                 canvas: null, // Existing canvas element to use as a base for drawing on
                 imageTimeout: 15000, // Timeout for loading an image (in milliseconds). Set to 0 to disable timeout.
                 logging: true, // Enable logging for debug purposes
                 onrendered: function (canvas) {
                     $('a').attr({
                         href: canvas.toDataURL(),
                         download: 'test.png',
                     }).appendTo('body').click().remove()
                 },
             };
             var liburl = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/0.4.1/html2canvas.min.js';
             $.when($.getScript(liburl).done(function () {
                 html2canvas(node || document.body, options)
             }))

         },
         pageToPixelData: function () {

             var options = {
                 backgroundColor: null, // Canvas background color (set to 'null' for transparent
                 removeContainer: false, // Whether to cleanup the cloned DOM elements html2canvas creates temporarily
                 async: true, // Whether to parse and render the element asynchronously
                 canvas: null, // Existing canvas element to use as a base for drawing on
                 imageTimeout: 15000, // Timeout for loading an image (in milliseconds). Set to 0 to disable timeout.
                 logging: true, // Enable logging for debug purposes
                 onrendered: function (canvas) {
                     RGB = {
                         data: new Uint32Array(canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data.buffer),
                         W: canvas.width,
                         H: canvas.height,
                     }
                 }, // Callback function which is called when the Document has been cloned for rendering
             };

             var liburl = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/0.4.1/html2canvas.min.js';
             $.when($.getScript(liburl).done(function () {
                 html2canvas(document.body, options)
             }))

         },
         cropFromPage: function (x, y, w, h) {

             elem = util.forceDom(elem);
             var dims = util.getDims(elem);
             var canvas = document.createElement('canvas');
             var context = canvas.getContext('2d');
             context.clearRect(0, 0, canvas.width, canvas.height);
             var image = new Image();
             image.src = elem.src || $(elem).css('backgroundImage').match(/^url\("(.+)"\)$/)[1];
             image.onload = function () {
                 context.drawImage(image, 0, 0);
                 image.style.display = 'visible';
             }
         },
         toggleClickLogging: function () {

             if (!document.body.onclick) {
                 CLICK_LOG = []; // initialize variable
                 function clickHandler(event) {

                     var clickedEl = event.target;
                     var clickedCmp = AdfRichUIPeer.getFirstAncestorComponent(clickedEl);
                     var currentClick = {
                         event: event,
                         clickedElement: clickedEl,
                         clickedComponent: clickedCmp,
                     };

                     console.log(currentClick);
                     CLICK_LOG.push(currentClick)
                     event.stopPropagation();
                     event.preventDefault();
                     return false;
                 }
                 document.body.onclick = clickHandler;
             } else {
                 document.body.onclick = null;
             }
         },
         dom2img: function (el) {


             function downloadDataUrl(dataUrl, fileName = 'output') {

                 var downloadAnchorNode = document.createElement('a');
                 downloadAnchorNode.setAttribute("href", dataUrl);
                 downloadAnchorNode.setAttribute("download", fileName);
                 document.body.appendChild(downloadAnchorNode); // required for firefox
                 downloadAnchorNode.click();
                 downloadAnchorNode.remove();

             }
             domtoimage.toSvg(el).then(
                 (dataUrl) => downloadDataUrl(dataUrl)
             )

             // then(function (dataUrl) {
             //      $('<a>').attr({
             //              href: dataUrl,
             //              download: defaultFileName,
             //          }.click()

             // var link = document.createElement('a'); link.download = id + '.svg'; link.href = '<?xml version="1.0" standalone="no"?>\r\n' + encodeURIComponent(dataUrl);
             // // link.href = dataUrl;
             //              // link.click();
             //          })
             //  })

         },
     }

     // +-+-+-+ +-+-+
     // OFF THE CHAIN
     // +-+-+-+ +-+-+
     Promise.all([
         util.load('https://code.jquery.com/jquery-3.3.1.min.js'),
         //  util.load('https://ux.us.oracle.com/export/users_data/Apps-ux/bspunt/assets/adfIconPaths.js'),
         util.load('https://stbeehive.oracle.com/content/dav/st/outcome-telemetry/Public%20Documents/adfIconPaths.js'),
         util.load('https://cdnjs.cloudflare.com/ajax/libs/snap.svg/0.5.1/snap.svg-min.js'),
         util.load('https://cdn.jsdelivr.net/npm/imagetracerjs@1.2.5/imagetracer_v1.2.5.min.js'),
         util.load('https://cdnjs.cloudflare.com/ajax/libs/dom-to-image/2.6.0/dom-to-image.min.js'),
         util.load('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/0.4.1/html2canvas.min.js'),
     ]).then(() => {
         util.addExtensions()
     }).then(() => {
         return util.getIcons()
     }).then(() => {
         return ui.initContainer()
         // }).then(() => {
         //     // if (DEBUG_MODE) {
         //     //     throw 'Welcome to DEBUG MODE. To use the private API syntax, run:\n\npageInfo = pageToSvg.pageInfo; util = pageToSvg.util; adf = pageToSvg.adf; draw = pageToSvg.draw; select = pageToSvg.select\n'
         //     // }
     }).then(() => {
         return draw.containers()
     }).then(() => {
         return draw.inputs()
     }).then(() => {
         return draw.images()
     }).then(() => {
         return util.wait(1000).then(draw.svgs())
     }).then(() => {
         return util.wait(500).then(draw.text())
     }).then(() => {
         return util.wait(500).then(util.cleanupDoc())
     }).then(() => {
         if (DEBUG_MODE) {
             throw 'Welcome to DEBUG MODE. To use the private API syntax, run:\n\npageInfo = pageToSvg.pageInfo; util = pageToSvg.util; adf = pageToSvg.adf; draw = pageToSvg.draw; select = pageToSvg.select; ui = pageToSvg.ui\n'
         }
     }).then(() => {
         return ui.makeTouchpointsTable();
         // return ui.downloadSvg()
         // return ui.downloadTouchpoints()
     }).catch(reasonForStopping => {
         util.log(reasonForStopping)
         $('#pageToSvgOverlay').remove()
     }).finally(() => {

         if (DEBUG_MODE) {
             toggle = ui.toggle;
             reset = ui.reset;
             pageToSvg = {
                 pageInfo,
                 select,
                 draw,
                 util,
                 adf,
                 ui,
                 beta
             }
         }
     })
 })();
