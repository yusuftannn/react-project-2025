import { useState, useEffect } from "react";
import ProfileCard from "../Profile";
import CalendarContainer from "../Calendar";

import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { getAuthUser } from "../../store/auth/selector";
import { getSchedule } from "../../store/schedule/selector";
import { setProfile } from "../../store/auth/actions";
import { fetchSchedule } from "../../store/schedule/actions";

import "../profileCalendar.scss";

const ProfileCalendar = () => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector(getAuthUser);
  const schedule = useAppSelector(getSchedule);

  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(setProfile());
    dispatch(fetchSchedule());
  }, [dispatch]);

  useEffect(() => {
    if (schedule?.staffs?.length) {
      setSelectedStaffId(schedule.staffs[0].id);
    }
  }, [schedule]);

  return (
    <div className="profile-calendar-layout">
      <aside className="left-panel">
        <ProfileCard profile={auth} />
        <div className="staff-list-sidebar">
          <h3 className="staff-list-title">Personeller</h3>
          {schedule?.staffs?.map((staff: any) => (
            <div
              key={staff.id}
              onClick={() => setSelectedStaffId(staff.id)}
              className={`staff-sidebar-item ${selectedStaffId === staff.id ? "active" : ""}`}
            >
              <span>{staff.name}</span>
            </div>
          ))}
        </div>
      </aside>

      <main className="calendar-panel">
        <CalendarContainer
          schedule={schedule}
          auth={auth}
          selectedStaffId={selectedStaffId}
        />
      </main>
    </div>
  );
};

export default ProfileCalendar;
