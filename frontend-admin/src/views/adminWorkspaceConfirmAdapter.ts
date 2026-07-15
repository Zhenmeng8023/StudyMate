import {
  runAdminConfirmDialogHandler,
  type ConfirmDialogKey
} from "./adminConfirmDialogState";
import {
  createAdminWorkspaceConfirmController,
  type CreateAdminWorkspaceConfirmControllerOptions
} from "./adminWorkspaceConfirmController";

interface AdminWorkspaceConfirmAdapterRunners {
  createController: typeof createAdminWorkspaceConfirmController;
  runConfirmDialogHandler: typeof runAdminConfirmDialogHandler;
}

export interface CreateAdminWorkspaceConfirmAdapterOptions
  extends CreateAdminWorkspaceConfirmControllerOptions {
  runners?: Partial<AdminWorkspaceConfirmAdapterRunners>;
}

export function createAdminWorkspaceConfirmAdapter(
  options: CreateAdminWorkspaceConfirmAdapterOptions
) {
  const runners: AdminWorkspaceConfirmAdapterRunners = {
    createController: options.runners?.createController ?? createAdminWorkspaceConfirmController,
    runConfirmDialogHandler:
      options.runners?.runConfirmDialogHandler ?? runAdminConfirmDialogHandler
  };

  const controller = runners.createController(options);

  return {
    buildDialogs: () => controller.buildDialogs(),
    cancelDialog(key: ConfirmDialogKey) {
      if (options.readLoading()) return;
      runners.runConfirmDialogHandler(key, controller.resetHandlers);
    },
    confirmDialog(key: ConfirmDialogKey) {
      return runners.runConfirmDialogHandler(key, controller.submitHandlers);
    },
    resetAll: () => controller.resetAll()
  };
}
