# Web Audio Modules (WAMs)
# wasm makefile for obxd
# Jari Kleimola 2017-2018 (jari@webaudiomodules.org)

# -- point this to the local copy of https://github.com/jariseon/JUCE
JUCELIB = /path/to/juce/wasm/repo

TARGET = ./obxd.js
WAM = ../../WAM/cpp
SRC = ../../Source
JUCE = ../../JuceLibraryCode

SOURCES = \
  $(SRC)/PluginProcessor.cpp \
  $(WAM)/obxd.cpp \
  $(JUCELIB)/wasm/wamsdk/processor.cpp

INC = -I$(WAM)/wamsdk -I$(SRC)/Engine -I$(JUCELIB) -I$(JUCELIB)/modules -I$(JUCELIB)/wasm/wamsdk -I$(JUCE)
LIBS = $(JUCELIB)/wasm/lib/juce-audioworklet.bc

Wno = -Wno-implicit-conversion-floating-point-to-bool
JUCEFLAGS = -DJUCE_AUDIOPROCESSOR_NO_GUI=1 -DJUCE_STANDALONE_APPLICATION=0 -DJUCE_GLOBAL_MODULE_SETTINGS_INCLUDED=1
CFLAGS  = -std=c++11 -DWASM $(Wno) $(INC)
LDFLAGS = -O2
JSFLAGS = --post-js post.js -s ALLOW_MEMORY_GROWTH=1 -s WASM=1 -s BINARYEN_ASYNC_COMPILATION=0 -s EXPORT_NAME="'AudioWorkletGlobalScope.WAM.OBXD'"

$(TARGET): $(OBJECTS)
	$(CC) $(CFLAGS) $(JUCEFLAGS) $(LDFLAGS) $(JSFLAGS) $(LIBS) -o $@ $(SOURCES)
