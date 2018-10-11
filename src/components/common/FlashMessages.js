import { notification, Modal } from "antd";
import "../../styles/flash_messages.css";

export const flashWithSuccess = (message, description, options = {}) => {
  notification.success({
    duration: options.duration || 4.5,
    // className: options.className || "simpleNotifySuccess",
    message: message || "Sucesso!",
    description: description || "Alterações realizadas com sucesso!"
  });
};

export const flashWithError = (message, description, options = {}) => {
  notification.error({
    duration: options.duration || 4.5,
    // className: options.className,
    message: message || "Erro"
  });
};

export const flashModalWithError = (
  content = "",
  title = "Ooopss",
  options = {}
) => {
  const modal = Modal.error({
    title,
    content,
    ...options
  });

  if (options.duration)
    setTimeout(() => {
      modal.destroy();
    }, options.duration);
};
