emmake make
node encode-wasm.js obxd.wasm OBXD
mv obxd.js ../../WAM/web/worklet/obxd.emsc.js
mv obxd.wasm.js ../../WAM/web/worklet/
rm obxd.wasm
