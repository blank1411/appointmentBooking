import { makeStyles, Button } from "@fluentui/react-components";
import { useNavigate } from "react-router-dom";

const useStyles = makeStyles({
  button: {
    marginRight: "3px",
    marginLeft: "3px",
  },
  container: {
    marginRight: "12px",
  },
});

const AuthButtons = () => {
  const classes = useStyles();
  let navigate = useNavigate();

  return (
    <div className={classes.container}>
      <Button
        appearance="primary"
        onClick={() => navigate("/login")}
        className={classes.button}
      >
        Log In
      </Button>
      <Button onClick={() => navigate("/signup")} className={classes.button}>
        Sign Up
      </Button>
    </div>
  );
};

export default AuthButtons;
