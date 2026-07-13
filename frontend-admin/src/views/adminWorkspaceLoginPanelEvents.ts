export function buildAdminWorkspaceLoginPanelEvents(input: {
  login: () => void | Promise<void>;
  setLoginValue: (value: string) => void;
  setPasswordValue: (value: string) => void;
}) {
  return {
    submit: () => {
      return input.login();
    },
    updateLoginValue: (value: string) => {
      input.setLoginValue(value);
    },
    updatePasswordValue: (value: string) => {
      input.setPasswordValue(value);
    }
  };
}
