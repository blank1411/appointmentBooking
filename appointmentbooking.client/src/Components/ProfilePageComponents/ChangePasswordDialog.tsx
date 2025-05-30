import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogTitle,
  DialogContent,
  DialogBody,
  DialogActions,
  Button,
  Input,
  Label,
  Spinner,
  MessageBar,
  makeStyles,
} from "@fluentui/react-components";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "../../Context/AuthContext";
import { ChangePassword } from "../../types/User";
import { EditRegular, EyeRegular, EyeOffRegular } from "@fluentui/react-icons";

const useStyles = makeStyles({
  content: {
    display: "flex",
    flexDirection: "column",
    rowGap: "10px",
  },
  actionButtons: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
  },
});

const ChangePasswordDialog = () => {
  const styles = useStyles();
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [showSuccessMessageBar, setShowSuccessMessageBar] =
    useState<boolean>(false);
  const [showErrorMessageBar, setShowErrorMessageBar] =
    useState<boolean>(false);
  const [showCurrentPassword, setShowCurrentPassword] =
    useState<boolean>(false);
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const { token } = useAuth();

  const { mutate, isPending, error, isError } = useMutation({
    mutationFn: async ({ currentPassword, newPassword }: ChangePassword) => {
      const response = await fetch("/api/changepassword", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to change password.");
      }

      return response.json();
    },
    onSuccess: () => {
      setShowSuccessMessageBar(true);
      setCurrentPassword("");
      setNewPassword("");
    },
    onError: () => setShowErrorMessageBar(true),
  });

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    mutate({ currentPassword, newPassword });
  };

  const handleCloseButton = () => {
    setShowErrorMessageBar(false);
    setShowSuccessMessageBar(false);
    setCurrentPassword("");
    setNewPassword("");
  };
  return (
    <Dialog modalType="non-modal">
      <DialogTrigger disableButtonEnhancement>
        <Button appearance="primary" icon={<EditRegular />}>
          Change Password
        </Button>
      </DialogTrigger>
      <DialogSurface>
        <form onSubmit={handleSubmit}>
          <DialogBody>
            <DialogTitle>Dialog title</DialogTitle>
            <DialogContent className={styles.content}>
              <Label required htmlFor={"current-password-input"}>
                Current Password
              </Label>
              <Input
                required
                type={showCurrentPassword ? "text" : "password"}
                id={"current-password-input"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                contentAfter={
                  <Button
                    appearance="transparent"
                    onClick={() => setShowCurrentPassword((prev) => !prev)}
                    tabIndex={-1} // So it doesn't steal tab navigation
                  >
                    {showCurrentPassword ? <EyeOffRegular /> : <EyeRegular />}
                  </Button>
                }
              />

              <Label required htmlFor={"new-password-input"}>
                New Password
              </Label>
              <Input
                required
                type={showNewPassword ? "text" : "password"}
                id={"new-password-input"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                contentAfter={
                  <Button
                    appearance="transparent"
                    onClick={() => setShowNewPassword((prev) => !prev)}
                    tabIndex={-1}
                  >
                    {showNewPassword ? <EyeOffRegular /> : <EyeRegular />}
                  </Button>
                }
              />
            </DialogContent>
            <DialogActions className={styles.actionButtons}>
              <Button type="submit" appearance="primary" disabled={isPending}>
                {isPending ? <Spinner /> : "Submit"}
              </Button>
              <DialogTrigger disableButtonEnhancement>
                <Button appearance="secondary" onClick={handleCloseButton}>
                  Close
                </Button>
              </DialogTrigger>
            </DialogActions>
            {(showErrorMessageBar || showSuccessMessageBar) && (
              <MessageBar intent={isError ? "error" : "success"}>
                {isError ? error?.message : "Succesfully Changed Password!"}
              </MessageBar>
            )}
          </DialogBody>
        </form>
      </DialogSurface>
    </Dialog>
  );
};

export default ChangePasswordDialog;
