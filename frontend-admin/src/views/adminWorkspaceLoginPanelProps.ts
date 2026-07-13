export function buildAdminWorkspaceLoginPanelProps(input: {
  errorMessage: string;
  loading: boolean;
  loginPrompt: string;
  loginValue: string;
  notice: string;
  passwordValue: string;
}) {
  return {
    errorMessage: input.errorMessage,
    loading: input.loading,
    loginPrompt: input.loginPrompt,
    loginValue: input.loginValue,
    notice: input.notice,
    passwordValue: input.passwordValue
  };
}
