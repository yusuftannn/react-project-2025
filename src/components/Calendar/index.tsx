import { useEffect, useRef, useState, useCallback } from "react";
import type { ScheduleInstance } from "../../models/schedule";
import type { UserInstance } from "../../models/user";

import FullCalendar from "@fullcalendar/react";
import interactionPlugin from "@fullcalendar/interaction";
import dayGridPlugin from "@fullcalendar/daygrid";
import type { EventInput } from "@fullcalendar/core/index.js";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

import "../profileCalendar.scss";

dayjs.extend(utc);
dayjs.extend(isSameOrBefore);

type CalendarContainerProps = {
  schedule: ScheduleInstance;
  auth: UserInstance;
  selectedStaffId: string | null;
};

const classes = [
  "bg-one", "bg-two", "bg-three", "bg-four", "bg-five", "bg-six", "bg-seven", "bg-eight",
  "bg-nine", "bg-ten", "bg-eleven", "bg-twelve", "bg-thirteen", "bg-fourteen", "bg-fifteen",
  "bg-sixteen", "bg-seventeen", "bg-eighteen", "bg-nineteen", "bg-twenty", "bg-twenty-one",
  "bg-twenty-two", "bg-twenty-three", "bg-twenty-four", "bg-twenty-five", "bg-twenty-six",
  "bg-twenty-seven", "bg-twenty-eight", "bg-twenty-nine", "bg-thirty", "bg-thirty-one",
  "bg-thirty-two", "bg-thirty-three", "bg-thirty-four", "bg-thirty-five", "bg-thirty-six",
  "bg-thirty-seven", "bg-thirty-eight", "bg-thirty-nine", "bg-forty",
];

const CalendarContainer = ({ schedule, auth, selectedStaffId }: CalendarContainerProps) => {
  const calendarRef = useRef<FullCalendar>(null);
  const [events, setEvents] = useState<EventInput[]>([]);
  const [highlightedDates, setHighlightedDates] = useState<string[]>([]);
  const [initialDate, setInitialDate] = useState<Date>();
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pairDates, setPairDates] = useState<{ date: string; colorClass: string }[]>([]);

