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

        execute: function(it) {
            return this.type.body(this, it); } });

    var emptynode = linkage.type([node], {
        empty: function() {
            return true; } });

    var type = linkage.type({
        init: function(spec) {
            this.body = spec.body || function() {};
            this.outlets = spec.outlets || [];
            this.slug = spec.slug || 'type'; },

        generate: function(spec) {
            return node({type: this}); } });

    var iftype = linkage.type([type], {
        init: function() {
            arguments.callee.uber({
                slug: 'if',
                outlets: 3,
                body: function(node, it) {
                    if (node.outlets[0] && it.focus.compare(node.outlets[0])) {
                        if (node.outlets[1]) {
                            return node.outlets[1].execute(it); }
                        else {
                            return it; } }
                    else if (node.outlets[2]) {
                        return node.outlets[2].execute(it); }
                    else {
                        return it; } } }); } });

    var movefocusuptype = linkage.type([type], {
        init: function() {
            arguments.callee.uber({
                slug: 'movefocusup',
                outlets: 1,
                body: function(node, it) {
                    if (it.focus.inlet) {
                        it.focus = it.focus.inlet; }
                    if (node.outlets[0]) {
                        return node.outlets[0].execute(it); }
                    else {
                        return it; } } }); } });

    var tree = linkage.type({
        init: function(spec) {
            
        }
    });

    return {
        type: type,
        node: node,
        tree: tree }; }();