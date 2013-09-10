// Generated by CoffeeScript 1.6.3
(function() {
  var Backbone, Collections, Config, JSON, Models, NProgress, Templates, Views, el, enter, escape, gen, reactive, sjcl, uid, _, _i, _len, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  require("jquery");

  JSON = require("json");

  _ = require("underscore");

  Backbone = require("backbone");

  NProgress = require("nprogress");

  sjcl = require("sjcl");

  uid = require("uid");

  reactive = require("reactive");

  enter = require("on-enter");

  escape = require("on-escape");

  gen = (require("passwordgen"))(Math.random);

  Config = {
    clientId: "671657367079.apps.googleusercontent.com"
  };

  reactive.subscribe(function(obj, prop, fn) {
    return obj.on("change:" + prop, fn);
  });

  reactive.set(function(obj, prop) {
    return obj.set(prop);
  });

  reactive.get(function(obj, prop) {
    return obj.get(prop);
  });

  reactive.bind("data-text", function(el, name) {
    var obj;
    obj = this.obj;
    el.innerText = obj.get(name);
    return el.onblur = function() {
      return obj.set(name, el.innerText);
    };
  });

  reactive.bind("data-value", function(el, name) {
    var obj;
    obj = this.obj;
    el.value = obj.get(name);
    return el.onchange = function() {
      return obj.set(name, el.value);
    };
  });

  reactive.bind("data-checked", function(el, name) {
    var obj;
    obj = this.obj;
    el.checked = Boolean(obj.get(name));
    return el.onchange = function() {
      return obj.set(name, el.checked);
    };
  });

  Templates = {
    entry: document.querySelector(".entry")
  };

  _ref = _(Templates).values();
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    el = _ref[_i];
    el.remove();
  }

  Models = {};

  Collections = {};

  Views = {};

  Models.Entry = (function(_super) {
    __extends(Entry, _super);

    function Entry() {
      _ref1 = Entry.__super__.constructor.apply(this, arguments);
      return _ref1;
    }

    return Entry;

  })(Backbone.Model);

  Collections.Entries = (function(_super) {
    __extends(Entries, _super);

    function Entries() {
      _ref2 = Entries.__super__.constructor.apply(this, arguments);
      return _ref2;
    }

    Entries.prototype.model = Models.Entry;

    return Entries;

  })(Backbone.Collection);

  Models.GenPassSettings = (function(_super) {
    __extends(GenPassSettings, _super);

    function GenPassSettings() {
      _ref3 = GenPassSettings.__super__.constructor.apply(this, arguments);
      return _ref3;
    }

    GenPassSettings.prototype.defaults = {
      type: "Chars",
      length: 30,
      numbers: true,
      letters: true,
      symbols: false
    };

    return GenPassSettings;

  })(Backbone.Model);

  Models.Chest = (function(_super) {
    __extends(Chest, _super);

    function Chest() {
      this.update = __bind(this.update, this);
      this.open = __bind(this.open, this);
      _ref4 = Chest.__super__.constructor.apply(this, arguments);
      return _ref4;
    }

    Chest.prototype.open = function(password) {
      var entries;
      this.set("password", password);
      try {
        entries = sjcl.decrypt(password, this.get("ciphertext"));
      } catch (_error) {
        return false;
      }
      this.entries.reset(JSON.parse(entries));
      return true;
    };

    Chest.prototype.update = function() {
      var data;
      data = JSON.stringify(this.entries.toJSON());
      this.set("ciphertext", sjcl.encrypt(this.get("password"), data));
      return this;
    };

    return Chest;

  })(Backbone.Model);

  Views.Entry = (function(_super) {
    __extends(Entry, _super);

    function Entry() {
      this["delete"] = __bind(this["delete"], this);
      this.trash = __bind(this.trash, this);
      this.hidePasword = __bind(this.hidePasword, this);
      this.showPassword = __bind(this.showPassword, this);
      _ref5 = Entry.__super__.constructor.apply(this, arguments);
      return _ref5;
    }

    Entry.prototype.events = {
      "focus .password": "showPassword",
      "blur .password": "hidePasword",
      "click a.trash": "trash",
      "click a.delete": "delete"
    };

    Entry.prototype.showPassword = function() {
      this.$(".password").attr("type", "text");
      return this;
    };

    Entry.prototype.hidePasword = function() {
      this.$(".password").attr("type", "password");
      return this;
    };

    Entry.prototype.trash = function(e) {
      e.preventDefault();
      this.model.set("trashed", true);
      this.remove();
      return this;
    };

    Entry.prototype["delete"] = function(e) {
      e.preventDefault();
      if (confirm("Are you sure you want to permanently delete this entry?")) {
        this.model.trigger("remove");
        this.remove();
      }
      return this;
    };

    return Entry;

  })(Backbone.View);

  Views.GenPass = (function(_super) {
    __extends(GenPass, _super);

    function GenPass() {
      this.toggleSettings = __bind(this.toggleSettings, this);
      this.output = __bind(this.output, this);
      this.generate = __bind(this.generate, this);
      this.initialize = __bind(this.initialize, this);
      _ref6 = GenPass.__super__.constructor.apply(this, arguments);
      return _ref6;
    }

    GenPass.prototype.el = ".genpass";

    GenPass.prototype.events = {
      "click button": "output",
      "click .icon-settings": "toggleSettings"
    };

    GenPass.prototype.initialize = function() {
      reactive(this.el, this.model);
      return this;
    };

    GenPass.prototype.generate = function() {
      var func, res, type;
      type = this.model.get("type");
      func = (function() {
        switch (type) {
          case "Chars":
            return "generate";
          case "Words":
            return "words";
        }
      })();
      res = gen[type][func](this.model.get("length"), {
        numbers: this.model.get("numbers"),
        letters: this.model.get("letters"),
        symbols: this.model.get("symbols")
      });
      switch (type) {
        case "Chars":
          return res;
        case "Words":
          return res.join(" ");
      }
    };

    GenPass.prototype.output = function() {
      this.$(".output").text(this.generate());
      return this;
    };

    GenPass.prototype.toggleSettings = function(e) {
      e.preventDefault();
      e.stopPropagation();
      this.$(".settings").toggle();
      return this;
    };

    return GenPass;

  })(Backbone.View);

  Views.App = (function(_super) {
    __extends(App, _super);

    function App() {
      this.updateChestMetadata = __bind(this.updateChestMetadata, this);
      this.sync = __bind(this.sync, this);
      this.toggleSync = __bind(this.toggleSync, this);
      this.newEntry = __bind(this.newEntry, this);
      this.filterEntries = __bind(this.filterEntries, this);
      this.renderEntries = __bind(this.renderEntries, this);
      this.renderEntry = __bind(this.renderEntry, this);
      this.listenEntries = __bind(this.listenEntries, this);
      this.listenEntry = __bind(this.listenEntry, this);
      this.open = __bind(this.open, this);
      this.setChestContent = __bind(this.setChestContent, this);
      this.downloadChest = __bind(this.downloadChest, this);
      this.setChestMetadata = __bind(this.setChestMetadata, this);
      this.getChestMetadata = __bind(this.getChestMetadata, this);
      this.pickerCb = __bind(this.pickerCb, this);
      this.pick = __bind(this.pick, this);
      this.newChest = __bind(this.newChest, this);
      this.getChestReq = __bind(this.getChestReq, this);
      this.showLoggedIn = __bind(this.showLoggedIn, this);
      this.checkAuth = __bind(this.checkAuth, this);
      this.auth = __bind(this.auth, this);
      this.buildPicker = __bind(this.buildPicker, this);
      this.loadPicker = __bind(this.loadPicker, this);
      this.loadDrive = __bind(this.loadDrive, this);
      this.load = __bind(this.load, this);
      this.toggleFilterHelp = __bind(this.toggleFilterHelp, this);
      this.showEntries = __bind(this.showEntries, this);
      this.hideOpen = __bind(this.hideOpen, this);
      this.showOpen = __bind(this.showOpen, this);
      this.hideNew = __bind(this.hideNew, this);
      this.showNew = __bind(this.showNew, this);
      this.hideLoad = __bind(this.hideLoad, this);
      this.showLoad = __bind(this.showLoad, this);
      this.hideAuth = __bind(this.hideAuth, this);
      this.showAuth = __bind(this.showAuth, this);
      this.setupPlugins = __bind(this.setupPlugins, this);
      this.error = __bind(this.error, this);
      this.initialize = __bind(this.initialize, this);
      _ref7 = App.__super__.constructor.apply(this, arguments);
      return _ref7;
    }

    App.prototype.el = ".app";

    App.prototype.events = {
      "click .auth button": function() {
        return this.auth(false, this.checkAuth);
      },
      "click .load .new": function() {
        this.hideLoad();
        return this.showNew();
      },
      "click .new .ok": function() {
        var name, password;
        name = this.$(".new .name").val().trim();
        password = this.$(".new .password").val();
        if (!(name && password)) {
          return;
        }
        this.hideNew();
        return this.newChest(name, password);
      },
      "click .new .cancel": function() {
        this.hideNew();
        return this.showLoad();
      },
      "click .load .pick": "pick",
      "click .open button": "open",
      "keyup .filter input": "filterEntries",
      "blur .filter input": "filterEntries",
      "change .filter input": "filterEntries",
      "click .filter .help": "toggleFilterHelp",
      "click .filter-help": "toggleFilterHelp",
      "click .new-entry": "newEntry",
      "click .sync": "sync"
    };

    App.prototype.initialize = function() {
      this.chest = new Models.Chest({
        status: "synced"
      });
      this.chest.on("change:status", this.toggleSync);
      this.chest.entries = new Collections.Entries();
      this.chest.entries.on("add", this.listenEntry).on("add", this.renderEntry).on("remove", this.removeEntry).on("reset", this.listenEntries).on("reset", this.renderEntries);
      this.genpass = new Views.GenPass({
        model: new Models.GenPassSettings()
      });
      this.setupPlugins();
      return this;
    };

    App.prototype.error = function(message) {
      var $error;
      $error = this.$(".error");
      if (this.errTimeout) {
        clearTimeout(this.errTimeout);
      }
      if (message != null) {
        $error.show().find("span").text(message);
        return this.errTimeout = setTimeout(function() {
          return $error.hide();
        }, 3000);
      } else {
        return $error.hide();
      }
    };

    App.prototype.setupPlugins = function() {
      NProgress.configure({
        showSpinner: false
      });
      $(document).ajaxStart(function() {
        return NProgress.start();
      }).ajaxStop(function() {
        return NProgress.done();
      });
      return this;
    };

    App.prototype.showAuth = function() {
      this.$(".auth.section").show();
      return this;
    };

    App.prototype.hideAuth = function() {
      this.$(".auth.section").hide();
      return this;
    };

    App.prototype.showLoad = function() {
      this.$(".load.section").show();
      return this;
    };

    App.prototype.hideLoad = function() {
      this.$(".load.section").hide();
      return this;
    };

    App.prototype.showNew = function() {
      enter(_.bind(function() {
        return this.$(".new .ok").trigger("click");
      }, this));
      escape(_.bind(function() {
        return this.$(".new .cancel").trigger("click");
      }, this));
      this.$(".new.section").show().find(".name").focus();
      return this;
    };

    App.prototype.hideNew = function() {
      enter.unbind();
      escape.unbind();
      this.$(".new.section").hide();
      return this;
    };

    App.prototype.showOpen = function() {
      enter(_.bind(function() {
        return this.$(".open button").trigger("click");
      }, this));
      this.$(".open.section").show().find(".password").focus();
      return this;
    };

    App.prototype.hideOpen = function() {
      enter.unbind();
      this.$(".open.section").hide();
      return this;
    };

    App.prototype.showEntries = function() {
      this.$(".entries").show();
      return this;
    };

    App.prototype.toggleFilterHelp = function(e) {
      e.preventDefault();
      $(".filter-help").toggle();
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
      this.auth(true, this.checkAuth);
      return this;
    };

    App.prototype.auth = function(immediate, cb) {
      var config;
      config = {
        client_id: Config.clientId,
        scope: ["https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/drive"],
        display: "popup"
      };
      if (immediate) {
        config.immediate = immediate;
      } else {
        config.prompt = "select_account";
      }
      gapi.auth.authorize(config, cb);
      return this;
    };

    App.prototype.checkAuth = function(token) {
      var req;
      if (token && !token.error) {
        req = gapi.client.request({
          path: "/oauth2/v1/userinfo",
          method: "GET"
        });
        req.execute(this.showLoggedIn);
        this.hideAuth();
        this.showLoad();
      } else {
        this.showAuth();
      }
      return this;
    };

    App.prototype.showLoggedIn = function(user) {
      this.$(".logged-in").show().find(".email").text(user.email);
      return this;
    };

    App.prototype.multipartBody = function(boundary, metadata, contentType, data) {
      return "--" + boundary + "\nContent-Type: application/json\n\n" + (JSON.stringify(metadata)) + "\n--" + boundary + "\nContent-Type: " + contentType + "\nContent-Transfer-Encoding: base64\n\n" + (btoa(data)) + "\n--" + boundary + "--";
    };

    App.prototype.getChestReq = function(method) {
      var boundary, contentType, metadata, path;
      path = "/upload/drive/v2/files";
      if (method === "PUT") {
        path += "/" + (this.chest.get("id"));
      }
      boundary = uid();
      contentType = "application/json";
      metadata = {
        title: this.chest.get("title"),
        mimeType: contentType
      };
      return gapi.client.request({
        path: path,
        method: method,
        params: {
          uploadType: "multipart"
        },
        headers: {
          "Content-Type": "multipart/mixed; boundary=" + boundary
        },
        body: this.multipartBody(boundary, metadata, contentType, this.chest.get("ciphertext"))
      });
    };

    App.prototype.newChest = function(name, password) {
      var req;
      NProgress.start();
      this.chest.entries.reset([
        {
          id: uid(20),
          title: "Example",
          url: "http://example.com",
          username: "username",
          password: "password"
        }
      ], {
        silent: true
      });
      this.chest.set({
        title: "" + name + ".chest",
        password: password
      }).update();
      req = this.getChestReq("POST");
      req.execute(this.setChestMetadata);
      return this;
    };

    App.prototype.pick = function() {
      this.picker.setVisible(true);
      return this;
    };

    App.prototype.pickerCb = function(data) {
      var fileId;
      switch (data[google.picker.Response.ACTION]) {
        case google.picker.Action.PICKED:
          fileId = data[google.picker.Response.DOCUMENTS][0].id;
          this.getChestMetadata(fileId);
      }
      return this;
    };

    App.prototype.getChestMetadata = function(fileId) {
      var req;
      NProgress.start();
      req = gapi.client.drive.files.get({
        fileId: fileId
      });
      req.execute(this.setChestMetadata);
      return this;
    };

    App.prototype.setChestMetadata = function(metadata) {
      this.chest.set(metadata);
      this.downloadChest();
      return this;
    };

    App.prototype.downloadChest = function() {
      $.ajax({
        url: this.chest.get("downloadUrl"),
        type: "get",
        headers: {
          "Authorization": "Bearer " + (gapi.auth.getToken().access_token)
        }
      }).done(this.setChestContent).fail(function() {
        return this.error("Failed to download chest");
      });
      return this;
    };

    App.prototype.setChestContent = function(resp) {
      NProgress.done();
      this.chest.set("ciphertext", JSON.stringify(resp));
      this.hideLoad();
      this.showOpen();
      return this;
    };

    App.prototype.open = function() {
      var password;
      this.error();
      password = this.$(".open .password").val();
      if (this.chest.open(password)) {
        this.hideOpen();
        this.showEntries();
      } else {
        this.error("Failed to open chest");
      }
      return this;
    };

    App.prototype.listenEntry = function(entry) {
      var chest;
      chest = this.chest;
      entry.on("change", function() {
        return chest.set("status", "needSync");
      });
      entry.on("remove", function() {
        chest.set("status", "needSync");
        return chest.entries.remove(entry);
      });
      return this;
    };

    App.prototype.listenEntries = function(entries) {
      entries.each(this.listenEntry);
      return this;
    };

    App.prototype.renderEntry = function(entry) {
      var filter;
      if (this.filterProp !== "trashed" && entry.get("trashed")) {
        return;
      }
      if (this.filterProp && entry.has(this.filterProp)) {
        if (this.filterProp === "trashed") {
          if (!entry.get("trashed")) {
            return;
          }
        } else {
          filter = new RegExp(this.filter.source.substring(this.filterProp.length + 1), "i");
          if (!filter.test(entry.get(this.filterProp))) {
            return;
          }
        }
      } else {
        if (this.filter && !this.filter.test(entry.get("title"))) {
          return;
        }
      }
      this.$(".entries > ul").append(new Views.Entry({
        model: entry,
        el: reactive(Templates.entry.cloneNode(true), entry).el
      }).$el);
      return this;
    };

    App.prototype.renderEntries = function(entries) {
      this.$(".entries > ul").empty();
      entries.each(this.renderEntry);
      return this;
    };

    App.prototype.filterEntries = function() {
      var filterVal;
      filterVal = this.$(".filter input").val().trim();
      if (filterVal.lastIndexOf(":") > 0) {
        this.filterProp = filterVal.split(":")[0];
      } else {
        this.filterProp = null;
      }
      this.filter = new RegExp(filterVal, "i");
      this.renderEntries(this.chest.entries);
      return this;
    };

    App.prototype.newEntry = function() {
      var entry, id;
      this.chest.set("status", "needSync");
      while (true) {
        id = uid(20);
        if (!this.chest.entries.get(id)) {
          break;
        }
      }
      entry = new Models.Entry({
        id: id,
        title: "New Entry",
        username: "",
        password: this.genPass.generate(),
        url: "http://"
      });
      this.chest.entries.add(entry);
      return this;
    };

    App.prototype.toggleSync = function() {
      var status;
      status = this.chest.get("status");
      this.$(".sync").prop("disabled", status !== "needSync").find("span").text((function() {
        switch (status) {
          case "needSync":
            return "Sync";
          case "syncing":
            return "Syncing";
          case "synced":
            return "Synced";
        }
      })());
      return this;
    };

    App.prototype.sync = function() {
      var req;
      NProgress.start();
      this.chest.set("status", "syncing").update();
      req = this.getChestReq("PUT");
      req.execute(this.updateChestMetadata);
      return this;
    };

    App.prototype.updateChestMetadata = function(metadata) {
      NProgress.done();
      this.chest.set(metadata);
      this.chest.set("status", "synced");
      return this;
    };

    return App;

  })(Backbone.View);

  module.exports = new Views.App();

}).call(this);
