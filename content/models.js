var SmartContract = Backbone.Model.extend({
    idAttribute: "FriendlyId",

    initialize: function () {
    },

    build: function () {
        app.talkToVscode("buildSmartContract", { id: this.id });
    },

    setBuildOptions: function (options) {
        var payload = options;
        payload.id = this.id;
        app.talkToVscode("setSmartContractBuildOptions", payload);
    },

    deploy: function (options) {
        var payload = options.toJSON();
        payload.id = this.id;
        app.talkToVscode("deploySmartContract", payload);
    },

    run: function (options) {
        var payload = options.toJSON();
        payload.id = this.id;
        app.talkToVscode("runSmartContract", payload);
    },

    addWatchedVariable: function(options) {
        this.getWatchedVariables(options.onTestnet).push({
            Name: "alice's balance",
            FunctionName: "do_balance",
            Arguments: ["public_key_of_alice"]
        });

        this.setWatchedVariables(options);
    },

    updateWatchedVariable: function(options) {
        var index = options.index;
        var variable = this.getWatchedVariables(options.onTestnet)[index];
        variable.Name = options.name;
        variable.FunctionName = options.functionName;
        variable.Arguments = options.arguments;

        this.setWatchedVariables(options);
    },

    deleteWatchedVariable: function(options) {
        var variables = this.getWatchedVariables(options.onTestnet);
        variables.splice(options.index, 1);

        this.setWatchedVariables(options);
    },

    getWatchedVariables: function(onTestnet) {
        var variables = onTestnet ? this.get("WatchedVariablesOnTestnet") : this.get("WatchedVariables");
        return variables;
    },

    setWatchedVariables: function(options) {
        var payload = options;
        payload.id = this.id;
        payload.variables = this.getWatchedVariables(options.onTestnet);

        this.trigger("change", this);
        app.talkToVscode("setWatchedVariables", payload);
    }
});

var SmartContractDeployOptions = Backbone.Model.extend({
    validate: function (attrs, options) {
        if (attrs.onTestnet) {
            if (!attrs.privateKey) {
                return "When deploying on testnet, the private key is required.";
            }

            if (!attrs.testnetNodeEndpoint) {
                return "When deploying on testnet, the node endpoint (url) is required.";
            }
        }
        else {
            if (!attrs.senderAddress) {
                return "Sender address is required.";
            }
        }
    }
});

var SmartContractRunOptions = Backbone.Model.extend({
    validate: function (attrs, options) {
        if (!attrs.functionName) {
            return "Function name is required.";
        }

        if (attrs.onTestnet) {
            if (!attrs.privateKey) {
                return "When running on testnet, the private key is required.";
            }

            if (!attrs.testnetNodeEndpoint) {
                return "When running on testnet, the node endpoint (url) is required.";
            }
        }
        else {
            if (!attrs.senderAddress) {
                return "Sender address is required.";
            }
        }
    }
});

var SmartContractsCollection = Backbone.Collection.extend({
    model: SmartContract
});