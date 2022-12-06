import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useRef,
} from "react";

export type SnackNotification = {
  message: string | undefined;
  type: "ERROR" | "SUCCESS";
};

type SnackAction =
  | { type: "QUEUE_NOTIFICATION"; payload: SnackNotification }
  | { type: "REMOVE_NOTIFICATION" };

type Notification = SnackNotification & {
  dispatch: React.Dispatch<SnackAction>;
};

const SnackbarContext = createContext<SnackNotification[]>(null!);
const SnackbarDispatchContext = createContext<
  ({ type, message }: Pick<SnackNotification, "type" | "message">) => void
>(null!);

export function useSnackbarDispatch() {
  return useContext(SnackbarDispatchContext);
}

export function SnackbarProvider({ children }: { children: React.ReactNode }) {
  const [snacks, snacksDispatch] = useReducer(
    snacksReducer,
    [] as SnackNotification[]
  );
  const currentSnack = Array.isArray(snacks) && snacks[0];

  const queueNotification = ({
    type,
    message,
  }: Pick<SnackNotification, "type" | "message">) => {
    snacksDispatch({ type: "QUEUE_NOTIFICATION", payload: { type, message } });
  };

  return (
    <SnackbarContext.Provider value={snacks}>
      <SnackbarDispatchContext.Provider value={queueNotification}>
        {currentSnack && (
          <Notification {...currentSnack} dispatch={snacksDispatch} />
        )}
        {children}
      </SnackbarDispatchContext.Provider>
    </SnackbarContext.Provider>
  );
}

function snacksReducer(state: SnackNotification[], action: SnackAction) {
  switch (action.type) {
    case "QUEUE_NOTIFICATION":
      return [...state, action.payload];
    case "REMOVE_NOTIFICATION":
      if (state.length > 0) {
        return state.slice(1);
      }
      return state;
    default:
      return state;
  }
}

function Notification({ message, type, dispatch }: Notification) {
  const animationRef = useRef<Animation>();
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (
      animationRef.current?.playState === "running" ||
      !notificationRef.current
    )
      return;

    animationRef.current = notificationRef.current.animate(
      [
        { transform: "translate(-50%, -100%)", offset: 0 },
        { transform: "translate(-50%, 20px)", offset: 0.2 },
        { transform: "translate(-50%, 20px)", offset: 0.8 },
        {
          transform: "translate(-50%, -100%)",
          offset: 1,
        },
      ],
      {
        duration: 3000,
        easing: "cubic-bezier(.1,.52,.99,.5)",
      }
    );
    animationRef.current.play();
    animationRef.current.finished.then(() => {
      dispatch({ type: "REMOVE_NOTIFICATION" });
    });
  });

  return (
    <div
      ref={notificationRef}
      className="fixed top-0 left-1/2 z-50 flex max-h-20 max-w-sm -translate-x-1/2 -translate-y-full justify-center overflow-y-auto overflow-x-hidden rounded border-2 border-gray-400 p-2 leading-tight"
    >
      <h3 className="h-full w-full overflow-clip text-ellipsis">{message}</h3>
    </div>
  );
}
