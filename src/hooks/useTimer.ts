import { useState, useEffect } from 'react'
import { useTaskStore } from '../store/taskStore'

/**
 * Returns live elapsed seconds for the currently running timer task.
 * If the given taskId is not the active timer, returns 0.
 */
export function useTimer(taskId: string): { isRunning: boolean; elapsedSeconds: number } {
  const timerTaskId = useTaskStore((s) => s.timerTaskId)
  const timerStartedAt = useTaskStore((s) => s.timerStartedAt)

  const isRunning = timerTaskId === taskId
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  useEffect(() => {
    if (!isRunning || !timerStartedAt) {
      setElapsedSeconds(0)
      return
    }

    // Initialise immediately
    setElapsedSeconds(Math.floor((Date.now() - new Date(timerStartedAt).getTime()) / 1000))

    const id = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - new Date(timerStartedAt).getTime()) / 1000))
    }, 1000)

    return () => clearInterval(id)
  }, [isRunning, timerStartedAt])

  return { isRunning, elapsedSeconds }
}

/** Format seconds → "1h 23m 45s" or "23m 45s" or "45s" */
export function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}h ${m}m ${s}s`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

/** Format total minutes stored on a task → "1h 23m" or "45m" */
export function formatMinutes(totalMinutes: number): string {
  if (totalMinutes <= 0) return '0m'
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  if (h > 0 && m > 0) return `${h}h ${m}m`
  if (h > 0) return `${h}h`
  return `${m}m`
}
