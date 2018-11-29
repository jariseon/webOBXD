// OBXD WAM Controller
// Jari Kleimola 2017-2018 (jari@webaudiomodules.org)

var WAM = WAM || {}

WAM.OBXD = class OBXD extends WAMController
{
  constructor (actx, options) {
    options = options || {};
    options.numberOfInputs  = 0;
    options.numberOfOutputs = 1;
    options.outputChannelCount = [2];
    // options.ioConfiguration = { outputs:[1] };

    super(actx, "OBXD", options);
    this.patches = [];
    this.bank = [];
    this.ipatch = 0;
  }

  // -- scripts need to be loaded first, and in order
  //
  static async importScripts (actx) {
    await actx.audioWorklet.addModule("worklet/obxd.wasm.js");
    await actx.audioWorklet.addModule("worklet/obxd.emsc.js");
    await actx.audioWorklet.addModule("libs/wam-processor.js");
    await actx.audioWorklet.addModule("worklet/obxd-awp.js");
  }

  // -- gui is implemented as a web component
  // -- and currently imported using HTML imports
  // -- skin is a relative folder name, containing pngs
  //
  loadGUI (skin) {
    var self = this;
    return new Promise((resolve,reject) => {
      let link = document.createElement('link');
      link.rel  = 'import';
      link.href = "obxd.html";
      link.onload = () => {
        self._gui = document.createElement("wam-obxd");
        self._gui.plug = self;
        self._gui.skin = skin || "skin";
        resolve(self._gui);
      }
      document.head.appendChild(link);
    });
  }

  // -- url gives the filename to an fxb format bank of presets
  //
  loadBank (url) {
    var self = this;
    return new Promise( (resolve,reject) => {
      fetch(url).then(resp => {
      resp.arrayBuffer().then(data => {

        self.patches = [];
        self.bank = [];
        self.bank.url = url;
        self.bank.name = url.substr(url.lastIndexOf("/") + 1);
        var arr = new Uint8Array(data);

	      // -- oh dear, cannot use DOMParser since fxb attribute names start with a number
        var s = "";
        try { s = String.fromCharCode.apply(null, arr.subarray(168, arr.length-1)); }
        catch(e) { s = new TextDecoder("utf-8").decode(arr.subarray(168, arr.length-1)); }
        var i1 = s.indexOf("<programs>");
        var i2 = s.indexOf("</programs>");
        if (i1 > 0 && i2 > 0)
        {
          s = s.slice(i1+10,i2);
          i2 = 0;
          i1 = s.indexOf("programName");
          var patchCount = 0;
          while (i1 > 0 && patchCount++ < 128)
          {
            var n1 = s.indexOf('\"',i1);
            var n2 = s.indexOf('\"',n1+1);
            if (n1 < 0 || n2 < 0) break;
            self.patches.push(s.slice(n1+1,n2));
            i2 = s.indexOf("/>", n2);
            if (i2 > 0)
            {
              var s2 = s.slice(n2+2,i2);
              var tokens = s2.split(' ');
              if (tokens.length == 71)
              {
                var patch = [];
                for (var i=0; i<tokens.length; i++)
                {
                  var pair = tokens[i].split('"');
                  patch.push(parseFloat(pair[1]));
                }
                self.bank.push(patch);
              }
            }
            i1 = s.indexOf("programName", i2);
          }
        }
        resolve(self.patches);
      }) }) });
  }

  // -- select patch from current bank
  //
  selectPatch (ipatch) {
    let patch = this.bank[ipatch];
    if (patch) {
      this.ipatch = ipatch;
      this.setPatch(patch);
    }
  }

  // -- set patch from data
  //
  setPatch (patch) {
    this.patch = patch;
    super.setPatch(Float32Array.from(patch).buffer);
    if (this._gui) this._gui.setPatch(patch);
  }

  // -- get current state
  //
  getState () {
    let state = { bank: this.bank.url, patchIndex: this.ipatch }
    state.data = this.patch;
    let blob   = new Blob([JSON.stringify(state)], {type: 'application/json'});
    return Promise.resolve(blob);
  }

  // -- restore current state
  //
  setState (blob) {
    let self = this;
    return new Promise((resolve,reject) => {
      let reader = new FileReader();
      reader.addEventListener("loadend", async () => {
        let state = JSON.parse(reader.result);
        await self.loadBank(state.bank);
        self.selectPatch(state.patchIndex);
        self.setPatch(state.data);
        resolve();
      });
      if (blob.type == "application/json")
        reader.readAsText(blob);
      else reject();
    });
  }

  // -- gui calls this method when tweaking a knob/toggle
  // -- update current patch state, and pass to DSP
  //
  setParam (key,value) {
    this.patch[key] = value;
    super.setParam(key,value);
  }
}

WAM.OBXD.title = "webOBXD";
