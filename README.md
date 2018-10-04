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
porting procedure is detailed in this wiki [page](https://github.com/jariseon/webOBXD/wiki/Porting).