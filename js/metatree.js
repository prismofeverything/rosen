var meta = function() {
    var inlet = linkage.type({});

    var emptyinlet = linkage.type({
        init: function(outlet) {
            this.outlet = outlet; } });

    var node = linkage.type({
        init: function(type, spec) {
            this.type = type;
            this.inlet = spec.inlet || emptyinlet(this);
            this.outlets = spec.outlets || []; },

        empty: function() {
            return false; },

        open: function() {
            if (this.type.outlets.length - this.outlets.length > 0) {
                return this.outlets.length; }
            else {
                return -1; } },

        join: function(path) {
            var position = this.open();
            if (position >= 0) {
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

        execute: function(focus, target) {
            
        }
    });

    var emptynode = linkage.type([node], {
        empty: function() {
            return true; } });

    var type = linkage.type({
        init: function(spec, node) {
            this.node = spec.node || emptynode();
            this.body = spec.body || function() {};
            this.outlets = spec.outlets || [];
            this.slug = spec.slug || 'type'; },

        generate: function(spec) {
            return node(this); } });

    var iftype = linkage.type([type], {
        init: function(node) {
            arguments.callee.uber({
                slug: 'if',
                node: node, 
                outlets: 3,
                body: function(focus, target) {
                    if (node.outlets[0] && focus.compare(node.outlets[0])) {
                        return node.outlets[1].execute(focus, target); }
                    else {
                        return node.outlets[2].execute(focus, target); } } }); } });

    var tree = linkage.type({
        init: function(spec) {
            
        }
    });

    var iterator = linkage.type({
        
    });
}();