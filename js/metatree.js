var meta = function() {
    var iterator = linkage.type({
        init: function(focus, target, focustree, targettree) {
            this.focus = focus;
            this.target = target;
            this.focustree = focustree;
            this.targettree = targettree; } });

    var maxlevel = 50;
    var emptynode = linkage.type({
        init: function(spec) {
            this.empty = true;
            this.type = {
                key: 'empty',
                outlets: 0,
                limit: -1,
                signature: function() { return this.key; } }; },

        leaf: function() { return true; },
        open: function() { return false; },
        openOutlet: function() { return -1; },
        balanced: function() { return {full: true, depth: 0}; },
        join: function(path) {},
        clean: function() {},
        fix: function(path, outlet) {},
        compare: function(other) { return other.empty; },
        execute: function(it) { return it; },
        replicate: function() { return emptynode(); },
        purge: function(depth, level) {},
        depth: function() { return 0; },
        code: function() { return '@'; } });

    var node = linkage.type({
        init: function(spec) {
            this.type = spec.type;
            this.outlets = [];
            this.inlet = emptynode();
            for (var oo = 0; oo < this.type.outlets; oo++) {
                this.outlets.push(emptynode()); }
            this.passes = 0;
            this.empty = false;
            this._full = undefined;
            this._depth = undefined; },

        leaf: function() {
            for (var oo = 0; oo < this.outlets.length; oo++) {
                if (!this.outlets[oo].empty) {
                    return false; }
                return true; } },

        open: function() {
            return this.openOutlet() >= 0; },

        openOutlet: function() {
            for (var oo = this.outlets.length - 1; oo >= 0; oo--) {
                if (this.outlets[oo] && this.outlets[oo].empty) {
                    return oo; } }
            return -1; },

        join: function(path) {
            var outlet = this.openOutlet();
            if (outlet >= 0) {
                this.fix(path, outlet);
                return outlet; }
            else {
                return -1; } },

        fix: function(path, outlet) {
            path.inlet = this;
            this.outlets[outlet] = path;
            return this.outlets[outlet]; },

        append: function(path) {
            var outlet = this.outlets.length - 1;
            if (!(this.join(path) >= 0)) {
                this.outlets[outlet].append(path); } },

        fill: function(path) {
            if (this.balanced().full) { return false; }

            var shallow = 0;
            var shallowdepth = 9999901;
            for (var oo = 0; oo < this.outlets.length; oo++) {
                if (this.outlets[oo].empty) {
                    this.fix(path, oo);
                    return true; }
                else if (this.outlets[oo].balanced().depth <= shallowdepth) {
                    shallowdepth = this.outlets[oo].balanced().depth;
                    shallow = oo; } }

            if (this.outlets[shallow].balanced().full) {
                this.outlets[shallow].append(path);
                return true; }
            // top-grower
            else if (this.outlets[shallow].balanced().depth < this.balanced().depth - 1) {
                return this.outlets[shallow].fill(path); }

            return false; },

        compare: function(other) {
            if (this.type.shares(other.type)) {
                var same = true;
                var ll = 0;
                while (same && ll < other.outlets.length) {
                    if (this.outlets[ll]) {
                        same = same && ((!this.outlets[ll] && !other.outlets[ll])
                                        || this.outlets[ll].compare(other.outlets[ll])); }
                    else {
                        return false; }
                    ll += 1; }
                return same; }
            else {
                return false; } },

        execute: function(it) {
            // console.log('  ' + this.type.signature() +
            //             ': (' + it.focus.type.key + ',' + it.target.type.key + ')');

            this.passes += 1;
            return this.type.body(this, it); },

        replicate: function() {
            var born = node(this);
            for (var oo = 0; oo < this.outlets.length; oo++) {
                born.fix(this.outlets[oo].replicate(), oo); }
            return born; },

        clip: function(outlet) {
            var clipped = this.outlets[outlet];
            clipped.inlet = emptynode();
            this.outlets[outlet] = emptynode();
            return clipped; },

        balanced: function() {
            if (this._full != undefined) {
                return {full: this._full, depth: this._depth}; }
            else {
                var result = this.outlets[0].balanced();
                for (var oo = 1; oo < this.outlets.length; oo++) {
                    var test = this.outlets[oo].balanced();
                    if (!test.full || !(result.depth === test.depth)) {
                        if (test.depth > result.depth) {
                            result = test; }
                        result.full = false; } }
                result.depth += 1;
                this._depth = result.depth;
                this._full = result.full;
                return result; } },

        purge: function(depth, level) {
            var clipped = undefined;
            var solidity = 1.01 * maxlevel / level;
            for (var p = 0; p < this.outlets.length; p++) {
                if (level > maxlevel || this.outlets[p].leaf() && this.outlets[p].passes > solidity) {
                    clipped = this;
                    this.clip(p); }
                else {
                    this._depth = undefined;
                    this._full = undefined;
                    this.outlets[p].purge(depth, level+1); } }
            return clipped; }, 

        depth: function() {
            if (this._depth) { return this._depth; }
            var deepest = 0;
            for (var oo = 0; oo < this.outlets.length; oo++) {
                var far = this.outlets[oo].depth() + 1;
                deepest = far > deepest ? far : deepest; }
            this._depth = deepest;
            return deepest; },

        clean: function() {
            this._depth = undefined;
            this._full = undefined;
            for (var oo = 0; oo < this.outlets.length; oo++) {
                this.outlets[oo].clean(); } },

        code: function(level) {
            level = level || 0;
            var padding = '';
            for (var pp = 0; pp < level; pp++) {
                padding += '  '; }
            var output = '\n'+padding+'(' + this.type.signature();
            for (var oo = 0; oo < this.outlets.length; oo++) {
                output += ' ' + this.outlets[oo].code(level+1); }
            return output + ')'; } });

    var type = linkage.type({
        init: function(spec) {
            this.probability = spec.probability || 1;
            this.body = spec.body || function() {};
            this.outlets = spec.outlets || [];
            this.signature = spec.signature || function() { return this.key; };
            this.limit = spec.limit || 5;
            this.key = spec.key || 'type'; },

        shares: function(other) {
            return this.key === other.key; },

        generate: function() {
            return node({type: this}); },

        flow: function(node, it, path) {
            path = path || 0;
            return node.outlets[path].execute(it); } });

    function randomPointer() {
        return Math.random() > 0.5 ? 'focus' : 'target'; }

    function randomOutlet() {
        return Math.floor(Math.random() * 1.9999); }

    var conditions = {
        compare: function(match) {
            match = match || 'if';
            return {
                discern: function(node, it) {
                    return it.focus.type.key === match; },
                signature: function() {
                    return match; } }; },

        random: function(threshold) {
            threshold = threshold || 0.5;
            return {
                discern: function(node, it) {
                    return Math.random() > threshold; },
                signature: function() {
                    return '' + threshhold; } }; } };

    var iftype = linkage.type([type], {
        init: function(spec) {
            this.condition = spec.condition || conditions.compare();
            arguments.callee.uber.call(this, {
                key: 'if',
                outlets: 2,
                probability: 2,
                signature: function() {
                    return this.key + "-" + this.condition.signature(); },
                body: function(node, it) {
                    if (this.condition.discern(node, it)) {
                        if (node.outlets[0].empty) {
                            return node.type.flow(node, it, 1); }
                        return node.type.flow(node, it, 0); }
                    else {
                        if (node.outlets[1].empty) {
                            return node.type.flow(node, it, 0); }
                        return node.type.flow(node, it, 1); } } }); } });

    var moveuptype = linkage.type([type], {
        init: function(spec) {
            this.element = spec.element || randomPointer();
            arguments.callee.uber.call(this, {
                key: 'moveup',
                outlets: 1,
                probability: 4,
                signature: function() {
                    return this.key + "-" + this.element; },
                body: function(node, it) {
                    if (!it[this.element].inlet.empty) {
                        it[this.element] = it[this.element].inlet; }
                    return node.type.flow(node, it, 0); } }); },

        shares: function(other) {
            return this.key === other.key && this.element === other.element; } });

    var movedowntype = linkage.type([type], {
        init: function(spec) {
            this.element = spec.element || randomPointer();
            this.outlet = spec.outlet || randomOutlet();
            arguments.callee.uber.call(this, {
                key: 'movedown',
                outlets: 1,
                probability: 2,
                signature: function() {
                    return this.key + "-" + this.element + "-" + this.outlet; },

                body: function(node, it) {
                    var outlet = (this.outlet < it[this.element].type.outlets) ?
                        this.outlet : (it[this.element].type.outlets - 1);
                    if (outlet >= 0 && !it[this.element].outlets[outlet].empty) {
                        it[this.element] = it[this.element].outlets[outlet]; }
                    return node.type.flow(node, it, 0); } }); },

        shares: function(other) {
            return this.key === other.key &&
                this.element === other.element &&
                this.outlet === other.outlet; } });

    var jointype = linkage.type([type], {
        init: function(spec) {
            arguments.callee.uber.call(this, {
                key: 'join',
                outlets: 1,
                probability: 2,
                body: function(node, it) {
                    it.target.join(it.focus.type.generate()); 
                    return node.type.flow(node, it, 0); } }); } });

    var attachtype = linkage.type([type], {
        init: function(spec) {
            arguments.callee.uber.call(this, {
                key: 'attach',
                outlets: 2,
                body: function(node, it) {
                    it.target.join(node.outlets[0].replicate()); 
                    return node.type.flow(node, it, 1); } }); } });

    var growtype = linkage.type([type], {
        init: function(spec) {
            arguments.callee.uber.call(this, {
                key: 'grow',
                outlets: 1,
                probability: 5,
                body: function(node, it) {
                    it.targettree.grow(it.focus.type.generate());
                    return node.type.flow(node, it, 0); } } ); } });

    var renewtype = linkage.type([type], {
        init: function(spec) {
            arguments.callee.uber.call(this, {
                key: 'renew',
                outlets: 1,
                body: function(node, it) {
                    it.target.passes = 0;
                    return node.type.flow(node, it, 0); } }); } });

    var inserttype = linkage.type([type], {
        init: function(spec) {
            this.outlet = spec.outlet || randomOutlet();
            arguments.callee.uber.call(this, {
                key: 'insert',
                outlets: 1,
                probability: 1,
                signature: function() {
                    return this.key + "-" + this.outlet; },

                body: function(node, it) {
                    var spliced = it.focus.type.generate();
                    var outlet = this.outlet < it.target.type.outlets ?
                        this.outlet : (it.target.type.outlets - 1);
                    if (!it.target.outlets[outlet].empty) {
                        spliced.join(it.target.outlets[outlet]); }
                    it.target.outlets[outlet] = spliced; 
                    return node.type.flow(node, it, 0); } }); },

        shares: function(other) {
            return this.key === other.key &&
                this.element === other.element &&
                this.outlet === other.outlet; } });

    var splicetype = linkage.type([type], {
        init: function(spec) {
            this.outlet = spec.outlet || randomOutlet();
            arguments.callee.uber.call(this, {
                key: 'splice',
                outlets: 2,
                signature: function() {
                    return this.key + "-" + this.outlet; },

                body: function(node, it) {
                    var spliced = node.outlets[0].replicate();;
                    if (this.outlet < it.target.type.outlets) {
                        if (!it.target.outlets[this.outlet].empty) {
                            spliced.join(it.target.outlets[this.outlet]); }
                        it.target.outlets[this.outlet] = spliced; }
                    return node.type.flow(node, it, 1); } }); },

        shares: function(other) {
            return this.key === other.key &&
                this.element === other.element &&
                this.outlet === other.outlet; } });

    var types = {
        // join: jointype(),
        grow: growtype(),
        renew: renewtype() };

    for (var outlet = 0; outlet < 2; outlet++) {
        // types['insert-'+outlet] = inserttype({outlet: outlet});
        // types['splice'+outlet] = splicetype({outlet: outlet});
        for (var to in {focus: 1, target: 1}) {
            types['movedown-'+to+'-'+outlet] = movedowntype({element: to, outlet: outlet});
            if (outlet === 0) {
                types['moveup-'+to] = moveuptype({element: to}); } } }

    var totalif = 0;
    var keys = ['if', 'grow', 'renew', 'moveup', 'movedown'];
    for (var k = 0; k < keys.length; k++) {
        var condition = conditions.compare(keys[k]);
        var ifkey = 'if-'+keys[k];
        var odds = 2;
        totalif += odds;
        types[ifkey] = iftype({condition: condition, probability: odds}); }
    types['if-if'] = iftype({condition: conditions.compare('if'), probability: 5}); 

    var typekeys = [];
    for (key in types) {
        typekeys.push(key); }

    var keywheel = linkage.wheel();
    for (key in types) {
        keywheel.add(key, types[key].probability); }

    var environmentnode = linkage.type({
        init: function(spec) {
            var generator = spec.generator || function() { return Math.random(); };
            this.generator = generator;
            this.outlets = [];
            this.inlet = emptynode();
            this.type = {
                key: 'environment',
                outlets: 0,
                limit: -1,
                generate: function() {
                    return types[keywheel.spectrum(generator())].generate(); },
                signature: function() { return this.key; } }; },

        leaf: function() { return true; },
        open: function() { return false; },
        join: function(path) {},
        fix: function(path, outlet) {},
        balanced: function() { return {full: true, depth: 0}; },
        compare: function(other) {return this.generator() > 0.5; },
        execute: function(it) { return it; },
        replicate: function() { return environmentnode({generator: generator}); },
        purge: function(depth, level) {},
        depth: function() { return 1; },
        code: function() { return 'environment'; } });

    var tree = linkage.type({
        init: function(spec) {
            this.root = spec.root || types['if'].generate(); },

        grow: function(path) {
            if (!this.root.fill(path)) {
                path.fix(this.root, 0);
                this.root = path; } },

        execute: function() {
            return this.root.execute(this.it); },

        purge: function() {
            if (this.root.leaf()) {
                var sprout = types[keywheel.spin()].generate();
                sprout.join(this.root);
                this.root = sprout;
                return this.root; }
            else {
                return this.root.purge(this.root.depth(), 1); } },

        depth: function() {
            return this.root.depth(); },

        code: function() {
            return this.root.code(); },

        clean: function() {
            return this.root.clean(); },

        cycle: function() {
            this.it = this.execute(); } });

    function randomTypeKey() {
        return keywheel.spin(); }

    function randomTree(depth) {
        var pod = types[randomTypeKey()].generate();
        if (depth > 1) {
            for (var ii = 0; ii < pod.type.outlets; ii++) {
                var subpod = randomTree(depth-1);
                pod.join(subpod); } }
        return pod; }

    var diagram = linkage.type({
        init: function(spec) {
            spec = spec || {};
            var generator = spec.environment || spec.e || function() { return Math.random(); };
            var depth = spec.depth || 11;

            this.environment = environmentnode({generator: generator});
            this.metabolism = spec.metabolism || spec.m || tree({root: randomTree(depth)});
            this.repair = spec.repair || spec.r || tree({root: randomTree(depth)});
            this.behavior = spec.behavior || spec.b || tree({root: randomTree(depth)});

            this.metabolism.it = iterator(this.environment, this.behavior.root, this.environment, this.behavior);
            this.repair.it = iterator(this.behavior.root, this.metabolism.root, this.behavior, this.metabolism);
            this.behavior.it = iterator(this.metabolism.root, this.repair.root, this.metabolism, this.repair); },

        cycle: function() {
            //console.log('metabolism: ');
            this.metabolism.cycle();
            //console.log('repair: ');
            this.repair.cycle();
            //console.log('behavior: ');
            this.behavior.cycle(); },
        
        purge: function() {
            var m = this.metabolism.purge();
            var r = this.repair.purge();
            var b = this.behavior.purge();

            if (b) {
                this.metabolism.it.target = b;
                this.repair.it.focus = b; }
            if (m) {
                this.repair.it.target = m;
                this.behavior.it.focus = m; }
            if (r) { this.behavior.it.target = r; }
        }, 

        clean: function() {
            this.metabolism.clean();
            this.repair.clean();
            this.behavior.clean(); }, 

        depth: function() {
            return {
                m: this.metabolism.depth(),
                b: this.behavior.depth(),
                r: this.repair.depth() }; } });

    return {
        type: type,
        types: types,
        typekeys: typekeys,
        keywheel: keywheel,
        node: node,
        tree: tree,
        iterator: iterator,
        diagram: diagram,
        random: randomTree,
        randomKey: randomTypeKey }; }();