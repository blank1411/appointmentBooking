import { makeStyles, Image } from "@fluentui/react-components";
import { useNavigate } from "react-router-dom";

const useStyles = makeStyles({
  header: {
    backgroundColor: "#edf6f9",
    width: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: "10px 20px",
    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
    borderRadius: "0px 0px 10px 10px",
  },
  title: {
    cursor: "pointer",
    transition: "transform 0.2s ease, color 0.3s",
    ":hover": {
      transform: "translateY(-2px)",
      color: "#006d77",
    },
    fontWeight: "bold",
    width: "194px",
    height: "68px",
    marginTop: "3px",
  },
});

const NoSearchHeader = () => {
  const classes = useStyles();
  let navigate = useNavigate();
  return (
    <div className={classes.header}>
      <Image
        src="bookingLogo.png"
        onClick={() => navigate("/")}
        className={classes.title}
      />
    </div>
  );
};

export default NoSearchHeader;
