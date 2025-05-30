import {
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuList,
  MenuItem,
  Avatar,
  makeStyles,
} from "@fluentui/react-components";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";

const useStyles = makeStyles({
  avatar: {
    marginRight: "16px",
    marginLeft: "6px",
    cursor: "pointer",
  },
});

const AvatarMenu = () => {
  let navigate = useNavigate();
  const { logout, user } = useAuth();
  const classes = useStyles();

  const username = user?.firstName! + " " + user?.lastName!;

  return (
    <div>
      <Menu>
        <MenuTrigger disableButtonEnhancement>
          <Avatar size={36} className={classes.avatar} name={username} />
        </MenuTrigger>
        <MenuPopover>
          <MenuList>
            <MenuItem onClick={() => navigate("/profile")}>Profile</MenuItem>
            <MenuItem onClick={() => navigate("/settings")}>Settings</MenuItem>
            <MenuItem onClick={logout}>Log Out</MenuItem>
          </MenuList>
        </MenuPopover>
      </Menu>
    </div>
  );
};

export default AvatarMenu;
