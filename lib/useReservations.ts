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

export const getReservations = async (microcmsClient, filters: string) => {
  const res = await microcmsClient.get({
    endpoint: 'reservations',
    filters: filters
  })
  .catch((err) => console.error(err));

  return res.contents;
}

export const createReservation = (microcmsClient, reservation: Reservation) => {
  microcmsClient.create({
    endpoint: 'reservations',
    content: reservation,
  })
  .catch((err) => console.error(err));

  return reservation;
}

export const deleteReservation = (microcmsClient, reservation: Reservation) => {
  microcmsClient.delete({
    endpoint: 'reservations',
    contentId: reservation.id,
  })
  .catch((err) => console.error(err));

  return reservation;
}

export const updateReservation = (microcmsClient, reservation: Reservation) => {
  microcmsClient.create({
    endpoint: 'reservations',
    content: reservation,
  })
  .catch((err) => console.error(err));

  return reservation;
}
