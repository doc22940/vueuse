import { onUnmounted, getCurrentInstance } from '../../api'

export function useRafFn(fn: () => any, options: {startNow?: boolean} = {}) {
  const { startNow = true } = options
  let started = false

  function loop() {
    if (!started)
      return
    fn()
    requestAnimationFrame(loop)
  }

  function start() {
    if (!started) {
      started = true
      loop()
    }
  }

  function stop() {
    started = false
  }

  if (startNow)
    start()

  if (getCurrentInstance())
    onUnmounted(() => stop())

  return { stop, start }
}
