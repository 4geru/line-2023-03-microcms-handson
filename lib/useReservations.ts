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

export const createReservation = (microcmsClient, reservation: Reservation, success: () => {}) => {
  if(!confirm("Do you reserve time?"))return;
  microcmsClient.create({
    endpoint: 'reservations',
    content: reservation,
  })
  .then(success)
  .catch((err) => console.error(err));

  return reservation;
}

export const deleteReservation = (microcmsClient, reservation: Reservation, success: () => {}) => {
  if(!confirm("Do you delete this reservation?"))return;
  microcmsClient.delete({
    endpoint: 'reservations',
    contentId: reservation.id,
  })
  .then(success)
  .catch((err) => console.error(err));

  return reservation;
}

export const updateReservation = (microcmsClient, reservation: Reservation) => {
  microcmsClient
    .update({
      endpoint: `reservations/${reservation.id}`,
      content: reservation,
    })
    .then((res) => console.log(res.id))
    .catch((err) => console.error(err));

  return reservation;
}
