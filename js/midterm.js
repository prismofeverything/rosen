var globalFontSize = 14;
var globalWidth = 50;
var globalHeight = 30;

Raphael.fn.arrow = function (path, x1, y1, x2, y2, size) {
  var point = path.getPointAtLength(path.getTotalLength()-5);
  var angle = point.alpha;
  var arrowString = 'M' + x2 + ' ' + y2 + ' L' + (x2 - size) + ' ' + (y2 - size) + ' L' + (x2 - size) + ' ' + (y2 + size) + ' L' + x2 + ' ' + y2;
  return {path: arrowString, angle: angle};
}

Raphael.fn.connection = function (obj1, obj2, line, bg, info) {
  if (obj1.line && obj1.from && obj1.to) {
    line = obj1;
    obj1 = line.from;
    obj2 = line.to;
  }
  var bb1 = obj1.getBBox(),
  bb2 = obj2.getBBox(),
  p = [{x: bb1.x + bb1.width / 2, y: bb1.y - 1},
       {x: bb1.x + bb1.width / 2, y: bb1.y + bb1.height + 1},
       {x: bb1.x - 1, y: bb1.y + bb1.height / 2},
       {x: bb1.x + bb1.width + 1, y: bb1.y + bb1.height / 2},
       {x: bb2.x + bb2.width / 2, y: bb2.y - 1},
       {x: bb2.x + bb2.width / 2, y: bb2.y + bb2.height + 1},
       {x: bb2.x - 1, y: bb2.y + bb2.height / 2},
       {x: bb2.x + bb2.width + 1, y: bb2.y + bb2.height / 2}],
  d = {}, dis = [];
  for (var i = 0; i < 4; i++) {
    for (var j = 4; j < 8; j++) {
      var dx = Math.abs(p[i].x - p[j].x),
      dy = Math.abs(p[i].y - p[j].y);
      if ((i == j - 4) || (((i != 3 && j != 6) || p[i].x < p[j].x) && ((i != 2 && j != 7) || p[i].x > p[j].x) && ((i != 0 && j != 5) || p[i].y > p[j].y) && ((i != 1 && j != 4) || p[i].y < p[j].y))) {
        dis.push(dx + dy);
        d[dis[dis.length - 1]] = [i, j];
      }
    }
  }
  if (dis.length == 0) {
    var res = [0, 4];
  } else {
    res = d[Math.min.apply(Math, dis)];
  }
  var x1 = p[res[0]].x,
  y1 = p[res[0]].y,
  x4 = p[res[1]].x,
  y4 = p[res[1]].y;
  dx = Math.max(Math.abs(x1 - x4) / 2, 10);
  dy = Math.max(Math.abs(y1 - y4) / 2, 10);
  var x2 = [x1, x1, x1 - dx, x1 + dx][res[0]].toFixed(3),
  y2 = [y1 - dy, y1 + dy, y1, y1][res[0]].toFixed(3),
  x3 = [0, 0, 0, 0, x4, x4, x4 - dx, x4 + dx][res[1]].toFixed(3),
  y3 = [0, 0, 0, 0, y1 + dy, y1 - dy, y4, y4][res[1]].toFixed(3);
  var path = ["M", x1.toFixed(3), y1.toFixed(3), "C", x2, y2, x3, y3, x4.toFixed(3), y4.toFixed(3)].join(",");
  if (line && line.line) {
    line.bg && line.bg.attr({path: path});
    line.line.attr({path: path});
    var arrow = this.arrow(line.line, x1, y1, x4, y4, 7);
    var color = line.line.attr('stroke');
    var labelshift = line.sign > 0 ? 0.7 : 0.6;
    line.arrow.remove();
    line.arrow = this.path(arrow.path).attr({stroke: color, fill: color}).rotate(arrow.angle, x4, y4);
    var point = line.line.getPointAtLength(line.line.getTotalLength()*labelshift);
    line.label.remove();
    line.label = this.text(point.x, point.y, line.labeltext).attr({stroke: color, fill: color, 'font-size': globalFontSize});
  } else {
    var color = typeof line == "string" ? line : "#000";
    var bgline = bg && bg.split && this.path(path).attr({stroke: bg.split("|")[0], fill: "none", "stroke-width": bg.split("|")[1] || 3});
    var mainline = this.path(path).attr({stroke: color, fill: "none", 'stroke-width': 3});
    var labelshift = info.sign > 0 ? 0.7 : 0.6;
    var point = mainline.getPointAtLength(mainline.getTotalLength()*labelshift);
    var arrow = this.arrow(mainline, x1, y1, x4, y4, 7);
    var arrowPath = this.path(arrow.path).attr({stroke: color, fill: color}).rotate(arrow.angle, x4, y4);
    return {
      bg: bgline,
      line: mainline,
      arrow: arrowPath,
      label: this.text(point.x, point.y, info.name).attr({fill: color, stroke: color, 'font-size': globalFontSize}),
      labeltext: info.name,
      sign: info.sign,
      from: obj1,
      to: obj2
    };
  }
};

