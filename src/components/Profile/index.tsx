import type { UserInstance } from "../../models/user";
import AuthSession from "../../utils/session";
import "../profileCalendar.scss";

type ProfileCardProps = {
    profile: UserInstance;
};

const ProfileCard = ({ profile }: ProfileCardProps) => {
  const fallbackRole = AuthSession.getRoles();
  const roleName = profile?.role?.name ?? fallbackRole?.name ?? "Unknown Role";

  return (
    <div className="profile-section">
      <div className="profile-info">
        <h2>Welcome, {profile?.name ?? AuthSession.getName()}</h2>
        <p>{profile?.email ?? AuthSession.getEmail()}</p>
         <p>{roleName}</p>
      </div>
    </div>
  );
};

export default ProfileCard;