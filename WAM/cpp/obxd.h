// Web Audio Modules (WAMs)
// WAM wrapper for obxd
// Jari Kleimola 2017-2018 (jari@webaudiomodules.org)
//
#ifndef obxd_h
#define obxd_h

#include "processor.h"
using namespace WAM;

namespace juce {
	class AudioProcessor;
	class MidiBuffer;
}

class OBXD : public WAM::Processor
{
public:
	virtual const char* init(uint32_t bufsize, uint32_t sr, void* desc);
	virtual void terminate();
	virtual void onProcess(AudioBus* audio, void* data);
	virtual void onMidi(byte status, byte data1, byte data2);
	virtual void onPatch(void* patch, uint32_t size);
	virtual void onParam(uint32_t idparam, double value);
private:
	juce::AudioProcessor* m_proc;
	juce::MidiBuffer* m_midibuf;
	void* m_audiobufs;
	uint32_t m_bufsize;
	uint32_t m_icount,m_ocount;
};

#endif
