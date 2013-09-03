// Generated by CoffeeScript 1.6.3
(function() {
  var App, Backbone, Config, JSON, NProgress, Safe, app, sjcl, _, _ref, _ref1,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  require("jquery");

  JSON = require("json");

  _ = require("underscore");

  Backbone = require("backbone");

  NProgress = require("nprogress");

  sjcl = require("sjcl");

  Config = {
    clientId: "671657367079.apps.googleusercontent.com"
  };

  Safe = (function(_super) {
    __extends(Safe, _super);

    function Safe() {
      this.decrypt = __bind(this.decrypt, this);
      this.jsonContent = __bind(this.jsonContent, this);
      _ref = Safe.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    Safe.prototype.jsonContent = function() {
      return JSON.parse(this.get("content"));
    };

    Safe.prototype.decrypt = function(password) {
      return sjcl.decrypt(password, this.jsonContent());
    };

    return Safe;

  })(Backbone.Model);

  App = (function(_super) {
    var _this = this;

    __extends(App, _super);

    function App() {
      this.open = __bind(this.open, this);
      this.showOpen = __bind(this.showOpen, this);
      this.setSafeContent = __bind(this.setSafeContent, this);
      this.downloadSafe = __bind(this.downloadSafe, this);
      this.setSafeMetadata = __bind(this.setSafeMetadata, this);
      this.loadSafe = __bind(this.loadSafe, this);
      this.pickerCb = __bind(this.pickerCb, this);
      this.hidePick = __bind(this.hidePick, this);
      this.showPick = __bind(this.showPick, this);
      this.pick = __bind(this.pick, this);
      this.hideAuth = __bind(this.hideAuth, this);
      this.showAuth = __bind(this.showAuth, this);
      this.checkAuth = __bind(this.checkAuth, this);
      this.auth = __bind(this.auth, this);
      this.buildPicker = __bind(this.buildPicker, this);
      this.loadPicker = __bind(this.loadPicker, this);
      this.loadDrive = __bind(this.loadDrive, this);
      this.load = __bind(this.load, this);
      this.setupPlugins = __bind(this.setupPlugins, this);
      this.initialize = __bind(this.initialize, this);
      _ref1 = App.__super__.constructor.apply(this, arguments);
      return _ref1;
    }

    App.prototype.el = ".app";

    App.prototype.events = {
      "click .auth button": function() {
        return App.auth(false, App.checkAuth);
      },
      "click .pick button": "pick",
      "click .open button": "open"
    };

    App.prototype.initialize = function() {
      this.safe = new Safe();
      this.setupPlugins();
      return this.load();
    };

    App.prototype.setupPlugins = function() {
      $(document).ajaxStart(function() {
        return NProgress.start();
      }).ajaxStop(function() {
        return NProgress.done();
      });
      return this;
    };

    App.prototype.load = function() {
      NProgress.start();
      gapi.load("auth,client", this.loadDrive);
      return this;
    };

    App.prototype.loadDrive = function() {
      gapi.client.load("drive", "v2", this.loadPicker);
      return this;
    };

    App.prototype.loadPicker = function(cb) {
      google.load("picker", "1", {
        callback: this.buildPicker
      });
      return this;
    };

    App.prototype.buildPicker = function() {
      NProgress.done();
      this.picker = new google.picker.PickerBuilder().addView(google.picker.ViewId.DOCS).setCallback(this.pickerCb).build();
      return this.auth(true, this.checkAuth);
    };

    App.prototype.auth = function(immediate, cb) {
      gapi.auth.authorize({
        client_id: Config.clientId,
        scope: "https://www.googleapis.com/auth/drive",
        immediate: immediate
      }, cb);
      return this;
    };

    App.prototype.checkAuth = function(token) {
      if (token && !token.error) {
        this.hideAuth();
        return this.showPick();
      } else {
        return this.showAuth();
      }
    };

    App.prototype.showAuth = function() {
      this.$(".auth").show();
      return this;
    };

    App.prototype.hideAuth = function() {
      this.$(".auth").hide();
      return this;
    };

    App.prototype.pick = function(e) {
      this.picker.setVisible(true);
      return this;
    };

    App.prototype.showPick = function() {
      return this.$(".pick").show();
    };

    App.prototype.hidePick = function() {
      return this.$(".pick").hide();
    };

    App.prototype.pickerCb = function(data) {
      var fileId;
      switch (data[google.picker.Response.ACTION]) {
        case google.picker.Action.PICKED:
          fileId = data[google.picker.Response.DOCUMENTS][0].id;
          this.loadSafe(fileId);
      }
      return this;
    };

    App.prototype.loadSafe = function(fileId) {
      var req;
      req = gapi.client.drive.files.get({
        fileId: fileId
      });
      req.execute(this.setSafeMetadata);
      return this;
    };

    App.prototype.setSafeMetadata = function(metadata) {
      this.safe.set(metadata);
      this.downloadSafe();
      return this;
    };

    App.prototype.downloadSafe = function() {
      console.log("Downloading " + (this.safe.get("downloadUrl")) + "...");
      $.ajax({
        url: this.safe.get("downloadUrl"),
        type: "get",
        headers: {
          "Authorization": "Bearer " + (gapi.auth.getToken().access_token)
        }
      }).done(this.setSafeContent).fail(function() {
        return console.error("Failed to download safe");
      });
      return this;
    };

    App.prototype.setSafeContent = function(resp) {
      this.safe.set('content', resp);
      this.hidePick();
      this.showOpen();
      return this;
    };

    App.prototype.showOpen = function() {
      this.$(".open").show();
      return this;
    };

    App.prototype.open = function() {
      var password;
      password = this.$(".open input[type=password]").val();
      return console.log(this.safe.decrypt(password));
    };

    return App;

  }).call(this, Backbone.View);

  app = new App();

}).call(this);
