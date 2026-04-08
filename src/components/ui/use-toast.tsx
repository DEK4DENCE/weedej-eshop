import * as React from "react"

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 10000

type ToasterToast = {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  variant?: "default" | "destructive"
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

let count = 0
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

type Action =
  | { type: "ADD_TOAST"; toast: ToasterToast }
  | { type: "UPDATE_TOAST"; toast: Partial<ToasterToast> }
  | { type: "DISMISS_TOAST"; toastId?: string }
  | { type: "REMOVE_TOAST"; toastId?: string }

interface State {
  toasts: ToasterToast[]
}

const listeners: Array<(state: State) => void> = []
let memoryState: State = { toasts: [] }

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => listener(memoryState))
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "ADD_TOAST":
      return { ...state, toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT) }
    case "UPDATE_TOAST":
      return { ...state, toasts: state.toasts.map((t) => t.id === action.toast.id ? { ...t, ...action.toast } : t) }
    case "DISMISS_TOAST":
      return { ...state, toasts: state.toasts.map((t) => t.id === action.toastId || action.toastId === undefined ? { ...t, open: false } : t) }
    case "REMOVE_TOAST":
      return { ...state, toasts: action.toastId === undefined ? [] : state.toasts.filter((t) => t.id !== action.toastId) }
  }
}

function toast(props: Omit<ToasterToast, "id">) {
  const id = genId()
  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dispatch({ type: "DISMISS_TOAST", toastId: id })
      },
    },
  })
  // Auto-dismiss after TOAST_REMOVE_DELAY
  setTimeout(() => {
    dispatch({ type: "DISMISS_TOAST", toastId: id })
    setTimeout(() => dispatch({ type: "REMOVE_TOAST", toastId: id }), 300)
  }, TOAST_REMOVE_DELAY)
  return {
    id,
    dismiss: () => dispatch({ type: "DISMISS_TOAST", toastId: id }),
    update: (props: Partial<ToasterToast>) => dispatch({ type: "UPDATE_TOAST", toast: { ...props, id } }),
  }
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState)
  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) listeners.splice(index, 1)
    }
  }, [state])
  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  }
}

export { useToast, toast }
export type { ToasterToast }
