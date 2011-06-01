var meta = function() {
    var iterator = linkage.type({
        init: function(focus, target) {
            this.focus = focus;
            this.target = target; } });

    var node = linkage.type({
        init: function(spec) {
            this.type = spec.type;
            this.inlet = spec.inlet;
            this.outlets = spec.outlets || []; },

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
            else {
                return null; } },

        compare: function(other) {
            if (this.type.shares(other.type)) {
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
            return born; },

        code: function() {
            var output = '(' + this.type.key;
            for (var oo = 0; oo < this.outlets.length; oo++) {
                output += ' ' + this.outlets[oo].code(); }
            return output + ')'; } });

    var environmentnode = linkage.type({
        init: function(spec) {
            this.generator = spec.generator || function() { return Math.random(); }; },

        open: function() { return true; },
        
        join: function(path) {},

        compare: function(other) {},

        execute: function(it) { return it; },

        replicate: function() { return this; }
    });

    var type = linkage.type({
        init: function(spec) {
            this.body = spec.body || function() {};
            this.outlets = spec.outlets || [];
            this.key = spec.key || 'type'; },

        shares: function(other) {
            return this.key === other.key; },

        generate: function() {
            return node({type: this}); },

        flow: function(node, it, path) {
            path = path || 0;
            if (node.outlets[path]) {
                return node.outlets[path].execute(it); }
            else {
                return it; } } });

    function randomPointer() {
        return Math.random() > 0.5 ? 'focus' : 'target'; }

    function randomOutlet() {
        return Math.floor(Math.random() * 2.5); }

    var iftype = linkage.type([type], {
        init: function(spec) {
            arguments.callee.uber({
                key: 'if',
                outlets: 3,
                body: function(node, it) {
                    if (node.outlets[0] && it.focus.compare(node.outlets[0])) {
                        return node.type.flow(node, it, 1); }
                    else {
                        return node.type.flow(node, it, 2); } } }); } });

    var moveuptype = linkage.type([type], {
        init: function(spec) {
            this.element = spec.element || randomPointer();
            arguments.callee.uber({
                key: 'moveup',
                outlets: 1,
                body: function(node, it) {
                    if (it[element].inlet) {
                        it[element] = it[element].inlet; }
                    return node.type.flow(node, it, 0); } }); },

        shares: function(other) {
            return this.key === other.key && this.element === other.element; } });

    var movedowntype = linkage.type([type], {
        init: function(spec) {
            this.element = spec.element || randomPointer();
            this.outlet = spec.outlet || randomOutlet();
            arguments.callee.uber({
                key: 'movedown',
                outlets: 1,
                body: function(node, it) {
                    if (it[element].outlet[outlet]) {
                        it[element] = it[element].outlet[outlet]; }
                    return node.type.flow(node, it, 0); } }); },

        shares: function(other) {
            return this.key === other.key &&
                this.element === other.element &&
                this.outlet === other.outlet; } });

    var jointype = linkage.type([type], {
        init: function(spec) {
            arguments.callee.uber({
                key: 'join',
                outlets: 2,
                body: function(node, it) {
                    if (it.target.open()) {
                        it.target.join(node.outlets[0].replicate()); }
                    return node.type.flow(node, it, 1); } }); } });

    var splicetype = linkage.type([type], {
        init: function(spec) {
            this.outlet = spec.outlet || randomOutlet();
            arguments.callee.uber({
                key: 'splice',
                outlets: 2,
                body: function(node, it) {
                    if (it.target.type.outlets > this.outlet) {
                        var spliced = node.outlets[0].replicate();
                        if (it.target.outlets.length > this.outlet) {
                            spliced.outlets[0] = it.target.outlets[outlet]; }
                        it.target.outlets[outlet] = spliced; }
                    return node.type.flow(node, it, 1); } }); },

        shares: function(other) {
            return this.key === other.key &&
                this.element === other.element &&
                this.outlet === other.outlet; } });

    var types = {
        if: iftype(),
        join: jointype() };

    for (var outlet = 0; outlet < 3; outlet++) {
        types['splice'+outlet] = splicetype({outlet: outlet});
        for (var to in {focus: 1, target: 1}) {
            types['movedown'+to+outlet] = movedowntype({element: to, outlet: outlet});
            if (outlet === 0) {
                types['moveup'+to] = moveuptype({element: to}); } } }

    var typekeys = [];
    for (var key in types) {
        typekeys.push(key); }

    var tree = linkage.type({
        init: function(spec) {
            this.root = spec.root || types['if'].generate(); },

        execute: function() {
            return this.root.execute(this.it); },

        code: function() {
            return this.root.code(); } });

    var diagram = linkage.type({
        init: function(spec) {
            var generator = spec.environment || spec.e || function() { return Math.random(); };
            this.environment = environmentnode({generator: generator});
            this.metabolism = spec.metabolism || spec.m || tree({});
            this.repair = spec.repair || spec.r || tree({});
            this.behavior = spec.behavior || spec.b || tree({});

            this.metabolism.it = iterator(this.environment, this.behavior.root);
            this.repair.it = iterator(this.behavior.root, this.metabolism.root);
            this.behavior.it = iterator(this.metabolism.root, this.repair.root); } });

    function randomTypeKey() {
        var typekey;
        while(!typekey) {
            typekey = typekeys[Math.floor(Math.random() * typekeys.length)]; }
        return typekey;
    }

    function randomTree(depth) {
        var pod = types[randomTypeKey()].generate();
        if (depth > 0) {
            for (var ii = 0; ii < pod.type.outlets; ii++) {
                var subpod = randomTree(depth-1);
                pod.outlets.push(subpod); } }
        return pod; };

    return {
        type: type,
        node: node,
        tree: tree,
        diagram: diagram,
        random: randomTree }; }();