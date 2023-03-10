import { lineNotify } from "./lineNotify";
import { Staff } from './useStaff'
export interface Reservation {
  id: string;
  userName: string;
  lineId: string;
  staff: any;
  course: number;
  reservationAt: Date;
  clientFreeForm: string;
  staffFreeForm: string;
}

export const getReservations = async (microcmsClient, filters: string, success: () => {}) => {
  const res = await microcmsClient.get({
    endpoint: 'reservations',
    filters: filters
  })
  .then(success)
  .catch((err) => console.error(err));

  return res.contents;
}

export const createReservation = (microcmsClient, reservation: Reservation, staff: Staff, success = () => {}) => {
  if(!confirm("Do you reserve time?"))return;
  microcmsClient.create({
    endpoint: 'reservations',
    content: reservation,
  })
  .then(() => {
    const date = new Date(reservation.reservationAt).toLocaleString()
    const message = `${staff.staffName}さん：${reservation.userName}様の${date}から予約されました。`
    lineNotify(message)

    success()
  })
  .catch((err) => console.error(err));

  return reservation;
}

export const deleteReservation = (microcmsClient, reservation: Reservation, success: () => {}) => {
  if(!confirm("Do you delete this reservation?"))return;
  microcmsClient.delete({
    endpoint: 'reservations',
    contentId: reservation.id,
  })
  .then(() => {
    const date = new Date(reservation.reservationAt).toLocaleString()
    const staffName = reservation.staff.staffName;
    const message = `${staffName}さん：${reservation.userName}様の${date}からの予約削除がされました。`
    lineNotify(message);
    success()
  })
  .catch((err) => console.error(err));

  return reservation;
}

export const updateReservation = (microcmsClient, reservation: Reservation, success = () => {}) => {
  microcmsClient
    .update({
      endpoint: `reservations/${reservation.id}`,
      content: reservation,
    })
    .then(() => {
      success()
    })
    .catch((err) => console.error(err));

  return reservation;
}