const validDates = useCallback(() => {
  const dates = [];
  let currentDate = dayjs(schedule.scheduleStartDate);
  while (
    currentDate.isBefore(schedule.scheduleEndDate) ||
    currentDate.isSame(schedule.scheduleEndDate)
  ) {
    dates.push(currentDate.format("YYYY-MM-DD"));
    currentDate = currentDate.add(1, "day");
  }

  return dates;
}, [schedule]);


  const getDatesBetween = (startDate: string, endDate: string) => {
    const dates = [];
    const start = dayjs(startDate, "DD.MM.YYYY").toDate();
    const end = dayjs(endDate, "DD.MM.YYYY").toDate();
    const current = new Date(start);

    while (current <= end) {
      dates.push(dayjs(current).format("DD-MM-YYYY"));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };

const getEarliestAssignmentDate = useCallback((): Date => {
  if (!schedule?.assignments?.length) return new Date();

  const sorted = [...schedule.assignments].sort((a, b) =>
    dayjs(a.shiftStart).isBefore(b.shiftStart) ? -1 : 1
  );

  return dayjs(sorted[0].shiftStart).toDate();
}, [schedule]);


const generateStaffBasedCalendar = useCallback(() => {
  if (!selectedStaffId || !schedule?.staffs?.length) return;

  const staffColorMap = new Map<string, string>();
  schedule.staffs.forEach((staff, index) => {
    staffColorMap.set(staff.id, classes[index % classes.length]);
  });

  const works: EventInput[] = [];
  for (const assignment of schedule?.assignments ?? []) {
    if (assignment.staffId !== selectedStaffId) continue;

    const shift = schedule.shifts.find((s) => s.id === assignment.shiftId);
    const assignmentDate = dayjs.utc(assignment.shiftStart).format("YYYY-MM-DD");
    const isValidDate = validDates().includes(assignmentDate);

    works.push({
      id: assignment.id,
      title: shift?.name ?? "Vardiya",
      date: assignmentDate,
      shiftStart: assignment.shiftStart,
      shiftEnd: assignment.shiftEnd,
      staffId: assignment.staffId,
      className: `event ${staffColorMap.get(assignment.staffId)} ${
        assignment.isUpdated ? "highlight" : ""
      } ${!isValidDate ? "invalid-date" : ""}`,
    });
  }

  const selectedStaff = schedule.staffs.find((s) => s.id === selectedStaffId);
  const offDays = selectedStaff?.offDays ?? [];
  const allDates = getDatesBetween(
    dayjs(schedule.scheduleStartDate).format("DD.MM.YYYY"),
    dayjs(schedule.scheduleEndDate).format("DD.MM.YYYY")
  );
  const highlighted = allDates.filter((date) =>
    offDays.includes(dayjs(date, "DD-MM-YYYY").format("DD.MM.YYYY"))
  );

  const pairHighlights: { date: string; colorClass: string }[] = [];
  selectedStaff?.pairList?.forEach((pair) => {
    const colorClass = staffColorMap.get(pair.staffId);
    if (!colorClass) return;
    const range = getDatesBetween(pair.startDate, pair.endDate);
    range.forEach((date) => pairHighlights.push({ date, colorClass }));
  });

  setHighlightedDates(highlighted);
  setPairDates(pairHighlights);
  setEvents(works);
}, [selectedStaffId, schedule, validDates]);

useEffect(() => {
  if (!schedule?.assignments?.length || !schedule?.staffs?.length) return;

  const firstDate = getEarliestAssignmentDate();
  setInitialDate(firstDate);
  calendarRef.current?.getApi().gotoDate(firstDate);
}, [schedule, getEarliestAssignmentDate]);

useEffect(() => {
  generateStaffBasedCalendar();
}, [generateStaffBasedCalendar]);

  const handleEventClick = (clickInfo: any) => {
    setSelectedEvent(clickInfo.event);
    setIsModalOpen(true);
  };

  const RenderEventContent = ({ eventInfo }: any) => (
    <div className="event-content">
      <p>{eventInfo.event.title}</p>
    </div>
  );

  return (
    <div className="calendar-section">
      <div className="calendar-wrapper">
        <FullCalendar
          ref={calendarRef}
          locale={auth.language}
          plugins={[dayGridPlugin, interactionPlugin]}
          height="auto"
          selectable
          editable={false}
          eventClick={handleEventClick}
          initialView="dayGridMonth"
          initialDate={initialDate}
          events={events}
          firstDay={1}
          dayMaxEventRows={4}
          fixedWeekCount
          showNonCurrentDates
          eventContent={(eventInfo: any) => (
            <RenderEventContent eventInfo={eventInfo} />
          )}
          datesSet={(info: any) => {
            const prevButton = document.querySelector(".fc-prev-button") as HTMLButtonElement;
            const nextButton = document.querySelector(".fc-next-button") as HTMLButtonElement;

            const current = calendarRef?.current?.getApi().getDate();
            if (current && !dayjs(schedule?.scheduleStartDate).isSame(current)) {
              setInitialDate(current);
            }

            const startDiff = dayjs(info.start).utc().diff(dayjs(schedule.scheduleStartDate).subtract(1, "day").utc(), "days");
            const endDiff = dayjs(schedule.scheduleEndDate).diff(info.end, "days");

            prevButton.disabled = startDiff < 0 && startDiff > -35;
            nextButton.disabled = endDiff < 0 && endDiff > -32;
          }}
          dayCellContent={({ date }) => {
            const formattedDate = dayjs(date).format("DD-MM-YYYY");
            const isValid = validDates().includes(dayjs(date).format("YYYY-MM-DD"));
            const isOff = highlightedDates.includes(formattedDate);
            const pairEntry = pairDates.find((pd) => pd.date === formattedDate);

            return (
              <div
                className={`${isValid ? "" : "date-range-disabled"} 
                  ${isOff ? "highlighted-date-orange" : ""} 
                  ${pairEntry ? `highlightedPair ${pairEntry.colorClass}` : ""}`}
              >
                {dayjs(date).date()}
              </div>
            );
          }}
        />

        {isModalOpen && selectedEvent && (
          <div className="event-modal">
            <div className="modal-content">
              <button className="modal-button" onClick={() => setIsModalOpen(false)}>
                Kapat
              </button>
              <h3>Etkinlik Detayı</h3>
              <p><strong>Personel:</strong> {schedule?.staffs.find((s) => s.id === selectedEvent.extendedProps.staffId)?.name}</p>
              <p><strong>Vardiya:</strong> {selectedEvent.title}</p>
              <p><strong>Tarih:</strong> {dayjs(selectedEvent.start).format("DD.MM.YYYY")}</p>
              <p><strong>Başlangıç:</strong> {dayjs(selectedEvent.extendedProps.shiftStart).format("HH:mm")}</p>
              <p><strong>Bitiş:</strong> {dayjs(selectedEvent.extendedProps.shiftEnd).format("HH:mm")}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarContainer;
