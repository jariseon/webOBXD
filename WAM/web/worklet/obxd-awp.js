// OBXD WAM Processor
// Jari Kleimola 2017-2018 (jari@webaudiomodules.org)

class OBXDAWP extends AudioWorkletGlobalScope.WAMProcessor
{
  constructor(options) {
    options = options || {}
    options.mod = AudioWorkletGlobalScope.WAM.OBXD;
    super(options);
    this.numOutChannels = [2];
  }
}

registerProcessor("OBXD", OBXDAWP);
