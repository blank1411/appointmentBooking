import React from "react";
import {
  Card,
  Text,
  Avatar,
  Divider,
  Badge,
  makeStyles,
  tokens,
  Title3,
} from "@fluentui/react-components";
import {
  PersonRegular,
  MailRegular,
  LocationRegular,
} from "@fluentui/react-icons";
import { useAuth } from "../../Context/AuthContext";
import BookedAppointments from "../../Components/ProfilePageComponents/BookedAppointments";
import ChangePasswordDialog from "../../Components/ProfilePageComponents/ChangePasswordDialog";

const useStyles = makeStyles({
  container: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-start",
    padding: "16px",
    backgroundColor: tokens.colorNeutralBackground1,
    minHeight: "100vh",
    fontFamily: tokens.fontFamilyBase,
    gap: "24px",
    flexWrap: "wrap",
  },
  profileCard: {
    width: "100%",
    maxWidth: "600px",
    backgroundColor: tokens.colorNeutralBackground1,
    borderRadius: tokens.borderRadiusLarge,
    boxShadow: tokens.shadow16,
    marginBottom: "24px",
  },
  headerSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "32px",
    background: `linear-gradient(135deg, ${tokens.colorBrandBackground2} 0%, ${tokens.colorBrandBackground} 100%)`,
    borderRadius: `${tokens.borderRadiusLarge} ${tokens.borderRadiusLarge} 0 0`,
    color: tokens.colorNeutralForegroundOnBrand,
  },
  avatar: {
    width: "120px",
    height: "120px",
    marginBottom: "16px",
    border: `4px solid ${tokens.colorNeutralBackground1}`,
    boxShadow: tokens.shadow8,
  },
  userName: {
    fontSize: "28px",
    fontWeight: tokens.fontWeightSemibold,
    marginBottom: "8px",
    color: tokens.colorNeutralBackground1,
  },
  userHandle: {
    fontSize: "16px",
    opacity: 0.9,
    color: tokens.colorNeutralBackground1,
  },
  contentSection: {
    padding: "32px",
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "24px",
    marginBottom: "32px",
  },
  infoItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "16px",
    backgroundColor: tokens.colorNeutralBackground2,
    borderRadius: tokens.borderRadiusMedium,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  infoIcon: {
    color: tokens.colorBrandForeground1,
    fontSize: "20px",
  },
  infoText: {
    display: "flex",
    flexDirection: "column",
  },
  infoLabel: {
    fontSize: "12px",
    color: tokens.colorNeutralForeground3,
    fontWeight: tokens.fontWeightSemibold,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  infoValue: {
    fontSize: "16px",
    color: tokens.colorNeutralForeground1,
    fontWeight: tokens.fontWeightMedium,
    marginTop: "4px",
  },
  actionButtons: {
    display: "flex",
    gap: "12px",
    justifyContent: "center",
    marginTop: "24px",
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "40px",
  },
  emptyState: {
    textAlign: "center",
    padding: "40px",
    color: tokens.colorNeutralForeground2,
  },
  errorState: {
    textAlign: "center",
    padding: "40px",
    color: tokens.colorPaletteRedForeground1,
  },
});

const ProfilePage: React.FC = () => {
  const styles = useStyles();

  const { user } = useAuth();

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div className={styles.container}>
      <Card className={styles.profileCard}>
        <div className={styles.headerSection}>
          <Avatar
            className={styles.avatar}
            name={`${user!.firstName} ${user!.lastName}`}
            size={120}
            initials={getInitials(user!.firstName, user!.lastName)}
          />
          <Text className={styles.userName}>
            {user!.firstName} {user!.lastName}
          </Text>
          <Text className={styles.userHandle}>@{user!.username}</Text>
          <Badge
            appearance="filled"
            color="brand"
            style={{ marginTop: "12px" }}
          >
            Active User
          </Badge>
        </div>

        <div className={styles.contentSection}>
          <Title3
            style={{
              marginBottom: "16px",
              color: tokens.colorNeutralForeground1,
            }}
          >
            Profile Information
          </Title3>

          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <PersonRegular className={styles.infoIcon} />
              <div className={styles.infoText}>
                <Text className={styles.infoLabel}>Full Name</Text>
                <Text className={styles.infoValue}>
                  {user!.firstName} {user!.lastName}
                </Text>
              </div>
            </div>

            <div className={styles.infoItem}>
              <PersonRegular className={styles.infoIcon} />
              <div className={styles.infoText}>
                <Text className={styles.infoLabel}>Username</Text>
                <Text className={styles.infoValue}>@{user!.username}</Text>
              </div>
            </div>

            <div className={styles.infoItem}>
              <MailRegular className={styles.infoIcon} />
              <div className={styles.infoText}>
                <Text className={styles.infoLabel}>Email</Text>
                <Text className={styles.infoValue}>{user!.email}</Text>
              </div>
            </div>

            <div className={styles.infoItem}>
              <LocationRegular className={styles.infoIcon} />
              <div className={styles.infoText}>
                <Text className={styles.infoLabel}>Location</Text>
                <Text className={styles.infoValue}>{user!.city}</Text>
              </div>
            </div>
          </div>

          <Divider style={{ margin: "24px 0" }} />

          <div className={styles.actionButtons}>
            <ChangePasswordDialog />
          </div>
        </div>
      </Card>

      <BookedAppointments />
    </div>
  );
};

export default ProfilePage;
