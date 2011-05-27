var meta = function() {
    var inlet = linkage.type({});

    var emptyinlet = linkage.type({
        init: function(outlet) {
            this.outlet = outlet; } });

    var iterator = linkage.type({
        init: function(focus, target) {
            this.focus = focus;
            this.target = target; } });

    var node = linkage.type({
        init: function(spec) {
            this.type = spec.type;
            this.inlet = spec.inlet || emptyinlet(this);
            this.outlets = spec.outlets || []; },

        empty: function() {
            return false; },

        open: function() {
            if (this.type.outlets.length - this.outlets.length > 0) {
                return this.outlets.length; }
            else {
                return 0; } },

        join: function(path) {
            var position = this.open();
            if (position >= 0) {
                path.inlet = this;
                this.outlets.push(path);
                return this.outlets.last(); }
            else { return null; } },

        compare: function(other) {
            if (this.type.slug == other.type.slug) {
                var same = true;
                var ll = 0;
                while (same && ll < other.outlets.length) {
                    if (this.outlets[ll]) {
                        same = same && this.outlets[ll].compare(other.outlets[ll]); }
                    else {
                        return false; }
                    ll += 1; }
                return same; }
            else {
                return false; } },

        execute: function(it) {
            return this.type.body(this, it); },

        replicate: function() {
            var born = node(spec);
            for (var o = 0; o < this.outlets.length; o++) {
                born.outlets.push(this.outlets[o].replicate()); }
            return born; } });

    var emptynode = linkage.type([node], {
        empty: function() {
            return true; } });

    var type = linkage.type({
        init: function(spec) {
            this.body = spec.body || function() {};
            this.outlets = spec.outlets || [];
            this.slug = spec.slug || 'type'; },

        generate: function(spec) {
            return node({type: this}); },

        flow: function(node, it, path) {
            path = path || 0;
            if (node.outlets[path]) {
                return node.outlets[path].execute(it); }
            else {
                return it; } } });

    var iftype = linkage.type([type], {
        init: function(spec) {
            arguments.callee.uber({
                slug: 'if',
                outlets: 3,
                body: function(node, it) {
                    if (node.outlets[0] && it.focus.compare(node.outlets[0])) {
                        return node.type.flow(node, it, 1); }
                    else {
                        return node.type.flow(node, it, 2); } } }); } });

    var movefocusuptype = linkage.type([type], {
        init: function(spec) {
            arguments.callee.uber({
                slug: 'movefocusup',
                outlets: 1,
                body: function(node, it) {
                    if (it.focus.inlet) {
                        it.focus = it.focus.inlet; }
                    return node.type.flow(node, it, 0); } }); } });

    var movefocusdowntype = linkage.type([type], {
        init: function(spec) {
            var outlet = spec.outlet || 0;
            arguments.callee.uber({
                slug: 'movefocusdown',
                outlets: 1,
                body: function(node, it) {
                    if (it.focus.outlet[outlet]) {
                        it.focus = it.focus.outlet[outlet]; }
                    return node.type.flow(node, it, 0); } }); } });

    var movetargetuptype = linkage.type([type], {
        init: function(spec) {
            arguments.callee.uber({
                slug: 'movetargetup',
                outlets: 1,
                body: function(node, it) {
                    if (it.target.inlet) {
                        it.target = it.target.inlet; }
                    return node.type.flow(node, it, 0); } }); } });

    var movetargetdowntype = linkage.type([type], {
        init: function(spec) {
            var outlet = spec.outlet || 0;
            arguments.callee.uber({
                slug: 'movetargetdown',
                outlets: 1,
                body: function(node, it) {
                    if (it.target.outlet[outlet]) {
                        it.target = it.target.outlet[outlet]; }
                    return node.type.flow(node, it, 0); } }); } });

    var jointype = linkage.type({
        init: function(spec) {
            arguments.callee.uber({
                slug: 'join',
                outlets: 2,
                body: function(node, it) {
                    if (it.target.open()) {
                        it.target.join(node.outlets[0].replicate()); }
                    return node.type.flow(node, it, 1); } }); } });

    var tree = linkage.type({
        init: function(spec) {} });

    return {
        type: type,
        node: node,
        tree: tree }; }();