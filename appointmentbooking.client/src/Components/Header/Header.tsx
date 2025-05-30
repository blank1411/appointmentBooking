import { Image, makeStyles } from "@fluentui/react-components";
import SearchBar from "./SearchBar";
import AvatarMenu from "../AvatarMenu/AvatarMenu";
import AuthButtons from "../AuthButtons/AuthButtons";
import { useAuth } from "../../Context/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";

const useStyles = makeStyles({
  title: {
    cursor: "pointer",
    transition: "transform 0.2s ease, color 0.3s",
    ":hover": {
      transform: "translateY(-2px)",
      color: "#006d77",
    },
    fontWeight: "bold",
  },
  header: {
    backgroundColor: "#edf6f9",
    width: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 20px",
    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
    borderRadius: "0px 0px 10px 10px",
  },
  rightSection: {
    display: "flex",
    gap: "10px",
    marginRight: "20px",
  },
});

function Header() {
  const classes = useStyles();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentQuery = searchParams.get("q") || "";

  return (
    <div className={classes.header}>
      <Image
        src="bookingLogo.png"
        style={{ width: "137px", height: "48px" }}
        className={classes.title}
        onClick={() => navigate("/")}
      />

      <SearchBar initialQuery={currentQuery} />

      <div className={classes.rightSection}>
        {isLoggedIn ? <AvatarMenu /> : <AuthButtons />}
      </div>
    </div>
  );
}

export default Header;
