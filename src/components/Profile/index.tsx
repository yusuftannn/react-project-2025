import type { UserInstance } from "../../models/user";
import AuthSession from "../../utils/session";
import "../profileCalendar.scss";

import { FaUserCircle, FaEnvelope, FaUserTag } from "react-icons/fa";

type ProfileCardProps = {
  profile: UserInstance;
};

const ProfileCard = ({ profile }: ProfileCardProps) => {
  const name = profile?.name ?? AuthSession.getName();
  const email = profile?.email ?? AuthSession.getEmail();
  const role = profile?.role?.name ?? AuthSession.getRoles()?.name ?? "Unknown Role";

  return (
    <div className="profile-section">
      <div className="profile-info">
        <FaUserCircle className="profile-icon" />
        <h2>Welcome, {name}</h2>

        <div className="profile-detail">
          <FaEnvelope />
          <span>{email}</span>
        </div>

        <div className="profile-detail">
          <FaUserTag />
          <span>{role}</span>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;