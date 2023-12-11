import { useState, useEffect } from "react";

const useVerificationCode = (initialDisabledPeriod = 60) => {
  const [isSendingCode, setSendingCode] = useState(false);
  const [disabledPeriod, setDisabledPeriod] = useState(initialDisabledPeriod);
  const [countdown, setCountdown] = useState(disabledPeriod);

  const startCountdown = () => {
    setSendingCode(true);
    setCountdown(disabledPeriod);

    const timer = setInterval(() => {
      setCountdown((prevCountdown) => {
        if (prevCountdown === 1) {
          clearInterval(timer);
          setSendingCode(false);
          return disabledPeriod;
        }
        return prevCountdown - 1;
      });
    }, 1000);
  };

  const sendCode = () => {
    if (!isSendingCode && countdown === disabledPeriod) {
      startCountdown();
    }
  };

  useEffect(() => {
    return () => {
      setCountdown(disabledPeriod);
    };
  }, [disabledPeriod]);

  return { sendCode, isSendingCode, countdown };
};

export default useVerificationCode;
