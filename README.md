# webOBXD (AudioWorklet/WASM edition)
Oberheim OB-X inspired synth in a browser, powered by AudioWorklets, WebAssembly and Web Audio Modules (WAMs) project. Ported from 2Dat's original [OBXD](https://github.com/2DaT/Obxd) JUCE Plugin.

demos: [webOBXD](https://webaudiomodules.org/wamsynths/obxd) and other WAMs at [webaudiomodules.org/wamsynths](https://webaudiomodules.org/wamsynths/). Currently runs best in Chrome.

## prerequisites
download and install [node.js](https://nodejs.org/en/download/) and WASM [toolchain](http://webassembly.org/getting-started/developers-guide/), then clone/download JUCE WASM library repository from [here](https://github.com/jariseon/JUCE).

## building
open `Builds/WAM/Makefile` in a text editor and edit the line below to point into the folder where you downloaded the JUCE WASM library repository:

```
JUCELIB = /path/to/juce/wasm/repo
```

then open console and give the following commands:

```
export PATH=$PATH:/to/emsdk/where/emmake/resides
cd Builds/WAM
sh build.sh
```

the compilation step creates `obxd.wasm.js` and `obxd.emsc.js` files in `WAM/web/worklet` folder. The first file is the WASM binary and the second file contains its loader/support code.

## running
serve files from repository root using a localhost http server, and then browse to [http://localhost/WAM/web/index.html](http://localhost/WAM/web/index.html) (requires Chrome).

## porting
This section describes the steps i took when porting OBXD to the web. There are five steps in all, but luckily none of this is rocket science. The procedure should adapt quite easily to other JUCE plugin porting efforts.

### 1. WAM wrapper

WAM wrapper operates as a bridge between JUCE and Web Audio API AudioWorkletProcessor. Its implementation is in `WAM/cpp/obxd.cpp` and `WAM/cpp/obxd.h`. The code is commented, and its methods map almost directly to juce::PluginProcessor counterparts.

### 2. changes to OBXD source code

only two files were modified. __#1:__ opengl module was commented out from `JuceLibraryCode/JuceHeader.h`. __#2:__ `Source/PluginProcessor.cpp` contains three modifications:

* processBlock() method was upgraded to JUCE 5
* createEditor() returns nullptr because GUI is implemented using web technologies
* setCurrentProgramStateInformation() uses raw data without XML wrapping

after these modifications OBXD cpp integration is done, and it is possible to build the WASM module as described in the __building__ section above.

_Note:_ if you are porting another JUCE plugin, just modify TARGET, SOURCES and EXPORT_NAME of JSFLAGS variables in the Makefile, and in build.sh, accordingly. The idea is to namespace classes so that they can coexist with other WAMs. For example, to port _myplugin_, replace each occurrence of

* __obxd__ with _myplugin_ in Makefile TARGET and build.sh
* __OBXD__ with _MYPLUGIN_ in Makefile EXPORT_NAME and build.sh
* follow the same logic in obxd.js and obxd-awp.js (see below)

### 3. interfacing Web Audio API

WAM runs as a Web Audio API AudioWorklet, which consists of two classes: __AudioWorkletProcessor__ runs hardcore DSP inside browser's audio thread, while __AudioWorkletNode__ exposes JS interface to the processor and its GUI on browser's main thread. `WAM/web/worklet/obxd-awp.js` inherits WAMProcessor, which hides most complexity involved when interfacing a WASM module. The constructor here simply passes WASM module to its superclass, and defines its audio io configuration.

`WAM/web/obxd.js` is more involved. It derives from WAMController to implement the main thread counterpart of the processor. Here are the main highlights:

* importScripts() loads scripts into audio thread scope, thereby initializing the processor
* loadBank() loads and parses VST fxb bank to raw preset data
* selectPatch() and setPatch() change current preset
* get/setState() persists current preset

See code comments for more info. After implementing these methods, a headless OBXD node is ready to be inserted into the Web Audio API audio graph.

### 4. integration into a web page

`WAM/web/index.html` first calls importScripts, creates OBXD AudioWorkletNode in the main thread, and connects it into the Web Audio API graph. It then loads the frontpanel GUI (see below), creates a virtual midi keyboard and inserts those into DOM. Finally, the code loads a preset bank and selects a patch from it.

### 5. GUI

Current JUCE WASM library implementation does not support JUCE Components and friends. I reimplemented OBXD frontpanel from scratch using web technologies, reusing native png assets for background, knobs and toggles. The frontpanel is implemented in `WAM/web/obxd.html` using templated Custom HTML Elements. JUCE knob and toggle widgets are reimplemented in `WAM/web/libs/wam-knob.js` and `WAM/web/libs/wam-toggle.js` classes. widgets are initialized to current patch state in wam-obxd.setPatch() method. user interaction trigger wam-obxd.\_oncontrol method calls, which are transformed into obxd.setParam() calls, and are eventually routed to the processor c++ implementation's setParam() method.

## conclusion
OBXD DSP was remarkably easy to port. Most time was spent with GUI reimplementation. although work is underway to also streamline JUCE GUI porting, it might not be a bad idea to consider implementing native JUCE GUIs using webviews.