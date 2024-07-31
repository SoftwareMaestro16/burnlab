import { FC, useEffect } from "react";
import { WebApp } from "./sdk";

interface BackButtonProps {
  onClick?: VoidFunction;
}

const backButton = WebApp.BackButton;

let isButtonShown = false;

export const BackButton: FC<BackButtonProps> = ({
  onClick = () => {
    window.history.back();
  },
}) => {
  useEffect(() => {
    backButton.show();
    isButtonShown = true;
    return () => {
      isButtonShown = false;
      setTimeout(() => {
        if (!isButtonShown) {
          backButton.hide();
        }
      }, 10);
    };
  }, []);

  useEffect(() => {
    WebApp.onEvent("backButtonClicked", onClick);
    return () => {
      WebApp.offEvent("backButtonClicked", onClick);
    };
  }, [onClick]);

  return null;
};
