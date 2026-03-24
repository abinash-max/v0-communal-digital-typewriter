let ctx = null

function getContext() {
  if (!ctx) ctx = new AudioContext()
  if (ctx.state === "suspended") ctx.resume()
  return ctx
}

/**
 * Short mechanical click — white-noise burst through a highpass filter
 * with instant attack and 40ms decay.
 */
export function playKeyClick() {
  const ac = getContext()
  const duration = 0.04
  const sampleRate = ac.sampleRate
  const length = Math.ceil(sampleRate * duration)

  const buffer = ac.createBuffer(1, length, sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < length; i++) {
    data[i] = Math.random() * 2 - 1
  }

  const source = ac.createBufferSource()
  source.buffer = buffer

  const filter = ac.createBiquadFilter()
  filter.type = "highpass"
  filter.frequency.value = 800

  const gain = ac.createGain()
  const now = ac.currentTime
  gain.gain.setValueAtTime(0.25, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration)

  source.connect(filter)
  filter.connect(gain)
  gain.connect(ac.destination)

  source.start(now)
  source.stop(now + duration)

  setTimeout(() => {
    source.disconnect()
    filter.disconnect()
    gain.disconnect()
  }, 100)
}

/**
 * Carriage-return whoosh — longer filtered noise sweep with a
 * falling bandpass to simulate the sliding mechanism.
 */
export function playCarriageReturn() {
  const ac = getContext()
  const duration = 0.15
  const sampleRate = ac.sampleRate
  const length = Math.ceil(sampleRate * duration)

  const buffer = ac.createBuffer(1, length, sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < length; i++) {
    data[i] = Math.random() * 2 - 1
  }

  const source = ac.createBufferSource()
  source.buffer = buffer

  const filter = ac.createBiquadFilter()
  filter.type = "bandpass"
  filter.Q.value = 1.5
  const now = ac.currentTime
  filter.frequency.setValueAtTime(600, now)
  filter.frequency.exponentialRampToValueAtTime(200, now + duration)

  const gain = ac.createGain()
  gain.gain.setValueAtTime(0.3, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration)

  source.connect(filter)
  filter.connect(gain)
  gain.connect(ac.destination)

  source.start(now)
  source.stop(now + duration)

  setTimeout(() => {
    source.disconnect()
    filter.disconnect()
    gain.disconnect()
  }, 200)
}
