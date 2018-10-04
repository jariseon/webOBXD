// Web Audio Modules (WAMs)
// WAM wrapper for obxd
// Jari Kleimola 2017-2018 (jari@webaudiomodules.org)
//
#include "obxd.h"
#include "JuceHeader.h"

extern juce::AudioProcessor* JUCE_CALLTYPE createPluginFilter();

extern "C" { EMSCRIPTEN_KEEPALIVE void* createModule() { return new OBXD(); } }

const char* OBXD::init(uint32_t bufsize, uint32_t sr, void* desc)
{
	// -- create JUCE PluginProcessor descendant
	m_proc = createPluginFilter();
	if (!m_proc) return nullptr;

	// -- no input channels, stereo out
	m_icount = 0;
	m_ocount = 2;
	m_bufsize = bufsize;

	// -- JUCE buffers for audio and midi
	m_audiobufs = new AudioSampleBuffer(m_icount + m_ocount, bufsize);
	m_midibuf = new MidiBuffer();
	m_proc->prepareToPlay(sr, bufsize);

	// -- our descriptor resides at JS side, so we don't return anything here
	return nullptr;
}

void OBXD::terminate()
{
	m_proc->releaseResources();
	delete (AudioSampleBuffer*)m_audiobufs;
	delete m_midibuf;
}

// sample accurate rendering is coming soon to WAMs
//
void OBXD::onMidi(byte status, byte data1, byte data2)
{
	if ((status & 0xF0) == 0xC0)
		m_proc->setCurrentProgram(data1);
	else if (status != 0xF0)
	{
		unsigned char msg[3] = { status, data1, data2 };
		m_midibuf->addEvent(msg, 3, 0);
	}
}

// set preset data
//
void OBXD::onPatch(void* patch, uint32_t size)
{
	m_proc->setCurrentProgramStateInformation(patch, size);
}

// called when user tweaks a GUI control
//
void OBXD::onParam(uint32_t idparam, double value)
{
	m_proc->setParameter((int)idparam, (float)value);
}

// render (stereo 32-bit floats)
//
void OBXD::onProcess(AudioBus* audio, void* data)
{
	// -- JUCE
	AudioBuffer<float>& buffer = *(AudioSampleBuffer*)m_audiobufs;
  buffer.clear();
	m_proc->processBlock(buffer, *m_midibuf);
	m_midibuf->clear();

	// -- copy to Web Audio API AudioBus
	const float* obxdL = buffer.getReadPointer(m_icount + 0);
	const float* obxdR = buffer.getReadPointer(m_icount + 1);
  memcpy(audio->outputs[0], obxdL, m_bufsize * sizeof(float));
  memcpy(audio->outputs[1], obxdR, m_bufsize * sizeof(float));
}
