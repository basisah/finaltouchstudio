import { useCallback, useEffect, useRef, useState } from "react";

/** Transient confirmation message: const [toast, showToast] = useToast(); */
export function useToast(duration = 3000) {
  const [message, setMessage] = useState("");
  const timer = useRef(null);

  const show = useCallback(
    (text) => {
      clearTimeout(timer.current);
      setMessage(text);
      timer.current = setTimeout(() => setMessage(""), duration);
    },
    [duration]
  );

  useEffect(() => () => clearTimeout(timer.current), []);

  return [message, show];
}