var windowDim = function() {
  var winW = 630, winH = 460;
  if (document.body && document.body.offsetWidth) {
    winW = document.body.offsetWidth;
    winH = document.body.offsetHeight;
  }
  if (document.compatMode=='CSS1Compat' &&
      document.documentElement &&
      document.documentElement.offsetWidth ) {
        winW = document.documentElement.offsetWidth;
        winH = document.documentElement.offsetHeight;
      }
  if (window.innerWidth && window.innerHeight) {
    winW = window.innerWidth;
    winH = window.innerHeight;
  }

  return [winW, winH];
};

var midterm = function() {
  var dim = windowDim();
  var rr = Raphael(0, 0, dim[0], dim[1]);  
  var connections = [];

  var dragShape = function () {
    this.ox = this.type == "rect" ? this.attr("x") : this.attr("cx");
    this.oy = this.type == "rect" ? this.attr("y") : this.attr("cy");
//     this.label.ox = this.ox;
//     this.label.oy = this.oy;
// //    this.animate({"fill-opacity": .2}, 500);
  };

  var moveShape = function (dx, dy) {
    var att = this.type == "rect" ? {x: this.ox + dx, y: this.oy + dy} : {cx: this.ox + dx, cy: this.oy + dy};
    var latt = this.type == "rect" ? {x: this.ox + dx + globalWidth, y: this.oy + dy + globalHeight} : {x: this.ox + dx, y: this.oy + dy};
    this.attr(att);
    this.label.attr(latt);
    for (var i = connections.length; i--;) {
      rr.connection(connections[i]);
    }
//    rr.safari();
  };

  var releaseShape = function () {
//    this.animate({"fill-opacity": 0}, 500);
  };

  var components = {
    project: {type: 'concrete', x: 400, y: 200, w: globalWidth, h: globalHeight},
    users: {type: 'concrete', x: 600, y: 250, w: globalWidth, h: globalHeight},
    contributors: {type: 'concrete', x: 500, y: 300, w: globalWidth, h: globalHeight},
    'related projects': {type: 'concrete', x: 100, y: 100, w: globalWidth, h: globalHeight},
    need: {type: 'abstract', x: 100, y: 300, w: globalWidth, h: globalHeight},
    'available time': {type: 'abstract', x: 300, y: 350, w: globalWidth, h: globalHeight},
    'other priorities': {type: 'abstract', x: 700, y: 350, w: globalWidth, h: globalHeight}
  };

  var typeShapes = {
    concrete: function(key, x, y, w, h) {
      var ell = rr.ellipse(x, y, w, h);
      ell.attr('fill', '#eedd77');
      ell.attr('stroke', '#000');
      ell.label = rr.text(x, y, key).attr({'font-size': globalFontSize});
      ell.drag(moveShape, dragShape, releaseShape);
      return ell;
    },

    abstract: function(key, x, y, w, h) {
      var rec = rr.rect(x-w, y-h, w*2, h*2, 5);
      rec.attr('fill', '#ddccee');
      rec.attr('stroke', '#000');
      rec.label = rr.text(x, y, key).attr({'font-size': globalFontSize});
      rec.drag(moveShape, dragShape, releaseShape);
      return rec;
    },
  }

  var arrows = [
    {from: "project", to: "related projects", name: "supports", sign: 1},
    {from: "project", to: "other priorities", name: "removes need for", sign: -1},
    {from: "project", to: "available time", name: "increases", sign: 1},
    {from: "project", to: "contributors", name: "provides for", sign: 1},
    {from: "project", to: "users", name: "enables", sign: 1},
    {from: "project", to: "need", name: "fills", sign: -1},
    {from: "project", to: "need", name: "generates new", sign: 1},

    {from: "contributors", to: "project", name: "develop", sign: 1},
    {from: "contributors", to: "users", name: "support", sign: 1},

    {from: "users", to: "project", name: "use", sign: 1},
    {from: "users", to: "need", name: "intensify", sign: 1},
    {from: "users", to: "contributors", name: "inform", sign: 1},
    {from: "users", to: "contributors", name: "annoy", sign: -1},

    {from: "related projects", to: "project", name: "supports", sign: 1},
    {from: "related projects", to: "need", name: "stokes", sign: 1},

    {from: "need", to: "contributors", name: "inspires", sign: 1},
    {from: "need", to: "users", name: "compels", sign: 1},
    {from: "need", to: "other priorities", name: "reduces the relevence of", sign: -1},
    
    {from: "available time", to: "contributors", name: "allows", sign: 1},

    {from: "other priorities", to: "contributors", name: "tie up", sign: -1},
    {from: "other priorities", to: "available time", name: "takes up", sign: -1}
  ];

  var shapes = _.reduce(_.keys(components), function(map, key) {
    var com = components[key];
    map[key] = {
      shape: typeShapes[com.type](key, com.x, com.y, com.w, com.h),
    };
    return map;
  }, {});

  connections = _.map(arrows, function(arrow) {
    var color = arrow.sign > 0 ? '#e77' : '#77e';
    return rr.connection(
      shapes[arrow.from].shape, 
      shapes[arrow.to].shape, 
      color,
      '#fff|5',
      arrow
    );
  });
};

window.onload = midterm;